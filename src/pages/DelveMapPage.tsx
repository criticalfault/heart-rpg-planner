import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { SimpleCard } from '../components/cards/SimpleCard';
import { LandmarkCard } from '../components/cards/LandmarkCard';
import { DelveCard } from '../components/cards/DelveCard';
import { CardPalette } from '../components/cards/CardPalette';
import { ConnectionManager } from '../components/connections/ConnectionManager';
import { Button, LoadingSpinner, ConfirmDialog, ErrorBoundary } from '../components/common';
import { LandmarkForm } from '../components/cards/LandmarkForm';
import { DelveForm } from '../components/cards/DelveForm';
import { PersistenceManager } from '../components/common/PersistenceManager';
import { useDelveMap } from '../hooks/useDelveMap';
import { useLandmarks } from '../hooks/useLandmarks';
import { useDelves } from '../hooks/useDelves';
import { useLibrary } from '../hooks/useLibrary';
import { useConnections } from '../hooks/useConnections';
import { useToast, useErrorHandler } from '../hooks';
import { useDelveMapContext } from '../context/DelveMapContext';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { usePerformanceOptimization } from '../hooks/usePerformanceOptimization';
import { Position, Landmark, Delve } from '../types';
import './DelveMapPage.css';
import '../styles/PersistenceManager.css';

export const DelveMapPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [showLandmarkForm, setShowLandmarkForm] = useState(false);
  const [showDelveForm, setShowDelveForm] = useState(false);
  const [showPersistenceManager, setShowPersistenceManager] = useState(false);
  const [showCardPalette, setShowCardPalette] = useState(true);
  
  // Connection state
  const [connectionMode, setConnectionMode] = useState(false);
  const [selectedConnectionCard, setSelectedConnectionCard] = useState<string | null>(null);
  
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
  const { state, dispatch, autoSave } = useDelveMapContext();
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
  const { connections, createConnection } = useConnections();

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
      
      // Scroll to selected card (accounting for zoom)
      const placedCard = placedCards.find(card => card.id === cardId);
      if (placedCard && containerRef.current) {
        const scaledX = placedCard.position.x * zoom;
        const scaledY = placedCard.position.y * zoom;
        const scrollX = Math.max(0, scaledX - containerRef.current.clientWidth / 2);
        const scrollY = Math.max(0, scaledY - containerRef.current.clientHeight / 2);
        containerRef.current.scrollTo({
          left: scrollX,
          top: scrollY,
          behavior: 'smooth'
        });
      }
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
      // Also scroll to top-left of canvas
      if (containerRef.current) {
        containerRef.current.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
      }
    },
    onEnd: () => {
      if (allCardIds.length > 0) {
        setSelectedCard(allCardIds[allCardIds.length - 1]);
      }
      // Also scroll to bottom-right of canvas (accounting for zoom)
      if (containerRef.current) {
        containerRef.current.scrollTo({ 
          left: (3000 * zoom) - containerRef.current.clientWidth, 
          top: (2000 * zoom) - containerRef.current.clientHeight, 
          behavior: 'smooth' 
        });
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
        
        // Container size updated
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // This function is no longer needed with free-form placement

  // Get card data by ID
  const getCardById = useCallback((id: string) => {
    const landmark = landmarks.find(l => l.id === id);
    if (landmark) return { ...landmark, type: 'landmark' as const };
    
    const delve = delves.find(d => d.id === id);
    if (delve) return { ...delve, type: 'delve' as const };
    
    return null;
  }, [landmarks, delves]);

  // Handle card drop on canvas
  const handleCardDrop = useCallback((cardId: string, cardType: 'landmark' | 'delve', position: { x: number; y: number }) => {
    console.log('Dropping card:', cardId, 'at position:', position);

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
  }, [placedCards, dispatch, setDraggedCard, batchUpdate]);

  // Handle card drag end (for DraggableCard component)
  const handleCardDragEnd = useCallback((cardId: string, position: { x: number; y: number }) => {
    const cardData = getCardById(cardId);
    if (!cardData) return;

    handleCardDrop(cardId, cardData.type, position);
  }, [getCardById, handleCardDrop]);

  // Handle canvas drop
  const handleCanvasDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: (event.clientX - rect.left) / zoom, // Adjust for zoom level
      y: (event.clientY - rect.top) / zoom   // Adjust for zoom level
    };

    try {
      const dragData = JSON.parse(event.dataTransfer.getData('application/json'));
      handleCardDrop(dragData.cardId, dragData.cardType, position);
    } catch (error) {
      console.error('Failed to parse drag data:', error);
    }
  }, [handleCardDrop, zoom]);

  // Handle canvas drag over
  const handleCanvasDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle canvas click
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    // Deselect any selected card when clicking empty canvas
    if (selectedCard && event.target === event.currentTarget) {
      setSelectedCard(null);
    }
  }, [selectedCard, setSelectedCard]);

  // Hex click handler removed - using canvas click instead

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

  // Handle placing a card on the map (from the palette)
  const handlePlaceCardOnMap = useCallback((cardId: string, cardType: 'landmark' | 'delve') => {
    console.log('Placing card:', cardId, cardType);
    
    // Use the large canvas dimensions for placement
    const canvasWidth = 3000;
    const canvasHeight = 2000;
    
    // Simple placement strategy - place cards in a grid pattern with some randomness
    const findEmptyPosition = (): { x: number; y: number } => {
      const cardSpacing = 250; // Space between cards
      const margin = 150; // Margin from edges
      
      // Calculate grid dimensions
      const gridCols = Math.floor((canvasWidth - 2 * margin) / cardSpacing);
      const gridRows = Math.floor((canvasHeight - 2 * margin) / cardSpacing);
      
      // Try positions in a grid pattern
      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          const baseX = margin + col * cardSpacing;
          const baseY = margin + row * cardSpacing;
          
          // Add some randomness to avoid perfect grid
          const x = baseX + (Math.random() - 0.5) * 100;
          const y = baseY + (Math.random() - 0.5) * 100;
          
          // Check if position is not too close to other cards
          const tooClose = placedCards.some(card => {
            const distance = Math.sqrt(
              Math.pow(card.position.x - x, 2) + Math.pow(card.position.y - y, 2)
            );
            return distance < 200; // Minimum distance between cards
          });
          
          if (!tooClose) {
            return { x, y };
          }
        }
      }
      
      // Fallback to random position if no good spot found
      return {
        x: margin + Math.random() * (canvasWidth - 2 * margin),
        y: margin + Math.random() * (canvasHeight - 2 * margin)
      };
    };

    const position = findEmptyPosition();
    console.log('Placing card at position:', position);
    
    // Place the card
    handleCardDrop(cardId, cardType, position);
    
    // Auto-select the placed card to make it visible
    setSelectedCard(cardId);
    
    // Scroll to the placed card to make it visible (accounting for zoom)
    if (containerRef.current) {
      const scaledX = position.x * zoom;
      const scaledY = position.y * zoom;
      const scrollX = Math.max(0, scaledX - containerRef.current.clientWidth / 2);
      const scrollY = Math.max(0, scaledY - containerRef.current.clientHeight / 2);
      containerRef.current.scrollTo({
        left: scrollX,
        top: scrollY,
        behavior: 'smooth'
      });
    }
    
    // Show success message
    showSuccess('Card Placed', `Card placed on the map and view scrolled to show it!`);
  }, [placedCards, handleCardDrop, showSuccess, setSelectedCard]);

  // Handle editing a card from the palette
  const handleEditCardFromPalette = useCallback((cardId: string, cardType: 'landmark' | 'delve') => {
    if (cardType === 'landmark') {
      setEditingCard(cardId);
    } else if (cardType === 'delve') {
      setEditingCard(cardId);
    }
  }, [setEditingCard]);

  // Handle deleting a card from the palette
  const handleDeleteCardFromPalette = useCallback((cardId: string, cardType: 'landmark' | 'delve') => {
    if (cardType === 'landmark') {
      handleDeleteLandmark(cardId);
    } else if (cardType === 'delve') {
      handleDeleteDelve(cardId);
    }
  }, [handleDeleteLandmark, handleDeleteDelve]);

  // Handle connection mode toggle
  const handleToggleConnectionMode = useCallback(() => {
    setConnectionMode(!connectionMode);
    setSelectedConnectionCard(null);
  }, [connectionMode]);

  // Handle card connection click
  const handleCardConnectionClick = useCallback((cardId: string) => {
    if (!connectionMode) return;

    if (!selectedConnectionCard) {
      // First card selection
      setSelectedConnectionCard(cardId);
    } else if (selectedConnectionCard === cardId) {
      // Clicking same card - deselect
      setSelectedConnectionCard(null);
    } else {
      // Second card selection - create connection
      const fromCard = getCardById(selectedConnectionCard);
      const toCard = getCardById(cardId);
      
      if (fromCard && toCard) {
        // Check if connection already exists
        const existingConnection = connections.find(
          conn => 
            (conn.fromId === selectedConnectionCard && conn.toId === cardId) ||
            (conn.fromId === cardId && conn.toId === selectedConnectionCard)
        );

        if (!existingConnection) {
          // Determine connection type
          const getConnectionType = (fromType: string, toType: string) => {
            if (fromType === 'landmark' && toType === 'delve') return 'landmark-to-delve';
            if (fromType === 'delve' && toType === 'delve') return 'delve-to-delve';
            if (fromType === 'landmark' && toType === 'landmark') return 'landmark-to-landmark';
            return 'landmark-to-delve';
          };

          const connectionType = getConnectionType(fromCard.type, toCard.type);
          createConnection(selectedConnectionCard, cardId, connectionType);
          showSuccess('Connection Created', `Connected ${fromCard.name} to ${toCard.name}`);
        } else {
          showSuccess('Connection Exists', 'These cards are already connected');
        }
      }
      
      setSelectedConnectionCard(null);
    }
  }, [connectionMode, selectedConnectionCard, connections, createConnection, getCardById, showSuccess]);

  // Render card component
  const renderCard = useCallback((cardId: string, position: Position) => {
    const cardData = getCardById(cardId);
    if (!cardData) return null;

    const isSelected = selectedCard === cardId;
    const isEditing = editingCard === cardId;
    const isDragging = draggedCard === cardId;

    if (cardData.type === 'landmark') {
      return (
        <SimpleCard
          key={cardId}
          cardId={cardId}
          cardType="landmark"
          position={position}
          onDragEnd={handleCardDragEnd}
          onConnectionClick={handleCardConnectionClick}
          isDragging={isDragging}
          isSelected={isSelected}
          isConnectionMode={connectionMode}
          isConnectionSelected={selectedConnectionCard === cardId}
          className={isSelected ? 'selected' : ''}
        >
          <div onClick={(e) => {
            e.stopPropagation();
            handleCardSelect(cardId);
          }}>
            <LandmarkCard
              landmark={cardData}
              onUpdate={handleUpdateLandmark}
              onDelete={handleDeleteLandmark}
              onSaveToLibrary={(landmark) => handleSaveToLibrary(landmark, 'landmark')}
              isEditing={isEditing}
              onEditToggle={(editing) => editing ? handleCardEdit(cardId) : setEditingCard(null)}
            />
          </div>
        </SimpleCard>
      );
    }

    if (cardData.type === 'delve') {
      return (
        <SimpleCard
          key={cardId}
          cardId={cardId}
          cardType="delve"
          position={position}
          onDragEnd={handleCardDragEnd}
          onConnectionClick={handleCardConnectionClick}
          isDragging={isDragging}
          isSelected={isSelected}
          isConnectionMode={connectionMode}
          isConnectionSelected={selectedConnectionCard === cardId}
          className={isSelected ? 'selected' : ''}
        >
          <div onClick={(e) => {
            e.stopPropagation();
            handleCardSelect(cardId);
          }}>
            <DelveCard
              delve={cardData}
              onUpdate={handleUpdateDelve}
              onDelete={handleDeleteDelve}
              onSaveToLibrary={(delve) => handleSaveToLibrary(delve, 'delve')}
              isEditing={isEditing}
              onEditToggle={(editing) => editing ? handleCardEdit(cardId) : setEditingCard(null)}
            />
          </div>
        </SimpleCard>
      );
    }

    return null;
  }, [
    getCardById, selectedCard, editingCard, draggedCard, 
    handleCardDragEnd, handleCardSelect,
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
          <span className="delve-map-card-count">
            Cards on map: {placedCards.length}
          </span>
          <span className="delve-map-canvas-size">
            Canvas: 3000×2000px (Scrollable)
          </span>
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
          <Button
            variant={showCardPalette ? 'primary' : 'secondary'}
            size="small"
            onClick={() => setShowCardPalette(!showCardPalette)}
            title="Toggle card palette visibility"
          >
            {showCardPalette ? 'Hide' : 'Show'} Cards ({landmarks.length + delves.length})
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={() => {
              autoSave.saveNow();
              console.log('Manual save triggered');
            }}
            title="Manually trigger auto-save"
          >
            Save Now
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={() => {
              if (containerRef.current) {
                containerRef.current.scrollTo({
                  left: (1500 * zoom) - containerRef.current.clientWidth / 2,
                  top: (1000 * zoom) - containerRef.current.clientHeight / 2,
                  behavior: 'smooth'
                });
              }
            }}
            title="Center view on canvas"
          >
            Center View
          </Button>
          {placedCards.length > 0 && (
            <Button
              variant="secondary"
              size="small"
              onClick={() => {
                console.log('Placed cards:', placedCards);
                alert(`Cards on map: ${placedCards.map(c => `${c.id} at (${c.position.x}, ${c.position.y})`).join(', ')}`);
              }}
              title="Show placed card positions"
            >
              Debug Cards
            </Button>
          )}
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
      >
        <div 
          className="delve-map-zoom-wrapper"
          style={{
            width: `${3000 * zoom}px`,
            height: `${2000 * zoom}px`
          }}
        >
          <div 
            className="delve-map-canvas"
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
            onClick={handleCanvasClick}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left'
            }}
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
            connectionMode={connectionMode}
            selectedConnectionCard={selectedConnectionCard}
            onToggleConnectionMode={handleToggleConnectionMode}
            onConnectionCardClick={handleCardConnectionClick}
          />
          </div>
        </div>
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

      {/* Card Palette */}
      {showCardPalette && (
        <CardPalette
          landmarks={landmarks}
          delves={delves}
          placedCardIds={placedCards.map(card => card.id)}
          onPlaceCard={handlePlaceCardOnMap}
          onEditCard={handleEditCardFromPalette}
          onDeleteCard={handleDeleteCardFromPalette}
          onSaveToLibrary={handleSaveToLibrary}
        />
      )}

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