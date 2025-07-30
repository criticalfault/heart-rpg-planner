/**
 * Demonstration script for persistence functionality
 * This file shows how the persistence features work and can be used for testing
 */

import { DelveMap, Library, Landmark, Delve } from '../types';
import { 
  libraryStorage, 
  mapsStorage, 
  currentMapStorage, 
  autoSaveStorage,
  exportData,
  importData,
  getStorageInfo,
  clearAllData
} from './localStorage';

// Sample data for demonstration
const sampleLandmark: Landmark = {
  id: 'demo-landmark-1',
  name: 'The Cursed Cathedral',
  domains: ['Cursed', 'Religion'],
  defaultStress: 'd8',
  haunts: ['Ghostly choir', 'Bleeding walls'],
  bonds: ['Ancient faith', 'Lost congregation']
};

const sampleDelve: Delve = {
  id: 'demo-delve-1',
  name: 'The Bone Gardens',
  resistance: 30,
  domains: ['Cursed', 'Desolate'],
  events: ['Skeleton ambush', 'Bone storm'],
  resources: ['Ancient bones', 'Cursed soil'],
  monsters: [
    {
      id: 'demo-monster-1',
      name: 'Bone Gardener',
      resistance: 15,
      protection: 8,
      attacks: ['Bone spear', 'Necrotic touch'],
      resources: ['Bone fragments', 'Death essence'],
      notes: 'A skeletal figure that tends to the bone gardens, hostile to intruders.'
    }
  ]
};

const sampleMap: DelveMap = {
  id: 'demo-map-1',
  name: 'The Cursed District',
  landmarks: [sampleLandmark],
  delves: [sampleDelve],
  placedCards: [
    {
      id: 'demo-landmark-1',
      type: 'landmark',
      position: { q: 0, r: 0 }
    },
    {
      id: 'demo-delve-1',
      type: 'delve',
      position: { q: 1, r: 0 }
    }
  ],
  connections: [
    {
      id: 'demo-connection-1',
      fromId: 'demo-landmark-1',
      toId: 'demo-delve-1',
      type: 'landmark-to-delve'
    }
  ],
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-02')
};

const sampleLibrary: Library = {
  monsters: [sampleDelve.monsters[0]],
  landmarks: [sampleLandmark],
  delves: [sampleDelve]
};

/**
 * Demonstration functions
 */
export const persistenceDemo = {
  /**
   * Initialize demo data
   */
  initializeDemoData: () => {
    console.log('🚀 Initializing demo data...');
    
    // Save sample library
    libraryStorage.save(sampleLibrary);
    console.log('✅ Library saved');
    
    // Save sample map
    mapsStorage.saveMap(sampleMap);
    console.log('✅ Map saved');
    
    // Set as current map
    currentMapStorage.save(sampleMap);
    console.log('✅ Current map set');
    
    // Create auto-save data
    autoSaveStorage.save({
      ...sampleMap,
      landmarks: [
        ...sampleMap.landmarks,
        {
          id: 'auto-save-landmark',
          name: 'Auto-saved Landmark',
          domains: ['Haven'],
          defaultStress: 'd6',
          haunts: [],
          bonds: []
        }
      ]
    });
    console.log('✅ Auto-save data created');
    
    console.log('🎉 Demo data initialized successfully!');
  },

  /**
   * Show current storage status
   */
  showStorageStatus: () => {
    console.log('📊 Storage Status:');
    const info = getStorageInfo();
    
    if (info.available) {
      console.log(`  Total usage: ${info.usage} bytes`);
      console.log(`  Library size: ${info.librarySize} bytes`);
      console.log(`  Maps size: ${info.mapsSize} bytes`);
      console.log(`  Current map size: ${info.currentMapSize} bytes`);
      console.log(`  Auto-save size: ${info.autoSaveSize} bytes`);
    } else {
      console.log('  ❌ Local storage not available');
    }
  },

  /**
   * Demonstrate export functionality
   */
  demonstrateExport: () => {
    console.log('📤 Export Demo:');
    
    // Export library
    const libraryJson = exportData.library(sampleLibrary);
    console.log('  Library export:', JSON.parse(libraryJson));
    
    // Export map
    const mapJson = exportData.map(sampleMap);
    console.log('  Map export:', JSON.parse(mapJson));
    
    // Export all maps
    const allMapsJson = exportData.allMaps([sampleMap]);
    console.log('  All maps export:', JSON.parse(allMapsJson));
  },

  /**
   * Demonstrate import functionality
   */
  demonstrateImport: () => {
    console.log('📥 Import Demo:');
    
    try {
      // Import library
      const libraryJson = exportData.library(sampleLibrary);
      const importedLibrary = importData.library(libraryJson);
      console.log('  ✅ Library import successful:', importedLibrary);
      
      // Import map
      const mapJson = exportData.map(sampleMap);
      const importedMap = importData.map(mapJson);
      console.log('  ✅ Map import successful:', importedMap);
      
      // Import maps
      const mapsJson = exportData.allMaps([sampleMap]);
      const importedMaps = importData.maps(mapsJson);
      console.log('  ✅ Maps import successful:', importedMaps);
      
    } catch (error) {
      console.error('  ❌ Import failed:', error);
    }
  },

  /**
   * Demonstrate auto-save functionality
   */
  demonstrateAutoSave: () => {
    console.log('💾 Auto-save Demo:');
    
    // Check if auto-save exists
    const hasAutoSave = autoSaveStorage.hasAutoSave();
    console.log(`  Has auto-save: ${hasAutoSave}`);
    
    if (hasAutoSave) {
      const autoSaveData = autoSaveStorage.load();
      console.log('  Auto-save data:', autoSaveData);
    }
    
    // Create new auto-save
    const modifiedMap = {
      ...sampleMap,
      name: 'Modified Map',
      updatedAt: new Date()
    };
    
    autoSaveStorage.save(modifiedMap);
    console.log('  ✅ New auto-save created');
  },

  /**
   * Test error handling
   */
  testErrorHandling: () => {
    console.log('🧪 Error Handling Demo:');
    
    try {
      // Test invalid JSON import
      importData.library('invalid json');
    } catch (error) {
      console.log('  ✅ Invalid JSON handled:', (error as Error).message);
    }
    
    try {
      // Test invalid library structure
      importData.library('{"invalid": "structure"}');
    } catch (error) {
      console.log('  ✅ Invalid structure handled:', (error as Error).message);
    }
  },

  /**
   * Clean up demo data
   */
  cleanup: () => {
    console.log('🧹 Cleaning up demo data...');
    clearAllData();
    console.log('✅ All demo data cleared');
  },

  /**
   * Run full demo
   */
  runFullDemo: () => {
    console.log('🎬 Starting Full Persistence Demo');
    console.log('=====================================');
    
    persistenceDemo.initializeDemoData();
    console.log('');
    
    persistenceDemo.showStorageStatus();
    console.log('');
    
    persistenceDemo.demonstrateExport();
    console.log('');
    
    persistenceDemo.demonstrateImport();
    console.log('');
    
    persistenceDemo.demonstrateAutoSave();
    console.log('');
    
    persistenceDemo.testErrorHandling();
    console.log('');
    
    console.log('🎉 Demo completed successfully!');
    console.log('Run persistenceDemo.cleanup() to clean up demo data');
  }
};

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).persistenceDemo = persistenceDemo;
}