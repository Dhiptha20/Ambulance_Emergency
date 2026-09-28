import React from 'react';

export function StatCard({ title, value, icon: Icon, color = 'blue', subtitle, change, trend }) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      glow: 'group-hover:border-blue-500/40',
      gradient: 'from-blue-500/10 to-transparent'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      glow: 'group-hover:border-emerald-500/40',
      gradient: 'from-emerald-500/10 to-transparent'
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      glow: 'group-hover:border-rose-500/40',
      gradient: 'from-rose-500/10 to-transparent'
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      glow: 'group-hover:border-amber-500/40',
      gradient: 'from-amber-500/10 to-transparent'
    },
    indigo: {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      text: 'text-indigo-400',
      glow: 'group-hover:border-indigo-500/40',
      gradient: 'from-indigo-500/10 to-transparent'
    }
  };

  const currentTheme = colorMap[color] || colorMap.blue;

  return (
    <div className={`group relative p-5 rounded-2xl bg-slate-900/80 border ${currentTheme.border} ${currentTheme.glow} transition-all duration-300 shadow-lg overflow-hidden`}>
      {/* Background ambient gradient */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${currentTheme.gradient} rounded-full blur-2xl pointer-events-none`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{value ?? 0}</span>
            {subtitle && <span className="text-xs text-slate-400 font-medium">{subtitle}</span>}
          </div>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${currentTheme.bg} ${currentTheme.text} border ${currentTheme.border} shadow-inner`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {change && (
        <div className="mt-3 text-xs flex items-center gap-1.5 text-slate-400">
          <span className={trend === 'up' ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
            {change}
          </span>
          <span>vs last period</span>
        </div>
      )}
    </div>
  );
}
