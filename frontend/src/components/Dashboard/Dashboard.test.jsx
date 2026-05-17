import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../components/Dashboard/Dashboard';

const mockAnalysis = {
  overall_risk_score: 68,
  risk_profile: 'High',
  summary: 'This contract contains several clauses that warrant careful review.',
  disclaimer: 'AEGIS provides informational insights only.',
  originalFileName: 'test_contract.pdf',
  clauses: [
    {
      clause_id: 'cl_001',
      original_text: 'Employee shall not compete for 24 months.',
      risk_score: 85,
      confidence: 0.92,
      risk_category: 'non_compete',
      advocate_argument: 'Overly broad.',
      judge_argument: 'Ambiguous terms.',
      counsel_argument: 'Standard practice.',
      scenario: 'You could be restricted from working.',
      questions: {
        self_directed: ['Do you plan to switch jobs soon?'],
        counterparty: ['Can you reduce the duration?'],
      },
    },
    {
      clause_id: 'cl_002',
      original_text: 'All IP created during employment belongs to Company.',
      risk_score: 62,
      confidence: 0.88,
      risk_category: 'ip_transfer',
      advocate_argument: 'Too broad IP assignment.',
      judge_argument: 'Lacks specificity.',
      counsel_argument: 'Common in tech.',
      scenario: 'Side projects could belong to employer.',
      questions: {
        self_directed: ['Do you work on side projects?'],
        counterparty: ['Can we exclude personal projects?'],
      },
    },
  ],
};

describe('Dashboard', () => {
  const renderDashboard = (props = {}) =>
    render(
      <MemoryRouter>
        <Dashboard analysis={mockAnalysis} analysisId="an_test" onBack={() => {}} {...props} />
      </MemoryRouter>
    );

  it('renders the overall risk score', () => {
    renderDashboard();
    expect(screen.getByText('68')).toBeInTheDocument();
  });

  it('renders the risk profile', () => {
    renderDashboard();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders the summary', () => {
    renderDashboard();
    expect(screen.getByText(/several clauses that warrant/)).toBeInTheDocument();
  });

  it('renders the disclaimer', () => {
    renderDashboard();
    expect(screen.getByText(/informational insights only/)).toBeInTheDocument();
  });

  it('renders document filename', () => {
    renderDashboard();
    expect(screen.getByText('test_contract.pdf')).toBeInTheDocument();
  });

  it('renders flagged clauses count', () => {
    renderDashboard();
    expect(screen.getByText('Flagged Clauses (2)')).toBeInTheDocument();
  });

  it('shows critical and high risk counts', () => {
    renderDashboard();
    // 1 critical (>75), 1 high (51-75)
    const stats = screen.getAllByText('1');
    expect(stats.length).toBeGreaterThanOrEqual(2);
  });

  it('shows total questions count', () => {
    renderDashboard();
    // 4 total questions (2 self + 2 counter)
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders export buttons', () => {
    renderDashboard();
    expect(screen.getByText('Export TXT')).toBeInTheDocument();
    expect(screen.getByText('Export JSON')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('renders back button', () => {
    renderDashboard();
    expect(screen.getByText('New Analysis')).toBeInTheDocument();
  });

  it('renders null when no analysis', () => {
    const { container } = render(
      <MemoryRouter>
        <Dashboard analysis={null} />
      </MemoryRouter>
    );
    expect(container.innerHTML).toBe('');
  });
});
