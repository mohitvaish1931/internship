import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { TableSkeleton } from '../../components/Skeleton';
import { Search, ToggleLeft, ToggleRight, Trash2, SlidersHorizontal, ChevronLeft, ChevronRight, Users } from 'lucide-react';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [batchId, setBatchId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/api/students', {
        params: {
          search,
          batch: batchId,
          page,
          limit: 8
        }
      });
      setStudents(response.data.students);
      setTotalPages(response.data.totalPages || 1);
      setTotalStudentsCount(response.data.totalStudents || 0);
    } catch (err) {
      console.error('Error fetching students list:', err);
    } finally {
      setLoading(false);
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
    fetchBatches();
  }, []);

  // Trigger search / filter refetches
  useEffect(() => {
    fetchStudents();
  }, [search, batchId, page]);

  const handleToggleActive = async (student) => {
    try {
      const updatedStatus = !student.active;
      const response = await api.put(`/api/students/${student._id}`, {
        active: updatedStatus
      });
      
      setStudents(prev => 
        prev.map(s => s._id === student._id ? { ...s, active: response.data.student.active } : s)
      );
    } catch (err) {
      console.error('Error toggling student active status:', err);
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this student account? This will wipe their complete learning and progress records.')) {
      return;
    }

    try {
      await api.delete(`/api/students/${studentId}`);
      setStudents(prev => prev.filter(s => s._id !== studentId));
      setTotalStudentsCount(prev => prev - 1);
    } catch (err) {
      console.error('Error deleting student account:', err);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // reset to first page
  };

  const handleBatchChange = (e) => {
    setBatchId(e.target.value);
    setPage(1);
  };

  if (loading && students.length === 0) {
    return (
      <div style={{ padding: '30px' }}>
        <h1 style={{ marginBottom: '20px' }}>Students Directory</h1>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Scope Header */}
      <div>
        <h1 style={{ fontSize: '28px', color: 'var(--text-primary-light)', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          Students Directory
        </h1>
        <p style={{ color: 'var(--text-secondary-light)', fontSize: '15px', marginTop: '4px' }}>
          Browse registered student profiles, verify cohort groups, and toggle account activation levels.
        </p>
      </div>

      {/* Filter Controls Row */}
      <div className="glass-card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '16px 24px'
      }}>
        
        {/* Search Input */}
        <div style={{ position: 'relative', width: '320px', minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            className="input-field"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or email..."
            style={{ paddingLeft: '44px' }}
          />
        </div>

        {/* Batch Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SlidersHorizontal size={16} style={{ color: '#64748b' }} />
          <select
            className="input-field"
            value={batchId}
            onChange={handleBatchChange}
            style={{ width: '220px', cursor: 'pointer' }}
          >
            <option value="">All Cohort Groups</option>
            {batches.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Directory Table Display */}
      {students.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Users size={40} style={{ color: '#64748b' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>No matching student profiles found.</h3>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '0px', overflowX: 'auto', border: '1px solid var(--light-border)', borderRadius: '16px' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '14.5px'
          }}>
            <thead>
              <tr style={{
                backgroundColor: 'rgba(99,102,241,0.02)',
                borderBottom: '1.5px solid var(--light-border)'
              }}>
                <th style={{ padding: '16px 24px', fontWeight: 700 }}>Student Full Name</th>
                <th style={{ padding: '16px 24px', fontWeight: 700 }}>Email Address</th>
                <th style={{ padding: '16px 24px', fontWeight: 700 }}>Assigned Cohort</th>
                <th style={{ padding: '16px 24px', fontWeight: 700, textAlign: 'center' }}>Portal Access</th>
                <th style={{ padding: '16px 24px', fontWeight: 700, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} style={{
                  borderBottom: '1px solid var(--light-border)',
                  backgroundColor: student.active ? 'transparent' : 'rgba(239,68,68,0.01)'
                }} className="table-row">
                  
                  {/* Name */}
                  <td style={{ padding: '16px 24px', fontWeight: 750, color: student.active ? 'var(--text-primary-light)' : 'var(--text-secondary-dark)' }}>
                    {student.name}
                  </td>
                  
                  {/* Email */}
                  <td style={{ padding: '16px 24px', color: 'var(--text-secondary-light)' }}>
                    {student.email}
                  </td>
                  
                  {/* Cohort Batch */}
                  <td style={{ padding: '16px 24px' }}>
                    <span className="badge-pill badge-info" style={{ fontSize: '10px' }}>
                      {student.batch?.name || 'Unassigned'}
                    </span>
                  </td>

                  {/* Active Toggle Switch */}
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleToggleActive(student)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: student.active ? 'var(--success)' : 'var(--text-secondary-dark)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.2s'
                      }}
                      title={student.active ? "Click to Deactivate account" : "Click to Activate account"}
                    >
                      {student.active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                  </td>

                  {/* Delete Account */}
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDelete(student._id)}
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
                      title="Wipe account"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginTop: '8px'
        }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-outline"
            style={{ padding: '8px 12px', borderRadius: '8px', opacity: page === 1 ? 0.5 : 1 }}
          >
            <ChevronLeft size={16} />
          </button>
          
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary-light)' }}>
            Page {page} of {totalPages} ({totalStudentsCount} total)
          </span>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-outline"
            style={{ padding: '8px 12px', borderRadius: '8px', opacity: page === totalPages ? 0.5 : 1 }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

    </div>
  );
};

export default StudentList;
