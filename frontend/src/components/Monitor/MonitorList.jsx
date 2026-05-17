import { useState, useEffect } from 'react';
import { listMonitors, deleteMonitor } from '../../services/api';
import { Bell, Calendar, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import './MonitorList.css';

export default function MonitorList() {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMonitors = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listMonitors();
      setMonitors(data.monitors || []);
    } catch (err) {
      setError('Failed to load monitors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
  }, []);

  const handleDelete = async (monitorId) => {
    try {
      await deleteMonitor(monitorId);
      setMonitors((prev) => prev.filter((m) => m.monitorId !== monitorId));
    } catch {
      setError('Failed to deactivate monitor.');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntil = (dateStr) => {
    const now = new Date();
    const target = new Date(dateStr);
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="monitor-page animate-fade-in-up">
      <div className="monitor-page__header">
        <div>
          <h1 className="monitor-page__title">
            <Bell size={24} className="monitor-page__icon" />
            Living Contract <span className="text-gradient">Monitors</span>
          </h1>
          <p className="monitor-page__desc">
            Track deadlines, renewals, and important dates for your analyzed contracts.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchMonitors} id="btn-refresh-monitors">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="monitor-page__error animate-fade-in">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="monitor-page__loading">
          <div className="skeleton" style={{ height: 80, width: '100%' }} />
          <div className="skeleton" style={{ height: 80, width: '100%' }} />
          <div className="skeleton" style={{ height: 80, width: '100%' }} />
        </div>
      ) : monitors.length === 0 ? (
        <div className="monitor-page__empty glass-panel">
          <Bell size={40} className="monitor-page__empty-icon" />
          <h3>No Active Monitors</h3>
          <p>After analyzing a contract, you can enable monitoring for important deadlines.</p>
        </div>
      ) : (
        <div className="monitor-page__list stagger-children">
          {monitors.map((monitor) => (
            <div key={monitor.monitorId} className="monitor-card glass-panel">
              <div className="monitor-card__header">
                <div>
                  <h3 className="monitor-card__name">{monitor.contractName}</h3>
                  <p className="monitor-card__created">
                    Created {formatDate(monitor.createdAt)}
                  </p>
                </div>
                <div className="monitor-card__actions">
                  <span className={`badge ${monitor.active ? 'badge-low' : 'badge-moderate'}`}>
                    {monitor.active ? 'Active' : 'Inactive'}
                  </span>
                  {monitor.active && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(monitor.monitorId)}
                      id={`btn-delete-${monitor.monitorId}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {monitor.events?.length > 0 && (
                <div className="monitor-card__events">
                  {monitor.events.map((event, idx) => {
                    const days = getDaysUntil(event.date);
                    return (
                      <div key={idx} className="monitor-card__event">
                        <Calendar size={14} />
                        <span className="monitor-card__event-type">
                          {event.type.replace(/_/g, ' ')}
                        </span>
                        <span className="monitor-card__event-date">
                          {formatDate(event.date)}
                        </span>
                        <span className={`monitor-card__event-days ${days <= 7 ? 'monitor-card__event-days--urgent' : ''}`}>
                          {days > 0 ? `${days} days left` : days === 0 ? 'Today!' : 'Passed'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
