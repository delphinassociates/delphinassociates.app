import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageHeader } from '../PageHeader';

describe('PageHeader', () => {
  const defaultProps = {
    title: 'Intelligence Log',
    description: 'View and manage all field reports submitted by supervisors.',
    breadcrumbs: ['Dashboard', 'Reports'],
  };

  // ── Rendering Tests ────────────────────────────────────────────────────────

  it('renders the page title correctly', () => {
    render(<PageHeader {...defaultProps} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Intelligence Log');
  });

  it('renders the description correctly', () => {
    render(<PageHeader {...defaultProps} />);
    expect(screen.getByText(/View and manage all field reports/i)).toBeInTheDocument();
  });

  it('renders all breadcrumb items', () => {
    render(<PageHeader {...defaultProps} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('renders a single breadcrumb with no separators', () => {
    render(
      <PageHeader
        title="Dashboard"
        description="Overview"
        breadcrumbs={['Dashboard']}
      />
    );
    // No ChevronRight SVG should be rendered
    const nav = screen.getByRole('navigation');
    expect(nav.querySelectorAll('svg')).toHaveLength(0);
  });

  it('renders multiple breadcrumbs with chevron separators between them', () => {
    render(<PageHeader {...defaultProps} />);
    const nav = screen.getByRole('navigation');
    // 2 breadcrumbs => 1 chevron separator
    expect(nav.querySelectorAll('svg')).toHaveLength(1);
  });

  it('renders 3 breadcrumbs with 2 chevron separators', () => {
    render(
      <PageHeader
        title="Report Detail"
        description="View specific report"
        breadcrumbs={['Dashboard', 'Reports', 'Detail']}
      />
    );
    const nav = screen.getByRole('navigation');
    expect(nav.querySelectorAll('svg')).toHaveLength(2);
  });

  it('applies accent color class to the last breadcrumb only', () => {
    render(<PageHeader {...defaultProps} />);
    const spans = screen.getAllByRole('navigation')[0].querySelectorAll('span');
    // Last span should have text-accent class, first should not
    expect(spans[0]).not.toHaveClass('text-accent');
    expect(spans[spans.length - 1]).toHaveClass('text-accent');
  });

  // ── Prop Variation Tests ───────────────────────────────────────────────────

  it('renders correctly with a long description', () => {
    const longDesc = 'A'.repeat(500);
    render(
      <PageHeader
        title="Title"
        description={longDesc}
        breadcrumbs={['Home']}
      />
    );
    expect(screen.getByText(longDesc)).toBeInTheDocument();
  });

  it('renders correctly with special characters in title', () => {
    render(
      <PageHeader
        title="Site & Operations <Overview>"
        description="Details"
        breadcrumbs={['Home']}
      />
    );
    expect(screen.getByText('Site & Operations <Overview>')).toBeInTheDocument();
  });
});
