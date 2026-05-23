import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Sun, Moon, LogOut, ShieldAlert } from 'lucide-react';
import logoImg from '../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || document.body.classList.contains('dark-mode');
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <nav className="glass-card" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 28px',
      borderRadius: '0px',
      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(20px)',
      boxShadow: '0 2px 20px rgba(0,0,0,0.02)',
      width: '100%'
    }}>
      {/* Brand Logo & Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img 
          src={logoImg} 
          alt="LearnKins Logo" 
          style={{ height: '36px', objectFit: 'contain' }} 
        />
      </div>

      {/* User Session Profile & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--text-primary-light)'
              }} className="nav-user-name">
                {user.name}
              </span>
              <span className={`badge-pill ${user.role === 'admin' ? 'badge-error' : 'badge-success'}`} style={{
                marginTop: '3px',
                fontSize: '10px',
                padding: '2px 8px'
              }}>
                {user.role === 'admin' ? (
                  <><ShieldAlert size={10} /> Admin Console</>
                ) : (
                  <>{user.batch?.name || 'Cohort Student'}</>
                )}
              </span>
            </div>
            
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: user.role === 'admin' ? '#fee2e2' : '#dcfce7',
              color: user.role === 'admin' ? '#ef4444' : '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px',
              border: '1.5px solid currentColor'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Toggles */}
        <div style={{
          height: '24px',
          width: '1px',
          backgroundColor: 'var(--light-border)',
        }} className="nav-divider" />

        <button 
          onClick={() => setDarkMode(!darkMode)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary-light)',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={20} className="text-warning" /> : <Moon size={20} />}
        </button>

        <button
          onClick={logout}
          className="btn btn-outline"
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
