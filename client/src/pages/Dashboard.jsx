import { useState, useEffect } from 'react';
import api from '../api';

const STATUS_COLORS = {
  success: '#16a34a',
  error: '#dc2626',
  running: '#d97706',
};

export default function Dashboard() {
  const [customer, setCustomer] = useState(null);
  const [runs, setRuns] = useState([]);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);

  const fetchData = () => {
    Promise.all([
      api.get('/auth/me'),
      api.get('/pipeline/runs'),
    ]).then(([me, runsRes]) => {
      setCustomer(me.data);
      setRuns(Array.isArray(runsRes.data) ? runsRes.data.slice(0, 5) : []);
    }).catch(console.error);
  };

  useEffect(() => { fetchData(); }, []);

  const handleRunNow = async () => {
    setRunning(true);
    setRunResult(null);
    try {
      const res = await api.post('/pipeline/run');
      const summary = res.data;
      if (summary.status === 'success') {
        setRunResult({ type: 'success', message: `${summary.pushed} prospect${summary.pushed !== 1 ? 's' : ''} pushed to CRM` });
      } else {
        setRunResult({ type: 'error', message: summary.error || 'Pipeline run failed' });
      }
      fetchData();
    } catch (err) {
      setRunResult({ type: 'error', message: err.response?.data?.error || 'Pipeline run failed' });
    }
    setRunning(false);
  };

  if (!customer) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="mb-2">Dashboard</h1>

      <div className="card">
        <div className="flex-between">
          <p>Welcome back, <strong>{customer.email}</strong></p>
          <button className="btn btn-primary" onClick={handleRunNow} disabled={running}>
            {running ? 'Running...' : 'Run Now'}
          </button>
        </div>
        {runResult && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.5rem 0.75rem',
            borderRadius: 6,
            background: runResult.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: runResult.type === 'success' ? '#16a34a' : '#dc2626',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}>
            {runResult.message}
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '0.75rem' }}>Recent Runs</h3>
        {runs.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            No runs yet. Configure your ICP filters and connect your tools to get started.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Pushed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {runs.map(run => (
                <tr key={run.id}>
                  <td>{new Date(run.started_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td>{run.prospects_pushed}</td>
                  <td>
                    <span style={{ color: STATUS_COLORS[run.status] || '#6b7280', fontWeight: 600, textTransform: 'capitalize' }}>
                      {run.status}
                    </span>
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
