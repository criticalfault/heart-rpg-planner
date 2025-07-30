import { useCallback } from 'react';
import { DelveMap, Library } from '../types';
import { exportData, importData, mapsStorage, libraryStorage } from '../utils/localStorage';

interface UseImportExportOptions {
  onImportSuccess?: (type: 'map' | 'maps' | 'library', data: any) => void;
  onImportError?: (error: Error) => void;
  onExportSuccess?: (type: 'map' | 'maps' | 'library') => void;
  onExportError?: (error: Error) => void;
}

/**
 * Custom hook for import/export functionality
 */
export function useImportExport(options: UseImportExportOptions = {}) {
  const {
    onImportSuccess,
    onImportError,
    onExportSuccess,
    onExportError
  } = options;

  // Export functions
  const exportMap = useCallback((map: DelveMap) => {
    try {
      const jsonString = exportData.map(map);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${map.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_map.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      onExportSuccess?.('map');
    } catch (error) {
      const exportError = error instanceof Error ? error : new Error('Failed to export map');
      console.error('Export map failed:', exportError);
      onExportError?.(exportError);
    }
  }, [onExportSuccess, onExportError]);

  const exportAllMaps = useCallback(() => {
    try {
      const maps = mapsStorage.load();
      const jsonString = exportData.allMaps(maps);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `heart_rpg_maps_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      onExportSuccess?.('maps');
    } catch (error) {
      const exportError = error instanceof Error ? error : new Error('Failed to export maps');
      console.error('Export maps failed:', exportError);
      onExportError?.(exportError);
    }
  }, [onExportSuccess, onExportError]);

  const exportLibrary = useCallback((library: Library) => {
    try {
      const jsonString = exportData.library(library);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `heart_rpg_library_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      onExportSuccess?.('library');
    } catch (error) {
      const exportError = error instanceof Error ? error : new Error('Failed to export library');
      console.error('Export library failed:', exportError);
      onExportError?.(exportError);
    }
  }, [onExportSuccess, onExportError]);

  // Import functions
  const importMap = useCallback((file: File): Promise<DelveMap> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const jsonString = event.target?.result as string;
          const map = importData.map(jsonString);
          
          // Save the imported map
          mapsStorage.saveMap(map);
          
          onImportSuccess?.('map', map);
          resolve(map);
        } catch (error) {
          const importError = error instanceof Error ? error : new Error('Failed to import map');
          console.error('Import map failed:', importError);
          onImportError?.(importError);
          reject(importError);
        }
      };
      
      reader.onerror = () => {
        const error = new Error('Failed to read file');
        onImportError?.(error);
        reject(error);
      };
      
      reader.readAsText(file);
    });
  }, [onImportSuccess, onImportError]);

  const importMaps = useCallback((file: File): Promise<DelveMap[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const jsonString = event.target?.result as string;
          const maps = importData.maps(jsonString);
          
          // Save all imported maps
          const existingMaps = mapsStorage.load();
          const allMaps = [...existingMaps];
          
          maps.forEach(map => {
            const existingIndex = allMaps.findIndex(m => m.id === map.id);
            if (existingIndex >= 0) {
              allMaps[existingIndex] = map;
            } else {
              allMaps.push(map);
            }
          });
          
          mapsStorage.save(allMaps);
          
          onImportSuccess?.('maps', maps);
          resolve(maps);
        } catch (error) {
          const importError = error instanceof Error ? error : new Error('Failed to import maps');
          console.error('Import maps failed:', importError);
          onImportError?.(importError);
          reject(importError);
        }
      };
      
      reader.onerror = () => {
        const error = new Error('Failed to read file');
        onImportError?.(error);
        reject(error);
      };
      
      reader.readAsText(file);
    });
  }, [onImportSuccess, onImportError]);

  const importLibrary = useCallback((file: File, merge: boolean = false): Promise<Library> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const jsonString = event.target?.result as string;
          const importedLibrary = importData.library(jsonString);
          
          let finalLibrary: Library;
          
          if (merge) {
            const existingLibrary = libraryStorage.load();
            finalLibrary = {
              monsters: [...existingLibrary.monsters, ...importedLibrary.monsters],
              landmarks: [...existingLibrary.landmarks, ...importedLibrary.landmarks],
              delves: [...existingLibrary.delves, ...importedLibrary.delves]
            };
          } else {
            finalLibrary = importedLibrary;
          }
          
          libraryStorage.save(finalLibrary);
          
          onImportSuccess?.('library', finalLibrary);
          resolve(finalLibrary);
        } catch (error) {
          const importError = error instanceof Error ? error : new Error('Failed to import library');
          console.error('Import library failed:', importError);
          onImportError?.(importError);
          reject(importError);
        }
      };
      
      reader.onerror = () => {
        const error = new Error('Failed to read file');
        onImportError?.(error);
        reject(error);
      };
      
      reader.readAsText(file);
    });
  }, [onImportSuccess, onImportError]);

  // Utility function to create file input for imports
  const createFileInput = useCallback((
    accept: string,
    onFileSelect: (file: File) => void
  ) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        onFileSelect(file);
      }
      document.body.removeChild(input);
    };
    
    document.body.appendChild(input);
    input.click();
  }, []);

  // Convenience functions that handle file selection
  const selectAndImportMap = useCallback(() => {
    createFileInput('.json', (file) => {
      importMap(file);
    });
  }, [createFileInput, importMap]);

  const selectAndImportMaps = useCallback(() => {
    createFileInput('.json', (file) => {
      importMaps(file);
    });
  }, [createFileInput, importMaps]);

  const selectAndImportLibrary = useCallback((merge: boolean = false) => {
    createFileInput('.json', (file) => {
      importLibrary(file, merge);
    });
  }, [createFileInput, importLibrary]);

  return {
    // Export functions
    exportMap,
    exportAllMaps,
    exportLibrary,
    
    // Import functions
    importMap,
    importMaps,
    importLibrary,
    
    // Convenience functions
    selectAndImportMap,
    selectAndImportMaps,
    selectAndImportLibrary
  };
}