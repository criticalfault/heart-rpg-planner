
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toast, ToastData } from '../Toast';

const mockToast: ToastData = {
  id: '1',
  type: 'success',
  title: 'Success',
  message: 'Operation completed successfully',
  duration: 5000
};

describe('Toast', () => {
  it('renders toast with title and message', () => {
    const onClose = vi.fn();
    render(<Toast toast={mockToast} onClose={onClose} />);

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
  });

  it('renders different toast types with correct styling', () => {
    const onClose = vi.fn();
    
    const { rerender } = render(
      <Toast toast={{ ...mockToast, type: 'success' }} onClose={onClose} />
    );
    expect(document.querySelector('.toast--success')).toBeInTheDocument();

    rerender(<Toast toast={{ ...mockToast, type: 'error' }} onClose={onClose} />);
    expect(document.querySelector('.toast--error')).toBeInTheDocument();

    rerender(<Toast toast={{ ...mockToast, type: 'warning' }} onClose={onClose} />);
    expect(document.querySelector('.toast--warning')).toBeInTheDocument();

    rerender(<Toast toast={{ ...mockToast, type: 'info' }} onClose={onClose} />);
    expect(document.querySelector('.toast--info')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Toast toast={mockToast} onClose={onClose} />);

    const closeButton = screen.getByLabelText('Close notification');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledWith('1');
  });

  it('renders action button when action is provided', () => {
    const onClose = vi.fn();
    const actionClick = vi.fn();
    const toastWithAction: ToastData = {
      ...mockToast,
      action: {
        label: 'Undo',
        onClick: actionClick
      }
    };

    render(<Toast toast={toastWithAction} onClose={onClose} />);

    const actionButton = screen.getByText('Undo');
    expect(actionButton).toBeInTheDocument();

    fireEvent.click(actionButton);
    expect(actionClick).toHaveBeenCalled();
  });

  it('auto-closes after duration', async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    const shortToast: ToastData = {
      ...mockToast,
      duration: 1000
    };

    render(<Toast toast={shortToast} onClose={onClose} />);

    // Fast-forward time
    vi.advanceTimersByTime(1300); // Duration + exit animation

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledWith('1');
    });

    vi.useRealTimers();
  });

  it('does not auto-close when duration is 0', async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    const persistentToast: ToastData = {
      ...mockToast,
      duration: 0
    };

    render(<Toast toast={persistentToast} onClose={onClose} />);

    vi.advanceTimersByTime(10000);

    expect(onClose).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('renders without message when message is not provided', () => {
    const onClose = vi.fn();
    const toastWithoutMessage: ToastData = {
      id: '1',
      type: 'info',
      title: 'Info Title'
    };

    render(<Toast toast={toastWithoutMessage} onClose={onClose} />);

    expect(screen.getByText('Info Title')).toBeInTheDocument();
    expect(screen.queryByText('Operation completed successfully')).not.toBeInTheDocument();
  });
});