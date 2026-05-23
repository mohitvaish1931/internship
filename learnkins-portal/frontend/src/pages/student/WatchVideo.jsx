import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import api from '../../utils/api';
import { TableSkeleton } from '../../components/Skeleton';
import { ChevronLeft, Play, Pause, RefreshCw, CheckCircle2, Award, ListVideo } from 'lucide-react';

const WatchVideo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);

  const [videoData, setVideoData] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Player Controls State
  const [playing, setPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [progressSaved, setProgressSaved] = useState(false);

  // Fetch video data & sibling videos list for cohort playlist
  const loadContent = async () => {
    try {
      const [videoRes, playlistRes] = await Promise.all([
        api.get(`/api/videos/${id}`),
        api.get('/api/videos') // retrieves student batch videos
      ]);

      setVideoData(videoRes.data);
      setPlaylist(playlistRes.data.videos || []);
      
      const previousWatchedPercent = videoRes.data.progress?.watchedPercent || 0;
      // If student previously watched some, we'll seek to that point once player is loaded
      if (previousWatchedPercent > 0 && previousWatchedPercent < 99) {
        // We'll calculate target seconds below once total duration is parsed
      }
    } catch (err) {
      console.error('Error fetching lesson video context:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
    setProgressSaved(false);
  }, [id]);

  // Sync Watch Progress to Backend
  const syncProgress = async (percent) => {
    try {
      const response = await api.post('/api/progress/update', {
        videoId: id,
        watchedPercent: Math.round(percent)
      });
      
      // Update local state watched percent
      setVideoData(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          watchedPercent: response.data.progress.watchedPercent,
          completed: response.data.progress.completed
        }
      }));

      setProgressSaved(true);
      setTimeout(() => setProgressSaved(false), 2000);
    } catch (err) {
      console.error('Error syncing watch progress:', err);
    }
  };

  const handleDuration = (dur) => {
    setTotalDuration(dur);
    
    // Auto-seek if student has prior watch progress
    const watchedPercent = videoData?.progress?.watchedPercent || 0;
    if (watchedPercent > 0 && watchedPercent < 95 && playerRef.current) {
      const startSeconds = (watchedPercent / 100) * dur;
      playerRef.current.seekTo(startSeconds, 'seconds');
      setPlayedSeconds(startSeconds);
    }
  };

  const handleProgress = (state) => {
    setPlayedSeconds(state.playedSeconds);
    
    // Calculate current percent
    if (totalDuration > 0) {
      const currentPercent = (state.playedSeconds / totalDuration) * 100;
      
      // Trigger sync if they hit milestones or every 10% interval
      const oldPercent = videoData?.progress?.watchedPercent || 0;
      if (currentPercent > oldPercent + 5 && currentPercent <= 100) {
        // Debounce / sync incremental progress
        syncProgress(currentPercent);
      }
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    // Mark as 100% completed
    syncProgress(100);
  };

  if (loading) {
    return (
      <div style={{ padding: '30px' }}>
        <h1 style={{ marginBottom: '20px' }}>Loading Lesson Stream...</h1>
        <TableSkeleton />
      </div>
    );
  }

  if (!videoData) {
    return (
      <div style={{ padding: '30px', textAlign: 'center' }}>
        <AlertCircle size={40} color="var(--error)" />
        <h2>Lesson Not Found</h2>
        <Link to="/student/videos">Go back to library</Link>
      </div>
    );
  }

  const { video } = videoData;
  const userProgress = videoData.progress || { watchedPercent: 0, completed: false };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Return button row */}
      <div>
        <Link to="/student/videos" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-secondary-light)',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 700
        }}>
          <ChevronLeft size={16} /> Return to Library
        </Link>
      </div>

      {/* Main Split Player desk Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '24px' }} className="responsive-split">
        
        {/* Left Side: Video Player, Metadata Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Main Media Player viewport wrapper */}
          <div className="glass-card" style={{
            backgroundColor: '#020617',
            padding: 0,
            overflow: 'hidden',
            borderRadius: '16px',
            position: 'relative',
            aspectRatio: '16/9',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
          }}>
            <ReactPlayer
              ref={playerRef}
              url={video.cloudinaryUrl}
              playing={playing}
              controls={true} // natively support full native speed and audio sliders
              playbackRate={playbackSpeed}
              width="100%"
              height="100%"
              onDuration={handleDuration}
              onProgress={handleProgress}
              onEnded={handleEnded}
              onPause={() => syncProgress((playedSeconds / totalDuration) * 100)}
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
          </div>

          {/* Quick Player Controllers bar */}
          <div className="glass-card" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setPlaying(!playing)}
                className="btn btn-primary"
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}
              >
                {playing ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Resume</>}
              </button>

              {/* Speed controls */}
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="input-field"
                style={{ padding: '6px 12px', width: '90px', borderRadius: '8px', fontSize: '13px', border: '1px solid var(--light-border)', cursor: 'pointer' }}
              >
                <option value={1}>1.0x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2.0x</option>
              </select>
            </div>

            {/* Progress sync message */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {progressSaved ? (
                <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> Watch progress recorded
                </span>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--text-secondary-dark)' }}>
                  Auto-syncing to learning profile...
                </span>
              )}
            </div>
          </div>

          {/* Lesson Metadata information card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <span className="badge-pill badge-warning" style={{ fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px' }}>
                {video.module} • Day {video.day}
              </span>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary-light)', lineHeight: '1.3' }}>
                {video.title}
              </h2>
            </div>

            <p style={{ color: 'var(--text-secondary-light)', fontSize: '14.5px', lineHeight: '1.6' }}>
              {video.description || 'No description provided for this lesson module.'}
            </p>

            {/* Achievement badge status preview */}
            {userProgress.completed && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: 'rgba(16,185,129,0.06)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '10px'
              }}>
                <div style={{
                  padding: '8px',
                  backgroundColor: 'rgba(16,185,129,0.1)',
                  borderRadius: '50%',
                  color: 'var(--success)'
                }}>
                  <Award size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--success)' }}>Lesson Module Completed!</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary-light)', marginTop: '2px' }}>
                    Congratulations! You completed this lesson and logged it on your Achievements ledger.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Side: Cohort Sibling Videos Playlist Panel */}
        <div>
          <div className="glass-card" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'sticky',
            top: '90px',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListVideo size={18} color="#f97316" /> Cohort Playlist
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {playlist.map((item, index) => {
                const isCurrent = item._id === id;
                const progressState = item.progress || { watchedPercent: 0, completed: false };

                return (
                  <div
                    key={item._id}
                    onClick={() => !isCurrent && navigate(`/student/videos/${item._id}`)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      padding: '12px',
                      borderRadius: '10px',
                      border: isCurrent ? '1.5px solid var(--primary)' : '1.5px solid var(--light-border)',
                      backgroundColor: isCurrent ? 'var(--primary-glow)' : progressState.completed ? 'rgba(16,185,129,0.01)' : '#ffffff',
                      cursor: isCurrent ? 'default' : 'pointer',
                      transition: 'all 0.15s'
                    }}
                    className={`playlist-item ${isCurrent ? 'active' : ''}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: 750,
                        color: isCurrent ? 'var(--primary)' : 'var(--text-primary-light)',
                        lineHeight: '1.3',
                        height: '34px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {index + 1}. {item.title}
                      </span>
                      {progressState.completed && (
                        <CheckCircle2 size={14} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-secondary-dark)', marginTop: '4px' }}>
                      <span>Day {item.day} • {item.module}</span>
                      <span style={{ fontWeight: 600 }}>{progressState.watchedPercent}%</span>
                    </div>

                    {/* Miniature progress bar */}
                    <div style={{ backgroundColor: 'var(--light-border)', height: '4px', borderRadius: '2px', overflow: 'hidden', marginTop: '2px' }}>
                      <div style={{
                        backgroundColor: progressState.completed ? 'var(--success)' : 'var(--primary)',
                        height: '100%',
                        width: `${progressState.watchedPercent}%`
                      }} />
                    </div>

                  </div>
                );
              })}
            </div>

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

export default WatchVideo;
