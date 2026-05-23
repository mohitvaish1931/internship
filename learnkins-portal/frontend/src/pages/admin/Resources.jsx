import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { TableSkeleton } from '../../components/Skeleton';
import { Plus, Trash2, Pin, Globe, FileText, Wrench, GitFork } from 'lucide-react';

const AdminResources = () => {
  const [resources, setResources] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('doc');
  const [category, setCategory] = useState('');
  const [pinned, setPinned] = useState(false);
  const [selectedBatches, setSelectedBatches] = useState([]);

  // Log messages
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchResources = async () => {
    try {
      const response = await api.get('/api/resources');
      setResources(response.data.resources);
    } catch (err) {
      console.error('Error fetching resources:', err);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await api.get('/api/batches');
      setBatches(response.data.batches);
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchResources(), fetchBatches()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleBatchToggle = (batchId) => {
    setSelectedBatches(prev =>
      prev.includes(batchId)
        ? prev.filter(id => id !== batchId)
        : [...prev, batchId]
    );
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!title || !url || !type || selectedBatches.length === 0) {
      setMsg({ type: 'error', text: 'Please fill in all required fields (Title, URL, Type, and target Cohorts).' });
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/api/resources', {
        title,
        url,
        type,
        category: category || 'General',
        pinned,
        batchIds: selectedBatches
      });

      setMsg({ type: 'success', text: `Success! "${title}" link has been cataloged.` });
      setTitle('');
      setUrl('');
      setCategory('');
      setPinned(false);
      setSelectedBatches([]);
      
      fetchResources(); // Reload resources list
    } catch (err) {
      console.error('Error creating resource:', err);
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add resource.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (resId) => {
    try {
      await api.delete(`/api/resources/${resId}`);
      setResources(prev => prev.filter(r => r._id !== resId));
    } catch (err) {
      console.error('Error deleting resource:', err);
    }
  };

  const getIcon = (resType) => {
    switch (resType) {
      case 'doc': return <FileText size={18} color="#3b82f6" />;
      case 'tool': return <Wrench size={18} color="#10b981" />;
      case 'repo': return <GitFork size={18} color="#6366f1" />;
      default: return <Globe size={18} color="#f97316" />;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '30px' }}>
        <h1 style={{ marginBottom: '20px' }}>Curated Links & Resources</h1>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }} className="responsive-split">
      
      {/* Left Column: Resources List */}
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', color: 'var(--text-primary-light)', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            Curated Links & Resources
          </h1>
          <p style={{ color: 'var(--text-secondary-light)', fontSize: '15px', marginTop: '4px' }}>
            Curate tutorials, external documentation, repositories, and developer utilities by cohorts.
          </p>
        </div>

        {resources.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '50px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Globe size={40} style={{ color: '#64748b' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>No resources cataloged yet.</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {resources.map((res) => (
              <div key={res._id} className="glass-card" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderLeft: res.pinned ? '5px solid var(--secondary)' : '1px solid var(--light-border)',
                backgroundColor: res.pinned ? 'rgba(249,115,22,0.02)' : 'rgba(255,255,255,0.7)',
                gap: '16px'
              }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  <div style={{
                    padding: '10px',
                    backgroundColor: 'var(--light-bg)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getIcon(res.type)}
                  </div>
                  
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 style={{ fontSize: '15.5px', fontWeight: 750, color: 'var(--text-primary-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {res.title}
                      {res.pinned && <Pin size={12} color="#f97316" style={{ transform: 'rotate(45deg)' }} />}
                    </h3>
                    <a href={res.url} target="_blank" rel="noreferrer" style={{
                      fontSize: '12.5px',
                      color: 'var(--primary)',
                      textDecoration: 'none',
                      display: 'block',
                      marginTop: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {res.url}
                    </a>
                    
                    {/* Cohort list tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                      <span className="badge-pill badge-info" style={{ fontSize: '9px', padding: '1px 6px', textTransform: 'uppercase' }}>
                        {res.type}
                      </span>
                      <span className="badge-pill badge-warning" style={{ fontSize: '9px', padding: '1px 6px' }}>
                        {res.category}
                      </span>
                      {res.batch && res.batch.map(b => (
                        <span key={b._id || b} className="badge-pill badge-success" style={{ fontSize: '9px', padding: '1px 6px', backgroundColor: 'rgba(16,185,129,0.06)' }}>
                          {b.name || 'Batch'}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                <button
                  onClick={() => handleDelete(res._id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary-light)',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary-light)'}
                  title="Remove resource Link"
                >
                  <Trash2 size={16} />
                </button>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Add Resource Form Card */}
      <div>
        <div className="glass-card" style={{ position: 'sticky', top: '100px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} color="#6366f1" /> Catalog New Link
          </h2>

          {msg.text && (
            <div style={{
              fontSize: '13px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: `1px solid ${msg.type === 'error' ? 'var(--error)' : 'var(--success)'}`,
              color: msg.type === 'error' ? 'var(--error)' : 'var(--success)',
              backgroundColor: msg.type === 'error' ? 'rgba(239,68,68,0.05)' : 'rgba(16,185,129,0.05)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>{msg.text}</span>
            </div>
          )}

          <form onSubmit={handleAddResource} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Resource Title *</label>
              <input
                type="text"
                className="input-field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. GitHub Repository - MERN Boilerplate"
                required
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Resource URL *</label>
              <input
                type="url"
                className="input-field"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/learnkins/mern"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Resource Type *</label>
                <select
                  className="input-field"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="doc">📜 Document / Guides</option>
                  <option value="tool">🛠️ Developer Tool</option>
                  <option value="article">📰 Read Article</option>
                  <option value="repo">📁 Code Repository</option>
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Category Group</label>
                <input
                  type="text"
                  className="input-field"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Git, Backend"
                />
              </div>
            </div>

            {/* Target Batches checklist */}
            <div>
              <label className="input-label" style={{ marginBottom: '8px' }}>Cohort Group Access *</label>
              <div style={{
                maxHeight: '120px',
                overflowY: 'auto',
                border: '1.5px solid var(--light-border)',
                borderRadius: '10px',
                padding: '8px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                backgroundColor: '#ffffff'
              }}>
                {batches.map(b => (
                  <div 
                    key={b._id}
                    onClick={() => handleBatchToggle(b._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      padding: '4px 0'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBatches.includes(b._id)}
                      onChange={() => {}} // container handled click
                      style={{ cursor: 'pointer', width: '14px', height: '14px', accentColor: 'var(--primary)' }}
                    />
                    <span>{b.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pin resource toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="pin-res"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                style={{ width: '15px', height: '15px', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <label htmlFor="pin-res" style={{ fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Pin resource to top of list
              </label>
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
                opacity: submitting ? 0.75 : 1
              }}
            >
              Add Curated Resource
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

export default AdminResources;
