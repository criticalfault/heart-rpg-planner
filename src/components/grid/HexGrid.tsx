import React, { useRef, useEffect, useState, useCallback, memo, useMemo } from 'react';
import { HexPosition } from '../../types';
import { 
  hexToPixel, 
  pixelToHex, 
  getHexCorners,
  snapToHex,
  HexGridConfig,
  getResponsiveHexConfig,
  PixelPosition 
} from '../../utils/hexUtils';
import { DragPreviewData } from '../cards/DraggableCard';
import { rafThrottle } from '../../utils/performance';
import './HexGrid.css';

export interface HexGridProps {
  width: number;
  height: number;
  config?: HexGridConfig;
  showGrid?: boolean;
  onHexClick?: (hex: HexPosition, pixel: PixelPosition) => void;
  onHexHover?: (hex: HexPosition | null, pixel: PixelPosition | null) => void;
  onDrop?: (cardId: string, cardType: 'landmark' | 'delve', position: HexPosition) => void;
  isOccupied?: (position: HexPosition, excludeId?: string) => boolean;
  children?: React.ReactNode;
  className?: string;
}

const HexGridComponent: React.FC<HexGridProps> = ({
  width,
  height,
  config,
  showGrid = true,
  onHexClick,
  onHexHover,
  onDrop,
  isOccupied,
  children,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredHex, setHoveredHex] = useState<HexPosition | null>(null);
  const [dragOverHex, setDragOverHex] = useState<HexPosition | null>(null);
  const [canDropOnHex, setCanDropOnHex] = useState<boolean>(true);
  
  // Use responsive config if none provided - memoize to prevent recalculation
  const effectiveConfig = useMemo(() => 
    config || getResponsiveHexConfig(width), 
    [config, width]
  );

  // Calculate visible hex range based on viewport - memoize for performance
  const visibleHexRange = useMemo(() => {
    const padding = effectiveConfig.hexSize * 1.2; // Optimized padding for large maps
    const topLeft = pixelToHex({ x: -padding, y: -padding }, effectiveConfig);
    const bottomRight = pixelToHex({ x: width + padding, y: height + padding }, effectiveConfig);
    
    // Dynamic range limit based on viewport size for better performance on large maps
    const maxRange = Math.min(100, Math.ceil(Math.max(width, height) / effectiveConfig.hexSize) + 10);
    
    return {
      minQ: Math.max(Math.floor(topLeft.q) - 1, -maxRange),
      maxQ: Math.min(Math.ceil(bottomRight.q) + 1, maxRange),
      minR: Math.max(Math.floor(topLeft.r) - 1, -maxRange),
      maxR: Math.min(Math.ceil(bottomRight.r) + 1, maxRange),
    };
  }, [width, height, effectiveConfig]);

  // Draw the hex grid with performance optimizations
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !showGrid) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const { minQ, maxQ, minR, maxR } = visibleHexRange;

    // Set up drawing context once
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Batch drawing operations for better performance
    ctx.beginPath();

    // Draw all hex outlines in one path
    for (let q = minQ; q <= maxQ; q++) {
      for (let r = minR; r <= maxR; r++) {
        const hex = { q, r };
        const center = hexToPixel(hex, effectiveConfig);
        
        // Skip if hex is outside viewport (with smaller buffer for performance)
        if (center.x < -effectiveConfig.hexSize * 0.5 || center.x > width + effectiveConfig.hexSize * 0.5 ||
            center.y < -effectiveConfig.hexSize * 0.5 || center.y > height + effectiveConfig.hexSize * 0.5) {
          continue;
        }

        const corners = getHexCorners(center, effectiveConfig);
        
        // Add hex path to the batch
        ctx.moveTo(corners[0].x, corners[0].y);
        for (let i = 1; i < corners.length; i++) {
          ctx.lineTo(corners[i].x, corners[i].y);
        }
        ctx.closePath();
      }
    }

    // Stroke all hexes at once
    ctx.stroke();

    // Draw highlights separately (these are less common)
    if (hoveredHex || dragOverHex) {
      const highlightHex = dragOverHex || hoveredHex;
      if (highlightHex) {
        const center = hexToPixel(highlightHex, effectiveConfig);
        const corners = getHexCorners(center, effectiveConfig);
        
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        for (let i = 1; i < corners.length; i++) {
          ctx.lineTo(corners[i].x, corners[i].y);
        }
        ctx.closePath();
        
        if (dragOverHex) {
          ctx.fillStyle = canDropOnHex ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)';
        } else {
          ctx.fillStyle = 'rgba(0, 123, 255, 0.1)';
        }
        ctx.fill();
      }
    }
  }, [width, height, effectiveConfig, showGrid, hoveredHex, dragOverHex, canDropOnHex, visibleHexRange]);

  // Handle mouse events with throttling for better performance
  const handleMouseMove = useCallback(rafThrottle((event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const pixel = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    const hex = pixelToHex(pixel, effectiveConfig);
    setHoveredHex(hex);
    onHexHover?.(hex, pixel);
  }), [effectiveConfig, onHexHover]);

  const handleMouseLeave = useCallback(() => {
    setHoveredHex(null);
    onHexHover?.(null, null);
  }, [onHexHover]);

  const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const pixel = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    const hex = pixelToHex(pixel, effectiveConfig);
    onHexClick?.(hex, pixel);
  }, [effectiveConfig, onHexClick]);

  // Handle drag over for the entire grid with throttling
  const handleDragOver = useCallback(rafThrottle((event: React.DragEvent<HTMLDivElement>) => {
    if (!containerRef.current || !onDrop) return;

    event.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    const pixel = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    const { hex } = snapToHex(pixel, effectiveConfig);
    
    // Check if position is occupied
    try {
      const dragData = JSON.parse(event.dataTransfer.getData('application/json')) as DragPreviewData;
      const occupied = isOccupied ? isOccupied(hex, dragData.cardId) : false;
      setCanDropOnHex(!occupied);
      event.dataTransfer.dropEffect = occupied ? 'none' : 'move';
    } catch {
      setCanDropOnHex(true);
      event.dataTransfer.dropEffect = 'move';
    }

    setDragOverHex(hex);
  }), [effectiveConfig, onDrop, isOccupied]);

  // Handle drag leave
  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    // Only clear if we're actually leaving the grid container
    const rect = containerRef.current.getBoundingClientRect();
    const { clientX, clientY } = event;
    
    if (clientX < rect.left || clientX > rect.right || 
        clientY < rect.top || clientY > rect.bottom) {
      setDragOverHex(null);
      setCanDropOnHex(true);
    }
  }, []);

  // Handle drop on grid
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (!containerRef.current || !onDrop) return;

    event.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    const pixel = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    const { hex } = snapToHex(pixel, effectiveConfig);

    try {
      const dragData = JSON.parse(event.dataTransfer.getData('application/json')) as DragPreviewData;
      
      // Check if drop is valid
      const occupied = isOccupied ? isOccupied(hex, dragData.cardId) : false;
      
      if (!occupied) {
        onDrop(dragData.cardId, dragData.cardType, hex);
      }
    } catch (error) {
      console.error('Failed to parse drag data:', error);
    }

    setDragOverHex(null);
    setCanDropOnHex(true);
  }, [effectiveConfig, onDrop, isOccupied]);

  // Redraw grid when dependencies change
  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;
    drawGrid();
  }, [width, height, drawGrid]);

  return (
    <div
      ref={containerRef}
      className={`hex-grid ${className}`}
      style={{ width, height, position: 'relative' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="hex-grid-canvas"
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          pointerEvents: showGrid ? 'auto' : 'none',
          zIndex: 1 
        }}
      />
      <div 
        className="hex-grid-content"
        style={{ 
          position: 'relative', 
          width: '100%', 
          height: '100%', 
          zIndex: 2 
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Memoized component with custom comparison function for better performance
export const HexGrid = memo(HexGridComponent, (prevProps, nextProps) => {
  // Compare dimensions
  if (prevProps.width !== nextProps.width) return false;
  if (prevProps.height !== nextProps.height) return false;
  
  // Compare config (shallow comparison of key properties)
  const prevConfig = prevProps.config;
  const nextConfig = nextProps.config;
  if (prevConfig?.hexSize !== nextConfig?.hexSize) return false;
  
  // Compare other props
  if (prevProps.showGrid !== nextProps.showGrid) return false;
  if (prevProps.className !== nextProps.className) return false;
  
  // Function props and children are assumed to be stable
  return true;
});

export default HexGrid;