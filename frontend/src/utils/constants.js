export const AMBULANCE_STATUS = {
  AVAILABLE: {
    label: 'AVAILABLE',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  BUSY: {
    label: 'BUSY',
    color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    dot: 'bg-rose-400 animate-pulse',
  }
};

export const EMERGENCY_STATUS = {
  PENDING: {
    label: 'PENDING',
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400 animate-ping-slow',
    description: 'Awaiting ambulance allocation'
  },
  ASSIGNED: {
    label: 'ASSIGNED',
    color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    dot: 'bg-blue-400 animate-pulse',
    description: 'Ambulance en route to emergency scene'
  },
  IN_PROGRESS: {
    label: 'IN_PROGRESS',
    color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    dot: 'bg-indigo-400',
    description: 'Paramedics on scene / stabilizing'
  },
  COMPLETED: {
    label: 'COMPLETED',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400',
    description: 'Emergency resolved and patient transported'
  },
  CANCELLED: {
    label: 'CANCELLED',
    color: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    dot: 'bg-slate-400',
    description: 'Call cancelled'
  }
};
