import { useState } from 'react';
import { useDelveMapContext } from '../../context/DelveMapContext';
import { useImportExport } from '../../hooks/useImportExport';
import { getStorageInfo, clearAllData, autoSaveStorage } from '../../utils/localStorage';
import { Button } from './Button';
import { Modal } from './Modal';

interface PersistenceManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PersistenceManager({ isOpen, onClose }: PersistenceManagerProps) {
  const { state, dispatch, autoSave } = useDelveMapContext();
  const [storageInfo, setStorageInfo] = useState(getStorageInfo());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showAutoSaveRestore, setShowAutoSaveRestore] = useState(false);

  const {
    exportMap,
    exportAllMaps,
    exportLibrary,
    selectAndImportMap,
    selectAndImportMaps,
    selectAndImportLibrary
  } = useImportExport({
    onImportSuccess: (type, data) => {
      if (type === 'map') {
        dispatch({ type: 'IMPORT_MAP', payload: data });
      } else if (type === 'library') {
        dispatch({ type: 'IMPORT_LIBRARY', payload: { library: data, merge: false } });
      }
      // Refresh storage info
      setStorageInfo(getStorageInfo());
    },
    onImportError: (error) => {
      alert(`Import failed: ${error.message}`);
    },
    onExportSuccess: (type) => {
      console.log(`Successfully exported ${type}`);
    },
    onExportError: (error) => {
      alert(`Export failed: ${error.message}`);
    }
  });

  const handleClearAllData = () => {
    clearAllData();
    dispatch({ type: 'CLEAR_MAP' });
    setStorageInfo(getStorageInfo());
    setShowClearConfirm(false);
    alert('All data cleared successfully');
  };

  const handleRestoreAutoSave = () => {
    const autoSaveData = autoSaveStorage.load();
    if (autoSaveData) {
      dispatch({ type: 'RESTORE_FROM_AUTO_SAVE', payload: autoSaveData });
      setShowAutoSaveRestore(false);
      alert('Auto-save data restored successfully');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const usagePercentage = storageInfo.available 
    ? Math.round((storageInfo.usage / storageInfo.total) * 100)
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Data Management">
      <div className="persistence-manager">
        {/* Storage Information */}
        <section className="storage-info">
          <h3>Storage Information</h3>
          {storageInfo.available ? (
            <div>
              <div className="storage-usage">
                <div className="usage-bar">
                  <div 
                    className="usage-fill" 
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
                <p>
                  {formatBytes(storageInfo.usage)} / {formatBytes(storageInfo.total)} 
                  ({usagePercentage}% used)
                </p>
              </div>
              <div className="storage-breakdown">
                <p>Library: {formatBytes(storageInfo.librarySize || 0)}</p>
                <p>Maps: {formatBytes(storageInfo.mapsSize || 0)}</p>
                <p>Current Map: {formatBytes(storageInfo.currentMapSize || 0)}</p>
                <p>Auto-save: {formatBytes(storageInfo.autoSaveSize || 0)}</p>
              </div>
            </div>
          ) : (
            <p>Local storage is not available</p>
          )}
        </section>

        {/* Auto-save Status */}
        <section className="auto-save-status">
          <h3>Auto-save</h3>
          <p>Status: {autoSave.isAutoSaveEnabled ? 'Enabled' : 'Disabled'}</p>
          <p>Unsaved changes: {autoSave.hasUnsavedChanges() ? 'Yes' : 'No'}</p>
          <div className="auto-save-actions">
            <Button onClick={autoSave.saveNow}>Save Now</Button>
            {autoSaveStorage.hasAutoSave() && (
              <Button 
                variant="secondary" 
                onClick={() => setShowAutoSaveRestore(true)}
              >
                Restore Auto-save
              </Button>
            )}
          </div>
        </section>

        {/* Export Functions */}
        <section className="export-section">
          <h3>Export Data</h3>
          <div className="export-actions">
            {state.currentMap && (
              <Button onClick={() => exportMap(state.currentMap!)}>
                Export Current Map
              </Button>
            )}
            <Button onClick={exportAllMaps}>Export All Maps</Button>
            <Button onClick={() => exportLibrary(state.library)}>
              Export Library
            </Button>
          </div>
        </section>

        {/* Import Functions */}
        <section className="import-section">
          <h3>Import Data</h3>
          <div className="import-actions">
            <Button onClick={selectAndImportMap}>Import Map</Button>
            <Button onClick={selectAndImportMaps}>Import Maps</Button>
            <Button onClick={() => selectAndImportLibrary(false)}>
              Import Library (Replace)
            </Button>
            <Button onClick={() => selectAndImportLibrary(true)}>
              Import Library (Merge)
            </Button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="danger-zone">
          <h3>Danger Zone</h3>
          <Button 
            variant="secondary" 
            onClick={() => setShowClearConfirm(true)}
          >
            Clear All Data
          </Button>
        </section>

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <Modal 
            isOpen={showClearConfirm} 
            onClose={() => setShowClearConfirm(false)}
            title="Confirm Clear All Data"
          >
            <div>
              <p>
                This will permanently delete all your maps, library items, and settings. 
                This action cannot be undone.
              </p>
              <p>Are you sure you want to continue?</p>
              <div className="modal-actions">
                <Button onClick={handleClearAllData}>Yes, Clear All Data</Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Auto-save Restore Modal */}
        {showAutoSaveRestore && (
          <Modal 
            isOpen={showAutoSaveRestore} 
            onClose={() => setShowAutoSaveRestore(false)}
            title="Restore Auto-save Data"
          >
            <div>
              <p>
                Auto-save data was found. This will restore your map to the last 
                auto-saved state, potentially overwriting current changes.
              </p>
              <p>Do you want to restore the auto-save data?</p>
              <div className="modal-actions">
                <Button onClick={handleRestoreAutoSave}>Restore</Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowAutoSaveRestore(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Modal>
  );
}