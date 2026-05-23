import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, Shield, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect based on role
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!email || !password) {
      setError('Please fill in all credentials fields.');
      setSubmitting(false);
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      setError(result.message || 'Invalid email or password.');
    }
    setSubmitting(false);
  };
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'radial-gradient(circle at top left, hsla(238, 83%, 66%, 0.15), transparent 40%), radial-gradient(circle at bottom right, hsla(24, 95%, 53%, 0.12), transparent 45%)',
      backgroundColor: '#0f172a',
      fontFamily: 'var(--font-sans)',
      color: '#f8fafc'
    }}>
      <div style={{ width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Portal Branding Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #6366f1, #f97316)',
            borderRadius: '16px',
            margin: '0 auto 16px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
          }}>
            <Shield size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 900, marginBottom: '6px' }}>
            LearnKins Desk
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>Gamified Learning for Young Minds</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card" style={{
          backgroundColor: 'rgba(30, 41, 59, 0.7)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          padding: '36px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', fontFamily: 'var(--font-display)', textAlign: 'center' }}>
            Portal Sign In
          </h2>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--error)',
              color: '#fca5a5',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email Field */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    backgroundColor: '#1e293b',
                    border: '1.5px solid #334155',
                    borderRadius: '12px',
                    fontSize: '15px',
                    color: '#f8fafc',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  className="login-input"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
                Password Key
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    backgroundColor: '#1e293b',
                    border: '1.5px solid #334155',
                    borderRadius: '12px',
                    fontSize: '15px',
                    color: '#f8fafc',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  className="login-input"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{
                padding: '14px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                marginTop: '10px',
                width: '100%',
                opacity: submitting ? 0.75 : 1
              }}
            >
              {submitting ? 'Authenticating...' : 'Enter Student Portal'}
            </button>
          </form>
        </div>
      </div>
      <style>{`
        .login-input:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default Login;
