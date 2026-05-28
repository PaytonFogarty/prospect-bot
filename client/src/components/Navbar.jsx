import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 2rem' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 56 }}>
        <div className="flex gap-2" style={{ alignItems: 'center' }}>
          <Link to="/dashboard" style={{ fontWeight: 700, fontSize: '1.125rem', color: '#4f46e5', textDecoration: 'none' }}>
            ProspectBot
          </Link>
          <div className="flex gap-1" style={{ marginLeft: '1.5rem' }}>
            {[
              ['Dashboard', '/dashboard'],
              ['Setup', '/setup'],
              ['Integrations', '/integrations'],
              ['Run Log', '/runs'],
              ['Billing', '/billing'],
            ].map(([label, path]) => (
              <Link key={path} to={path} style={{ color: '#374151', textDecoration: 'none', fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
        <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
