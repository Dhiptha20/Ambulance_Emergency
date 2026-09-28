import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Truck, 
  PhoneCall, 
  PlusCircle, 
  MapPin, 
  Route, 
  BarChart3, 
  Activity,
  Radio
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/ambulances', label: 'Ambulances', icon: Truck },
  { path: '/emergency-calls', label: 'Emergency Calls', icon: PhoneCall },
  { path: '/emergency-calls/new', label: 'New Emergency', icon: PlusCircle, highlight: true },
  { path: '/zones', label: 'Zones', icon: MapPin },
  { path: '/proximity', label: 'Zone Proximity', icon: Route },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar sidebar element */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Logo / Header */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800 bg-slate-950/50">
          <div className="relative p-2 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white shadow-lg shadow-rose-600/30">
            <Activity className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              Ambulance<span className="text-rose-500">Dispatch</span>
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Nearest Allocation</p>
          </div>
        </div>

        {/* Live system status badge */}
        <div className="px-5 py-3 border-b border-slate-800/60 bg-slate-900/30">
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="flex items-center gap-2 text-slate-300 font-medium">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              CAD System
            </span>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">ONLINE</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold shadow-sm'
                      : item.highlight
                      ? 'text-rose-400 bg-rose-950/30 border border-rose-900/40 hover:bg-rose-900/50 hover:text-rose-300'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${item.highlight ? 'text-rose-400' : ''}`} />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="ml-auto text-[10px] uppercase bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded">
                    SOS
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400">
          <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
            <span>MySQL 8.0</span>
            <span className="text-emerald-400">Spring Boot 3</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Project Leap Final Assessment</p>
        </div>
      </aside>
    </>
  );
}
