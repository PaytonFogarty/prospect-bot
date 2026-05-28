import { useState, useEffect } from 'react';
import api from '../api';
import PlanBadge from '../components/PlanBadge';

export default function Billing() {
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/billing/status')
      .then(res => setBilling(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCheckout = async () => {
    try {
      const res = await api.post('/billing/checkout');
      window.location.href = res.data.url;
    } catch (err) {
      console.error('Checkout failed:', err);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) return;
    try {
      await api.post('/billing/cancel');
      const res = await api.get('/billing/status');
      setBilling(res.data);
    } catch (err) {
      console.error('Cancel failed:', err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="mb-2">Billing</h1>

      <div className="card">
        <div className="flex-between mb-2">
          <h3>ProspectBot Plan</h3>
          <PlanBadge status={billing?.subscriptionStatus} />
        </div>

        <p style={{ fontSize: '2rem', fontWeight: 700 }}>$149<span style={{ fontSize: '1rem', fontWeight: 400, color: '#6b7280' }}>/month</span></p>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Flat rate. No prospect limits. No feature tiers. Everything included.
        </p>

        {billing?.subscriptionStatus === 'trialing' && (
          <div style={{ background: '#eff6ff', padding: '0.75rem 1rem', borderRadius: 6, marginTop: '1rem' }}>
            <p style={{ fontWeight: 600 }}>{billing.trialDaysLeft} days left in your free trial</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Your trial ends on {new Date(billing.trialEndsAt).toLocaleDateString()}. Subscribe to keep your pipeline running.
            </p>
          </div>
        )}

        <div className="mt-2">
          {billing?.subscriptionStatus !== 'active' ? (
            <button className="btn btn-primary" onClick={handleCheckout}>Subscribe Now</button>
          ) : (
            <button className="btn btn-danger" onClick={handleCancel}>Cancel Subscription</button>
          )}
        </div>
      </div>
    </div>
  );
}
