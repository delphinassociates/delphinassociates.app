import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmationDialog } from '../ConfirmationDialog';

describe('ConfirmationDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Delete Report',
    description: 'This action cannot be undone.',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Rendering Tests ────────────────────────────────────────────────────────

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ConfirmationDialog {...defaultProps} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the dialog when isOpen is true', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    expect(screen.getByText('Delete Report')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });

  it('renders default confirm and cancel button text', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders custom confirm and cancel button text', () => {
    render(
      <ConfirmationDialog
        {...defaultProps}
        confirmText="Yes, Delete It"
        cancelText="Keep It"
      />
    );
    expect(screen.getByText('Yes, Delete It')).toBeInTheDocument();
    expect(screen.getByText('Keep It')).toBeInTheDocument();
  });

  it('renders the irreversible warning bar', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    expect(screen.getByText(/Critical Action: Irreversible/i)).toBeInTheDocument();
  });

  // ── Variant Tests ──────────────────────────────────────────────────────────

  it.each(['danger', 'warning', 'info'] as const)(
    'renders without crashing for variant: %s',
    (variant) => {
      render(<ConfirmationDialog {...defaultProps} variant={variant} />);
      expect(screen.getByText('Delete Report')).toBeInTheDocument();
    }
  );

  // ── Interaction Tests ──────────────────────────────────────────────────────

  it('calls onClose when Cancel button is clicked', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('calls both onConfirm and onClose when Confirm button is clicked', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Confirm'));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const { container } = render(<ConfirmationDialog {...defaultProps} />);
    // The backdrop is the first absolute div
    const backdrop = container.querySelector('.absolute.inset-0');
    if (backdrop) fireEvent.click(backdrop);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the X icon button is clicked', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    // The X button is the only <button> element without text
    const buttons = screen.getAllByRole('button');
    const xButton = buttons.find((btn) => btn.querySelector('svg'));
    if (xButton) fireEvent.click(xButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  // ── Accessibility Tests ────────────────────────────────────────────────────

  it('renders with proper heading level for screen readers', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Delete Report');
  });
});
