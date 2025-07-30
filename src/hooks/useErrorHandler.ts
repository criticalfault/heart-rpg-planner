import { useCallback } from 'react';
import { useToast } from './useToast';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  toastTitle?: string;
  toastMessage?: string;
  logError?: boolean;
  onError?: (error: Error) => void;
}

export interface UseErrorHandlerReturn {
  handleError: (error: Error | string, options?: ErrorHandlerOptions) => void;
  handleAsyncError: <T>(
    asyncFn: () => Promise<T>,
    options?: ErrorHandlerOptions
  ) => Promise<T | null>;
  wrapAsync: <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options?: ErrorHandlerOptions
  ) => (...args: T) => Promise<R | null>;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const { showError } = useToast();

  const handleError = useCallback((
    error: Error | string,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      toastTitle = 'Error',
      toastMessage,
      logError = true,
      onError
    } = options;

    const errorObj = typeof error === 'string' ? new Error(error) : error;

    // Log error if enabled
    if (logError) {
      console.error('Error handled:', errorObj);
    }

    // Show toast notification if enabled
    if (showToast) {
      const message = toastMessage || errorObj.message || 'An unexpected error occurred';
      showError(toastTitle, message);
    }

    // Call custom error handler if provided
    if (onError) {
      onError(errorObj);
    }
  }, [showError]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, options);
      return null;
    }
  }, [handleError]);

  const wrapAsync = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options: ErrorHandlerOptions = {}
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        return await fn(...args);
      } catch (error) {
        handleError(error as Error, options);
        return null;
      }
    };
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    wrapAsync
  };
};