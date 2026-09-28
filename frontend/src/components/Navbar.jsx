import React, { useState, useEffect } from 'react';
import { Menu, Bell, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar({ onMenuToggle }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Dispatch Control Room</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300">Zone Proximity Engine</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </span>
        </div>

        {/* Quick New Emergency Button */}
        <Link
          to="/emergency-calls/new"
          className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold rounded-lg shadow-lg shadow-rose-900/40 transition-all duration-200"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Dispatch Emergency</span>
        </Link>
      </div>
    </header>
  );
}
