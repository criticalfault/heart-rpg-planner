import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useErrorHandler } from '../useErrorHandler';
import { useToast } from '../useToast';

// Mock useToast
vi.mock('../useToast', () => ({
  useToast: vi.fn()
}));

const mockShowError = vi.fn();
const mockUseToast = useToast as vi.MockedFunction<typeof useToast>;

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseToast.mockReturnValue({
      toasts: [],
      addToast: vi.fn(),
      removeToast: vi.fn(),
      clearToasts: vi.fn(),
      showSuccess: vi.fn(),
      showError: mockShowError,
      showWarning: vi.fn(),
      showInfo: vi.fn()
    });
  });

  it('handles string errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    act(() => {
      result.current.handleError('Test error message');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error handled:', expect.any(Error));
    expect(mockShowError).toHaveBeenCalledWith('Error', 'Test error message');

    consoleSpy.mockRestore();
  });

  it('handles Error objects', () => {
    const { result } = renderHook(() => useErrorHandler());
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Test error');

    act(() => {
      result.current.handleError(error);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error handled:', error);
    expect(mockShowError).toHaveBeenCalledWith('Error', 'Test error');

    consoleSpy.mockRestore();
  });

  it('respects showToast option', () => {
    const { result } = renderHook(() => useErrorHandler());
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    act(() => {
      result.current.handleError('Test error', { showToast: false });
    });

    expect(mockShowError).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('respects logError option', () => {
    const { result } = renderHook(() => useErrorHandler());
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    act(() => {
      result.current.handleError('Test error', { logError: false });
    });

    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('uses custom toast title and message', () => {
    const { result } = renderHook(() => useErrorHandler());
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    act(() => {
      result.current.handleError('Test error', {
        toastTitle: 'Custom Title',
        toastMessage: 'Custom message'
      });
    });

    expect(mockShowError).toHaveBeenCalledWith('Custom Title', 'Custom message');

    consoleSpy.mockRestore();
  });

  it('calls custom onError callback', () => {
    const { result } = renderHook(() => useErrorHandler());
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();
    const error = new Error('Test error');

    act(() => {
      result.current.handleError(error, { onError });
    });

    expect(onError).toHaveBeenCalledWith(error);

    consoleSpy.mockRestore();
  });

  it('handles async errors with handleAsyncError', async () => {
    const { result } = renderHook(() => useErrorHandler());
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const asyncFn = vi.fn().mockRejectedValue(new Error('Async error'));

    let returnValue: any;
    await act(async () => {
      returnValue = await result.current.handleAsyncError(asyncFn);
    });

    expect(asyncFn).toHaveBeenCalled();
    expect(returnValue).toBeNull();
    expect(mockShowError).toHaveBeenCalledWith('Error', 'Async error');

    consoleSpy.mockRestore();
  });

  it('returns result when async function succeeds', async () => {
    const { result } = renderHook(() => useErrorHandler());

    const asyncFn = vi.fn().mockResolvedValue('success');

    let returnValue: any;
    await act(async () => {
      returnValue = await result.current.handleAsyncError(asyncFn);
    });

    expect(returnValue).toBe('success');
    expect(mockShowError).not.toHaveBeenCalled();
  });

  it('wraps async functions with wrapAsync', async () => {
    const { result } = renderHook(() => useErrorHandler());
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const originalFn = vi.fn().mockRejectedValue(new Error('Wrapped error'));
    const wrappedFn = result.current.wrapAsync(originalFn);

    let returnValue: any;
    await act(async () => {
      returnValue = await wrappedFn('arg1', 'arg2');
    });

    expect(originalFn).toHaveBeenCalledWith('arg1', 'arg2');
    expect(returnValue).toBeNull();
    expect(mockShowError).toHaveBeenCalledWith('Error', 'Wrapped error');

    consoleSpy.mockRestore();
  });

  it('preserves function arguments with wrapAsync', async () => {
    const { result } = renderHook(() => useErrorHandler());

    const originalFn = vi.fn().mockResolvedValue('success');
    const wrappedFn = result.current.wrapAsync(originalFn);

    await act(async () => {
      await wrappedFn('test', 123, { key: 'value' });
    });

    expect(originalFn).toHaveBeenCalledWith('test', 123, { key: 'value' });
  });
});