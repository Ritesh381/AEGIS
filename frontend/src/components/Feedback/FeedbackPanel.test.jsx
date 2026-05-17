import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FeedbackPanel from './FeedbackPanel';

// Mock the API call
vi.mock('../../services/api', () => ({
  submitFeedback: vi.fn(() => Promise.resolve()),
}));

describe('FeedbackPanel', () => {
  it('renders the feedback question', () => {
    render(<FeedbackPanel analysisId="test-123" clauseId="cl_001" />);
    expect(screen.getByText('Was this risk assessment accurate?')).toBeInTheDocument();
  });

  it('renders all three feedback options', () => {
    render(<FeedbackPanel analysisId="test-123" clauseId="cl_001" />);
    expect(screen.getByText('Accurate')).toBeInTheDocument();
    expect(screen.getByText('Overstated')).toBeInTheDocument();
    expect(screen.getByText('Missed Risk')).toBeInTheDocument();
  });

  it('shows comment textarea after selecting feedback', () => {
    render(<FeedbackPanel analysisId="test-123" clauseId="cl_001" />);
    fireEvent.click(screen.getByText('Accurate'));
    expect(screen.getByPlaceholderText('Optional: tell us more...')).toBeInTheDocument();
  });

  it('shows submit button after selecting feedback', () => {
    render(<FeedbackPanel analysisId="test-123" clauseId="cl_001" />);
    fireEvent.click(screen.getByText('Overstated'));
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('shows anonymization notice', () => {
    render(<FeedbackPanel analysisId="test-123" clauseId="cl_001" />);
    expect(screen.getByText(/anonymized/i)).toBeInTheDocument();
  });
});
