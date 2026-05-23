import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { VideoListSkeleton } from '../../components/Skeleton';
import { PlayCircle, CheckCircle, Clock, Video } from 'lucide-react';

const VideoLibrary = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModuleTab, setActiveModuleTab] = useState('All');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await api.get('/api/videos');
        setVideos(response.data.videos);
      } catch (err) {
        console.error('Error fetching student videos library:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '30px' }}>
        <h1 style={{ marginBottom: '20px' }}>Video Library Workspace</h1>
        <VideoListSkeleton />
      </div>
    );
  }

  // Parse list of unique Modules dynamically to display as Filter Tabs
  const uniqueModules = ['All', ...new Set(videos.map(v => v.module))];

  // Filter video cards based on active module tab selection
  const filteredVideos = activeModuleTab === 'All'
    ? videos
    : videos.filter(v => v.module === activeModuleTab);

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Scope Header */}
      <div>
        <h1 style={{ fontSize: '28px', color: 'var(--text-primary-light)', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          Video Library Workspace
        </h1>
        <p style={{ color: 'var(--text-secondary-light)', fontSize: '15px', marginTop: '4px' }}>
          Browse scheduled video lessons assigned to your cohort. Complete modules to earn badges.
        </p>
      </div>

      {videos.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Video size={48} style={{ color: '#64748b' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>No videos assigned to your cohort yet.</h3>
          <p style={{ color: 'var(--text-secondary-light)', fontSize: '14.5px', marginTop: '4px' }}>
            Check back soon! Your cohort supervisor will publish course modules shortly.
          </p>
        </div>
      ) : (
        <>
          {/* Module Filter Tabs Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '8px',
            borderBottom: '1.5px solid var(--light-border)'
          }} className="tabs-row">
            {uniqueModules.map((mod) => (
              <button
                key={mod}
                onClick={() => setActiveModuleTab(mod)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  outline: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                  backgroundColor: activeModuleTab === mod ? 'var(--primary)' : 'transparent',
                  color: activeModuleTab === mod ? 'white' : 'var(--text-secondary-light)'
                }}
                className="tab-button"
              >
                {mod}
              </button>
            ))}
          </div>

          {/* Grid of video lessons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {filteredVideos.map((video) => {
              const userProgress = video.progress || { watchedPercent: 0, completed: false };

              return (
                <div key={video._id} className="glass-card" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  padding: '16px',
                  border: userProgress.completed ? '1.5px solid rgba(16,185,129,0.3)' : '1px solid var(--light-border)',
                  backgroundColor: userProgress.completed ? 'rgba(16,185,129,0.01)' : 'rgba(255,255,255,0.7)',
                  position: 'relative'
                }}>
                  
                  {/* Thumbnail Banner */}
                  <div style={{
                    position: 'relative',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    paddingBottom: '56.25%',
                    backgroundColor: '#0f172a',
                    marginBottom: '14px'
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

                    {/* Day indicator tag */}
                    <span className="badge-pill badge-warning" style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      fontSize: '9px',
                      padding: '2px 8px',
                      fontWeight: 800
                    }}>
                      Day {video.day}
                    </span>

                    {/* Duration */}
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'white',
                      backgroundColor: 'rgba(15,23,42,0.8)',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '9px',
                      fontWeight: 700,
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <Clock size={10} />
                      <span>{Math.floor(video.duration / 60)}m</span>
                    </div>

                    {/* Checked Overlay */}
                    {userProgress.completed && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(15,23,42,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CheckCircle size={40} color="#10b981" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))' }} />
                      </div>
                    )}
                  </div>

                  {/* Title and Module details */}
                  <div style={{ flex: 1, marginBottom: '16px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary-dark)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                      {video.module}
                    </span>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary-light)', lineHeight: '1.4' }}>
                      {video.title}
                    </h3>
                  </div>

                  {/* Progress and Link controller */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--light-border)', paddingTop: '14px' }}>
                    
                    {/* Progress Slider */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <span style={{ color: 'var(--text-secondary-light)', fontWeight: 600 }}>Watch Progress</span>
                      <span style={{ fontWeight: 700, color: userProgress.completed ? 'var(--success)' : 'var(--text-primary-light)' }}>
                        {userProgress.watchedPercent}%
                      </span>
                    </div>
                    
                    <div style={{ backgroundColor: 'var(--light-border)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        backgroundColor: userProgress.completed ? 'var(--success)' : 'var(--primary)',
                        height: '100%',
                        width: `${userProgress.watchedPercent}%`
                      }} />
                    </div>

                    {/* Go to Video Lesson link */}
                    <Link
                      to={`/student/videos/${video._id}`}
                      className={`btn ${userProgress.completed ? 'btn-outline' : 'btn-primary'}`}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        marginTop: '4px'
                      }}
                    >
                      <PlayCircle size={15} />
                      <span>{userProgress.completed ? 'Rewatch Lesson' : userProgress.watchedPercent > 0 ? 'Resume Course' : 'Watch Lesson'}</span>
                    </Link>

                  </div>

                </div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
};

export default VideoLibrary;
