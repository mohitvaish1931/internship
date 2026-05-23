import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { UploadCloud, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

const UploadVideo = () => {
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [day, setDay] = useState(1);
  const [module, setModule] = useState('');
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [order, setOrder] = useState(1);
  const [duration, setDuration] = useState(60);

  // File Upload State Mockups
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Message logs
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await api.get('/api/batches');
        setBatches(response.data.batches);
      } catch (err) {
        console.error('Error fetching batches:', err);
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, []);

  const handleBatchToggle = (batchId) => {
    setSelectedBatches(prev => 
      prev.includes(batchId) 
        ? prev.filter(id => id !== batchId) 
        : [...prev, batchId]
    );
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Auto-set some parameters for admin convenience
      setTitle(file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
      setMsg({ type: '', text: '' });
    }
  };

  const handleUploadAndSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!title || !day || !module || selectedBatches.length === 0) {
      setMsg({ type: 'error', text: 'Please fill in all required fields (Title, Day, Module, and at least one Batch).' });
      return;
    }

    if (!selectedFile && !videoUrl) {
      setMsg({ type: 'error', text: 'Please select a local video file to upload or provide a direct video URL.' });
      return;
    }

    setSubmitting(true);

    // If local file is selected, run an beautiful mock upload progress bar animation
    if (selectedFile) {
      setIsUploading(true);
      setUploadProgress(0);
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.floor(Math.random() * 15) + 5;
        });
      }, 200);

      // Wait for progress to hit 100%
      await new Promise(resolve => setTimeout(resolve, 2500));
      setIsUploading(false);
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('day', day);
      formData.append('module', module);
      formData.append('order', order);
      formData.append('duration', duration);
      formData.append('thumbnail', thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400');

      // Add selected batches
      selectedBatches.forEach(bId => {
        formData.append('batchIds', bId);
      });

      if (selectedFile) {
        formData.append('videoFile', selectedFile);
      } else {
        formData.append('videoUrl', videoUrl);
      }

      const response = await api.post('/api/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMsg({ type: 'success', text: `Success! "${title}" lesson has been uploaded and scheduled.` });
      
      // Reset form fields
      setTitle('');
      setDescription('');
      setVideoUrl('');
      setThumbnail('');
      setSelectedFile(null);
      setUploadProgress(0);
      setSelectedBatches([]);
      setModule('');
      setDay(1);
    } catch (err) {
      console.error('Error posting video:', err);
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to complete video upload.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Scope Header */}
      <div>
        <h1 style={{ fontSize: '28px', color: 'var(--text-primary-light)', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          Upload Learning Module Video
        </h1>
        <p style={{ color: 'var(--text-secondary-light)', fontSize: '15px', marginTop: '4px' }}>
          Publish new video lessons, structure them by modules/days, and restrict access per batch.
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
          fontSize: '14px'
        }}>
          {msg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Main Upload Box Form */}
      <form onSubmit={handleUploadAndSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Drag & Drop File Upload Panel Fallback */}
        <div>
          <label className="input-label" style={{ marginBottom: '10px' }}>Video File Upload</label>
          <div style={{
            border: '2px dashed var(--light-border)',
            borderRadius: '16px',
            padding: '36px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: selectedFile ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
            borderColor: selectedFile ? 'var(--primary)' : 'var(--light-border)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.2s'
          }} className="drag-drop-zone">
            
            <input 
              type="file" 
              accept="video/*" 
              onChange={handleFileChange} 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />

            <UploadCloud size={48} style={{ color: selectedFile ? 'var(--primary)' : '#64748b', margin: '0 auto 12px auto' }} />
            
            {selectedFile ? (
              <div>
                <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary-light)' }}>
                  Selected: {selectedFile.name}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary-light)', marginTop: '4px' }}>
                  ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB) - Click or drag to change file
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontWeight: 600, fontSize: '14.5px' }}>Drag & Drop video file here, or click to browse</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary-light)', marginTop: '4px' }}>
                  Supports MP4, WebM formats up to 100MB
                </p>
              </div>
            )}

            {/* Fake progress bar mockup */}
            {isUploading && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '4px',
                width: `${uploadProgress}%`,
                backgroundColor: 'var(--secondary)',
                transition: 'width 0.2s ease-out'
              }} />
            )}
          </div>
        </div>

        {/* Alternative URL Input Option */}
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Alternative Direct Video URL (If not uploading local file)</label>
          <input
            type="text"
            className="input-field"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="e.g. https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            disabled={!!selectedFile}
            style={{ opacity: selectedFile ? 0.5 : 1 }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Lesson Title */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Lesson Title *</label>
            <input
              type="text"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Setting up your local MongoDB environment"
            />
          </div>

          {/* Module / Topic Area */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Module / Topic Area *</label>
            <input
              type="text"
              className="input-field"
              value={module}
              onChange={(e) => setModule(e.target.value)}
              placeholder="e.g. Database Foundations"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          {/* Study Day */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Study Day *</label>
            <input
              type="number"
              className="input-field"
              value={day}
              min="1"
              onChange={(e) => setDay(e.target.value)}
            />
          </div>

          {/* Sort Order */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Module Display Order</label>
            <input
              type="number"
              className="input-field"
              value={order}
              min="1"
              onChange={(e) => setOrder(e.target.value)}
            />
          </div>

          {/* Duration */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Lesson Duration (Seconds)</label>
            <input
              type="number"
              className="input-field"
              value={duration}
              min="10"
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        </div>

        {/* Thumbnail URL input option */}
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Optional Thumbnail Image URL</label>
          <input
            type="text"
            className="input-field"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            placeholder="e.g. https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400"
          />
        </div>

        {/* Target cohort Batch Checkboxes */}
        <div>
          <label className="input-label" style={{ marginBottom: '10px' }}>Target Cohorts (Select at least one) *</label>
          {loadingBatches ? (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary-dark)' }}>Loading batches list...</p>
          ) : batches.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--error)' }}>No batches active. Please configure cohorts first.</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '12px',
              backgroundColor: 'rgba(99,102,241,0.02)',
              border: '1.5px solid var(--light-border)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              {batches.map((batch) => (
                <div 
                  key={batch._id} 
                  onClick={() => handleBatchToggle(batch._id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: selectedBatches.includes(batch._id) ? 'var(--primary-glow)' : 'transparent',
                    transition: 'all 0.15s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedBatches.includes(batch._id)}
                    onChange={() => {}} // Controlled click on container parent
                    style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: 'var(--primary)' }}
                  />
                  <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{batch.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Description textarea */}
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Detailed Lesson Description</label>
          <textarea
            className="input-field"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short overview of what interns will master in this lesson module..."
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Submit Uploader Button */}
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary"
          style={{
            padding: '14px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            opacity: submitting ? 0.75 : 1,
            marginTop: '10px'
          }}
        >
          <Sparkles size={18} />
          {submitting ? 'Uploading Lesson & Scheduling...' : 'Upload & Publish Module'}
        </button>

      </form>
    </div>
  );
};

export default UploadVideo;
