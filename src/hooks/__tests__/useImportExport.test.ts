import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImportExport } from '../useImportExport';
import { DelveMap, Library } from '../../types';
import * as localStorageUtils from '../../utils/localStorage';

// Mock localStorage utilities
vi.mock('../../utils/localStorage', () => ({
  exportData: {
    map: vi.fn(),
    library: vi.fn(),
    allMaps: vi.fn()
  },
  importData: {
    map: vi.fn(),
    library: vi.fn(),
    maps: vi.fn()
  },
  mapsStorage: {
    load: vi.fn(),
    saveMap: vi.fn(),
    save: vi.fn()
  },
  libraryStorage: {
    load: vi.fn(),
    save: vi.fn()
  }
}));

// Mock DOM APIs
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement
});

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild
});

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild
});

Object.defineProperty(URL, 'createObjectURL', {
  value: mockCreateObjectURL
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: mockRevokeObjectURL
});

// Mock FileReader
class MockFileReader {
  onload: ((event: any) => void) | null = null;
  onerror: (() => void) | null = null;
  result: string | null = null;

  readAsText(file: File) {
    setTimeout(() => {
      this.result = file.name === 'valid.json' ? '{"valid": true}' : 'invalid json';
      if (this.onload) {
        this.onload({ target: { result: this.result } });
      }
    }, 0);
  }
}

Object.defineProperty(window, 'FileReader', {
  value: MockFileReader
});

const mockDelveMap: DelveMap = {
  id: 'test-map',
  name: 'Test Map',
  landmarks: [],
  delves: [],
  placedCards: [],
  connections: [],
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-02')
};

const mockLibrary: Library = {
  monsters: [],
  landmarks: [],
  delves: []
};

describe('useImportExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    mockCreateElement.mockReturnValue({
      href: '',
      download: '',
      click: mockClick,
      type: '',
      accept: '',
      style: { display: '' },
      onchange: null
    });
    
    mockCreateObjectURL.mockReturnValue('blob:mock-url');
    
    vi.mocked(localStorageUtils.exportData.map).mockReturnValue('{"map": "data"}');
    vi.mocked(localStorageUtils.exportData.library).mockReturnValue('{"library": "data"}');
    vi.mocked(localStorageUtils.exportData.allMaps).mockReturnValue('[{"maps": "data"}]');
    
    vi.mocked(localStorageUtils.importData.map).mockReturnValue(mockDelveMap);
    vi.mocked(localStorageUtils.importData.library).mockReturnValue(mockLibrary);
    vi.mocked(localStorageUtils.importData.maps).mockReturnValue([mockDelveMap]);
    
    vi.mocked(localStorageUtils.mapsStorage.load).mockReturnValue([]);
    vi.mocked(localStorageUtils.libraryStorage.load).mockReturnValue(mockLibrary);
  });

  describe('export functions', () => {
    it('should export map successfully', () => {
      const onExportSuccess = vi.fn();
      const { result } = renderHook(() => 
        useImportExport({ onExportSuccess })
      );

      act(() => {
        result.current.exportMap(mockDelveMap);
      });

      expect(localStorageUtils.exportData.map).toHaveBeenCalledWith(mockDelveMap);
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
      expect(onExportSuccess).toHaveBeenCalledWith('map');
    });

    it('should export all maps successfully', () => {
      const onExportSuccess = vi.fn();
      const { result } = renderHook(() => 
        useImportExport({ onExportSuccess })
      );

      act(() => {
        result.current.exportAllMaps();
      });

      expect(localStorageUtils.mapsStorage.load).toHaveBeenCalled();
      expect(localStorageUtils.exportData.allMaps).toHaveBeenCalled();
      expect(onExportSuccess).toHaveBeenCalledWith('maps');
    });

    it('should export library successfully', () => {
      const onExportSuccess = vi.fn();
      const { result } = renderHook(() => 
        useImportExport({ onExportSuccess })
      );

      act(() => {
        result.current.exportLibrary(mockLibrary);
      });

      expect(localStorageUtils.exportData.library).toHaveBeenCalledWith(mockLibrary);
      expect(onExportSuccess).toHaveBeenCalledWith('library');
    });

    it('should handle export errors', () => {
      const onExportError = vi.fn();
      const exportError = new Error('Export failed');
      
      vi.mocked(localStorageUtils.exportData.map).mockImplementation(() => {
        throw exportError;
      });

      const { result } = renderHook(() => 
        useImportExport({ onExportError })
      );

      act(() => {
        result.current.exportMap(mockDelveMap);
      });

      expect(onExportError).toHaveBeenCalledWith(exportError);
    });
  });

  describe('import functions', () => {
    it('should import map successfully', async () => {
      const onImportSuccess = vi.fn();
      const { result } = renderHook(() => 
        useImportExport({ onImportSuccess })
      );

      const mockFile = new File(['{"map": "data"}'], 'valid.json', { type: 'application/json' });

      await act(async () => {
        const promise = result.current.importMap(mockFile);
        await promise;
      });

      expect(localStorageUtils.importData.map).toHaveBeenCalled();
      expect(localStorageUtils.mapsStorage.saveMap).toHaveBeenCalledWith(mockDelveMap);
      expect(onImportSuccess).toHaveBeenCalledWith('map', mockDelveMap);
    });

    it('should import maps successfully', async () => {
      const onImportSuccess = vi.fn();
      const { result } = renderHook(() => 
        useImportExport({ onImportSuccess })
      );

      const mockFile = new File(['[{"maps": "data"}]'], 'valid.json', { type: 'application/json' });

      await act(async () => {
        const promise = result.current.importMaps(mockFile);
        await promise;
      });

      expect(localStorageUtils.importData.maps).toHaveBeenCalled();
      expect(localStorageUtils.mapsStorage.save).toHaveBeenCalled();
      expect(onImportSuccess).toHaveBeenCalledWith('maps', [mockDelveMap]);
    });

    it('should import library successfully', async () => {
      const onImportSuccess = vi.fn();
      const { result } = renderHook(() => 
        useImportExport({ onImportSuccess })
      );

      const mockFile = new File(['{"library": "data"}'], 'valid.json', { type: 'application/json' });

      await act(async () => {
        const promise = result.current.importLibrary(mockFile, false);
        await promise;
      });

      expect(localStorageUtils.importData.library).toHaveBeenCalled();
      expect(localStorageUtils.libraryStorage.save).toHaveBeenCalledWith(mockLibrary);
      expect(onImportSuccess).toHaveBeenCalledWith('library', mockLibrary);
    });

    it('should merge library when merge is true', async () => {
      const existingLibrary: Library = {
        monsters: [{ id: 'existing', name: 'Existing', resistance: 1, protection: 1, attacks: [], resources: [], notes: '' }],
        landmarks: [],
        delves: []
      };

      vi.mocked(localStorageUtils.libraryStorage.load).mockReturnValue(existingLibrary);

      const { result } = renderHook(() => useImportExport());

      const mockFile = new File(['{"library": "data"}'], 'valid.json', { type: 'application/json' });

      await act(async () => {
        const promise = result.current.importLibrary(mockFile, true);
        await promise;
      });

      expect(localStorageUtils.libraryStorage.save).toHaveBeenCalledWith({
        monsters: [...existingLibrary.monsters, ...mockLibrary.monsters],
        landmarks: [...existingLibrary.landmarks, ...mockLibrary.landmarks],
        delves: [...existingLibrary.delves, ...mockLibrary.delves]
      });
    });

    it('should handle import errors', async () => {
      const onImportError = vi.fn();
      const importError = new Error('Import failed');
      
      vi.mocked(localStorageUtils.importData.map).mockImplementation(() => {
        throw importError;
      });

      const { result } = renderHook(() => 
        useImportExport({ onImportError })
      );

      const mockFile = new File(['invalid'], 'invalid.json', { type: 'application/json' });

      await act(async () => {
        try {
          await result.current.importMap(mockFile);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(onImportError).toHaveBeenCalledWith(importError);
    });

    it('should handle file read errors', async () => {
      const onImportError = vi.fn();
      
      // Mock FileReader to simulate error
      class ErrorFileReader extends MockFileReader {
        readAsText() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror();
            }
          }, 0);
        }
      }

      Object.defineProperty(window, 'FileReader', {
        value: ErrorFileReader
      });

      const { result } = renderHook(() => 
        useImportExport({ onImportError })
      );

      const mockFile = new File(['data'], 'test.json', { type: 'application/json' });

      await act(async () => {
        try {
          await result.current.importMap(mockFile);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(onImportError).toHaveBeenCalledWith(new Error('Failed to read file'));

      // Restore original FileReader
      Object.defineProperty(window, 'FileReader', {
        value: MockFileReader
      });
    });
  });

  describe('convenience functions', () => {
    it('should create file input for map import', () => {
      const { result } = renderHook(() => useImportExport());

      act(() => {
        result.current.selectAndImportMap();
      });

      expect(mockCreateElement).toHaveBeenCalledWith('input');
      expect(mockAppendChild).toHaveBeenCalled();
    });

    it('should create file input for maps import', () => {
      const { result } = renderHook(() => useImportExport());

      act(() => {
        result.current.selectAndImportMaps();
      });

      expect(mockCreateElement).toHaveBeenCalledWith('input');
    });

    it('should create file input for library import', () => {
      const { result } = renderHook(() => useImportExport());

      act(() => {
        result.current.selectAndImportLibrary(false);
      });

      expect(mockCreateElement).toHaveBeenCalledWith('input');
    });
  });
});