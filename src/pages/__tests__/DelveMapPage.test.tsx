import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { DelveMapPage } from '../DelveMapPage';
import { DelveMapProvider } from '../../context/DelveMapContext';

// Mock the hex utils
vi.mock('../../utils/hexUtils', () => ({
  hexToPixel: vi.fn(() => ({ x: 100, y: 100 })),
  pixelToHex: vi.fn(() => ({ q: 0, r: 0 })),
  snapToHex: vi.fn(() => ({ hex: { q: 0, r: 0 }, pixel: { x: 100, y: 100 } })),
  getHexCorners: vi.fn(() => [
    { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 15, y: 8 },
    { x: 10, y: 16 }, { x: 0, y: 16 }, { x: -5, y: 8 }
  ]),
  DEFAULT_HEX_CONFIG: {
    hexSize: 30,
    hexWidth: 52,
    hexHeight: 60
  }
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock getBoundingClientRect
Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  configurable: true,
  value: vi.fn(() => ({
    width: 800,
    height: 600,
    top: 0,
    left: 0,
    bottom: 600,
    right: 800,
  })),
});

const renderDelveMapPage = () => {
  return render(
    <DelveMapProvider>
      <DelveMapPage />
    </DelveMapProvider>
  );
};

describe('DelveMapPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main delve map interface', () => {
    renderDelveMapPage();
    
    expect(screen.getByText('Delve Map')).toBeInTheDocument();
    expect(screen.getByText('Add Landmark')).toBeInTheDocument();
    expect(screen.getByText('Add Delve')).toBeInTheDocument();
  });

  it('displays toolbar with view controls', () => {
    renderDelveMapPage();
    
    expect(screen.getByText('Grid')).toBeInTheDocument();
    expect(screen.getByText('Connections')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument(); // Zoom out button
    expect(screen.getByText('+')).toBeInTheDocument(); // Zoom in button
    expect(screen.getByText('100%')).toBeInTheDocument(); // Zoom level
  });

  it('opens landmark form when Add Landmark button is clicked', async () => {
    renderDelveMapPage();
    
    const addLandmarkButton = screen.getByText('Add Landmark');
    fireEvent.click(addLandmarkButton);
    
    await waitFor(() => {
      expect(screen.getByText('Add New Landmark')).toBeInTheDocument();
    });
  });

  it('opens delve form when Add Delve button is clicked', async () => {
    renderDelveMapPage();
    
    const addDelveButton = screen.getByText('Add Delve');
    fireEvent.click(addDelveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Add New Delve')).toBeInTheDocument();
    });
  });

  it('toggles grid visibility when Grid button is clicked', () => {
    renderDelveMapPage();
    
    const gridButton = screen.getByText('Grid');
    
    // Grid should be visible by default (primary variant)
    expect(gridButton).toHaveClass('button--primary');
    
    fireEvent.click(gridButton);
    
    // After click, should toggle to secondary variant
    expect(gridButton).toHaveClass('button--secondary');
  });

  it('toggles connection visibility when Connections button is clicked', () => {
    renderDelveMapPage();
    
    const connectionsButton = screen.getByText('Connections');
    
    // Connections should be visible by default (primary variant)
    expect(connectionsButton).toHaveClass('button--primary');
    
    fireEvent.click(connectionsButton);
    
    // After click, should toggle to secondary variant
    expect(connectionsButton).toHaveClass('button--secondary');
  });

  it('handles zoom controls correctly', () => {
    renderDelveMapPage();
    
    const zoomInButton = screen.getByText('+');
    const zoomOutButton = screen.getByText('-');
    const zoomLevel = screen.getByText('100%');
    
    expect(zoomLevel).toBeInTheDocument();
    
    // Test zoom in
    fireEvent.click(zoomInButton);
    expect(screen.getByText('110%')).toBeInTheDocument();
    
    // Test zoom out
    fireEvent.click(zoomOutButton);
    fireEvent.click(zoomOutButton);
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('disables zoom buttons at limits', () => {
    renderDelveMapPage();
    
    const zoomInButton = screen.getByText('+');
    const zoomOutButton = screen.getByText('-');
    
    // Zoom to maximum
    for (let i = 0; i < 15; i++) {
      fireEvent.click(zoomInButton);
    }
    expect(zoomInButton).toBeDisabled();
    
    // Zoom to minimum
    for (let i = 0; i < 20; i++) {
      fireEvent.click(zoomOutButton);
    }
    expect(zoomOutButton).toBeDisabled();
  });

  it('renders hex grid component', () => {
    renderDelveMapPage();
    
    const hexGrid = document.querySelector('.delve-map-grid');
    expect(hexGrid).toBeInTheDocument();
  });

  it('renders connection manager component', () => {
    renderDelveMapPage();
    
    const connectionManager = document.querySelector('.connection-manager');
    expect(connectionManager).toBeInTheDocument();
  });

  it('handles container resize', () => {
    renderDelveMapPage();
    
    // Trigger resize event
    fireEvent(window, new Event('resize'));
    
    // Component should still be rendered correctly
    expect(screen.getByText('Delve Map')).toBeInTheDocument();
  });

  it('applies zoom transform to map container', () => {
    renderDelveMapPage();
    
    const zoomInButton = screen.getByText('+');
    fireEvent.click(zoomInButton);
    
    const mapContainer = document.querySelector('.delve-map-container');
    expect(mapContainer).toHaveStyle('transform: scale(1.1)');
  });

  it('closes forms when cancel is clicked', async () => {
    renderDelveMapPage();
    
    // Open landmark form
    fireEvent.click(screen.getByText('Add Landmark'));
    await waitFor(() => {
      expect(screen.getByText('Add New Landmark')).toBeInTheDocument();
    });
    
    // Close form
    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() => {
      expect(screen.queryByText('Add New Landmark')).not.toBeInTheDocument();
    });
  });
});

describe('DelveMapPage Integration', () => {
  it('integrates with hex grid for card positioning', () => {
    renderDelveMapPage();
    
    // The hex grid should be rendered with proper props
    const hexGrid = document.querySelector('.hex-grid');
    expect(hexGrid).toBeInTheDocument();
  });

  it('integrates with drag and drop system', () => {
    renderDelveMapPage();
    
    // Should render draggable cards container
    const mapContainer = document.querySelector('.delve-map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  it('integrates with connection system', () => {
    renderDelveMapPage();
    
    // Connection manager should be present
    const connectionManager = document.querySelector('.connection-manager');
    expect(connectionManager).toBeInTheDocument();
  });
});