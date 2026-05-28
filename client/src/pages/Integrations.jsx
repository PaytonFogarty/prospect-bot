import { useState, useEffect } from 'react';
import api from '../api';

const ENRICHMENT_TOOLS = ['lusha', 'apollo', 'hunter'];
const CRM_TOOLS = ['outreach', 'hubspot', 'salesforce'];

export default function Integrations() {
  const [integrations, setIntegrations] = useState([]);
  const [apiKeys, setApiKeys] = useState({});

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const res = await api.get('/customer/integrations');
      setIntegrations(res.data);
    } catch (err) {
      console.error('Failed to load integrations:', err);
    }
  };

  const isConnected = (toolName) => integrations.some(i => i.tool_name === toolName);

  const connectApiKey = async (toolName) => {
    const key = apiKeys[toolName];
    if (!key) return;
    try {
      await api.post('/customer/integrations', { toolName, apiKey: key });
      setApiKeys({ ...apiKeys, [toolName]: '' });
      loadIntegrations();
    } catch (err) {
      console.error(`Failed to connect ${toolName}:`, err);
    }
  };

  const connectOAuth = async (provider) => {
    try {
      const res = await api.get(`/crm/oauth/${provider}`);
      window.location.href = res.data.url;
    } catch (err) {
      console.error(`OAuth init failed for ${provider}:`, err);
    }
  };

  const disconnect = async (toolName) => {
    try {
      await api.delete(`/crm/disconnect/${toolName}`);
      loadIntegrations();
    } catch (err) {
      console.error(`Failed to disconnect ${toolName}:`, err);
    }
  };

  return (
    <div>
      <h1 className="mb-2">Integrations</h1>

      <div className="card">
        <h3 style={{ marginBottom: '0.75rem' }}>Enrichment Tools</h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          Connect your own enrichment account. We use your API key to search for prospects — you control the credits.
        </p>
        {ENRICHMENT_TOOLS.map(tool => (
          <div key={tool} className="flex-between" style={{ padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
            <div className="flex gap-1" style={{ alignItems: 'center' }}>
              <strong style={{ textTransform: 'capitalize', minWidth: 80 }}>{tool}</strong>
              {isConnected(tool) && <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.125rem 0.5rem', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600 }}>Connected</span>}
            </div>
            {isConnected(tool) ? (
              <button className="btn btn-outline" onClick={() => disconnect(tool)}>Disconnect</button>
            ) : (
              <div className="flex gap-1">
                <input
                  style={{ width: 240 }}
                  placeholder={`Paste your ${tool} API key`}
                  value={apiKeys[tool] || ''}
                  onChange={e => setApiKeys({ ...apiKeys, [tool]: e.target.value })}
                />
                <button className="btn btn-primary" onClick={() => connectApiKey(tool)}>Connect</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '0.75rem' }}>CRM</h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          Connect your CRM to push prospects directly into your sales workflow.
        </p>
        {CRM_TOOLS.map(tool => (
          <div key={tool} className="flex-between" style={{ padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
            <div className="flex gap-1" style={{ alignItems: 'center' }}>
              <strong style={{ textTransform: 'capitalize', minWidth: 80 }}>{tool}</strong>
              {isConnected(tool) && <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.125rem 0.5rem', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600 }}>Connected</span>}
            </div>
            {isConnected(tool) ? (
              <button className="btn btn-outline" onClick={() => disconnect(tool)}>Disconnect</button>
            ) : (
              <button className="btn btn-primary" onClick={() => connectOAuth(tool)}>Connect via OAuth</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
