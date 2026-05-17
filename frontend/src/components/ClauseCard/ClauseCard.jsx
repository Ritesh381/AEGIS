import { useState } from 'react';
import {
  ChevronDown, ChevronUp, AlertTriangle, Scale, Swords,
  MessageSquare, HelpCircle, UserCheck, Users
} from 'lucide-react';
import FeedbackPanel from '../Feedback/FeedbackPanel';
import './ClauseCard.css';

export default function ClauseCard({ clause, analysisId, index, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const getBadgeClass = (score) => {
    if (score <= 25) return 'badge-low';
    if (score <= 50) return 'badge-moderate';
    if (score <= 75) return 'badge-high';
    return 'badge-critical';
  };

  const getProfileLabel = (score) => {
    if (score <= 25) return 'Low';
    if (score <= 50) return 'Moderate';
    if (score <= 75) return 'High';
    return 'Critical';
  };

  const getCategoryIcon = (cat) => {
    const icons = {
      non_compete: Swords,
      ip_transfer: Scale,
      liability: AlertTriangle,
      privacy: AlertTriangle,
      arbitration: Scale,
      termination: AlertTriangle,
      renewal: AlertTriangle,
      data_collection: AlertTriangle,
    };
    return icons[cat] || AlertTriangle;
  };

  const CategoryIcon = getCategoryIcon(clause.risk_category);
  const categoryLabel = clause.risk_category?.replace(/_/g, ' ') || 'Unknown';

  return (
    <div
      className={`clause-card glass-panel ${expanded ? 'clause-card--expanded' : ''}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header — always visible */}
      <button
        className="clause-card__header"
        onClick={() => setExpanded(!expanded)}
        id={`clause-toggle-${clause.clause_id}`}
      >
        <div className="clause-card__header-left">
          <div className="clause-card__category-icon">
            <CategoryIcon size={18} />
          </div>
          <div>
            <span className="clause-card__category">{categoryLabel}</span>
            <p className="clause-card__excerpt truncate">
              {clause.original_text?.slice(0, 120)}...
            </p>
          </div>
        </div>
        <div className="clause-card__header-right">
          <span className={`badge ${getBadgeClass(clause.risk_score)}`}>
            {clause.risk_score} • {getProfileLabel(clause.risk_score)}
          </span>
          {clause.confidence != null && (
            <span className="clause-card__confidence" title="AI Confidence">
              {(clause.confidence * 100).toFixed(0)}%
            </span>
          )}
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="clause-card__body animate-fade-in">
          {/* Original clause text */}
          <div className="clause-card__section">
            <h4 className="clause-card__section-title">
              <MessageSquare size={14} /> Original Clause
            </h4>
            <blockquote className="clause-card__quote">
              {clause.original_text}
            </blockquote>
          </div>

          {/* Debate Summary */}
          <div className="clause-card__section">
            <h4 className="clause-card__section-title">
              <Swords size={14} /> Agent Debate
            </h4>
            <div className="clause-card__debate">
              <div className="clause-card__agent">
                <span className="clause-card__agent-name clause-card__agent-name--advocate">
                  <UserCheck size={14} /> User Advocate
                </span>
                <p>{clause.advocate_argument}</p>
              </div>
              <div className="clause-card__agent">
                <span className="clause-card__agent-name clause-card__agent-name--judge">
                  <Scale size={14} /> Strict Judge
                </span>
                <p>{clause.judge_argument}</p>
              </div>
              <div className="clause-card__agent">
                <span className="clause-card__agent-name clause-card__agent-name--counsel">
                  <Users size={14} /> Opposing Counsel
                </span>
                <p>{clause.counsel_argument}</p>
              </div>
            </div>
          </div>

          {/* Scenario */}
          {clause.scenario && (
            <div className="clause-card__section">
              <h4 className="clause-card__section-title">
                <AlertTriangle size={14} /> What Could Happen
              </h4>
              <div className="clause-card__scenario">
                {clause.scenario}
              </div>
            </div>
          )}

          {/* Questions */}
          {clause.questions && (
            <div className="clause-card__section">
              <h4 className="clause-card__section-title">
                <HelpCircle size={14} /> Questions to Ask
              </h4>

              {clause.questions.self_directed?.length > 0 && (
                <div className="clause-card__questions-group">
                  <span className="clause-card__questions-label">Ask yourself:</span>
                  <ul className="clause-card__questions-list">
                    {clause.questions.self_directed.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {clause.questions.counterparty?.length > 0 && (
                <div className="clause-card__questions-group">
                  <span className="clause-card__questions-label">Ask the other party:</span>
                  <ul className="clause-card__questions-list clause-card__questions-list--counter">
                    {clause.questions.counterparty.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Feedback */}
          <FeedbackPanel analysisId={analysisId} clauseId={clause.clause_id} />
        </div>
      )}
    </div>
  );
}
