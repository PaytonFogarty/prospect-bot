import { useState, useEffect } from 'react';
import api from '../api';
import RunLogRow from '../components/RunLogRow';

export default function Dashboard() {
  const [customer, setCustomer] = useState(null);
  const [pipelineStatus, setPipelineStatus] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/auth/me'),
      api.get('/pipeline/status'),
    ]).then(([me, pipeline]) => {
      setCustomer(me.data);
      setPipelineStatus(pipeline.data);
    }).catch(console.error);
  }, []);

  const handleRunNow = async () => {
    setRunning(true);
    try {
      await api.post('/pipeline/run');
      setTimeout(async () => {
        const res = await api.get('/pipeline/status');
        setPipelineStatus(res.data);
        setRunning(false);
      }, 2000);
    } catch (err) {
      console.error('Run failed:', err);
      setRunning(false);
    }
  };

  if (!customer) return <p>Loading...</p>;

  const lastRun = pipelineStatus?.lastRun;
  const recentRuns = pipelineStatus?.recentRuns || [];

  return (
    <div>
      <h1 className="mb-2">Dashboard</h1>

      <div className="card">
        <div className="flex-between">
          <div>
            <p>Welcome back, <strong>{customer.email}</strong></p>
            {lastRun && (
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Last run: {new Date(lastRun.started_at).toLocaleString()} — {lastRun.prospects_pushed} pushed, {lastRun.prospects_skipped_dedup} skipped
              </p>
            )}
          </div>
          <button className="btn btn-primary" onClick={handleRunNow} disabled={running}>
            {running ? 'Running...' : 'Run Now'}
          </button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '0.75rem' }}>Recent Runs</h3>
        {recentRuns.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No runs yet. Configure your ICP filters and connect your tools to get started.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Searched</th>
                <th>Filtered</th>
                <th>Skipped</th>
                <th>Enriched</th>
                <th>Pushed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRuns.map(run => <RunLogRow key={run.id} run={run} />)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
