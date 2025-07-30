import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useToast } from '../useToast';

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid')
  }
});

describe('useToast', () => {
  it('initializes with empty toasts array', () => {
    const { result } = renderHook(() => useToast());
    
    expect(result.current.toasts).toEqual([]);
  });

  it('adds a toast with addToast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast({
        type: 'success',
        title: 'Success',
        message: 'Operation completed'
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      id: 'mock-uuid',
      type: 'success',
      title: 'Success',
      message: 'Operation completed',
      duration: 5000
    });
  });

  it('removes a toast with removeToast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast({
        type: 'info',
        title: 'Info'
      });
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      result.current.removeToast('mock-uuid');
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('clears all toasts with clearToasts', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast({ type: 'success', title: 'Success 1' });
      result.current.addToast({ type: 'error', title: 'Error 1' });
    });

    expect(result.current.toasts).toHaveLength(2);

    act(() => {
      result.current.clearToasts();
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('adds success toast with showSuccess', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showSuccess('Success Title', 'Success message');
    });

    expect(result.current.toasts[0]).toMatchObject({
      type: 'success',
      title: 'Success Title',
      message: 'Success message',
      duration: 5000
    });
  });

  it('adds error toast with showError', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showError('Error Title', 'Error message');
    });

    expect(result.current.toasts[0]).toMatchObject({
      type: 'error',
      title: 'Error Title',
      message: 'Error message',
      duration: 8000 // Errors have longer duration
    });
  });

  it('adds warning toast with showWarning', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showWarning('Warning Title', 'Warning message');
    });

    expect(result.current.toasts[0]).toMatchObject({
      type: 'warning',
      title: 'Warning Title',
      message: 'Warning message',
      duration: 6000 // Warnings have medium duration
    });
  });

  it('adds info toast with showInfo', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showInfo('Info Title', 'Info message');
    });

    expect(result.current.toasts[0]).toMatchObject({
      type: 'info',
      title: 'Info Title',
      message: 'Info message',
      duration: 5000
    });
  });

  it('allows custom options to override defaults', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showSuccess('Success', 'Message', {
        duration: 10000,
        action: {
          label: 'Undo',
          onClick: () => {}
        }
      });
    });

    expect(result.current.toasts[0]).toMatchObject({
      type: 'success',
      title: 'Success',
      message: 'Message',
      duration: 10000,
      action: {
        label: 'Undo',
        onClick: expect.any(Function)
      }
    });
  });

  it('returns toast ID when adding toast', () => {
    const { result } = renderHook(() => useToast());

    let toastId: string;
    act(() => {
      toastId = result.current.addToast({
        type: 'info',
        title: 'Test'
      });
    });

    expect(toastId!).toBe('mock-uuid');
  });
});