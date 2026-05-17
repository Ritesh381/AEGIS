import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RiskGauge from './RiskGauge';

describe('RiskGauge', () => {
  it('renders with score and profile', () => {
    render(<RiskGauge score={72} profile="High" size={180} />);
    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders low risk correctly', () => {
    render(<RiskGauge score={15} profile="Low" size={180} />);
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('renders critical risk correctly', () => {
    render(<RiskGauge score={90} profile="Critical" size={180} />);
    expect(screen.getByText('90')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('defaults to score 0 and Low when no props', () => {
    render(<RiskGauge />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });
});
