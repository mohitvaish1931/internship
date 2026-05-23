import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, Video, FolderOpen, Link2, Users, UserPlus, Mail, Layers,
  PlaySquare, Award, FolderHeart
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/admin/upload', label: 'Upload Video', icon: <Video size={18} /> },
    { to: '/admin/videos', label: 'Manage Videos', icon: <FolderOpen size={18} /> },
    { to: '/admin/resources', label: 'Curated Resources', icon: <Link2 size={18} /> },
    { to: '/admin/students', label: 'Students Directory', icon: <Users size={18} /> },
    { to: '/admin/students/new', label: 'Onboard Student', icon: <UserPlus size={18} /> },
    { to: '/admin/email', label: 'Bulk Emailer', icon: <Mail size={18} /> },
    { to: '/admin/batches', label: 'Batch Manager', icon: <Layers size={18} /> },
  ];

  const studentLinks = [
    { to: '/student', label: 'My Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/student/videos', label: 'Video Library', icon: <PlaySquare size={18} /> },
    { to: '/student/resources', label: 'Resource Desk', icon: <FolderHeart size={18} /> },
    { to: '/student/progress', label: 'Achievements', icon: <Award size={18} /> },
  ];

  const activeStyle = {
    backgroundColor: 'var(--primary-glow)',
    borderLeft: '4px solid var(--primary)',
    color: 'var(--primary)',
    fontWeight: '700'
  };

  const links = user.role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className="glass-card" style={{
      width: '260px',
      borderRadius: '0px',
      borderRight: '1px solid rgba(226, 232, 240, 0.8)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 72px)',
      boxShadow: '2px 0 20px rgba(0,0,0,0.01)',
      flexShrink: 0
    }}>
      <p style={{
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--text-secondary-light)',
        marginBottom: '16px',
        paddingLeft: '12px'
      }}>
        Portal Workspace
      </p>

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.to === '/admin' || link.to === '/student'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                textDecoration: 'none',
                color: 'var(--text-secondary-light)',
                fontSize: '14.5px',
                fontWeight: 500,
                transition: 'all 0.15s ease',
                borderLeft: '4px solid transparent',
                ...(isActive ? activeStyle : {})
              })}
              className="sidebar-link"
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Footer Branding inside Sidebar */}
      <div style={{ marginTop: 'auto', paddingLeft: '12px', paddingTop: '20px' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary-light)' }}>
          Logged as <strong>{user.role}</strong>
        </p>
        <span style={{ fontSize: '9px', color: 'var(--text-secondary-dark)', display: 'block', marginTop: '2px' }}>
          LearnKins v1.0.0
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;
