import { useState } from 'react';
import RiskGauge from '../RiskGauge/RiskGauge';
import ClauseCard from '../ClauseCard/ClauseCard';
import { FileText, AlertTriangle, HelpCircle, ArrowLeft, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard({ analysis, analysisId, onBack }) {
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  if (!analysis) return null;

  const sortedClauses = [...(analysis.clauses || [])].sort(
    (a, b) => (b.risk_score || 0) - (a.risk_score || 0)
  );

  const criticalCount = sortedClauses.filter((c) => c.risk_score > 75).length;
  const highCount = sortedClauses.filter((c) => c.risk_score > 50 && c.risk_score <= 75).length;

  // Collect ALL questions from all clauses
  const allQuestions = sortedClauses.flatMap((c) => {
    const selfQ = (c.questions?.self_directed || []).map((q) => ({
      text: q,
      type: 'self',
      category: c.risk_category,
      clauseId: c.clause_id,
    }));
    const counterQ = (c.questions?.counterparty || []).map((q) => ({
      text: q,
      type: 'counter',
      category: c.risk_category,
      clauseId: c.clause_id,
    }));
    return [...selfQ, ...counterQ];
  });

  const totalQuestions = allQuestions.length;

  return (
    <div className="dashboard animate-fade-in-up">
      {/* Back button */}
      <button className="btn btn-ghost" onClick={onBack} id="btn-back">
        <ArrowLeft size={16} />
        New Analysis
      </button>

      {/* Hero section */}
      <div className="dashboard__hero glass-panel">
        <div className="dashboard__hero-left">
          <div className="dashboard__gauge-wrap">
            <RiskGauge
              score={analysis.overall_risk_score || 0}
              profile={analysis.risk_profile || 'Low'}
              size={180}
            />
          </div>
        </div>

        <div className="dashboard__hero-right">
          <h2 className="dashboard__title">
            Risk Analysis Complete
          </h2>
          <p className="dashboard__filename">
            <FileText size={14} />
            {analysis.originalFileName || 'Document'}
          </p>
          <p className="dashboard__summary">{analysis.summary}</p>

          <div className="dashboard__stats">
            <div className="dashboard__stat">
              <span className="dashboard__stat-value" style={{ color: 'var(--risk-critical)' }}>
                {criticalCount}
              </span>
              <span className="dashboard__stat-label">Critical</span>
            </div>
            <div className="dashboard__stat">
              <span className="dashboard__stat-value" style={{ color: 'var(--risk-high)' }}>
                {highCount}
              </span>
              <span className="dashboard__stat-label">High Risk</span>
            </div>
            <div className="dashboard__stat">
              <span className="dashboard__stat-value" style={{ color: 'var(--accent-cyan)' }}>
                {sortedClauses.length}
              </span>
              <span className="dashboard__stat-label">Flagged</span>
            </div>
            <div className="dashboard__stat">
              <span className="dashboard__stat-value" style={{ color: 'var(--accent-violet)' }}>
                {totalQuestions}
              </span>
              <span className="dashboard__stat-label">Questions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      {analysis.disclaimer && (
        <div className="dashboard__disclaimer">
          <AlertTriangle size={14} />
          {analysis.disclaimer}
        </div>
      )}

      {/* Questions Summary — always visible */}
      {totalQuestions > 0 && (
        <div className="dashboard__questions-panel glass-panel">
          <button
            className="dashboard__questions-header"
            onClick={() => setShowAllQuestions(!showAllQuestions)}
            id="btn-toggle-questions"
          >
            <div className="dashboard__questions-header-left">
              <HelpCircle size={18} />
              <h3 className="dashboard__questions-title">
                All Questions ({totalQuestions})
              </h3>
            </div>
            {showAllQuestions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showAllQuestions && (
            <div className="dashboard__questions-body animate-fade-in">
              {/* Self-directed questions */}
              {allQuestions.filter((q) => q.type === 'self').length > 0 && (
                <div className="dashboard__questions-group">
                  <span className="dashboard__questions-label dashboard__questions-label--self">
                    🤔 Ask Yourself
                  </span>
                  <ul className="dashboard__questions-list">
                    {allQuestions
                      .filter((q) => q.type === 'self')
                      .map((q, i) => (
                        <li key={`self-${i}`} className="dashboard__question-item">
                          <span className="dashboard__question-cat">
                            {q.category?.replace(/_/g, ' ')}
                          </span>
                          {q.text}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Counterparty questions */}
              {allQuestions.filter((q) => q.type === 'counter').length > 0 && (
                <div className="dashboard__questions-group">
                  <span className="dashboard__questions-label dashboard__questions-label--counter">
                    🤝 Ask the Other Party
                  </span>
                  <ul className="dashboard__questions-list dashboard__questions-list--counter">
                    {allQuestions
                      .filter((q) => q.type === 'counter')
                      .map((q, i) => (
                        <li key={`counter-${i}`} className="dashboard__question-item">
                          <span className="dashboard__question-cat">
                            {q.category?.replace(/_/g, ' ')}
                          </span>
                          {q.text}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Clauses */}
      <div className="dashboard__clauses">
        <h3 className="dashboard__clauses-title">
          <AlertTriangle size={18} />
          Flagged Clauses ({sortedClauses.length})
        </h3>
        <p className="dashboard__clauses-hint">
          Click each clause to expand and see the full AI debate, scenario analysis, and questions.
        </p>
        <div className="dashboard__clauses-list stagger-children">
          {sortedClauses.map((clause, idx) => (
            <ClauseCard
              key={clause.clause_id || idx}
              clause={clause}
              analysisId={analysisId}
              index={idx}
              defaultExpanded={idx === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
