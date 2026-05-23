import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { TableSkeleton } from '../../components/Skeleton';
import { Edit, Trash2, Video, AlertCircle, PlayCircle } from 'lucide-react';

const ManageVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);

  // Edit Modal State
  const [editingVideo, setEditingVideo] = useState(null);
  const [batches, setBatches] = useState([]);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDay, setEditDay] = useState(1);
  const [editModule, setEditModule] = useState('');
  const [editOrder, setEditOrder] = useState(1);
  const [editDuration, setEditDuration] = useState(60);
  const [editBatches, setEditBatches] = useState([]);
  const [updating, setUpdating] = useState(false);

  const fetchVideos = async () => {
    try {
      const response = await api.get('/api/videos');
      setVideos(response.data.videos);
    } catch (err) {
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await api.get('/api/batches');
      setBatches(response.data.batches);
    } catch (err) {
      console.error('Error fetching cohorts:', err);
    }
  };

  useEffect(() => {
    fetchVideos();
    fetchBatches();
  }, []);

  const handleDelete = async (videoId) => {
    try {
      await api.delete(`/api/videos/${videoId}`);
      setVideos(prev => prev.filter(v => v._id !== videoId));
      setDeleteConfirmationId(null);
    } catch (err) {
      console.error('Error deleting video:', err);
    }
  };

  const startEdit = (video) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditDesc(video.description || '');
    setEditDay(video.day);
    setEditModule(video.module);
    setEditOrder(video.order || 1);
    setEditDuration(video.duration || 60);
    setEditBatches(video.batch ? video.batch.map(b => b._id || b) : []);
  };

  const handleEditBatchToggle = (batchId) => {
    setEditBatches(prev =>
      prev.includes(batchId)
        ? prev.filter(id => id !== batchId)
        : [...prev, batchId]
    );
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await api.put(`/api/videos/${editingVideo._id}`, {
        title: editTitle,
        description: editDesc,
        day: Number(editDay),
        module: editModule,
        order: Number(editOrder),
        duration: Number(editDuration),
        batchIds: editBatches
      });

      setEditingVideo(null);
      fetchVideos(); // Reload videos list
    } catch (err) {
      console.error('Error updating video details:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '30px' }}>
        <h1 style={{ marginBottom: '20px' }}>Manage Video Library</h1>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Scope Header */}
      <div>
        <h1 style={{ fontSize: '28px', color: 'var(--text-primary-light)', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          Manage Video Library
        </h1>
        <p style={{ color: 'var(--text-secondary-light)', fontSize: '15px', marginTop: '4px' }}>
          Monitor published lesson video streams, edit display metadata, and configure targeted cohorts access control.
        </p>
      </div>

      {videos.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <Video size={48} style={{ color: '#64748b' }} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Your Video Library is Empty</h3>
            <p style={{ color: 'var(--text-secondary-light)', fontSize: '14.5px', marginTop: '4px' }}>
              Upload video courses to schedule them for active learning groups.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {videos.map((video) => (
            <div key={video._id} className="glass-card" style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              padding: '16px',
              border: deleteConfirmationId === video._id ? '1.5px solid var(--error)' : '1px solid var(--light-border)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              
              {/* Media Thumbnail Container */}
              <div style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                paddingBottom: '56.25%', // 16:9 Aspect Ratio
                backgroundColor: '#1e293b',
                marginBottom: '16px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
              }}>
                <img 
                  src={video.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400'} 
                  alt={video.title} 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.8
                  }}
                />
                
                {/* Duration Badge */}
                <span className="badge-pill badge-info" style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  fontSize: '10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {Math.floor(video.duration / 60)}m {video.duration % 60}s
                </span>

                {/* Day / Module Badge */}
                <span className="badge-pill badge-warning" style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  fontSize: '10px',
                  fontWeight: 800
                }}>
                  Day {video.day} • {video.module}
                </span>

                <PlayCircle size={36} color="white" style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.8
                }} />
              </div>

              {/* Video Info details */}
              <div style={{ flex: 1, marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary-light)', lineHeight: '1.4' }}>
                  {video.title}
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary-light)',
                  marginTop: '6px',
                  lineHeight: '1.5',
                  height: '40px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {video.description || 'No description provided.'}
                </p>

                {/* Cohort Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
                  {video.batch && video.batch.map(b => (
                    <span key={b._id || b} className="badge-pill badge-success" style={{ fontSize: '9px', padding: '2px 6px' }}>
                      {b.name || 'Batch'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modification / Deletion button block */}
              <div style={{ display: 'flex', gap: '10px', borderTop: '1.5px solid var(--light-border)', paddingTop: '14px' }}>
                
                {deleteConfirmationId === video._id ? (
                  <div style={{ display: 'flex', width: '100%', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--error)', flex: 1 }}>Confirm Delete?</span>
                    <button 
                      onClick={() => handleDelete(video._id)}
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '8px', backgroundColor: 'var(--error)' }}
                    >
                      Delete
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmationId(null)}
                      className="btn btn-outline" 
                      style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '8px' }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(video)}
                      className="btn btn-outline"
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Edit size={14} /> Edit
                    </button>

                    <button
                      onClick={() => setDeleteConfirmationId(video._id)}
                      className="btn btn-outline"
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: 'var(--error)',
                        borderColor: 'rgba(239,68,68,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modern Overlay Edit Video Modal */}
      {editingVideo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '560px',
            backgroundColor: 'var(--light-surface)',
            border: '1px solid var(--light-border)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', fontFamily: 'var(--font-display)' }}>
              Edit Lesson Details
            </h2>

            <form onSubmit={saveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Lesson Title</label>
                <input
                  type="text"
                  className="input-field"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Module / Topic</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editModule}
                    onChange={(e) => setEditModule(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Day</label>
                  <input
                    type="number"
                    className="input-field"
                    value={editDay}
                    onChange={(e) => setEditDay(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Module Order</label>
                  <input
                    type="number"
                    className="input-field"
                    value={editOrder}
                    onChange={(e) => setEditOrder(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Duration (sec)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Target cohort list */}
              <div>
                <label className="input-label" style={{ marginBottom: '8px' }}>Target Cohorts</label>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  border: '1.5px solid var(--light-border)',
                  borderRadius: '10px',
                  padding: '10px'
                }}>
                  {batches.map((batch) => (
                    <div 
                      key={batch._id}
                      onClick={() => handleEditBatchToggle(batch._id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '6px',
                        backgroundColor: editBatches.includes(batch._id) ? 'var(--primary-glow)' : 'transparent'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={editBatches.includes(batch._id)}
                        onChange={() => {}} // parent handled click
                        style={{ cursor: 'pointer', width: '14px', height: '14px', accentColor: 'var(--primary)' }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{batch.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Description</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Button controllers */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="submit"
                  disabled={updating}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '14px' }}
                >
                  {updating ? 'Saving Changes...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '14px' }}
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageVideos;
