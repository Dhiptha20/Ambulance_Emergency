import React from 'react';
import { AMBULANCE_STATUS, EMERGENCY_STATUS } from '../utils/constants';

export function StatusBadge({ status, type = 'emergency' }) {
  if (!status) return null;

  const config = type === 'ambulance' 
    ? (AMBULANCE_STATUS[status] || { label: status, color: 'bg-slate-800 text-slate-300 border-slate-700', dot: 'bg-slate-400' })
    : (EMERGENCY_STATUS[status] || { label: status, color: 'bg-slate-800 text-slate-300 border-slate-700', dot: 'bg-slate-400' });

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label || status}
    </span>
  );
}
