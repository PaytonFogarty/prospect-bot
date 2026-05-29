import { useState, useEffect } from 'react';
import api from '../api';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = [];
for (let h = 5; h <= 21; h++) {
  const label = h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`;
  HOURS.push({ value: `${String(h).padStart(2, '0')}:00`, label });
}

const EMPTY_FORM = {
  name: '',
  keywords: [],
  includeCompanies: [],
  excludeCompanies: [],
  locations: [],
  industries: [],
  assignedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  runTime: '08:00',
  prospectsPerRun: 50,
  autoRunEnabled: false,
};

function TagInput({ value, onChange, placeholder }) {
  const [input, setInput] = useState('');

  const addTag = (text) => {
    const trimmed = text.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (idx) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '0.375rem', display: 'flex', flexWrap: 'wrap', gap: '0.375rem', minHeight: 42, background: '#fff' }}>
      {value.map((tag, i) => (
        <span key={i} style={{ background: '#eef2ff', color: '#4f46e5', padding: '0.125rem 0.5rem', borderRadius: 4, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {tag}
          <button onClick={() => removeTag(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', fontWeight: 700, fontSize: '0.875rem', padding: 0, lineHeight: 1 }}>x</button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input && addTag(input)}
        placeholder={value.length === 0 ? placeholder : ''}
        style={{ border: 'none', outline: 'none', flex: 1, minWidth: 120, fontSize: '0.875rem', padding: '0.125rem' }}
      />
    </div>
  );
}

export default function Setup() {
  const [configs, setConfigs] = useState([]);
  const [editing, setEditing] = useState(null); // null = list view, 'new' = new form, configId = editing
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [runningId, setRunningId] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    fetchConfigs();
    fetchLastRefresh();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await api.get('/pipeline/configs');
      setConfigs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load configs:', err);
    }
  };

  const fetchLastRefresh = async () => {
    try {
      const res = await api.get('/pipeline/refresh-logs');
      const logs = Array.isArray(res.data) ? res.data : [];
      setLastRefresh(logs[0] || null);
    } catch (err) {
      console.error('Failed to load refresh logs:', err);
    }
  };

  const startNew = () => {
    setForm({ ...EMPTY_FORM });
    setEditing('new');
  };

  const startEdit = (config) => {
    setForm({
      name: config.name,
      keywords: config.keywords || [],
      includeCompanies: config.include_companies || [],
      excludeCompanies: config.exclude_companies || [],
      locations: config.locations || [],
      industries: config.industries || [],
      assignedDays: config.assigned_days || [],
      runTime: config.run_time || '08:00',
      prospectsPerRun: config.prospects_per_run || 50,
      autoRunEnabled: config.auto_run_enabled || false,
    });
    setEditing(config.id);
  };

  const cancelEdit = () => { setEditing(null); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing === 'new') {
        await api.post('/pipeline/configs', form);
      } else {
        await api.put(`/pipeline/configs/${editing}`, form);
      }
      setEditing(null);
      await fetchConfigs();
    } catch (err) {
      console.error('Save failed:', err);
      alert(err.response?.data?.error || 'Save failed');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this config?')) return;
    try {
      await api.delete(`/pipeline/configs/${id}`);
      await fetchConfigs();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleRunNow = async (configId) => {
    setRunningId(configId);
    setRunResult(null);
    try {
      const res = await api.post(`/pipeline/configs/${configId}/run`);
      setRunResult({ id: configId, type: res.data.status === 'success' ? 'success' : 'error', message: res.data.status === 'success' ? `${res.data.pushed} prospect${res.data.pushed !== 1 ? 's' : ''} pushed` : res.data.error });
    } catch (err) {
      setRunResult({ id: configId, type: 'error', message: err.response?.data?.error || 'Run failed' });
    }
    setRunningId(null);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshResult(null);
    try {
      const res = await api.post('/pipeline/refresh');
      setRefreshResult({ type: res.data.status === 'success' ? 'success' : 'error', message: res.data.status === 'success' ? `${res.data.checked} checked, ${res.data.updated} updated` : res.data.error });
      await fetchLastRefresh();
    } catch (err) {
      setRefreshResult({ type: 'error', message: err.response?.data?.error || 'Refresh failed' });
    }
    setRefreshing(false);
  };

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      assignedDays: f.assignedDays.includes(day)
        ? f.assignedDays.filter(d => d !== day)
        : [...f.assignedDays, day],
    }));
  };

  const isEditing = editing !== null;

  return (
    <div>
      <div className="flex-between mb-2">
        <h1>Pipeline Setup</h1>
        {!isEditing && <button className="btn btn-primary" onClick={startNew}>+ New Config</button>}
      </div>

      {/* Config Form */}
      {isEditing && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>{editing === 'new' ? 'New Config' : 'Edit Config'}</h3>

          <div className="form-group">
            <label>Config Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Quant Traders NYC" />
          </div>

          <div className="form-group">
            <label>Keywords</label>
            <TagInput value={form.keywords} onChange={v => setForm({ ...form, keywords: v })} placeholder="e.g. quant researcher, quant trader" />
          </div>

          <div className="form-group">
            <label>Include Companies <span style={{ fontWeight: 400, color: '#6b7280', fontSize: '0.75rem' }}>(optional)</span></label>
            <TagInput value={form.includeCompanies} onChange={v => setForm({ ...form, includeCompanies: v })} placeholder="Leave empty to search all companies" />
          </div>

          <div className="form-group">
            <label>Exclude Companies <span style={{ fontWeight: 400, color: '#6b7280', fontSize: '0.75rem' }}>(optional)</span></label>
            <TagInput value={form.excludeCompanies} onChange={v => setForm({ ...form, excludeCompanies: v })} placeholder="e.g. competitors to skip" />
          </div>

          <div className="form-group">
            <label>Locations <span style={{ fontWeight: 400, color: '#6b7280', fontSize: '0.75rem' }}>(optional)</span></label>
            <TagInput value={form.locations} onChange={v => setForm({ ...form, locations: v })} placeholder="e.g. New York City, London" />
          </div>

          <div className="form-group">
            <label>Industries <span style={{ fontWeight: 400, color: '#6b7280', fontSize: '0.75rem' }}>(optional)</span></label>
            <TagInput value={form.industries} onChange={v => setForm({ ...form, industries: v })} placeholder="e.g. Financial Services, Technology" />
          </div>

          <div className="form-group">
            <label style={{ marginBottom: '0.5rem' }}>Assigned Days</label>
            <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
              {ALL_DAYS.map(day => (
                <button key={day} className="btn" onClick={() => toggleDay(day)} style={{
                  background: form.assignedDays.includes(day) ? '#4f46e5' : '#fff',
                  color: form.assignedDays.includes(day) ? '#fff' : '#374151',
                  border: `1px solid ${form.assignedDays.includes(day) ? '#4f46e5' : '#d1d5db'}`,
                  padding: '0.375rem 0.75rem', fontSize: '0.8125rem',
                }}>{day}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Run Time</label>
              <select value={form.runTime} onChange={e => setForm({ ...form, runTime: e.target.value })}>
                {HOURS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Prospects per Run: <span style={{ color: '#4f46e5' }}>{form.prospectsPerRun}</span></label>
              <input type="range" min={10} max={500} step={10} value={form.prospectsPerRun} onChange={e => setForm({ ...form, prospectsPerRun: Number(e.target.value) })} style={{ width: '100%' }} />
              <div className="flex-between" style={{ fontSize: '0.75rem', color: '#6b7280' }}><span>10</span><span>500</span></div>
            </div>
          </div>

          <div className="form-group">
            <div className="flex-between">
              <label>Auto-run enabled</label>
              <button onClick={() => setForm({ ...form, autoRunEnabled: !form.autoRunEnabled })} style={{
                width: 48, height: 26, borderRadius: 13, border: 'none',
                background: form.autoRunEnabled ? '#4f46e5' : '#d1d5db', cursor: 'pointer', position: 'relative',
              }}>
                <span style={{ position: 'absolute', top: 3, left: form.autoRunEnabled ? 24 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            </div>
          </div>

          <div className="flex gap-1 mt-2">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Config'}</button>
            <button className="btn btn-outline" onClick={cancelEdit}>Cancel</button>
          </div>
        </div>
      )}

      {/* Config Cards */}
      {!isEditing && (
        <div>
          {configs.length === 0 ? (
            <div className="card">
              <p style={{ color: '#6b7280' }}>No configs yet. Click "+ New Config" to create your first prospecting config.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              {configs.map(config => (
                <div key={config.id} className="card" style={{ marginBottom: 0 }}>
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <h4>{config.name}</h4>
                    {config.auto_run_enabled && (
                      <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '0.125rem 0.5rem', borderRadius: 12, fontSize: '0.6875rem', fontWeight: 600 }}>Auto</span>
                    )}
                  </div>

                  {/* Keywords */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
                    {(config.keywords || []).map((kw, i) => (
                      <span key={i} style={{ background: '#f3f4f6', padding: '0.125rem 0.5rem', borderRadius: 4, fontSize: '0.75rem', color: '#374151' }}>{kw}</span>
                    ))}
                  </div>

                  {/* Days */}
                  {config.assigned_days && config.assigned_days.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                      {config.assigned_days.map(d => (
                        <span key={d} style={{ background: '#eef2ff', color: '#4f46e5', padding: '0.0625rem 0.375rem', borderRadius: 4, fontSize: '0.6875rem', fontWeight: 600 }}>{d}</span>
                      ))}
                    </div>
                  )}

                  <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                    {config.prospects_per_run} prospects/run
                    {config.run_time && ` at ${config.run_time}`}
                  </p>

                  {/* Run result banner */}
                  {runResult && runResult.id === config.id && (
                    <div style={{ marginBottom: '0.5rem', padding: '0.375rem 0.5rem', borderRadius: 4, background: runResult.type === 'success' ? '#f0fdf4' : '#fef2f2', color: runResult.type === 'success' ? '#16a34a' : '#dc2626', fontSize: '0.8125rem', fontWeight: 600 }}>
                      {runResult.message}
                    </div>
                  )}

                  <div className="flex gap-1">
                    <button className="btn btn-primary" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }} onClick={() => handleRunNow(config.id)} disabled={runningId === config.id}>
                      {runningId === config.id ? 'Running...' : 'Run Now'}
                    </button>
                    <button className="btn btn-outline" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }} onClick={() => startEdit(config)}>Edit</button>
                    <button className="btn btn-outline" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem', color: '#dc2626', borderColor: '#fca5a5' }} onClick={() => handleDelete(config.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Refresh Section */}
      <div className="card">
        <h3 style={{ marginBottom: '0.25rem' }}>Keep your CRM up to date</h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          We'll scan your existing CRM prospects and update any outdated contact info — email, phone, job title — using fresh data from your enrichment tool.
        </p>

        {refreshResult && (
          <div style={{ marginBottom: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 6, background: refreshResult.type === 'success' ? '#f0fdf4' : '#fef2f2', color: refreshResult.type === 'success' ? '#16a34a' : '#dc2626', fontSize: '0.875rem', fontWeight: 600 }}>
            {refreshResult.message}
          </div>
        )}

        <button className="btn btn-primary" onClick={handleRefresh} disabled={refreshing} style={{ marginBottom: '1rem' }}>
          {refreshing ? 'Refreshing...' : 'Run Refresh Now'}
        </button>

        {lastRefresh && (
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem', fontSize: '0.875rem' }}>
            <p style={{ color: '#6b7280', marginBottom: '0.25rem' }}>Last refresh</p>
            <div className="flex gap-2">
              <span>{new Date(lastRefresh.started_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              <span>{lastRefresh.prospects_checked} checked</span>
              <span>{lastRefresh.prospects_updated} updated</span>
              <span style={{ color: lastRefresh.status === 'success' ? '#16a34a' : lastRefresh.status === 'error' ? '#dc2626' : '#d97706', fontWeight: 600, textTransform: 'capitalize' }}>{lastRefresh.status}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
