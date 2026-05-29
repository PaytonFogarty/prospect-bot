import { useState, useEffect } from 'react';
import api from '../api';

const ENRICHMENT_TOOLS = [
  { name: 'lusha', label: 'Lusha', description: 'Find verified B2B contact data including emails and direct dials.' },
  { name: 'apollo', label: 'Apollo', description: 'Access 270M+ contacts with email and phone enrichment.' },
  { name: 'hunter', label: 'Hunter', description: 'Find and verify professional email addresses by domain.' },
];

const CRM_TOOLS = [
  { name: 'outreach', label: 'Outreach', description: 'Push prospects into sequences and automate outbound.' },
  { name: 'hubspot', label: 'HubSpot', description: 'Sync contacts directly to your HubSpot CRM.' },
  { name: 'salesforce', label: 'Salesforce', description: 'Create leads in Salesforce and add to campaigns.' },
];

const connectedBadge = (
  <span style={{
    background: '#dcfce7', color: '#16a34a',
    padding: '0.25rem 0.75rem', borderRadius: 12,
    fontSize: '0.75rem', fontWeight: 600,
  }}>Connected</span>
);

export default function Integrations() {
  const [integrations, setIntegrations] = useState([]);
  const [apiKeys, setApiKeys] = useState({});
  const [connecting, setConnecting] = useState(null);

  useEffect(() => { loadIntegrations(); }, []);

  const loadIntegrations = async () => {
    try {
      const res = await api.get('/customer/integrations');
      const data = res.data;
      setIntegrations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load integrations:', err);
    }
  };

  const isConnected = (toolName) => Array.isArray(integrations) && integrations.some(i => i.toolName === toolName);

  const connectApiKey = async (toolName) => {
    const key = apiKeys[toolName];
    if (!key) return;
    setConnecting(toolName);
    try {
      await api.post('/customer/integrations', { toolName, apiKey: key });
      setApiKeys({ ...apiKeys, [toolName]: '' });
      await loadIntegrations();
    } catch (err) {
      console.error(`Failed to connect ${toolName}:`, err);
    }
    setConnecting(null);
  };

  const disconnect = async (toolName) => {
    try {
      await api.delete(`/customer/integrations/${toolName}`);
      await loadIntegrations();
    } catch (err) {
      console.error(`Failed to disconnect ${toolName}:`, err);
    }
  };

  return (
    <div>
      <h1 className="mb-2">Integrations</h1>

      {/* Enrichment Tools */}
      <div className="card">
        <h3 style={{ marginBottom: '0.25rem' }}>Enrichment Tools</h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.25rem' }}>
          Connect your own enrichment account. We use your API key to search for prospects — you control the credits.
        </p>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {ENRICHMENT_TOOLS.map(tool => (
            <div key={tool.name} style={{
              border: `1px solid ${isConnected(tool.name) ? '#bbf7d0' : '#e5e7eb'}`,
              borderRadius: 8,
              padding: '1.25rem',
              background: isConnected(tool.name) ? '#f0fdf4' : '#fff',
            }}>
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <div className="flex gap-1" style={{ alignItems: 'center' }}>
                  <strong style={{ fontSize: '1rem' }}>{tool.label}</strong>
                  {isConnected(tool.name) && connectedBadge}
                </div>
                {isConnected(tool.name) && (
                  <button className="btn btn-outline" onClick={() => disconnect(tool.name)}>Disconnect</button>
                )}
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>{tool.description}</p>

              {!isConnected(tool.name) && (
                <div className="flex gap-1">
                  <input
                    type="password"
                    style={{ flex: 1, maxWidth: 360 }}
                    placeholder={`Paste your ${tool.label} API key`}
                    value={apiKeys[tool.name] || ''}
                    onChange={e => setApiKeys({ ...apiKeys, [tool.name]: e.target.value })}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => connectApiKey(tool.name)}
                    disabled={connecting === tool.name || !apiKeys[tool.name]}
                  >
                    {connecting === tool.name ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CRM */}
      <div className="card">
        <h3 style={{ marginBottom: '0.25rem' }}>CRM</h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.25rem' }}>
          Connect your CRM to push prospects directly into your sales workflow.
        </p>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {CRM_TOOLS.map(tool => (
            <div key={tool.name} style={{
              border: `1px solid ${isConnected(tool.name) ? '#bbf7d0' : '#e5e7eb'}`,
              borderRadius: 8,
              padding: '1.25rem',
              background: isConnected(tool.name) ? '#f0fdf4' : '#fff',
            }}>
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <div className="flex gap-1" style={{ alignItems: 'center' }}>
                  <strong style={{ fontSize: '1rem' }}>{tool.label}</strong>
                  {isConnected(tool.name) && connectedBadge}
                </div>
                {isConnected(tool.name) && (
                  <button className="btn btn-outline" onClick={() => disconnect(tool.name)}>Disconnect</button>
                )}
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>{tool.description}</p>

              {!isConnected(tool.name) && (
                <button
                  className="btn btn-outline"
                  onClick={() => alert(`${tool.label} OAuth integration coming soon`)}
                >
                  Connect via OAuth
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
