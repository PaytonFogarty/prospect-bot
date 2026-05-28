import { useState, useEffect } from 'react';
import api from '../api';

const FIELDS = ['currentTitle', 'companyName', 'location', 'industry', 'seniority'];
const OPERATORS = ['contains', 'equals', 'notContains'];

export default function Setup() {
  const [rules, setRules] = useState([]);
  const [schedule, setSchedule] = useState('daily');
  const [sequenceId, setSequenceId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // New rule form state
  const [newRule, setNewRule] = useState({ field: 'currentTitle', operator: 'contains', value: '', required: true });

  useEffect(() => {
    api.get('/pipeline/config').then(res => {
      setRules(res.data.icpRules || []);
      setSchedule(res.data.schedule || 'daily');
      setSequenceId(res.data.sequenceId || '');
    }).catch(console.error);
  }, []);

  const addRule = () => {
    if (!newRule.value.trim()) return;
    setRules([...rules, { ...newRule }]);
    setNewRule({ field: 'currentTitle', operator: 'contains', value: '', required: true });
  };

  const removeRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.put('/pipeline/config', { icpRules: rules, schedule, sequenceId });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
    }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="mb-2">Pipeline Setup</h1>

      <div className="card">
        <h3 style={{ marginBottom: '0.75rem' }}>ICP Filters</h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          Define your ideal customer profile. Only prospects matching all required filters will be processed.
        </p>

        {rules.length > 0 && (
          <table style={{ marginBottom: '1rem' }}>
            <thead>
              <tr>
                <th>Field</th>
                <th>Operator</th>
                <th>Value</th>
                <th>Required</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule, i) => (
                <tr key={i}>
                  <td>{rule.field}</td>
                  <td>{rule.operator}</td>
                  <td>{rule.value}</td>
                  <td>{rule.required ? 'Yes' : 'No'}</td>
                  <td><button className="btn btn-outline" onClick={() => removeRule(i)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex gap-1" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '0.75rem' }}>Field</label>
            <select value={newRule.field} onChange={e => setNewRule({ ...newRule, field: e.target.value })}>
              {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem' }}>Operator</label>
            <select value={newRule.operator} onChange={e => setNewRule({ ...newRule, operator: e.target.value })}>
              {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.75rem' }}>Value</label>
            <input value={newRule.value} onChange={e => setNewRule({ ...newRule, value: e.target.value })} placeholder="e.g. VP Sales" />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <input type="checkbox" checked={newRule.required} onChange={e => setNewRule({ ...newRule, required: e.target.checked })} />
              Required
            </label>
          </div>
          <button className="btn btn-outline" onClick={addRule}>Add Rule</button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '0.75rem' }}>Schedule</h3>
        <div className="form-group">
          <select value={schedule} onChange={e => setSchedule(e.target.value)}>
            <option value="daily">Daily (every day at 9 AM)</option>
            <option value="weekdays">Weekdays only (Mon-Fri at 9 AM)</option>
            <option value="weekly">Weekly (every Monday at 9 AM)</option>
          </select>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '0.75rem' }}>CRM Sequence</h3>
        <div className="form-group">
          <label>Sequence ID</label>
          <input value={sequenceId} onChange={e => setSequenceId(e.target.value)} placeholder="e.g. 12345" />
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            The ID of the sequence/cadence in your CRM where new prospects will be enrolled. Find this in your CRM's sequence settings.
          </p>
        </div>
      </div>

      <div className="flex gap-1" style={{ alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
        {saved && <span style={{ color: '#16a34a', fontWeight: 600 }}>Saved!</span>}
      </div>
    </div>
  );
}
