import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import { TableSkeleton } from '../../components/Skeleton';
import { 
  Sparkles, PlayCircle, BookOpen, AlertCircle, Pin, CheckCircle2, ChevronRight, GraduationCap 
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  
  const [analytics, setAnalytics] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        const [analyticsRes, announcementsRes, resourcesRes] = await Promise.all([
          api.get(`/api/analytics/student/${user._id}`),
          api.get('/api/announcements'),
          api.get('/api/resources')
        ]);
        
        setAnalytics(analyticsRes.data);
        setAnnouncements(announcementsRes.data.announcements);
        
        // Take top 3 recent resources
        setResources(resourcesRes.data.resources.slice(0, 3));
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div style={{ padding: '30px' }}>
        <h1 style={{ marginBottom: '20px' }}>My Student Desk</h1>
        <TableSkeleton />
      </div>
    );
  }

  const stats = analytics?.stats || { totalVideos: 0, completedVideos: 0, overallCompletion: 0 };
  const progressList = analytics?.progressList || [];
  
  // Daily recommendation: First uncompleted video lesson in sorted order
  const recommendedVideo = progressList.find(v => !v.completed) || progressList[0];

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Welcome Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(249, 115, 22, 0.8))',
        color: 'white',
        border: 'none',
        padding: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px',
        boxShadow: '0 10px 30px rgba(99, 102, 241, 0.25)'
      }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 900, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GraduationCap size={36} /> Welcome back, {user.name}!
          </h1>
          <p style={{ opacity: 0.9, fontSize: '15.5px', maxWidth: '600px', lineHeight: '1.5' }}>
            Cohort: <strong>{user.batch?.name || 'Cohort Participant'}</strong> • Keep expanding your skills. You have completed {stats.completedVideos} of {stats.totalVideos} assigned video models.
          </p>
        </div>
        
        {/* Simple Progress Ring alternative */}
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.15)',
          border: '4px solid rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          backdropFilter: 'blur(8px)'
        }}>
          <span style={{ fontSize: '22px', fontWeight: 900 }}>{stats.overallCompletion}%</span>
          <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>Watched</span>
        </div>
      </div>

      {/* Main Split Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }} className="responsive-split">
        
        {/* Left Column: Daily Lesson Recommender & Announcements Notice Board */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Daily recommendation lesson card */}
          {recommendedVideo ? (
            <div className="glass-card" style={{
              borderLeft: '5px solid var(--secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)' }}>
                <Sparkles size={18} />
                <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended Daily Lesson</span>
              </div>

              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary-light)' }}>
                  {recommendedVideo.title}
                </h3>
                <p style={{ color: 'var(--text-secondary-light)', fontSize: '13px', marginTop: '4px' }}>
                  Module: <strong>{recommendedVideo.module}</strong> • Day {recommendedVideo.day} • Duration: {Math.floor(recommendedVideo.duration / 60)} mins
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1.5px solid var(--light-border)', paddingTop: '16px', marginTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <div style={{ backgroundColor: 'var(--light-border)', height: '8px', borderRadius: '4px', flex: 1, maxWidth: '240px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: 'var(--primary)', height: '100%', width: `${recommendedVideo.watchedPercent}%` }} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary-light)' }}>{recommendedVideo.watchedPercent}% progress</span>
                </div>

                <Link
                  to={`/student/videos/${recommendedVideo.videoId}`}
                  className="btn btn-secondary"
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <PlayCircle size={16} />
                  <span>{recommendedVideo.watchedPercent > 0 ? 'Resume Lesson' : 'Start Lesson'}</span>
                </Link>
              </div>

            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
              <CheckCircle2 size={36} color="var(--success)" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Fantastic! You have completed every assigned lesson.</h3>
            </div>
          )}

          {/* Announcements Notice Board */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📢 Notice Board Announcements
            </h3>

            {announcements.length === 0 ? (
              <p style={{ color: 'var(--text-secondary-dark)', padding: '20px 0', textAlign: 'center' }}>Notice board is currently clear.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {announcements.map((announcement) => (
                  <div key={announcement._id} style={{
                    border: '1.5px solid var(--light-border)',
                    borderRadius: '12px',
                    padding: '20px',
                    backgroundColor: announcement.pinned ? 'rgba(99,102,241,0.01)' : '#ffffff',
                    borderLeft: announcement.pinned ? '4px solid var(--primary)' : '1.5px solid var(--light-border)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {announcement.title}
                        {announcement.pinned && <Pin size={12} color="#6366f1" style={{ transform: 'rotate(45deg)' }} />}
                      </h4>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary-dark)' }}>
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary-light)', lineHeight: '1.5' }}>
                      {announcement.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Key Progress bar and Recent Curated Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Key Progress metrics card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
              Course Master Progress
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  <span>Lesson Completion Rate</span>
                  <span>{stats.completedVideos} of {stats.totalVideos} videos</span>
                </div>
                
                {/* Horizontal Progress Bar */}
                <div style={{ backgroundColor: 'var(--light-border)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{
                    backgroundColor: 'var(--primary)',
                    height: '100%',
                    width: `${stats.overallCompletion}%`,
                    borderRadius: '5px',
                    transition: 'width 0.4s ease-out'
                  }} />
                </div>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-secondary-light)', lineHeight: '1.4' }}>
                Complete lessons by watching 90% or more of each assigned video lesson to unlock Achievements badges!
              </p>
            </div>
          </div>

          {/* Recent Curated Links Box */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                Recently Shared Links
              </h3>
              <Link to="/student/resources" style={{
                fontSize: '12px',
                color: 'var(--primary)',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center'
              }}>
                See All <ChevronRight size={14} />
              </Link>
            </div>

            {resources.length === 0 ? (
              <p style={{ color: 'var(--text-secondary-dark)', textAlign: 'center', padding: '20px 0' }}>No curated links active for your cohort.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {resources.map((res) => (
                  <a
                    key={res._id}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="glass-card"
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      border: '1px solid var(--light-border)',
                      backgroundColor: '#ffffff',
                      transition: 'transform 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <BookOpen size={16} color="#6366f1" style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 750, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {res.title}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary-light)' }}>
                        {res.category} • {res.type.toUpperCase()}
                      </span>
                    </div>
                  </a>
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

export default StudentDashboard;
