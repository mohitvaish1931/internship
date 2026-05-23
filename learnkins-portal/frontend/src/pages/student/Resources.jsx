import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { TableSkeleton } from '../../components/Skeleton';
import { Search, Globe, FileText, Wrench, GitFork, Pin, ExternalLink } from 'lucide-react';

const StudentResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search / Tab states
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await api.get('/api/resources');
        setResources(response.data.resources);
      } catch (err) {
        console.error('Error loading resources:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'doc': return <FileText size={20} color="#3b82f6" />;
      case 'tool': return <Wrench size={20} color="#10b981" />;
      case 'repo': return <GitFork size={20} color="#6366f1" />;
      default: return <Globe size={20} color="#f97316" />;
    }
  };

  const getLabel = (type) => {
    switch (type) {
      case 'doc': return '📜 Guides & Docs';
      case 'tool': return '🛠️ Utilities';
      case 'article': return '📰 Reading';
      case 'repo': return '📁 Repositories';
      default: return '🔗 Web Resource';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '30px' }}>
        <h1 style={{ marginBottom: '20px' }}>Shared Cohort Resources</h1>
        <TableSkeleton />
      </div>
    );
  }

  // Filter resource list
  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(search.toLowerCase()) || 
                          res.category.toLowerCase().includes(search.toLowerCase());
    
    const matchesTab = activeTab === 'All' || res.type === activeTab;
    
    return matchesSearch && matchesTab;
  });

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Scope Header */}
      <div>
        <h1 style={{ fontSize: '28px', color: 'var(--text-primary-light)', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          Shared Cohort Resources
        </h1>
        <p style={{ color: 'var(--text-secondary-light)', fontSize: '15px', marginTop: '4px' }}>
          Browse external articles, code repositories, documentation links, and tools pinned for your learning program.
        </p>
      </div>

      {/* Filter and Search controls */}
      <div className="glass-card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '16px 24px'
      }}>
        
        {/* Search */}
        <div style={{ position: 'relative', width: '320px', minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search links by name or category..."
            style={{ paddingLeft: '44px' }}
          />
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }} className="tabs-row">
          {['All', 'doc', 'tool', 'article', 'repo'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.15s',
                backgroundColor: activeTab === tab ? 'var(--primary)' : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--text-secondary-light)'
              }}
              className="tab-button"
            >
              {tab === 'All' ? '📂 All Resources' : getLabel(tab)}
            </button>
          ))}
        </div>

      </div>

      {/* Resources grid display */}
      {filteredResources.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Globe size={40} style={{ color: '#64748b' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>No matching resources active for your cohort.</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {filteredResources.map((res) => (
            <a
              key={res._id}
              href={res.url}
              target="_blank"
              rel="noreferrer"
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px',
                textDecoration: 'none',
                color: 'inherit',
                borderLeft: res.pinned ? '5px solid var(--secondary)' : '1px solid var(--light-border)',
                backgroundColor: res.pinned ? 'rgba(249,115,22,0.01)' : 'rgba(255,255,255,0.7)',
                boxShadow: res.pinned ? '0 4px 20px rgba(249,115,22,0.04)' : '0 4px 20px rgba(0,0,0,0.01)',
                height: '100%',
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = res.pinned ? '0 4px 20px rgba(249,115,22,0.04)' : '0 4px 20px rgba(0,0,0,0.01)';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', gap: '10px' }}>
                  <div style={{
                    padding: '8px',
                    backgroundColor: 'var(--light-bg)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getIcon(res.type)}
                  </div>

                  {res.pinned && (
                    <span className="badge-pill badge-warning" style={{ fontSize: '9px', fontWeight: 800 }}>
                      <Pin size={10} style={{ transform: 'rotate(45deg)' }} /> Pinned
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary-light)', lineHeight: '1.4' }}>
                  {res.title}
                </h3>
                
                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary-dark)',
                  wordBreak: 'break-all',
                  marginTop: '6px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {res.url}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--light-border)',
                paddingTop: '16px',
                marginTop: '20px',
                fontSize: '12px'
              }}>
                <span className="badge-pill badge-info" style={{ textTransform: 'uppercase', fontSize: '9px' }}>
                  {res.category}
                </span>

                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--primary)',
                  fontWeight: 700
                }}>
                  Open Link <ExternalLink size={12} />
                </span>
              </div>

            </a>
          ))}
        </div>
      )}

    </div>
  );
};

export default StudentResources;
