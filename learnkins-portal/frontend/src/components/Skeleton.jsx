import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="glass-card skeleton" style={{
      height: '180px',
      width: '100%',
      border: 'none',
      opacity: 0.8
    }}></div>
  );
};

export const VideoListSkeleton = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
};

export const TableSkeleton = () => {
  return (
    <div className="glass-card" style={{ padding: '20px', width: '100%' }}>
      <div className="skeleton" style={{ height: '35px', width: '100%', marginBottom: '15px' }}></div>
      <div className="skeleton" style={{ height: '25px', width: '100%', marginBottom: '10px', opacity: 0.7 }}></div>
      <div className="skeleton" style={{ height: '25px', width: '100%', marginBottom: '10px', opacity: 0.6 }}></div>
      <div className="skeleton" style={{ height: '25px', width: '100%', marginBottom: '10px', opacity: 0.5 }}></div>
      <div className="skeleton" style={{ height: '25px', width: '100%', opacity: 0.4 }}></div>
    </div>
  );
};
