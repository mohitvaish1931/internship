import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRole }) => {
  const { user, loading, isAuthenticated } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#0f172a',
        color: 'white',
        flexDirection: 'column',
        gap: '15px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 255, 255, 0.1)',
          borderLeftColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '15px', letterSpacing: '0.05em' }}>Loading LearnKins Desk...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // If not matching role, redirect appropriately
    return user.role === 'admin' 
      ? <Navigate to="/admin" replace /> 
      : <Navigate to="/student" replace />;
  }

  return children;
};

export default PrivateRoute;
