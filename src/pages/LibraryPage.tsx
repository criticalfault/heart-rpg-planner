import { useState } from 'react';
import { useLibrary } from '../hooks/useLibrary';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { LandmarkForm } from '../components/cards/LandmarkForm';
import { DelveForm } from '../components/cards/DelveForm';
import { MonsterForm } from '../components/cards/MonsterForm';
import { Landmark, Delve, Monster } from '../types';
import './LibraryPage.css';

type TabType = 'landmarks' | 'delves' | 'monsters';

export function LibraryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('landmarks');
  const [editingItem, setEditingItem] = useState<{ type: TabType; item: Landmark | Delve | Monster } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const {
    library,
    updateLibraryLandmark,
    updateLibraryDelve,
    updateLibraryMonster,
    deleteLandmarkFromLibrary,
    deleteDelveFromLibrary,
    deleteMonsterFromLibrary,
    copyLandmarkFromLibrary,
    copyDelveFromLibrary
  } = useLibrary();

  const handleEditItem = (type: TabType, item: Landmark | Delve | Monster) => {
    setEditingItem({ type, item });
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedItem: Landmark | Delve | Monster) => {
    if (!editingItem) return;

    switch (editingItem.type) {
      case 'landmarks':
        updateLibraryLandmark(updatedItem.id, updatedItem as Landmark);
        break;
      case 'delves':
        updateLibraryDelve(updatedItem.id, updatedItem as Delve);
        break;
      case 'monsters':
        updateLibraryMonster(updatedItem.id, updatedItem as Monster);
        break;
    }

    setShowEditModal(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (type: TabType, id: string) => {
    if (window.confirm('Are you sure you want to delete this item from your library?')) {
      switch (type) {
        case 'landmarks':
          deleteLandmarkFromLibrary(id);
          break;
        case 'delves':
          deleteDelveFromLibrary(id);
          break;
        case 'monsters':
          deleteMonsterFromLibrary(id);
          break;
      }
    }
  };

  const handleUseItem = (type: TabType, item: Landmark | Delve | Monster) => {
    switch (type) {
      case 'landmarks':
        copyLandmarkFromLibrary(item as Landmark);
        break;
      case 'delves':
        copyDelveFromLibrary(item as Delve);
        break;
      case 'monsters':
        // For monsters, we'll need to handle this differently since they belong to delves
        // For now, we'll just show an alert
        alert('To use a monster, please add it to a delve from the delve map.');
        break;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'landmarks':
        return (
          <div className="library-items">
            {library.landmarks.length === 0 ? (
              <p className="empty-message">No landmarks saved to library yet.</p>
            ) : (
              library.landmarks.map(landmark => (
                <div key={landmark.id} className="library-item">
                  <div className="library-item-header">
                    <h3>{landmark.name}</h3>
                    <div className="library-item-actions">
                      <Button
                        variant="secondary"
                        onClick={() => handleUseItem('landmarks', landmark)}
                      >
                        Use in Map
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleEditItem('landmarks', landmark)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteItem('landmarks', landmark.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="library-item-details">
                    <p><strong>Domains:</strong> {landmark.domains.join(', ')}</p>
                    <p><strong>Default Stress:</strong> {landmark.defaultStress}</p>
                    {landmark.haunts.length > 0 && (
                      <p><strong>Haunts:</strong> {landmark.haunts.join(', ')}</p>
                    )}
                    {landmark.bonds.length > 0 && (
                      <p><strong>Bonds:</strong> {landmark.bonds.join(', ')}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'delves':
        return (
          <div className="library-items">
            {library.delves.length === 0 ? (
              <p className="empty-message">No delves saved to library yet.</p>
            ) : (
              library.delves.map(delve => (
                <div key={delve.id} className="library-item">
                  <div className="library-item-header">
                    <h3>{delve.name}</h3>
                    <div className="library-item-actions">
                      <Button
                        variant="secondary"
                        onClick={() => handleUseItem('delves', delve)}
                      >
                        Use in Map
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleEditItem('delves', delve)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteItem('delves', delve.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="library-item-details">
                    <p><strong>Resistance:</strong> {delve.resistance}</p>
                    <p><strong>Domains:</strong> {delve.domains.join(', ')}</p>
                    {delve.events.length > 0 && (
                      <p><strong>Events:</strong> {delve.events.join(', ')}</p>
                    )}
                    {delve.resources.length > 0 && (
                      <p><strong>Resources:</strong> {delve.resources.join(', ')}</p>
                    )}
                    {delve.monsters.length > 0 && (
                      <p><strong>Monsters:</strong> {delve.monsters.length} monster(s)</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'monsters':
        return (
          <div className="library-items">
            {library.monsters.length === 0 ? (
              <p className="empty-message">No monsters saved to library yet.</p>
            ) : (
              library.monsters.map(monster => (
                <div key={monster.id} className="library-item">
                  <div className="library-item-header">
                    <h3>{monster.name}</h3>
                    <div className="library-item-actions">
                      <Button
                        variant="secondary"
                        onClick={() => handleUseItem('monsters', monster)}
                      >
                        Use in Delve
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleEditItem('monsters', monster)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteItem('monsters', monster.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="library-item-details">
                    <p><strong>Resistance:</strong> {monster.resistance}</p>
                    <p><strong>Protection:</strong> {monster.protection}</p>
                    {monster.attacks.length > 0 && (
                      <p><strong>Attacks:</strong> {monster.attacks.join(', ')}</p>
                    )}
                    {monster.resources.length > 0 && (
                      <p><strong>Resources:</strong> {monster.resources.join(', ')}</p>
                    )}
                    {monster.notes && (
                      <p><strong>Notes:</strong> {monster.notes}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderEditModal = () => {
    if (!editingItem) return null;

    switch (editingItem.type) {
      case 'landmarks':
        return (
          <LandmarkForm
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingItem(null);
            }}
            onSubmit={handleSaveEdit}
            initialData={editingItem.item as Landmark}
            title="Edit Landmark"
          />
        );
      case 'delves':
        return (
          <DelveForm
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingItem(null);
            }}
            onSubmit={handleSaveEdit}
            initialData={editingItem.item as Delve}
            title="Edit Delve"
          />
        );
      case 'monsters':
        return (
          <MonsterForm
            monster={editingItem.item as Monster}
            onSave={handleSaveEdit}
            onCancel={() => {
              setShowEditModal(false);
              setEditingItem(null);
            }}
            isEditing={true}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="library-page">
      <div className="library-header">
        <h1>Personal Library</h1>
        <p>Manage your saved landmarks, delves, and monsters</p>
      </div>

      <div className="library-tabs">
        <button
          className={`tab-button ${activeTab === 'landmarks' ? 'active' : ''}`}
          onClick={() => setActiveTab('landmarks')}
        >
          Landmarks ({library.landmarks.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'delves' ? 'active' : ''}`}
          onClick={() => setActiveTab('delves')}
        >
          Delves ({library.delves.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'monsters' ? 'active' : ''}`}
          onClick={() => setActiveTab('monsters')}
        >
          Monsters ({library.monsters.length})
        </button>
      </div>

      <div className="library-content">
        {renderTabContent()}
      </div>

      {showEditModal && editingItem?.type === 'monsters' && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingItem(null);
          }}
          title="Edit Monster"
        >
          {renderEditModal()}
        </Modal>
      )}
      
      {showEditModal && (editingItem?.type === 'landmarks' || editingItem?.type === 'delves') && renderEditModal()}
    </div>
  );
}