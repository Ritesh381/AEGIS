import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listAnalyses, getAnalysis } from '../services/api';
import Dashboard from '../components/Dashboard/Dashboard';
import { FileText, Clock, AlertTriangle, ChevronRight, RefreshCw, Loader } from 'lucide-react';
import './History.css';

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const navigate = useNavigate();

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const data = await listAnalyses();
      setAnalyses(data.analyses || []);
    } catch (err) {
      console.error('Failed to load analyses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const handleViewAnalysis = async (item) => {
    // If we already have clauses data in the list response, use it directly
    if (item.clauses && item.clauses.length > 0) {
      setSelectedAnalysis(item);
      setSelectedId(item.analysis_id);
      return;
    }

    // Otherwise fetch the full analysis
    setLoadingDetail(true);
    try {
      const data = await getAnalysis(item.analysis_id);
      setSelectedAnalysis(data);
      setSelectedId(item.analysis_id);
    } catch (err) {
      console.error('Failed to load analysis details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleBack = () => {
    setSelectedAnalysis(null);
    setSelectedId(null);
  };

  const getBadgeClass = (profile) => {
    switch (profile) {
      case 'Low': return 'badge-low';
      case 'Moderate': return 'badge-moderate';
      case 'High': return 'badge-high';
      case 'Critical': return 'badge-critical';
      default: return '';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // If viewing a specific analysis, show the Dashboard
  if (selectedAnalysis) {
    return <Dashboard analysis={selectedAnalysis} analysisId={selectedId} onBack={handleBack} />;
  }

  return (
    <div className="history-page animate-fade-in-up">
      <div className="history-page__header">
        <div>
          <h1 className="history-page__title">
            <Clock size={24} />
            Analysis <span className="text-gradient">History</span>
          </h1>
          <p className="history-page__desc">
            View your past contract analyses and their risk assessments.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchAnalyses} id="btn-refresh-history">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="history-page__loading">
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: 80, width: '100%' }} />
          ))}
        </div>
      ) : analyses.length === 0 ? (
        <div className="history-page__empty glass-panel">
          <FileText size={40} className="history-page__empty-icon" />
          <h3>No Analyses Yet</h3>
          <p>Upload a contract to get started with your first analysis.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')} id="btn-goto-upload">
            Upload a Contract
          </button>
        </div>
      ) : (
        <div className="history-page__list stagger-children">
          {analyses.map((item) => (
            <button
              key={item.analysis_id}
              className="history-card glass-panel"
              onClick={() => handleViewAnalysis(item)}
              disabled={loadingDetail}
              id={`history-card-${item.analysis_id}`}
            >
              <div className="history-card__left">
                <FileText size={20} className="history-card__icon" />
                <div>
                  <p className="history-card__name truncate">{item.originalFileName || 'Unknown document'}</p>
                  <p className="history-card__date">{formatDate(item.uploadedAt)}</p>
                </div>
              </div>
              <div className="history-card__right">
                {item.status === 'completed' ? (
                  <>
                    <span className="history-card__score">
                      {item.overallRiskScore ?? '–'}
                    </span>
                    <span className={`badge ${getBadgeClass(item.riskProfile)}`}>
                      {item.riskProfile || 'N/A'}
                    </span>
                  </>
                ) : (
                  <span className={`badge ${item.status === 'failed' ? 'badge-critical' : 'badge-moderate'}`}>
                    {item.status}
                  </span>
                )}
                {loadingDetail ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <ChevronRight size={16} className="history-card__arrow" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
