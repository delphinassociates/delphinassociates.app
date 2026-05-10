import React from 'react';
import { render, screen } from '@testing-library/react';
import { SectionHeading } from '../SectionHeading';

// Mock next/link since we're in test environment
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}));

describe('SectionHeading', () => {
  // ── Rendering Tests ────────────────────────────────────────────────────────

  it('renders the title correctly', () => {
    render(<SectionHeading title="01. Labour Configuration" />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('01. Labour Configuration');
  });

  it('renders description when provided', () => {
    render(
      <SectionHeading
        title="Section Title"
        description="This is a helpful description."
      />
    );
    expect(screen.getByText('This is a helpful description.')).toBeInTheDocument();
  });

  it('does NOT render description paragraph when omitted', () => {
    render(<SectionHeading title="Title Only" />);
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('renders the help icon link when helpId is provided', () => {
    render(<SectionHeading title="Labour" helpId="labour-section" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/supervisor/help#labour-section');
    expect(link).toHaveAttribute('title', 'View Handbook Guidance');
  });

  it('does NOT render the help icon when helpId is not provided', () => {
    render(<SectionHeading title="Labour" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders custom action element when provided', () => {
    render(
      <SectionHeading
        title="Labour"
        action={<button>Add Row</button>}
      />
    );
    expect(screen.getByRole('button', { name: 'Add Row' })).toBeInTheDocument();
  });

  it('does NOT render action slot when action prop is omitted', () => {
    render(<SectionHeading title="Labour" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  // ── Combination Tests ──────────────────────────────────────────────────────

  it('renders all props together correctly', () => {
    render(
      <SectionHeading
        title="Full Section"
        description="Complete description"
        helpId="full-section"
        action={<button>Action</button>}
      />
    );
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Full Section');
    expect(screen.getByText('Complete description')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/supervisor/help#full-section');
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });
});
