import { useState, useEffect } from 'react';
import api from '../api';

const STATUS_COLORS = {
  success: '#16a34a',
  error: '#dc2626',
  running: '#d97706',
};

function formatDuration(startedAt, completedAt) {
  if (!completedAt) return '—';
  const ms = new Date(completedAt) - new Date(startedAt);
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function RunLog() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRuns = () => {
    setLoading(true);
    api.get('/pipeline/runs')
      .then(res => setRuns(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRuns(); }, []);

  return (
    <div>
      <div className="flex-between mb-2">
        <h1>Run Log</h1>
        <button className="btn btn-outline" onClick={fetchRuns} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="card">
        {runs.length === 0 && !loading ? (
          <p style={{ color: '#6b7280' }}>
            No runs yet. Set up your ICP filters and connect your tools to get started.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Searched</th>
                <th>Filtered</th>
                <th>Deduped</th>
                <th>Enriched</th>
                <th>Pushed</th>
                <th>Status</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {runs.map(run => (
                <tr key={run.id}>
                  <td>{formatDate(run.started_at)}</td>
                  <td>{run.prospects_searched}</td>
                  <td>{run.prospects_filtered}</td>
                  <td>{run.prospects_skipped_dedup}</td>
                  <td>{run.prospects_enriched}</td>
                  <td>{run.prospects_pushed}</td>
                  <td>
                    <span style={{
                      color: STATUS_COLORS[run.status] || '#6b7280',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}>
                      {run.status}
                    </span>
                    {run.status === 'error' && run.error_message && (
                      <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.125rem' }}>
                        {run.error_message}
                      </p>
                    )}
                  </td>
                  <td style={{ color: '#6b7280' }}>
                    {formatDuration(run.started_at, run.completed_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
