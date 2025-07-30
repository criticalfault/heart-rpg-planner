import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PersistenceManager } from '../PersistenceManager';
import { DelveMapProvider } from '../../../context/DelveMapContext';
import * as localStorageUtils from '../../../utils/localStorage';

// Mock localStorage utilities
vi.mock('../../../utils/localStorage', () => ({
  getStorageInfo: vi.fn(),
  clearAllData: vi.fn(),
  autoSaveStorage: {
    load: vi.fn(),
    clear: vi.fn(),
    hasAutoSave: vi.fn()
  }
}));

// Mock useImportExport hook
vi.mock('../../../hooks/useImportExport', () => ({
  useImportExport: () => ({
    exportMap: vi.fn(),
    exportAllMaps: vi.fn(),
    exportLibrary: vi.fn(),
    selectAndImportMap: vi.fn(),
    selectAndImportMaps: vi.fn(),
    selectAndImportLibrary: vi.fn()
  })
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <DelveMapProvider>
      {component}
    </DelveMapProvider>
  );
};

describe('PersistenceManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    vi.mocked(localStorageUtils.getStorageInfo).mockReturnValue({
      available: true,
      usage: 1024,
      total: 5 * 1024 * 1024,
      librarySize: 512,
      mapsSize: 256,
      currentMapSize: 128,
      autoSaveSize: 64
    });
    
    vi.mocked(localStorageUtils.autoSaveStorage.hasAutoSave).mockReturnValue(false);
    vi.mocked(localStorageUtils.autoSaveStorage.load).mockReturnValue(null);
  });

  it('should render when open', () => {
    renderWithProvider(
      <PersistenceManager isOpen={true} onClose={() => {}} />
    );

    expect(screen.getByText('Data Management')).toBeInTheDocument();
    expect(screen.getByText('Storage Information')).toBeInTheDocument();
    expect(screen.getByText('Auto-save')).toBeInTheDocument();
    expect(screen.getByText('Export Data')).toBeInTheDocument();
    expect(screen.getByText('Import Data')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    renderWithProvider(
      <PersistenceManager isOpen={false} onClose={() => {}} />
    );

    expect(screen.queryByText('Data Management')).not.toBeInTheDocument();
  });

  it('should display storage information', () => {
    renderWithProvider(
      <PersistenceManager isOpen={true} onClose={() => {}} />
    );

    expect(screen.getByText(/1.00 KB \/ 5.00 MB/)).toBeInTheDocument();
    expect(screen.getByText(/Library: 512 Bytes/)).toBeInTheDocument();
    expect(screen.getByText(/Maps: 256 Bytes/)).toBeInTheDocument();
  });

  it('should show auto-save status', () => {
    renderWithProvider(
      <PersistenceManager isOpen={true} onClose={() => {}} />
    );

    expect(screen.getByText('Status: Enabled')).toBeInTheDocument();
    expect(screen.getByText('Save Now')).toBeInTheDocument();
  });

  it('should show restore auto-save button when auto-save data exists', () => {
    vi.mocked(localStorageUtils.autoSaveStorage.hasAutoSave).mockReturnValue(true);
    
    renderWithProvider(
      <PersistenceManager isOpen={true} onClose={() => {}} />
    );

    expect(screen.getByText('Restore Auto-save')).toBeInTheDocument();
  });

  it('should show export buttons', () => {
    renderWithProvider(
      <PersistenceManager isOpen={true} onClose={() => {}} />
    );

    expect(screen.getByText('Export All Maps')).toBeInTheDocument();
    expect(screen.getByText('Export Library')).toBeInTheDocument();
  });

  it('should show import buttons', () => {
    renderWithProvider(
      <PersistenceManager isOpen={true} onClose={() => {}} />
    );

    expect(screen.getByText('Import Map')).toBeInTheDocument();
    expect(screen.getByText('Import Maps')).toBeInTheDocument();
    expect(screen.getByText('Import Library (Replace)')).toBeInTheDocument();
    expect(screen.getByText('Import Library (Merge)')).toBeInTheDocument();
  });

  it('should show clear all data button', () => {
    renderWithProvider(
      <PersistenceManager isOpen={true} onClose={() => {}} />
    );

    expect(screen.getByText('Clear All Data')).toBeInTheDocument();
  });

  it('should show confirmation dialog when clearing data', () => {
    renderWithProvider(
      <PersistenceManager isOpen={true} onClose={() => {}} />
    );

    fireEvent.click(screen.getByText('Clear All Data'));

    expect(screen.getByText('Confirm Clear All Data')).toBeInTheDocument();
    expect(screen.getByText(/This will permanently delete all your maps/)).toBeInTheDocument();
  });

  it('should handle localStorage unavailable', () => {
    vi.mocked(localStorageUtils.getStorageInfo).mockReturnValue({
      available: false,
      usage: 0,
      total: 0
    });

    renderWithProvider(
      <PersistenceManager isOpen={true} onClose={() => {}} />
    );

    expect(screen.getByText('Local storage is not available')).toBeInTheDocument();
  });
});