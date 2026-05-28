import { useState, useEffect } from 'react';
import api from '../api';
import RunLogRow from '../components/RunLogRow';

export default function RunLog() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/pipeline/status')
      .then(res => setRuns(res.data.recentRuns || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="mb-2">Run Log</h1>

      <div className="card">
        {runs.length === 0 ? (
          <p style={{ color: '#6b7280' }}>
            No pipeline runs yet. Set up your ICP filters and connect your tools, then hit "Run Now" from the dashboard.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Searched</th>
                <th>Filtered</th>
                <th>Skipped (Dedup)</th>
                <th>Enriched</th>
                <th>Pushed to CRM</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {runs.map(run => <RunLogRow key={run.id} run={run} />)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
