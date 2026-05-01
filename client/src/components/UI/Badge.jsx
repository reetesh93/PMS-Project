import React from 'react';

const statusMap = {
  'Pending': 'badge-pending',
  'In Progress': 'badge-progress',
  'Done': 'badge-done',
  'High': 'badge-high',
  'Medium': 'badge-medium',
  'Low': 'badge-low',
  'admin': 'badge-admin',
  'member': 'badge-member',
};

const Badge = ({ text }) => {
  const cls = statusMap[text] || 'badge-pending';
  return <span className={`badge ${cls}`}>{text}</span>;
};

export default Badge;
