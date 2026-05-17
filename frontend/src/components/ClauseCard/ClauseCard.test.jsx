import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ClauseCard from '../components/ClauseCard/ClauseCard';

const mockClause = {
  clause_id: 'cl_test_001',
  original_text: 'Employee agrees not to compete with the Company for a period of 24 months following termination of employment within a 100-mile radius.',
  risk_score: 82,
  confidence: 0.91,
  risk_category: 'non_compete',
  advocate_argument: 'This non-compete is overly broad in both duration and geographic scope.',
  judge_argument: 'The term "compete" is ambiguous and could be interpreted broadly.',
  counsel_argument: 'The employer has a legitimate interest in protecting trade secrets.',
  scenario: 'If you leave and start a similar business within 100 miles, you could face legal action.',
  questions: {
    self_directed: ['Do you plan to stay in this industry for the next 2 years?'],
    counterparty: ['Can we reduce the non-compete to 12 months and 25 miles?'],
  },
};

describe('ClauseCard', () => {
  it('renders the clause category', () => {
    render(<ClauseCard clause={mockClause} analysisId="an_test" index={0} />);
    expect(screen.getByText('non compete')).toBeInTheDocument();
  });

  it('renders the risk score badge', () => {
    render(<ClauseCard clause={mockClause} analysisId="an_test" index={0} />);
    expect(screen.getByText(/82/)).toBeInTheDocument();
  });

  it('renders confidence percentage', () => {
    render(<ClauseCard clause={mockClause} analysisId="an_test" index={0} />);
    expect(screen.getByText('91%')).toBeInTheDocument();
  });

  it('shows clause excerpt in collapsed state', () => {
    render(<ClauseCard clause={mockClause} analysisId="an_test" index={0} />);
    expect(screen.getByText(/Employee agrees not to compete/)).toBeInTheDocument();
  });

  it('expands to show debate details when defaultExpanded', () => {
    render(<ClauseCard clause={mockClause} analysisId="an_test" index={0} defaultExpanded={true} />);
    expect(screen.getByText(/overly broad in both duration/)).toBeInTheDocument();
    expect(screen.getByText(/ambiguous and could be interpreted/)).toBeInTheDocument();
  });

  it('shows scenario when expanded', () => {
    render(<ClauseCard clause={mockClause} analysisId="an_test" index={0} defaultExpanded={true} />);
    expect(screen.getByText(/face legal action/)).toBeInTheDocument();
  });

  it('shows questions when expanded', () => {
    render(<ClauseCard clause={mockClause} analysisId="an_test" index={0} defaultExpanded={true} />);
    expect(screen.getByText(/plan to stay in this industry/)).toBeInTheDocument();
    expect(screen.getByText(/reduce the non-compete/)).toBeInTheDocument();
  });

  it('toggles expansion on click', () => {
    render(<ClauseCard clause={mockClause} analysisId="an_test" index={0} />);
    // Initially collapsed - debate details not visible
    expect(screen.queryByText(/overly broad in both duration/)).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(screen.getByText(/non compete/));
    expect(screen.getByText(/overly broad in both duration/)).toBeInTheDocument();
  });
});
