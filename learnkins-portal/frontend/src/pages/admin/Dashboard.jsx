import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { TableSkeleton } from '../../components/Skeleton';
import { 
  Users, Video, Layers, Mail, Plus, AlertCircle, Pin, CheckCircle2 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Notice board inputs
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticePinned, setNoticePinned] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/analytics/admin');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching admin statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handlePublishNotice = async (e) => {
    e.preventDefault();
    setPublishing(true);
    setMsg({ type: '', text: '' });

    if (!noticeTitle || !noticeContent) {
      setMsg({ type: 'error', text: 'Title and Content are required to post notices.' });
      setPublishing(false);
      return;
    }

    try {
      await api.post('/api/announcements', {
        title: noticeTitle,
        content: noticeContent,
        pinned: noticePinned
      });
      setMsg({ type: 'success', text: 'Notice board announcement successfully posted!' });
      setNoticeTitle('');
      setNoticeContent('');
      setNoticePinned(false);
      fetchStats(); // Reload board notice statistics
    } catch (err) {
      console.error('Error creating notice announcement:', err);
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to post announcement.' });
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '30px' }}>
        <h1 style={{ marginBottom: '20px' }}>Admin Workspace Desk</h1>
        <TableSkeleton />
      </div>
    );
  }

  const metrics = stats?.metrics || { totalStudents: 0, totalVideos: 0, totalBatches: 0, totalEmails: 0 };
  const recentStudents = stats?.recentStudents || [];
  const batchStats = stats?.batchStats || [];

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Scope Header */}
      <div>
        <h1 style={{ fontSize: '28px', color: 'var(--text-primary-light)', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          Admin Workspace Desk
        </h1>
        <p style={{ color: 'var(--text-secondary-light)', fontSize: '15px', marginTop: '4px' }}>
          Overview of learning cohorts, video libraries, resources, and broadcasts logs.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="dashboard-grid">
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', color: '#6366f1' }}>
            <Users size={28} />
          </div>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary-light)', display: 'block' }}>Students Directory</span>
            <span style={{ fontSize: '28px', fontWeight: 800 }}>{metrics.totalStudents}</span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', backgroundColor: 'rgba(249, 115, 22, 0.1)', borderRadius: '12px', color: '#f97316' }}>
            <Video size={28} />
          </div>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary-light)', display: 'block' }}>Video Lessons</span>
            <span style={{ fontSize: '28px', fontWeight: 800 }}>{metrics.totalVideos}</span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
            <Layers size={28} />
          </div>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary-light)', display: 'block' }}>Active Cohorts</span>
            <span style={{ fontSize: '28px', fontWeight: 800 }}>{metrics.totalBatches}</span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3b82f6' }}>
            <Mail size={28} />
          </div>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary-light)', display: 'block' }}>Mails Dispatched</span>
            <span style={{ fontSize: '28px', fontWeight: 800 }}>{metrics.totalEmails}</span>
          </div>
        </div>
      </div>

      {/* Main Panel Content Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="responsive-split">
        
        {/* Left Column: Recharts and Batch Performance List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Recharts Analytics Chart */}
          <div className="glass-card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', fontFamily: 'var(--font-display)' }}>
              Cohort Progress Engagement Rate
            </h3>
            {batchStats.length === 0 ? (
              <p style={{ color: 'var(--text-secondary-dark)', margin: 'auto' }}>No cohort performance details available.</p>
            ) : (
              <div style={{ flex: 1, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={batchStats} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-secondary-light)' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                    <Bar dataKey="avgCompletion" fill="#6366f1" radius={[4, 4, 0, 0]} name="Avg Progress" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Active Cohorts List */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
              Cohort Groups Performance
            </h3>
            {batchStats.length === 0 ? (
              <p style={{ color: 'var(--text-secondary-dark)' }}>No cohort details.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {batchStats.map((batch) => (
                  <div key={batch.batchId} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '12px',
                    borderBottom: '1.5px solid var(--light-border)',
                  }} className="batch-analytics-row">
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '14.5px', display: 'block' }}>{batch.name}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary-light)' }}>
                        👥 {batch.studentCount} Students • 🎥 {batch.videoCount} Video modules
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge-pill badge-info" style={{ fontSize: '12px' }}>
                        Avg Progress: {batch.avgCompletion}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Broadcast Notice Form & Recent Onboardings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick Notice Publisher Card */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Pin size={18} color="#f97316" /> Publish Notice Board Update
            </h3>

            {msg.text && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: msg.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                border: `1px solid ${msg.type === 'error' ? 'var(--error)' : 'var(--success)'}`,
                color: msg.type === 'error' ? '#ef4444' : '#10b981',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13.5px',
                marginBottom: '16px'
              }}>
                {msg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                <span>{msg.text}</span>
              </div>
            )}

            <form onSubmit={handlePublishNotice} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Announcement Title</label>
                <input
                  type="text"
                  className="input-field"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Schedule for Mid-Term Hackathon Broadcast"
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Detailed Notice Content</label>
                <textarea
                  className="input-field"
                  rows={4}
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="Interns, please note that the upcoming project submissions..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="pin-notice"
                  checked={noticePinned}
                  onChange={(e) => setNoticePinned(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: 'var(--primary)',
                    cursor: 'pointer'
                  }}
                />
                <label htmlFor="pin-notice" style={{ fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Pin this announcement to top of notice board
                </label>
              </div>

              <button
                type="submit"
                disabled={publishing}
                className="btn btn-primary"
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: publishing ? 0.75 : 1
                }}
              >
                <Plus size={16} />
                {publishing ? 'Publishing Notice...' : 'Publish Update'}
              </button>
            </form>
          </div>

          {/* Recent Onboarded Students directory snippet */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
              Recent Student Registrations
            </h3>
            {recentStudents.length === 0 ? (
              <p style={{ color: 'var(--text-secondary-dark)' }}>No registered students.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentStudents.map((student) => (
                  <div key={student._id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '10px',
                    borderBottom: '1.5px solid var(--light-border)',
                  }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{student.name}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary-light)', display: 'block' }}>{student.email}</span>
                    </div>
                    <div>
                      <span className="badge-pill badge-success" style={{ fontSize: '10px' }}>
                        {student.batch?.name || 'No cohort'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 800px) {
          .responsive-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
};

export default AdminDashboard;
