import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Fingerprint, Database, Home, Activity } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <nav className="navbar" style={{ background: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <Link to="/" className="nav-brand">Prajna 0.2</Link>
      <div className="nav-links">
        <Link to="/" className={isActive('/')}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Home size={16} /> Home
          </span>
        </Link>
        <Link to="/verify" className={isActive('/verify')}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Fingerprint size={16} /> Verify Identity
          </span>
        </Link>
        <Link to="/database" className={isActive('/database')}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={16} /> Manage Profiles
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
