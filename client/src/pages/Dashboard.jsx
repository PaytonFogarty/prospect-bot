import { useState, useEffect } from 'react';
import api from '../api';
import PlanBadge from '../components/PlanBadge';
import RunLogRow from '../components/RunLogRow';

export default function Dashboard() {
  const [customer, setCustomer] = useState(null);
  const [billing, setBilling] = useState(null);
  const [pipelineStatus, setPipelineStatus] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/auth/me'),
      api.get('/billing/status'),
      api.get('/pipeline/status'),
    ]).then(([me, bill, pipeline]) => {
      setCustomer(me.data);
      setBilling(bill.data);
      setPipelineStatus(pipeline.data);
    }).catch(console.error);
  }, []);

  const handleRunNow = async () => {
    setRunning(true);
    try {
      await api.post('/pipeline/run');
      // Refresh status after a short delay
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
      <div className="flex-between mb-2">
        <h1>Dashboard</h1>
        <PlanBadge status={billing?.subscriptionStatus} />
      </div>

      <div className="card">
        <p>Welcome back, <strong>{customer.email}</strong></p>
        {billing?.subscriptionStatus === 'trialing' && (
          <p className="mt-1" style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {billing.trialDaysLeft} days left in your free trial
          </p>
        )}
      </div>

      <div className="card">
        <div className="flex-between">
          <div>
            <h3>Pipeline</h3>
            {lastRun ? (
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Last run: {new Date(lastRun.started_at).toLocaleString()} — {lastRun.prospects_pushed} pushed, {lastRun.prospects_skipped_dedup} skipped
              </p>
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>No runs yet</p>
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
