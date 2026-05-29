import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Setup from './pages/Setup';
import Integrations from './pages/Integrations';
import RunLog from './pages/RunLog';
import Billing from './pages/Billing';

function SmartRedirect() {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : <Landing />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SmartRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<WithNavbar />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/runs" element={<RunLog />} />
          <Route path="/billing" element={<Billing />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function WithNavbar() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Outlet />
      </div>
    </>
  );
}
