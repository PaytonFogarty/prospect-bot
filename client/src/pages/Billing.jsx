import { useState, useEffect } from 'react';
import api from '../api';
import PlanBadge from '../components/PlanBadge';

const FEATURES = [
  'Unlimited prospect searches — no monthly caps',
  'Automated daily prospecting runs',
  'CRM integrations (HubSpot & Salesforce)',
  'Contact enrichment & automatic refresh',
  'Smart deduplication across runs',
  'Priority email support',
];

export default function Billing() {
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  const params = new URLSearchParams(window.location.search);
  const showSuccess = params.get('success') === 'true';
  const showCancelled = params.get('cancelled') === 'true';
  const showSubscribeRequired = params.get('subscribe') === 'required';

  useEffect(() => {
    api.get('/billing/status')
      .then(res => setBilling(res.data))
      .catch(() => setError('Failed to load billing information.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async () => {
    setWorking(true);
    setError('');
    try {
      const res = await api.post('/billing/checkout');
      window.location.href = res.data.url;
    } catch (err) {
      setError('Could not start checkout. Please try again.');
      setWorking(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel your subscription? You will keep access until the end of the current billing period.')) {
      return;
    }
    setWorking(true);
    setError('');
    try {
      const res = await api.post('/billing/cancel');
      setBilling(prev => ({ ...prev, subscription_status: res.data.subscription_status || 'cancelled' }));
    } catch (err) {
      setError('Could not cancel your subscription. Please try again.');
    } finally {
      setWorking(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  const isActive = billing?.subscription_status === 'active';
  const planName = billing?.plan || 'Revara';
  const price = billing?.price || 149;

  return (
    <div>
      <h1 className="mb-2">Billing</h1>

      {showSuccess && (
        <div className="card" style={{ background: '#dcfce7', border: '1px solid #16a34a', color: '#166534', fontWeight: 600 }}>
          Welcome to Revara! Your subscription is active.
        </div>
      )}
      {showCancelled && (
        <div className="card" style={{ background: '#f3f4f6', color: '#374151' }}>
          Checkout cancelled. Subscribe anytime to activate your account.
        </div>
      )}
      {showSubscribeRequired && !isActive && (
        <div className="card" style={{ background: '#fef3c7', border: '1px solid #d97706', color: '#92400e', fontWeight: 600 }}>
          You need an active subscription to continue. Subscribe below to activate your account.
        </div>
      )}
      {error && <p className="error mb-2">{error}</p>}

      {isActive ? (
        <div className="card">
          <div className="flex-between mb-2">
            <h3>{planName}</h3>
            <PlanBadge status="active" />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>
            ${price}
            <span style={{ fontSize: '1rem', fontWeight: 400, color: '#6b7280' }}>/month</span>
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Your subscription is active. Thanks for being a Revara customer.
          </p>
          <div className="mt-2">
            <button className="btn btn-danger" onClick={handleCancel} disabled={working}>
              {working ? 'Cancelling...' : 'Cancel Subscription'}
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="flex-between mb-2">
            <h3>{planName}</h3>
            {billing?.subscription_status && billing.subscription_status !== 'inactive' && (
              <PlanBadge status={billing.subscription_status} />
            )}
          </div>
          <p style={{ fontSize: '2.25rem', fontWeight: 700 }}>
            ${price}
            <span style={{ fontSize: '1rem', fontWeight: 400, color: '#6b7280' }}>/month</span>
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Flat rate. Everything included. No prospect limits, no feature tiers.
          </p>

          <ul style={{ listStyle: 'none', margin: '1.5rem 0', display: 'grid', gap: '0.75rem' }}>
            {FEATURES.map(feature => (
              <li key={feature} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '1.1rem' }}>✓</span>
                {feature}
              </li>
            ))}
          </ul>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
            onClick={handleSubscribe}
            disabled={working}
          >
            {working ? 'Redirecting...' : 'Subscribe Now'}
          </button>
        </div>
      )}
    </div>
  );
}
