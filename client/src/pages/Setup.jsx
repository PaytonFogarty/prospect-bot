import { useState, useEffect } from 'react';
import api from '../api';

const FIELDS = [
  { value: 'currentTitle', label: 'Current Job Title' },
  { value: 'companyName', label: 'Company Name' },
  { value: 'location', label: 'Location' },
  { value: 'industry', label: 'Industry' },
  { value: 'seniority', label: 'Seniority' },
];

const OPERATORS = [
  { value: 'contains', label: 'contains' },
  { value: 'equals', label: 'equals' },
  { value: 'notContains', label: 'does not contain' },
];

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DEFAULT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const HOURS = [];
for (let h = 5; h <= 21; h++) {
  const label = h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`;
  const value = `${String(h).padStart(2, '0')}:00`;
  HOURS.push({ value, label });
}

export default function Setup() {
  const [rules, setRules] = useState([]);
  const [runMode, setRunMode] = useState('manual');
  const [autoRunEnabled, setAutoRunEnabled] = useState(false);
  const [scheduleDays, setScheduleDays] = useState(DEFAULT_DAYS);
  const [scheduleTime, setScheduleTime] = useState('08:00');
  const [prospectsPerRun, setProspectsPerRun] = useState(50);
  const [sequenceId, setSequenceId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [newRule, setNewRule] = useState({ field: 'currentTitle', operator: 'contains', value: '', required: true });

  useEffect(() => {
    api.get('/pipeline/config').then(res => {
      const c = res.data;
      setRules(c.icpRules || []);
      setRunMode(c.runMode || 'manual');
      setAutoRunEnabled(c.autoRunEnabled || false);
      setScheduleDays(c.scheduleDays?.length ? c.scheduleDays : DEFAULT_DAYS);
      setScheduleTime(c.scheduleTime || '08:00');
      setProspectsPerRun(c.prospectsPerRun || 50);
      setSequenceId(c.sequenceId || '');
    }).catch(console.error);
  }, []);

  const addRule = () => {
    if (!newRule.value.trim()) return;
    setRules([...rules, { ...newRule }]);
    setNewRule({ field: 'currentTitle', operator: 'contains', value: '', required: true });
  };

  const removeRule = (index) => setRules(rules.filter((_, i) => i !== index));

  const toggleDay = (day) => {
    setScheduleDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.put('/pipeline/config', {
        icpRules: rules,
        sequenceId,
        runMode,
        autoRunEnabled,
        scheduleDays,
        scheduleTime,
        prospectsPerRun,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
    }
    setSaving(false);
  };

  const fieldLabel = (val) => FIELDS.find(f => f.value === val)?.label || val;
  const operatorLabel = (val) => OPERATORS.find(o => o.value === val)?.label || val;

  return (
    <div>
      <h1 className="mb-2">Pipeline Setup</h1>

      {/* ICP Filters */}
      <div className="card">
        <h3 style={{ marginBottom: '0.75rem' }}>ICP Filters</h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          Define your ideal customer profile. Only prospects matching all required filters will be processed.
        </p>

        {rules.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            {rules.map((rule, i) => (
              <div key={i} className="flex-between" style={{ padding: '0.5rem 0.75rem', background: '#f9fafb', borderRadius: 6, marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem' }}>
                  <strong>{fieldLabel(rule.field)}</strong>{' '}
                  <span style={{ color: '#6b7280' }}>{operatorLabel(rule.operator)}</span>{' '}
                  "{rule.value}"
                  {rule.required && <span style={{ color: '#dc2626', marginLeft: '0.5rem', fontSize: '0.75rem' }}>Required</span>}
                </span>
                <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => removeRule(i)}>Delete</button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-1" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '0.75rem' }}>Field</label>
            <select value={newRule.field} onChange={e => setNewRule({ ...newRule, field: e.target.value })}>
              {FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem' }}>Operator</label>
            <select value={newRule.operator} onChange={e => setNewRule({ ...newRule, operator: e.target.value })}>
              {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <label style={{ fontSize: '0.75rem' }}>Value</label>
            <input value={newRule.value} onChange={e => setNewRule({ ...newRule, value: e.target.value })} placeholder="e.g. VP Sales" />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
              <input type="checkbox" checked={newRule.required} onChange={e => setNewRule({ ...newRule, required: e.target.checked })} />
              Required
            </label>
          </div>
          <button className="btn btn-primary" onClick={addRule}>Add Rule</button>
        </div>
      </div>

      {/* Run Mode */}
      <div className="card">
        <h3 style={{ marginBottom: '0.75rem' }}>How should the bot run?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

          {/* Manual Card */}
          <div
            style={{
              border: `2px solid ${runMode === 'manual' ? '#4f46e5' : '#e5e7eb'}`,
              borderRadius: 8,
              padding: '1.5rem',
              cursor: 'pointer',
              background: runMode === 'manual' ? '#eef2ff' : '#fff',
              transition: 'all 0.15s',
            }}
            onClick={() => setRunMode('manual')}
          >
            <h4 style={{ marginBottom: '0.5rem' }}>Manual</h4>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              You control when the bot runs. Click "Run Now" from the dashboard whenever you want fresh prospects.
            </p>
            <button
              className={`btn ${runMode === 'manual' ? 'btn-primary' : 'btn-outline'}`}
              onClick={(e) => { e.stopPropagation(); setRunMode('manual'); }}
            >
              {runMode === 'manual' ? 'Selected' : 'Select Manual'}
            </button>
          </div>

          {/* Automatic Card */}
          <div
            style={{
              border: `2px solid ${runMode === 'automatic' ? '#4f46e5' : '#e5e7eb'}`,
              borderRadius: 8,
              padding: '1.5rem',
              cursor: 'pointer',
              background: runMode === 'automatic' ? '#eef2ff' : '#fff',
              transition: 'all 0.15s',
            }}
            onClick={() => setRunMode('automatic')}
          >
            <h4 style={{ marginBottom: '0.5rem' }}>Automatic</h4>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              The bot runs on a schedule you define. Set the days, time, and how many prospects per run.
            </p>
            {runMode !== 'automatic' && (
              <button
                className="btn btn-outline"
                onClick={(e) => { e.stopPropagation(); setRunMode('automatic'); }}
              >
                Select Automatic
              </button>
            )}
          </div>
        </div>

        {/* Automatic schedule settings */}
        {runMode === 'automatic' && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            background: '#f9fafb',
            borderRadius: 8,
            opacity: autoRunEnabled ? 1 : 0.5,
            transition: 'opacity 0.2s',
          }}>
            {/* Toggle */}
            <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Auto-run enabled</label>
              <button
                onClick={() => setAutoRunEnabled(!autoRunEnabled)}
                style={{
                  width: 48,
                  height: 26,
                  borderRadius: 13,
                  border: 'none',
                  background: autoRunEnabled ? '#4f46e5' : '#d1d5db',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: 3,
                  left: autoRunEnabled ? 24 : 3,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>

            {/* Days */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Days</label>
              <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                {ALL_DAYS.map(day => (
                  <button
                    key={day}
                    className="btn"
                    disabled={!autoRunEnabled}
                    onClick={() => autoRunEnabled && toggleDay(day)}
                    style={{
                      background: scheduleDays.includes(day) ? '#4f46e5' : '#fff',
                      color: scheduleDays.includes(day) ? '#fff' : '#374151',
                      border: `1px solid ${scheduleDays.includes(day) ? '#4f46e5' : '#d1d5db'}`,
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.8125rem',
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Time */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Time</label>
              <select
                value={scheduleTime}
                onChange={e => setScheduleTime(e.target.value)}
                disabled={!autoRunEnabled}
                style={{ maxWidth: 200 }}
              >
                {HOURS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
              </select>
            </div>

            {/* Prospects per run */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                Prospects per run: <span style={{ color: '#4f46e5' }}>{prospectsPerRun}</span>
              </label>
              <input
                type="range"
                min={10}
                max={500}
                step={10}
                value={prospectsPerRun}
                onChange={e => setProspectsPerRun(Number(e.target.value))}
                disabled={!autoRunEnabled}
                style={{ width: '100%', maxWidth: 400 }}
              />
              <div className="flex-between" style={{ maxWidth: 400, fontSize: '0.75rem', color: '#6b7280' }}>
                <span>10</span>
                <span>500</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex gap-1" style={{ alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
        {saved && <span style={{ color: '#16a34a', fontWeight: 600 }}>Saved!</span>}
      </div>
    </div>
  );
}
