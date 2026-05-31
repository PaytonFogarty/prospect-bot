import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import api from '../api';

// Layout route guard: requires a token, then checks subscription status.
// Inactive customers are redirected to /billing (except when already there).
export default function ProtectedRoute() {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const [status, setStatus] = useState(undefined); // undefined = still loading
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    api.get('/billing/status')
      .then(res => { if (active) setStatus(res.data.subscription_status); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Wait for the status check before deciding (avoids a flash of the app).
  if (status === undefined && !failed) {
    return <div className="container"><p>Loading...</p></div>;
  }

  // If the status couldn't be loaded, fail open — the backend still enforces
  // subscription on every protected endpoint, so the user can't do anything
  // privileged, and we avoid trapping them on a transient error.
  const isBillingPage = location.pathname === '/billing';
  if (!failed && status !== 'active' && !isBillingPage) {
    return <Navigate to="/billing?subscribe=required" replace />;
  }

  return <Outlet />;
}
