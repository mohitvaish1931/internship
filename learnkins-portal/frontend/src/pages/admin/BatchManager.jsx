import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { TableSkeleton } from '../../components/Skeleton';
import { Layers, Plus, Calendar, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

const BatchManager = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Messages log
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchBatches = async () => {
    try {
      const response = await api.get('/api/batches');
      setBatches(response.data.batches);
    } catch (err) {
      console.error('Error fetching batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!name) {
      setMsg({ type: 'error', text: 'Batch name is required.' });
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/api/batches', {
        name,
        startDate: startDate || null,
        endDate: endDate || null
      });

      setMsg({ type: 'success', text: `Success! Cohort group "${name}" has been configured.` });
      setName('');
      setStartDate('');
      setEndDate('');
      fetchBatches(); // Reload batches list
    } catch (err) {
      console.error('Error creating batch:', err);
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create batch.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (batch) => {
    try {
      const updatedStatus = !batch.active;
      await api.put(`/api/batches/${batch._id}`, {
        active: updatedStatus
      });
      fetchBatches(); // Reload list
    } catch (err) {
      console.error('Error updating batch active status:', err);
    }
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this cohort batch? This will unassign any students currently linked to this cohort.')) {
      return;
    }

    try {
      await api.delete(`/api/batches/${batchId}`);
      setBatches(prev => prev.filter(b => b._id !== batchId));
    } catch (err) {
      console.error('Error deleting batch:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '30px' }}>
        <h1 style={{ marginBottom: '20px' }}>Cohort Batch Manager</h1>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }} className="responsive-split">
      
      {/* Left Column: Batches list */}
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', color: 'var(--text-primary-light)', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            Cohort Batch Manager
          </h1>
          <p style={{ color: 'var(--text-secondary-light)', fontSize: '15px', marginTop: '4px' }}>
            Configure and schedule learning student cohorts. Restrict resource and video lessons visibility per cohort.
          </p>
        </div>

        {batches.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '50px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Layers size={40} style={{ color: '#64748b' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>No cohorts configured yet.</h3>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {batches.map((batch) => (
              <div key={batch._id} className="glass-card" style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                border: '1px solid var(--light-border)',
                padding: '20px'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '10px' }}>
                    <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary-light)', lineHeight: '1.3' }}>
                      {batch.name}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(batch)}
                      className={`badge-pill ${batch.active ? 'badge-success' : 'badge-error'}`}
                      style={{ fontSize: '9px', padding: '2px 8px', border: 'none', cursor: 'pointer' }}
                      title="Click to toggle cohort status"
                    >
                      {batch.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary-light)', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} />
                      <span>Start: {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'Immediate'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} />
                      <span>End: {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'Self-Paced'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1.5px solid var(--light-border)', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleDeleteBatch(batch._id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-secondary-light)',
                      padding: '6px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary-light)'}
                    title="Delete cohort"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Add Batch Form Card */}
      <div>
        <div className="glass-card" style={{ position: 'sticky', top: '100px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} color="#6366f1" /> Create New Cohort
          </h2>

          {msg.text && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: `1px solid ${msg.type === 'error' ? 'var(--error)' : 'var(--success)'}`,
              color: msg.type === 'error' ? 'var(--error)' : 'var(--success)',
              backgroundColor: msg.type === 'error' ? 'rgba(239,68,68,0.05)' : 'rgba(16,185,129,0.05)',
              marginBottom: '16px'
            }}>
              {msg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{msg.text}</span>
            </div>
          )}

          <form onSubmit={handleCreateBatch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Cohort Name *</label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Batch Delta (Mobile App Dev)"
                required
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Program Start Date</label>
              <input
                type="date"
                className="input-field"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Program End Date</label>
              <input
                type="date"
                className="input-field"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                opacity: submitting ? 0.75 : 1,
                marginTop: '10px'
              }}
            >
              Configure Cohort
            </button>

          </form>
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

export default BatchManager;
