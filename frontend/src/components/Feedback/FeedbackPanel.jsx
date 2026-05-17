import { useState } from 'react';
import { ThumbsUp, ThumbsDown, AlertCircle, Send, CheckCircle } from 'lucide-react';
import { submitFeedback } from '../../services/api';
import './FeedbackPanel.css';

export default function FeedbackPanel({ analysisId, clauseId }) {
  const [selected, setSelected] = useState(null); // 'accurate' | 'overstated' | 'missed'
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);

    try {
      await submitFeedback(analysisId, clauseId, selected, comment);
      setSubmitted(true);
    } catch {
      // Silently fail — feedback is best-effort
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="feedback-panel feedback-panel--submitted animate-fade-in">
        <CheckCircle size={16} className="feedback-panel__check" />
        <span>Thank you! Your feedback helps AEGIS learn anonymously.</span>
      </div>
    );
  }

  return (
    <div className="feedback-panel glass-panel">
      <p className="feedback-panel__title">Was this risk assessment accurate?</p>
      <p className="feedback-panel__hint">Your feedback is fully anonymized and helps improve AEGIS for everyone.</p>

      <div className="feedback-panel__options">
        <button
          className={`feedback-panel__btn ${selected === 'accurate' ? 'feedback-panel__btn--selected-good' : ''}`}
          onClick={() => setSelected('accurate')}
          id={`feedback-accurate-${clauseId}`}
        >
          <ThumbsUp size={16} />
          Accurate
        </button>
        <button
          className={`feedback-panel__btn ${selected === 'overstated' ? 'feedback-panel__btn--selected-warn' : ''}`}
          onClick={() => setSelected('overstated')}
          id={`feedback-overstated-${clauseId}`}
        >
          <ThumbsDown size={16} />
          Overstated
        </button>
        <button
          className={`feedback-panel__btn ${selected === 'missed' ? 'feedback-panel__btn--selected-bad' : ''}`}
          onClick={() => setSelected('missed')}
          id={`feedback-missed-${clauseId}`}
        >
          <AlertCircle size={16} />
          Missed Risk
        </button>
      </div>

      {selected && (
        <div className="feedback-panel__comment animate-fade-in">
          <textarea
            className="input"
            placeholder="Optional: tell us more..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSubmit}
            disabled={loading}
            id={`feedback-submit-${clauseId}`}
          >
            <Send size={14} />
            {loading ? 'Sending...' : 'Submit'}
          </button>
        </div>
      )}
    </div>
  );
}
