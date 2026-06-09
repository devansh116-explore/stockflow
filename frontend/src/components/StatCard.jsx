import React from 'react';

export default function StatCard({ title, value, icon: Icon, accent }) {
  return (
    <div className="stat-card" style={{ '--accent': accent }}>
      <div className="stat-icon">
        <Icon size={22} />
      </div>
      <div className="stat-body">
        <p className="stat-label">{title}</p>
        <h2 className="stat-value">{value}</h2>
      </div>
    </div>
  );
}
