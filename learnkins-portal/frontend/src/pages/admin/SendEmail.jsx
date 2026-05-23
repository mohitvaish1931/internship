import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { TableSkeleton } from '../../components/Skeleton';
import { Mail, CheckCircle2, AlertCircle, Calendar, Send } from 'lucide-react';

const SendEmail = () => {
  const [batches, setBatches] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [targetType, setTargetType] = useState('all');
  const [batchId, setBatchId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [templateName, setTemplateName] = useState('Custom Announcement');

  // Messages log
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [broadcasting, setBroadcasting] = useState(false);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/api/email/logs');
      setLogs(response.data.logs);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await api.get('/api/batches');
      setBatches(response.data.batches);
      if (response.data.batches.length > 0) {
        setBatchId(response.data.batches[0]._id);
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchLogs(), fetchBatches()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!subject || !message || !templateName) {
      setMsg({ type: 'error', text: 'Subject, Message, and Template style are required to trigger broadcasts.' });
      return;
    }

    if (targetType === 'batch' && !batchId) {
      setMsg({ type: 'error', text: 'Please select a target cohort group.' });
      return;
    }

    setBroadcasting(true);

    try {
      const response = await api.post('/api/email/send', {
        targetType,
        batchId: targetType === 'batch' ? batchId : null,
        subject,
        message,
        templateName
      });

      setMsg({ type: 'success', text: response.data.message });
      setSubject('');
      setMessage('');
      
      // Reload logs
      fetchLogs();
    } catch (err) {
      console.error('Error dispatching mail list:', err);
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to dispatch email broadcast.' });
    } finally {
      setBroadcasting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '30px' }}>
        <h1 style={{ marginBottom: '20px' }}>Bulk Email Dispatch</h1>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '30px' }} className="responsive-split">
      
      {/* Left Column: Composer Form Card */}
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', color: 'var(--text-primary-light)', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            Bulk Email Broadcast
          </h1>
          <p style={{ color: 'var(--text-secondary-light)', fontSize: '14.5px', marginTop: '4px' }}>
            Compose notifications, reminders, or onboarding packets, wrap them in responsive HTML templates, and dispatch them to cohorts.
          </p>
        </div>

        {msg.text && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: msg.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            border: `1px solid ${msg.type === 'error' ? 'var(--error)' : 'var(--success)'}`,
            color: msg.type === 'error' ? '#ef4444' : '#10b981',
            padding: '14px 18px',
            borderRadius: '12px',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            {msg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleBroadcast} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={20} color="#6366f1" /> Mail Composer
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Target Selectors */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Recipients Audience *</label>
              <select
                className="input-field"
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="all">👥 Broadcast All Active Students</option>
                <option value="batch">🎒 Target Specific Cohort Batch</option>
              </select>
            </div>

            {/* Template Selector */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Email Layout Template *</label>
              <select
                className="input-field"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="Welcome">📜 Welcome Package Frame</option>
                <option value="Weekly Reminder">📬 Weekly learning checklist</option>
                <option value="Custom Announcement">📢 Custom notices layout</option>
              </select>
            </div>
          </div>

          {/* Batch Selector if targetType is 'batch' */}
          {targetType === 'batch' && (
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Select Target Cohort Batch *</label>
              <select
                className="input-field"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                style={{ cursor: 'pointer' }}
                required
              >
                {batches.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Subject */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Email Subject Header *</label>
            <input
              type="text"
              className="input-field"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Schedule and Resources list for week 2"
              required
            />
          </div>

          {/* Rich message text body */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Broadcast Message (HTML / Text body) *</label>
            <textarea
              className="input-field"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your email announcement message here..."
              style={{ resize: 'vertical' }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={broadcasting}
            className="btn btn-primary"
            style={{
              padding: '14px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: broadcasting ? 0.75 : 1,
              marginTop: '10px'
            }}
          >
            <Send size={16} />
            {broadcasting ? 'Processing Broadcast Dispatches...' : 'Dispatch Broadcast'}
          </button>

        </form>
      </div>

      {/* Right Column: Past Dispatch History Logs List */}
      <div>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', maxHeight: '640px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="#f97316" /> Dispatch History Logs
          </h3>

          {logs.length === 0 ? (
            <p style={{ color: 'var(--text-secondary-dark)', textAlign: 'center', padding: '40px 0' }}>No broadcasts history recorded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {logs.map((log) => (
                <div key={log._id} style={{
                  border: '1.5px solid var(--light-border)',
                  borderRadius: '12px',
                  padding: '16px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary-light)' }}>
                      {log.subject}
                    </span>
                    <span className={`badge-pill ${log.status === 'sent' ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                      {log.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '11px', color: 'var(--text-secondary-light)' }}>
                    📅 {new Date(log.sentAt).toLocaleString()} • Scope: {log.template}
                  </p>

                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text-secondary-dark)',
                    backgroundColor: 'var(--light-bg)',
                    padding: '8px',
                    borderRadius: '6px',
                    wordBreak: 'break-word',
                    maxHeight: '60px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    <strong>To:</strong> {log.recipients && log.recipients.join(', ')}
                  </div>

                </div>
              ))}
            </div>
          )}
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

export default SendEmail;
