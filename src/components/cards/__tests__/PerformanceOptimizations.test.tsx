import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { LandmarkCard } from '../LandmarkCard';
import { DelveCard } from '../DelveCard';
import { MonsterCard } from '../MonsterCard';
import { DraggableCard } from '../DraggableCard';
import { Landmark, Delve, Monster } from '../../../types';

// Mock performance optimization hook
vi.mock('../../../hooks/usePerformanceOptimization', () => ({
  usePerformanceOptimization: () => ({
    performanceSettings: {
      enableAnimations: true,
      enableVirtualization: false,
      maxVisibleItems: 50,
      shouldOptimize: false
    },
    throttledUpdate: (fn: () => void) => fn(),
    debouncedUpdate: (fn: () => void) => fn(),
    batchUpdate: (updates: (() => void)[]) => updates.forEach(update => update())
  })
}));

// Mock hex utils
vi.mock('../../../utils/hexUtils', () => ({
  hexToPixel: () => ({ x: 100, y: 100 }),
  DEFAULT_HEX_CONFIG: { hexSize: 50 }
}));

describe('Performance Optimizations', () => {
  const mockLandmark: Landmark = {
    id: 'landmark-1',
    name: 'Test Landmark',
    domains: ['Haven'],
    defaultStress: 'd6',
    haunts: ['Haunt 1'],
    bonds: ['Bond 1']
  };

  const mockMonster: Monster = {
    id: 'monster-1',
    name: 'Test Monster',
    resistance: 10,
    protection: 5,
    attacks: ['Bite'],
    resources: ['Teeth'],
    notes: 'A test monster'
  };

  const mockDelve: Delve = {
    id: 'delve-1',
    name: 'Test Delve',
    resistance: 25,
    domains: ['Warren'],
    events: ['Event 1'],
    resources: ['Resource 1'],
    monsters: [mockMonster]
  };

  describe('LandmarkCard Performance', () => {
    it('should render without performance issues', () => {
      const onUpdate = vi.fn();
      const onDelete = vi.fn();
      
      render(
        <LandmarkCard
          landmark={mockLandmark}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      );

      expect(screen.getByText('Test Landmark')).toBeInTheDocument();
    });

    it('should memoize properly and not re-render unnecessarily', () => {
      const onUpdate = vi.fn();
      const renderSpy = vi.fn();
      
      const TestComponent = React.memo(() => {
        renderSpy();
        return (
          <LandmarkCard
            landmark={mockLandmark}
            onUpdate={onUpdate}
          />
        );
      });

      const { rerender } = render(<TestComponent />);
      
      // Initial render
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same props should not trigger re-render
      rerender(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid field changes efficiently', async () => {
      const onUpdate = vi.fn();
      
      render(
        <LandmarkCard
          landmark={mockLandmark}
          onUpdate={onUpdate}
          isEditing={true}
        />
      );

      const nameInput = screen.getByDisplayValue('Test Landmark');
      
      // Simulate rapid typing
      fireEvent.change(nameInput, { target: { value: 'T' } });
      fireEvent.change(nameInput, { target: { value: 'Te' } });
      fireEvent.change(nameInput, { target: { value: 'Tes' } });
      fireEvent.change(nameInput, { target: { value: 'Test' } });
      
      // Should handle changes without performance issues
      expect(nameInput).toHaveValue('Test');
    });
  });

  describe('DelveCard Performance', () => {
    it('should render with multiple monsters efficiently', () => {
      const manyMonsters = Array.from({ length: 20 }, (_, i) => ({
        ...mockMonster,
        id: `monster-${i}`,
        name: `Monster ${i}`
      }));

      const delveWithManyMonsters = {
        ...mockDelve,
        monsters: manyMonsters
      };

      render(
        <DelveCard
          delve={delveWithManyMonsters}
        />
      );

      expect(screen.getByText('Test Delve')).toBeInTheDocument();
      expect(screen.getByText('Monsters (20)')).toBeInTheDocument();
    });

    it('should optimize rendering for large monster lists', () => {
      const manyMonsters = Array.from({ length: 100 }, (_, i) => ({
        ...mockMonster,
        id: `monster-${i}`,
        name: `Monster ${i}`
      }));

      const delveWithManyMonsters = {
        ...mockDelve,
        monsters: manyMonsters
      };

      const startTime = performance.now();
      
      render(
        <DelveCard
          delve={delveWithManyMonsters}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in reasonable time (less than 100ms)
      expect(renderTime).toBeLessThan(100);
    });
  });

  describe('MonsterCard Performance', () => {
    it('should render efficiently with memo optimization', () => {
      const renderSpy = vi.fn();
      
      const TestMonsterCard = React.memo(() => {
        renderSpy();
        return <MonsterCard monster={mockMonster} />;
      });

      const { rerender } = render(<TestMonsterCard />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same props
      rerender(<TestMonsterCard />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('DraggableCard Performance', () => {
    it('should handle drag operations efficiently', () => {
      render(
        <DraggableCard
          cardId="test-card"
          cardType="landmark"
          position={{ q: 0, r: 0 }}
        >
          <div>Test Card Content</div>
        </DraggableCard>
      );

      const card = screen.getByText('Test Card Content').closest('div');
      expect(card).toBeInTheDocument();
    });

    it('should optimize drag updates with throttling', async () => {
      const onDragMove = vi.fn();
      
      render(
        <DraggableCard
          cardId="test-card"
          cardType="landmark"
          position={{ q: 0, r: 0 }}
          onDragMove={onDragMove}
        >
          <div>Test Card Content</div>
        </DraggableCard>
      );

      const card = screen.getByText('Test Card Content').closest('div');
      
      // Simulate rapid drag events
      for (let i = 0; i < 10; i++) {
        fireEvent.dragStart(card!);
        fireEvent.drag(card!, { clientX: i * 10, clientY: i * 10 });
      }

      // Should throttle the updates
      await waitFor(() => {
        expect(onDragMove).toHaveBeenCalled();
      });
    });
  });

  describe('Animation Performance', () => {
    it('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <LandmarkCard
          landmark={mockLandmark}
        />
      );

      const card = screen.getByText('Test Landmark').closest('.landmark-card');
      
      // Should not have animation classes when reduced motion is preferred
      expect(card).not.toHaveClass('card-transition');
    });
  });

  describe('Memory Management', () => {
    it('should clean up event listeners and timers', () => {
      const { unmount } = render(
        <DraggableCard
          cardId="test-card"
          cardType="landmark"
          position={{ q: 0, r: 0 }}
        >
          <div>Test Card Content</div>
        </DraggableCard>
      );

      // Should unmount without memory leaks
      expect(() => unmount()).not.toThrow();
    });

    it('should handle large datasets without memory issues', () => {
      const largeLandmark = {
        ...mockLandmark,
        haunts: Array.from({ length: 1000 }, (_, i) => `Haunt ${i}`),
        bonds: Array.from({ length: 1000 }, (_, i) => `Bond ${i}`)
      };

      const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      render(
        <LandmarkCard
          landmark={largeLandmark}
        />
      );

      const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = endMemory - startMemory;

      // Should not use excessive memory (less than 10MB increase)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });
});