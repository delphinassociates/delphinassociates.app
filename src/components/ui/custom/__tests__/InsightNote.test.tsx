import React from 'react';
import { render, screen } from '@testing-library/react';
import { InsightNote } from '../InsightNote';

describe('InsightNote', () => {
  // ── Default State Tests ────────────────────────────────────────────────────

  it('renders the title and content correctly', () => {
    render(
      <InsightNote
        title="Data Freeze Notice"
        content="Reports are frozen at midnight."
      />
    );
    expect(screen.getByText('Data Freeze Notice')).toBeInTheDocument();
    expect(screen.getByText('Reports are frozen at midnight.')).toBeInTheDocument();
  });

  it('renders with default "info" type when type prop is omitted', () => {
    const { container } = render(
      <InsightNote title="Notice" content="Some info." />
    );
    expect(container.firstChild).toHaveClass('bg-blue-500/10');
    expect(container.firstChild).toHaveClass('text-blue-400');
  });

  // ── Variant Styling Tests ──────────────────────────────────────────────────

  it.each([
    ['info', 'bg-blue-500/10', 'text-blue-400'],
    ['warning', 'bg-amber-500/10', 'text-amber-400'],
    ['success', 'bg-emerald-500/10', 'text-emerald-400'],
    ['error', 'bg-red-500/10', 'text-red-400'],
  ] as const)(
    'renders correct styling for type: %s',
    (type, bgClass, textClass) => {
      const { container } = render(
        <InsightNote title="Test" content="Content." type={type} />
      );
      expect(container.firstChild).toHaveClass(bgClass);
      expect(container.firstChild).toHaveClass(textClass);
    }
  );

  // ── Icon Rendering Tests ───────────────────────────────────────────────────

  it('renders an SVG icon for each type', () => {
    const { container } = render(
      <InsightNote title="Test" content="Content." type="warning" />
    );
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  // ── Custom ClassName Test ──────────────────────────────────────────────────

  it('applies a custom className to the container', () => {
    const { container } = render(
      <InsightNote title="Test" content="Content." className="mt-8" />
    );
    expect(container.firstChild).toHaveClass('mt-8');
  });

  // ── Accessibility Tests ────────────────────────────────────────────────────

  it('renders the title as an h5 heading element', () => {
    render(<InsightNote title="Freeze Alert" content="Frozen at midnight." />);
    expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Freeze Alert');
  });
});
