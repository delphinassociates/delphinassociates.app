import React from 'react';
import { render, screen } from '@testing-library/react';
import { KpiStrip } from '../KpiStrip';
import { Users, TrendingUp, DollarSign } from 'lucide-react';

const mockItems = [
  { label: 'Total Workforce', value: 142, icon: Users },
  { label: 'Active Sites', value: 8, icon: TrendingUp, trend: '+2', trendUp: true },
  { label: 'Daily Expense', value: '₹24,500', icon: DollarSign, trend: '-5%', trendUp: false },
];

describe('KpiStrip', () => {
  // ── Rendering Tests ────────────────────────────────────────────────────────

  it('renders all KPI items', () => {
    render(<KpiStrip items={mockItems} />);
    expect(screen.getByText('Total Workforce')).toBeInTheDocument();
    expect(screen.getByText('Active Sites')).toBeInTheDocument();
    expect(screen.getByText('Daily Expense')).toBeInTheDocument();
  });

  it('renders the correct values for each KPI', () => {
    render(<KpiStrip items={mockItems} />);
    expect(screen.getByText('142')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('₹24,500')).toBeInTheDocument();
  });

  it('renders trend badge when trend prop is provided', () => {
    render(<KpiStrip items={mockItems} />);
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.getByText('-5%')).toBeInTheDocument();
  });

  it('does NOT render trend badge when trend prop is absent', () => {
    render(<KpiStrip items={[{ label: 'Workforce', value: 10, icon: Users }]} />);
    // No badge text should be rendered
    expect(screen.queryByText(/\+|\-/)).not.toBeInTheDocument();
  });

  it('renders emerald (positive) trend badge styling for trendUp=true', () => {
    render(<KpiStrip items={mockItems} />);
    const trendBadge = screen.getByText('+2');
    // The badge element itself has the colour classes (not its parent)
    expect(trendBadge).toHaveClass('bg-emerald-500/10');
    expect(trendBadge).toHaveClass('text-emerald-400');
  });

  it('renders red (negative) trend badge styling for trendUp=false', () => {
    render(<KpiStrip items={mockItems} />);
    const trendBadge = screen.getByText('-5%');
    expect(trendBadge).toHaveClass('bg-red-500/10');
    expect(trendBadge).toHaveClass('text-red-400');
  });

  it('renders an empty state when no items are passed', () => {
    const { container } = render(<KpiStrip items={[]} />);
    // The grid container should exist but have no KPI children
    expect(container.firstChild?.childNodes.length).toBe(0);
  });

  it('applies custom className to the container', () => {
    const { container } = render(
      <KpiStrip items={mockItems} className="my-custom-class" />
    );
    expect(container.firstChild).toHaveClass('my-custom-class');
  });

  // ── Value Length Rendering Tests ───────────────────────────────────────────

  it('renders a short value (≤7 chars) with large text class', () => {
    const { container } = render(
      <KpiStrip items={[{ label: 'Short', value: 42, icon: Users }]} />
    );
    const heading = container.querySelector('h2');
    expect(heading).toHaveClass('text-lg');
  });

  it('renders a long value (>10 chars) with small text class', () => {
    const { container } = render(
      <KpiStrip items={[{ label: 'Long', value: '₹1,23,45,678', icon: Users }]} />
    );
    const heading = container.querySelector('h2');
    expect(heading).toHaveClass('text-sm');
  });
});
