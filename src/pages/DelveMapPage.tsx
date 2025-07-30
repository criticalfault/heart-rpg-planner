import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { HexGrid } from '../components/grid/HexGrid';
import { DraggableCard } from '../components/cards/DraggableCard';
import { LandmarkCard } from '../components/cards/LandmarkCard';
import { DelveCard } from '../components/cards/DelveCard';
import { ConnectionManager } from '../components/connections/ConnectionManager';
import { Button, LoadingSpinner, ConfirmDialog, ErrorBoundary } from '../components/common';
import { LandmarkForm } from '../components/cards/LandmarkForm';
import { DelveForm } from '../components/cards/DelveForm';
import { PersistenceManager } from '../components/common/PersistenceManager';
import { useDelveMap } from '../hooks/useDelveMap';
import { useLandmarks } from '../hooks/useLandmarks';
import { useDelves } from '../hooks/useDelves';
import { useLibrary } from '../hooks/useLibrary';
import { useToast, useErrorHandler } from '../hooks';
import { useDelveMapContext } from '../context/DelveMapContext';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { usePerformanceOptimization } from '../hooks/usePerformanceOptimization';
import { HexPosition, Landmark, Delve } from '../types';
import { DEFAULT_HEX_CONFIG, getResponsiveHexConfig } from '../utils/hexUtils';
import './DelveMapPage.css';
import '../styles/PersistenceManager.css';

export const DelveMapPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [hexConfig, setHexConfig] = useState(DEFAULT_HEX_CONFIG);
  const [showLandmarkForm, setShowLandmarkForm] = useState(false);
  const [showDelveForm, setShowDelveForm] = useState(false);
  const [showPersistenceManager, setShowPersistenceManager] = useState(false);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger'
  });

  // Context hooks
  const { state, dispatch } = useDelveMapContext();
  const showGrid = state.gridVisible;
  const showConnections = state.showConnections;
  const { loading, error } = state;

  // Toast and error handling
  const { showSuccess } = useToast();
  const { wrapAsync } = useErrorHandler();
  
  const { 
    selectedCard, 
    editingCard, 
    draggedCard, 
    placedCards,
    setSelectedCard, 
    setEditingCard, 
    setDraggedCard 
  } = useDelveMap();

  const { 
    landmarks, 
    addLandmark, 
    updateLandmark, 
    deleteLandmark 
  } = useLandmarks();

  const { 
    delves, 
    addDelve, 
    updateDelve, 
    deleteDelve 
  } = useDelves();

  const { addToLibrary } = useLibrary();

  // Performance optimization
  const { batchUpdate } = usePerformanceOptimization({
    enableAnimations: true,
    maxVisibleItems: placedCards.length
  });

  // Get all card IDs for keyboard navigation
  const allCardIds = useMemo(() => 
    placedCards.map(card => card.id),
    [placedCards]
  );

  // Enhanced keyboard navigation with accessibility
  const { setFocusedCard } = useKeyboardNavigation({
    onCardSelect: (cardId) => {
      setSelectedCard(cardId);
      setFocusedCard(cardId);
    },
    onCardEdit: (cardId) => {
      handleCardEdit(cardId);
    },
    onCardDelete: (cardId) => {
      const cardData = getCardById(cardId);
      if (cardData?.type === 'landmark') {
        handleDeleteLandmark(cardId);
      } else if (cardData?.type === 'delve') {
        handleDeleteDelve(cardId);
      }
    },
    onEscape: () => {
      setSelectedCard(null);
      setEditingCard(null);
      setShowLandmarkForm(false);
      setShowDelveForm(false);
      setShowPersistenceManager(false);
    },
    onHome: () => {
      if (allCardIds.length > 0) {
        setSelectedCard(allCardIds[0]);
      }
    },
    onEnd: () => {
      if (allCardIds.length > 0) {
        setSelectedCard(allCardIds[allCardIds.length - 1]);
      }
    },
    isEnabled: !showLandmarkForm && !showDelveForm && !showPersistenceManager && !confirmDialog.isOpen,
    announceChanges: true
  }, allCardIds);

  // Handle container resize and responsive hex config
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width,
          height: rect.height
        });
        
        // Update hex config based on screen width
        const newHexConfig = getResponsiveHexConfig(window.innerWidth);
        setHexConfig(newHexConfig);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Check if a hex position is occupied
  const isHexOccupied = useCallback((position: HexPosition, excludeId?: string) => {
    return placedCards.some(card => 
      card.position.q === position.q && 
      card.position.r === position.r && 
      card.id !== excludeId
    );
  }, [placedCards]);

  // Get card data by ID
  const getCardById = useCallback((id: string) => {
    const landmark = landmarks.find(l => l.id === id);
    if (landmark) return { ...landmark, type: 'landmark' as const };
    
    const delve = delves.find(d => d.id === id);
    if (delve) return { ...delve, type: 'delve' as const };
    
    return null;
  }, [landmarks, delves]);

  // Handle card drop on hex grid with performance optimization
  const handleCardDrop = useCallback((cardId: string, cardType: 'landmark' | 'delve', position: HexPosition) => {
    // Check if position is already occupied
    if (isHexOccupied(position, cardId)) {
      return;
    }

    // Batch the updates for better performance
    batchUpdate([
      () => {
        // Update or add placed card
        const existingCard = placedCards.find(card => card.id === cardId);
        if (existingCard) {
          // Move existing card
          dispatch({ type: 'MOVE_CARD', payload: { id: cardId, position } });
        } else {
          // Place new card
          dispatch({ type: 'PLACE_CARD', payload: { id: cardId, type: cardType, position } });
        }
      },
      () => {
        setDraggedCard(null);
      }
    ]);
  }, [isHexOccupied, placedCards, dispatch, setDraggedCard, batchUpdate]);

  // Handle card drag end (for DraggableCard component)
  const handleCardDragEnd = useCallback((cardId: string, position: HexPosition) => {
    const cardData = getCardById(cardId);
    if (!cardData) return;

    handleCardDrop(cardId, cardData.type, position);
  }, [getCardById, handleCardDrop]);

  // Handle hex click
  const handleHexClick = useCallback((_hex: HexPosition) => {
    // Deselect any selected card when clicking empty hex
    if (selectedCard) {
      setSelectedCard(null);
    }
  }, [selectedCard, setSelectedCard]);

  // Handle card selection
  const handleCardSelect = useCallback((cardId: string) => {
    setSelectedCard(cardId === selectedCard ? null : cardId);
  }, [selectedCard, setSelectedCard]);

  // Handle card editing
  const handleCardEdit = useCallback((cardId: string) => {
    setEditingCard(cardId);
  }, [setEditingCard]);

  // Handle landmark operations
  const handleAddLandmark = useCallback(wrapAsync(async (landmark: Landmark) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const landmarkData = { ...landmark };
      delete (landmarkData as any).id; // Remove ID to let addLandmark generate it
      const newLandmark = addLandmark(landmarkData);
      setShowLandmarkForm(false);
      showSuccess('Landmark Created', `"${landmark.name}" has been added to your map.`);
      return newLandmark;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, {
    toastTitle: 'Failed to Create Landmark',
    toastMessage: 'There was an error creating the landmark. Please try again.'
  }), [addLandmark, dispatch, showSuccess, wrapAsync]);

  const handleUpdateLandmark = useCallback(wrapAsync(async (landmark: Landmark) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      updateLandmark(landmark.id, landmark);
      setEditingCard(null);
      showSuccess('Landmark Updated', `"${landmark.name}" has been updated.`);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, {
    toastTitle: 'Failed to Update Landmark',
    toastMessage: 'There was an error updating the landmark. Please try again.'
  }), [updateLandmark, setEditingCard, dispatch, showSuccess, wrapAsync]);

  const handleDeleteLandmark = useCallback((id: string) => {
    const landmark = landmarks.find(l => l.id === id);
    if (!landmark) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Landmark',
      message: `Are you sure you want to delete "${landmark.name}"? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: wrapAsync(async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
          deleteLandmark(id);
          if (selectedCard === id) setSelectedCard(null);
          if (editingCard === id) setEditingCard(null);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          showSuccess('Landmark Deleted', `"${landmark.name}" has been removed from your map.`);
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }, {
        toastTitle: 'Failed to Delete Landmark',
        toastMessage: 'There was an error deleting the landmark. Please try again.'
      })
    });
  }, [landmarks, deleteLandmark, selectedCard, editingCard, setSelectedCard, setEditingCard, dispatch, showSuccess, wrapAsync]);

  // Handle delve operations
  const handleAddDelve = useCallback(wrapAsync(async (delve: Delve) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const delveData = { ...delve };
      delete (delveData as any).id; // Remove ID to let addDelve generate it
      const newDelve = addDelve(delveData);
      setShowDelveForm(false);
      showSuccess('Delve Created', `"${delve.name}" has been added to your map.`);
      return newDelve;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, {
    toastTitle: 'Failed to Create Delve',
    toastMessage: 'There was an error creating the delve. Please try again.'
  }), [addDelve, dispatch, showSuccess, wrapAsync]);

  const handleUpdateDelve = useCallback(wrapAsync(async (delve: Delve) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      updateDelve(delve.id, delve);
      setEditingCard(null);
      showSuccess('Delve Updated', `"${delve.name}" has been updated.`);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, {
    toastTitle: 'Failed to Update Delve',
    toastMessage: 'There was an error updating the delve. Please try again.'
  }), [updateDelve, setEditingCard, dispatch, showSuccess, wrapAsync]);

  const handleDeleteDelve = useCallback((id: string) => {
    const delve = delves.find(d => d.id === id);
    if (!delve) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Delve',
      message: `Are you sure you want to delete "${delve.name}"? This will also remove all monsters within this delve. This action cannot be undone.`,
      variant: 'danger',
      onConfirm: wrapAsync(async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
          deleteDelve(id);
          if (selectedCard === id) setSelectedCard(null);
          if (editingCard === id) setEditingCard(null);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          showSuccess('Delve Deleted', `"${delve.name}" has been removed from your map.`);
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }, {
        toastTitle: 'Failed to Delete Delve',
        toastMessage: 'There was an error deleting the delve. Please try again.'
      })
    });
  }, [delves, deleteDelve, selectedCard, editingCard, setSelectedCard, setEditingCard, dispatch, showSuccess, wrapAsync]);

  // Handle save to library
  const handleSaveToLibrary = useCallback(wrapAsync(async (item: Landmark | Delve, type: 'landmark' | 'delve') => {
    try {
      addToLibrary(type, item);
      showSuccess('Saved to Library', `"${item.name}" has been saved to your personal library.`);
    } catch (error) {
      throw error;
    }
  }, {
    toastTitle: 'Failed to Save to Library',
    toastMessage: 'There was an error saving the item to your library. Please try again.'
  }), [addToLibrary, showSuccess, wrapAsync]);

  // Render card component
  const renderCard = useCallback((cardId: string, position: HexPosition) => {
    const cardData = getCardById(cardId);
    if (!cardData) return null;

    const isSelected = selectedCard === cardId;
    const isEditing = editingCard === cardId;
    const isDragging = draggedCard === cardId;

    if (cardData.type === 'landmark') {
      return (
        <DraggableCard
          key={cardId}
          cardId={cardId}
          cardType="landmark"
          position={position}
          hexConfig={hexConfig}
          onDragStart={() => setDraggedCard(cardId)}
          onDragEnd={handleCardDragEnd}
          isDragging={isDragging}
          isSelected={isSelected}
          isOccupied={isHexOccupied}
          className={isSelected ? 'selected' : ''}
        >
          <div onClick={() => handleCardSelect(cardId)}>
            <LandmarkCard
              landmark={cardData}
              onUpdate={handleUpdateLandmark}
              onDelete={handleDeleteLandmark}
              onSaveToLibrary={(landmark) => handleSaveToLibrary(landmark, 'landmark')}
              isEditing={isEditing}
              onEditToggle={(editing) => editing ? handleCardEdit(cardId) : setEditingCard(null)}
            />
          </div>
        </DraggableCard>
      );
    }

    if (cardData.type === 'delve') {
      return (
        <DraggableCard
          key={cardId}
          cardId={cardId}
          cardType="delve"
          position={position}
          hexConfig={hexConfig}
          onDragStart={() => setDraggedCard(cardId)}
          onDragEnd={handleCardDragEnd}
          isDragging={isDragging}
          isSelected={isSelected}
          isOccupied={isHexOccupied}
          className={isSelected ? 'selected' : ''}
        >
          <div onClick={() => handleCardSelect(cardId)}>
            <DelveCard
              delve={cardData}
              onUpdate={handleUpdateDelve}
              onDelete={handleDeleteDelve}
              onSaveToLibrary={(delve) => handleSaveToLibrary(delve, 'delve')}
              isEditing={isEditing}
              onEditToggle={(editing) => editing ? handleCardEdit(cardId) : setEditingCard(null)}
            />
          </div>
        </DraggableCard>
      );
    }

    return null;
  }, [
    getCardById, selectedCard, editingCard, draggedCard, 
    setDraggedCard, handleCardDragEnd, isHexOccupied, handleCardSelect,
    handleUpdateLandmark, handleDeleteLandmark, handleSaveToLibrary,
    handleCardEdit, setEditingCard, handleUpdateDelve, handleDeleteDelve
  ]);

  return (
    <ErrorBoundary>
      <div className="delve-map-page">
        {/* Loading overlay */}
        {loading && (
          <LoadingSpinner 
            overlay 
            message="Processing..." 
            size="large"
          />
        )}

        {/* Error display */}
        {error && (
          <div className="delve-map-error">
            <p>Error: {error}</p>
            <Button 
              variant="secondary" 
              size="small"
              onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Toolbar */}
        <div className="delve-map-toolbar">
        <div className="delve-map-toolbar-section">
          <h1 className="delve-map-title">Delve Map</h1>
        </div>

        <div className="delve-map-toolbar-section">
          <Button
            variant="primary"
            size="small"
            onClick={() => setShowLandmarkForm(true)}
          >
            Add Landmark
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={() => setShowDelveForm(true)}
          >
            Add Delve
          </Button>
        </div>

        <div className="delve-map-toolbar-section">
          <Button
            variant={showGrid ? 'primary' : 'secondary'}
            size="small"
            onClick={() => dispatch({ type: 'TOGGLE_GRID' })}
            title="Toggle grid visibility"
          >
            Grid
          </Button>
          <Button
            variant={showConnections ? 'primary' : 'secondary'}
            size="small"
            onClick={() => dispatch({ type: 'TOGGLE_CONNECTIONS' })}
            title="Toggle connection visibility"
          >
            Connections
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={() => setShowPersistenceManager(true)}
            title="Data management and import/export"
          >
            Data
          </Button>
          <div className="delve-map-zoom-controls">
            <Button
              variant="secondary"
              size="small"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              disabled={zoom <= 0.5}
            >
              -
            </Button>
            <span className="delve-map-zoom-level">{Math.round(zoom * 100)}%</span>
            <Button
              variant="secondary"
              size="small"
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              disabled={zoom >= 2}
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {/* Main map area */}
      <div 
        ref={containerRef}
        className="delve-map-container"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
      >
        <HexGrid
          width={containerSize.width / zoom}
          height={containerSize.height / zoom}
          config={hexConfig}
          showGrid={showGrid}
          onHexClick={handleHexClick}
          onDrop={handleCardDrop}
          isOccupied={isHexOccupied}
          className="delve-map-grid"
        >
          {/* Render placed cards */}
          {placedCards.map(placedCard => 
            renderCard(placedCard.id, placedCard.position)
          )}

          {/* Connection manager overlay */}
          <ConnectionManager
            placedCards={placedCards}
            landmarks={landmarks}
            delves={delves}
            showConnections={showConnections}
            onToggleConnections={() => dispatch({ type: 'TOGGLE_CONNECTIONS' })}
          />
        </HexGrid>
      </div>

      {/* Modals */}
      <LandmarkForm
        isOpen={showLandmarkForm}
        onClose={() => setShowLandmarkForm(false)}
        onSubmit={handleAddLandmark}
        title="Add New Landmark"
      />

      <DelveForm
        isOpen={showDelveForm}
        onClose={() => setShowDelveForm(false)}
        onSubmit={handleAddDelve}
        title="Add New Delve"
      />

      <PersistenceManager
        isOpen={showPersistenceManager}
        onClose={() => setShowPersistenceManager(false)}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        loading={loading}
      />
    </div>
    </ErrorBoundary>
  );
};

export default DelveMapPage;