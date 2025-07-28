import React, { useRef, useEffect, useState, useCallback } from 'react';
import { HexPosition } from '../../types';
import { 
  hexToPixel, 
  pixelToHex, 
  getHexCorners,
  snapToHex,
  HexGridConfig,
  DEFAULT_HEX_CONFIG,
  PixelPosition 
} from '../../utils/hexUtils';
import { DragPreviewData } from '../cards/DraggableCard';
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

export const HexGrid: React.FC<HexGridProps> = ({
  width,
  height,
  config = DEFAULT_HEX_CONFIG,
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

  // Calculate visible hex range based on viewport
  const getVisibleHexRange = useCallback(() => {
    const padding = config.hexSize * 2;
    const topLeft = pixelToHex({ x: -padding, y: -padding }, config);
    const bottomRight = pixelToHex({ x: width + padding, y: height + padding }, config);
    
    return {
      minQ: Math.floor(topLeft.q) - 1,
      maxQ: Math.ceil(bottomRight.q) + 1,
      minR: Math.floor(topLeft.r) - 1,
      maxR: Math.ceil(bottomRight.r) + 1,
    };
  }, [width, height, config]);

  // Draw the hex grid
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !showGrid) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const { minQ, maxQ, minR, maxR } = getVisibleHexRange();

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    // Draw hexagons
    for (let q = minQ; q <= maxQ; q++) {
      for (let r = minR; r <= maxR; r++) {
        const hex = { q, r };
        const center = hexToPixel(hex, config);
        
        // Skip if hex is outside viewport
        if (center.x < -config.hexSize || center.x > width + config.hexSize ||
            center.y < -config.hexSize || center.y > height + config.hexSize) {
          continue;
        }

        const corners = getHexCorners(center, config);
        
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        for (let i = 1; i < corners.length; i++) {
          ctx.lineTo(corners[i].x, corners[i].y);
        }
        ctx.closePath();
        
        // Highlight hovered hex
        if (hoveredHex && hoveredHex.q === q && hoveredHex.r === r) {
          ctx.fillStyle = 'rgba(0, 123, 255, 0.1)';
          ctx.fill();
        }

        // Highlight drag over hex
        if (dragOverHex && dragOverHex.q === q && dragOverHex.r === r) {
          ctx.fillStyle = canDropOnHex ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)';
          ctx.fill();
        }
        
        ctx.stroke();
      }
    }
  }, [width, height, config, showGrid, hoveredHex, dragOverHex, canDropOnHex, getVisibleHexRange]);

  // Handle mouse events
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const pixel = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    const hex = pixelToHex(pixel, config);
    setHoveredHex(hex);
    onHexHover?.(hex, pixel);
  }, [config, onHexHover]);

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

    const hex = pixelToHex(pixel, config);
    onHexClick?.(hex, pixel);
  }, [config, onHexClick]);

  // Handle drag over for the entire grid
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (!containerRef.current || !onDrop) return;

    event.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    const pixel = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    const { hex } = snapToHex(pixel, config);
    
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
  }, [config, onDrop, isOccupied]);

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

    const { hex } = snapToHex(pixel, config);

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
  }, [config, onDrop, isOccupied]);

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

export default HexGrid;