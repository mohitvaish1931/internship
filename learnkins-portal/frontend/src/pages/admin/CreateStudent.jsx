import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { UserPlus, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

const CreateStudent = () => {
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [batchId, setBatchId] = useState('');
  
  // Results
  const [createdStudent, setCreatedStudent] = useState(null);
  const [tempPassword, setTempPassword] = useState('');
  const [copied, setCopied] = useState(false);

  // Messages log
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await api.get('/api/batches');
        setBatches(response.data.batches);
        if (response.data.batches.length > 0) {
          setBatchId(response.data.batches[0]._id);
        }
      } catch (err) {
        console.error('Error fetching batches:', err);
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, []);

  const handleOnboard = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setCreatedStudent(null);
    setTempPassword('');
    setCopied(false);

    if (!name || !email || !batchId) {
      setMsg({ type: 'error', text: 'Please fill in name, email, and target cohort.' });
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post('/api/students/create', {
        name,
        email,
        batchId
      });

      setMsg({ type: 'success', text: `Successfully registered student account for ${name}!` });
      setCreatedStudent(response.data.student);
      setTempPassword(response.data.generatedPassword);
      
      // Clear fields on successful onboarding
      setName('');
      setEmail('');
    } catch (err) {
      console.error('Error registering student:', err);
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to onboard student.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '30px', maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Scope Header */}
      <div>
        <h1 style={{ fontSize: '28px', color: 'var(--text-primary-light)', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          Onboard Student Profile
        </h1>
        <p style={{ color: 'var(--text-secondary-light)', fontSize: '15px', marginTop: '4px' }}>
          Create a student profile, assign them to a learning cohort, and trigger an automated Welcome credentials email.
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

      {/* Main Registration Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={20} color="#f97316" /> Student Details
        </h3>

        <form onSubmit={handleOnboard} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Student Full Name *</label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Email Address *</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john.doe@learnkins.com"
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Assign Learning Cohort *</label>
            {loadingBatches ? (
              <select className="input-field" disabled><option>Loading cohorts...</option></select>
            ) : batches.length === 0 ? (
              <select className="input-field" disabled><option>No cohorts available. Configure cohorts first.</option></select>
            ) : (
              <select
                className="input-field"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                style={{ cursor: 'pointer' }}
                required
              >
                {batches.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || batches.length === 0}
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
            Create Account & Send Welcome Package
          </button>

        </form>
      </div>

      {/* Onboarding Credentials Results display */}
      {createdStudent && tempPassword && (
        <div className="glass-card" style={{
          border: '1.5px solid #fed7aa',
          backgroundColor: '#fffaf0',
          color: '#7c2d12',
          padding: '24px',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            🎉 Student Credentials Package Created!
          </h4>
          <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#9a3412' }}>
            The student account was successfully recorded. Please provide these credentials to the student:
          </p>
          
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #ffedd5',
            borderRadius: '12px',
            padding: '16px',
            fontFamily: 'monospace',
            fontSize: '13.5px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <p><strong>Name:</strong> {createdStudent.name}</p>
            <p><strong>Email:</strong> {createdStudent.email}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p><strong>Temporary Password:</strong> <span style={{ backgroundColor: '#ffedd5', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{tempPassword}</span></p>
              
              <button
                onClick={handleCopyPassword}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 700
                }}
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy Key'}</span>
              </button>
            </div>
          </div>
          <p style={{ fontSize: '11px', color: '#c2410c', fontStyle: 'italic' }}>
            * Note: If mail delivery configuration credentials are not set in the backend env file, the email was logged to the terminal console, and the student can log in using these credentials immediately.
          </p>
        </div>
      )}

    </div>
  );
};

export default CreateStudent;
