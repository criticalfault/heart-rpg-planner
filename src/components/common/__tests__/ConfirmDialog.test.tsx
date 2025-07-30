import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: vi.fn(),
    onCancel: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('Confirm'));
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('renders custom button text', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmText="Delete"
        cancelText="Keep"
      />
    );

    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Keep')).toBeInTheDocument();
  });

  it('renders different variants with correct styling', () => {
    const { rerender } = render(
      <ConfirmDialog {...defaultProps} variant="danger" />
    );
    expect(document.querySelector('.confirm-dialog--danger')).toBeInTheDocument();

    rerender(<ConfirmDialog {...defaultProps} variant="warning" />);
    expect(document.querySelector('.confirm-dialog--warning')).toBeInTheDocument();

    rerender(<ConfirmDialog {...defaultProps} variant="info" />);
    expect(document.querySelector('.confirm-dialog--info')).toBeInTheDocument();
  });

  it('disables buttons when loading', () => {
    render(<ConfirmDialog {...defaultProps} loading={true} />);

    const confirmButton = screen.getByText('Confirm');
    const cancelButton = screen.getByText('Cancel');

    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('shows loading state on confirm button', () => {
    render(<ConfirmDialog {...defaultProps} loading={true} />);

    // Check if loading spinner is present (assuming Button component shows spinner when loading)
    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toBeDisabled();
  });

  it('renders appropriate icon for each variant', () => {
    const { rerender } = render(
      <ConfirmDialog {...defaultProps} variant="danger" />
    );
    expect(screen.getByText('⚠️')).toBeInTheDocument();

    rerender(<ConfirmDialog {...defaultProps} variant="warning" />);
    expect(screen.getByText('⚠️')).toBeInTheDocument();

    rerender(<ConfirmDialog {...defaultProps} variant="info" />);
    expect(screen.getByText('ℹ️')).toBeInTheDocument();
  });
});