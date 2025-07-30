import { useEffect, useCallback, useRef } from 'react';
import { HexPosition } from '../types';

export interface KeyboardNavigationOptions {
  onCardSelect?: (cardId: string | null) => void;
  onCardEdit?: (cardId: string) => void;
  onCardDelete?: (cardId: string) => void;
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowKey?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onTab?: (direction: 'forward' | 'backward') => void;
  onHome?: () => void;
  onEnd?: () => void;
  onPageUp?: () => void;
  onPageDown?: () => void;
  isEnabled?: boolean;
  announceChanges?: boolean;
}

export interface KeyboardNavigationState {
  focusedCardId: string | null;
  focusedPosition: HexPosition | null;
}

export function useKeyboardNavigation(
  options: KeyboardNavigationOptions = {},
  cardIds: string[] = []
) {
  const {
    onCardSelect,
    onCardEdit,
    onCardDelete,
    onEscape,
    onEnter,
    onArrowKey,
    onTab,
    onHome,
    onEnd,
    onPageUp,
    onPageDown,
    isEnabled = true,
    announceChanges = true
  } = options;

  const focusedIndexRef = useRef<number>(-1);
  const cardIdsRef = useRef<string[]>([]);
  const announcementRef = useRef<HTMLDivElement | null>(null);

  // Create screen reader announcement element
  useEffect(() => {
    if (announceChanges && !announcementRef.current) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.style.position = 'absolute';
      announcement.style.left = '-10000px';
      announcement.style.width = '1px';
      announcement.style.height = '1px';
      announcement.style.overflow = 'hidden';
      document.body.appendChild(announcement);
      announcementRef.current = announcement;
    }

    return () => {
      if (announcementRef.current) {
        document.body.removeChild(announcementRef.current);
        announcementRef.current = null;
      }
    };
  }, [announceChanges]);

  // Update card IDs reference
  useEffect(() => {
    cardIdsRef.current = cardIds;
  }, [cardIds]);

  // Announce changes to screen readers
  const announce = useCallback((message: string) => {
    if (announceChanges && announcementRef.current) {
      announcementRef.current.textContent = message;
    }
  }, [announceChanges]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;

    const { key, ctrlKey, metaKey, shiftKey } = event;
    const currentCardIds = cardIdsRef.current;

    switch (key) {
      case 'Escape':
        event.preventDefault();
        focusedIndexRef.current = -1;
        onEscape?.();
        onCardSelect?.(null);
        announce('Selection cleared');
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndexRef.current >= 0 && focusedIndexRef.current < currentCardIds.length) {
          const cardId = currentCardIds[focusedIndexRef.current];
          if (key === 'Enter') {
            onEnter?.();
            onCardEdit?.(cardId);
          } else {
            onCardSelect?.(cardId);
          }
        }
        break;

      case 'Delete':
      case 'Backspace':
        event.preventDefault();
        if (focusedIndexRef.current >= 0 && focusedIndexRef.current < currentCardIds.length) {
          const cardId = currentCardIds[focusedIndexRef.current];
          onCardDelete?.(cardId);
        }
        break;

      case 'Tab':
        event.preventDefault();
        const direction = shiftKey ? 'backward' : 'forward';
        onTab?.(direction);
        
        if (direction === 'forward') {
          focusedIndexRef.current = Math.min(
            focusedIndexRef.current + 1,
            currentCardIds.length - 1
          );
        } else {
          focusedIndexRef.current = Math.max(
            focusedIndexRef.current - 1,
            0
          );
        }

        if (focusedIndexRef.current >= 0 && focusedIndexRef.current < currentCardIds.length) {
          const cardId = currentCardIds[focusedIndexRef.current];
          onCardSelect?.(cardId);
          announce(`Navigated to card ${focusedIndexRef.current + 1} of ${currentCardIds.length}`);
        }
        break;

      case 'Home':
        event.preventDefault();
        if (currentCardIds.length > 0) {
          focusedIndexRef.current = 0;
          const cardId = currentCardIds[0];
          onCardSelect?.(cardId);
          onHome?.();
          announce(`First card selected: 1 of ${currentCardIds.length}`);
        }
        break;

      case 'End':
        event.preventDefault();
        if (currentCardIds.length > 0) {
          focusedIndexRef.current = currentCardIds.length - 1;
          const cardId = currentCardIds[focusedIndexRef.current];
          onCardSelect?.(cardId);
          onEnd?.();
          announce(`Last card selected: ${currentCardIds.length} of ${currentCardIds.length}`);
        }
        break;

      case 'PageUp':
        event.preventDefault();
        if (currentCardIds.length > 0) {
          const jumpSize = Math.max(1, Math.floor(currentCardIds.length / 10));
          focusedIndexRef.current = Math.max(0, focusedIndexRef.current - jumpSize);
          const cardId = currentCardIds[focusedIndexRef.current];
          onCardSelect?.(cardId);
          onPageUp?.();
          announce(`Jumped up to card ${focusedIndexRef.current + 1} of ${currentCardIds.length}`);
        }
        break;

      case 'PageDown':
        event.preventDefault();
        if (currentCardIds.length > 0) {
          const jumpSize = Math.max(1, Math.floor(currentCardIds.length / 10));
          focusedIndexRef.current = Math.min(currentCardIds.length - 1, focusedIndexRef.current + jumpSize);
          const cardId = currentCardIds[focusedIndexRef.current];
          onCardSelect?.(cardId);
          onPageDown?.();
          announce(`Jumped down to card ${focusedIndexRef.current + 1} of ${currentCardIds.length}`);
        }
        break;

      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        event.preventDefault();
        const arrowDirection = key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
        onArrowKey?.(arrowDirection);

        // Navigate through cards with arrow keys
        if (key === 'ArrowUp' || key === 'ArrowLeft') {
          focusedIndexRef.current = Math.max(
            focusedIndexRef.current - 1,
            0
          );
        } else if (key === 'ArrowDown' || key === 'ArrowRight') {
          focusedIndexRef.current = Math.min(
            focusedIndexRef.current + 1,
            currentCardIds.length - 1
          );
        }

        if (focusedIndexRef.current >= 0 && focusedIndexRef.current < currentCardIds.length) {
          const cardId = currentCardIds[focusedIndexRef.current];
          onCardSelect?.(cardId);
          announce(`Navigated to card ${focusedIndexRef.current + 1} of ${currentCardIds.length}`);
        }
        break;

      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        if (ctrlKey || metaKey) {
          event.preventDefault();
          const index = parseInt(key, 10) - 1;
          if (index >= 0 && index < currentCardIds.length) {
            focusedIndexRef.current = index;
            const cardId = currentCardIds[index];
            onCardSelect?.(cardId);
            announce(`Quick select: card ${index + 1} of ${currentCardIds.length}`);
          }
        }
        break;

      default:
        break;
    }
  }, [isEnabled, onCardSelect, onCardEdit, onCardDelete, onEscape, onEnter, onArrowKey, onTab]);

  useEffect(() => {
    if (isEnabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, isEnabled]);

  const setFocusedCard = useCallback((cardId: string | null) => {
    if (cardId === null) {
      focusedIndexRef.current = -1;
    } else {
      const index = cardIdsRef.current.indexOf(cardId);
      focusedIndexRef.current = index >= 0 ? index : -1;
    }
  }, []);

  const getFocusedCardId = useCallback(() => {
    const currentCardIds = cardIdsRef.current;
    if (focusedIndexRef.current >= 0 && focusedIndexRef.current < currentCardIds.length) {
      return currentCardIds[focusedIndexRef.current];
    }
    return null;
  }, []);

  return {
    setFocusedCard,
    getFocusedCardId,
    focusedIndex: focusedIndexRef.current
  };
}