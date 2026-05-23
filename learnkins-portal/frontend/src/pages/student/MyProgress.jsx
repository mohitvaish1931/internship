import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import { TableSkeleton } from '../../components/Skeleton';
import { Award, Lock, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const MyProgress = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      try {
        const response = await api.get(`/api/analytics/student/${user._id}`);
        setData(response.data);
      } catch (err) {
        console.error('Error fetching student achievements:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div style={{ padding: '30px' }}>
        <h1 style={{ marginBottom: '20px' }}>Achievements Ledger</h1>
        <TableSkeleton />
      </div>
    );
  }

  const stats = data?.stats || { totalVideos: 0, completedVideos: 0, overallCompletion: 0 };
  const progressList = data?.progressList || [];
  const earnedBadges = data?.badges || [];

  // Structure complete badges library (earned vs locked)
  const badgesLibrary = [
    {
      id: 'first_step',
      title: '🎯 First Step',
      description: 'Completed your first course learning module.',
      icon: '🎯',
      details: 'Unlocked by watching 90% or more of any assigned video lesson.'
    },
    {
      id: 'halfway_hero',
      title: '⚡ Halfway Hero',
      description: 'Passed 50% watch rate milestone.',
      icon: '⚡',
      details: 'Unlocked by crossing 50% overall completion average.'
    },
    {
      id: 'mastery',
      title: '🏆 LearnKins Master',
      description: 'Completed entire learning syllabus.',
      icon: '🏆',
      details: 'Unlocked by successfully watching all assigned course modules.'
    }
  ];

  // Pie Chart Data
  const remainingVideos = Math.max(0, stats.totalVideos - stats.completedVideos);
  const pieData = [
    { name: 'Completed Modules', value: stats.completedVideos },
    { name: 'Remaining Modules', value: remainingVideos }
  ];
  const COLORS = ['#6366f1', '#e2e8f0'];

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Scope Header */}
      <div>
        <h1 style={{ fontSize: '28px', color: 'var(--text-primary-light)', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          Achievements Ledger
        </h1>
        <p style={{ color: 'var(--text-secondary-light)', fontSize: '15px', marginTop: '4px' }}>
          Monitor video lesson module completions, track watch percentage ratios, and unlock gamified awards.
        </p>
      </div>

      {/* Analytics Visualization Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }} className="responsive-split">
        
        {/* Left Column: Progress details bar chart */}
        <div className="glass-card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="#6366f1" /> Watch Progress Per Video Module
          </h3>
          {progressList.length === 0 ? (
            <p style={{ color: 'var(--text-secondary-dark)', margin: 'auto' }}>No videos assigned to your cohort yet.</p>
          ) : (
            <div style={{ flex: 1, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressList} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="title" tick={{ fontSize: 9, fill: 'var(--text-secondary-light)' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" />
                  <Tooltip cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                  <Bar dataKey="watchedPercent" fill="#f97316" radius={[4, 4, 0, 0]} name="Progress Rate" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right Column: Completed Breakdown Pie Chart */}
        <div className="glass-card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
            Completion Breakdown Ratio
          </h3>
          {stats.totalVideos === 0 ? (
            <p style={{ color: 'var(--text-secondary-dark)', margin: 'auto' }}>No progress logs recorded.</p>
          ) : (
            <div style={{ flex: 1, width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '100%', height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '12.5px', fontWeight: 600, marginTop: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#6366f1' }} />
                  Completed ({stats.completedVideos})
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#e2e8f0' }} />
                  Remaining ({remainingVideos})
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Gamified Badges library Section */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🏆 Gamified Program Badges ({earnedBadges.length} Earned)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {badgesLibrary.map((badge) => {
            const isEarned = earnedBadges.some(b => b.id === badge.id);
            const earnDetails = earnedBadges.find(b => b.id === badge.id);

            return (
              <div
                key={badge.id}
                className="glass-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  border: isEarned ? '1.5px solid var(--secondary)' : '1px solid var(--light-border)',
                  backgroundColor: isEarned ? 'rgba(249,115,22,0.01)' : 'rgba(255,255,255,0.4)',
                  opacity: isEarned ? 1 : 0.6,
                  padding: '24px',
                  borderRadius: '16px',
                  position: 'relative'
                }}
              >
                
                {/* Badge Icon circle */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: isEarned ? 'rgba(249,115,22,0.1)' : 'rgba(15,23,42,0.05)',
                  color: isEarned ? 'var(--secondary)' : 'var(--text-secondary-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  border: isEarned ? '1.5px solid var(--secondary)' : '1px dashed var(--light-border)',
                  flexShrink: 0,
                  boxShadow: isEarned ? '0 4px 12px rgba(249,115,22,0.2)' : 'none'
                }}>
                  {isEarned ? badge.icon : <Lock size={22} />}
                </div>

                {/* Badge copy details */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {badge.title}
                    {isEarned && <span className="badge-pill badge-success" style={{ fontSize: '8px', padding: '1px 5px' }}>Earned</span>}
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary-light)', marginTop: '4px', lineHeight: '1.4' }}>
                    {badge.description}
                  </p>
                  
                  {isEarned ? (
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary-dark)', display: 'block', marginTop: '6px', fontStyle: 'italic' }}>
                      Earned on: {new Date(earnDetails.earnedAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span style={{ fontSize: '11.5px', color: 'var(--text-secondary-dark)', display: 'block', marginTop: '6px', fontWeight: 500 }}>
                      🔒 {badge.details}
                    </span>
                  )}
                </div>

              </div>
            );
          })}
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

export default MyProgress;
