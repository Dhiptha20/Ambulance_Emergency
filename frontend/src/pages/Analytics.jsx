import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  Clock, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  CheckCircle2, 
  RefreshCw, 
  ArrowDownRight, 
  ArrowUpRight, 
  Activity, 
  Filter 
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { zoneService } from '../services/zoneService';
import { StatCard } from '../components/StatCard';
import { useToast } from '../hooks/useToast.jsx';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

export function Analytics() {
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('ALL');
  
  // Default date range: 30 days prior to tomorrow
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { success, error } = useToast();

  // Load zones on mount
  useEffect(() => {
    async function fetchZones() {
      try {
        const data = await zoneService.getAll();
        setZones(data);
      } catch (err) {
        error('Failed to load zone options');
      }
    }
    fetchZones();
  }, [error]);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getAverageResponseTime({
        zone: selectedZone,
        startDate,
        endDate
      });
      setAnalyticsData(data);
    } catch (err) {
      error(err.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [selectedZone, startDate, endDate, error]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadAnalytics();
  };

  // Prepare chart series from completed calls
  const chartData = analyticsData?.completedCalls?.map((c, idx) => ({
    name: `#${c.callId} (${c.callerZone})`,
    responseTime: c.responseTimeMinutes,
    ambulance: c.assignedAmbulanceNumber,
    completedAt: c.completedAt
  })) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
              Performance Intelligence
            </span>
            <span className="text-xs text-slate-400">Response Time & SLA Analytics</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            Dispatch Response Analytics
          </h2>
        </div>

        <button
          onClick={loadAnalytics}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Date & Zone Filter Controls */}
      <form
        onSubmit={handleFilterSubmit}
        className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap gap-4 items-end"
      >
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            Target District Zone
          </label>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="ALL">ALL ZONES (Combined Citywide)</option>
            {zones.map((z) => (
              <option key={z.id} value={z.zoneCode}>{z.zoneCode} — {z.zoneName}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Apply Filter
          </button>
        </div>
      </form>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Average Response Time"
          value={`${analyticsData?.averageResponseTime ?? 0} min`}
          icon={Clock}
          color="emerald"
          subtitle={`Filtered Zone: ${analyticsData?.zone ?? 'ALL'}`}
        />
        <StatCard
          title="Completed Calls"
          value={analyticsData?.numberOfCompletedCalls ?? 0}
          icon={CheckCircle2}
          color="blue"
          subtitle="Resolved emergencies in range"
        />
        <StatCard
          title="Fastest Response (Min)"
          value={`${analyticsData?.minimumResponseTime ?? 0} min`}
          icon={TrendingUp}
          color="indigo"
          subtitle="Best arrival SLA"
        />
        <StatCard
          title="Longest Response (Max)"
          value={`${analyticsData?.maximumResponseTime ?? 0} min`}
          icon={Activity}
          color="rose"
          subtitle="Maximum transit duration"
        />
      </div>

      {/* Response Time Breakdown Chart */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Response Time Distribution by Completed Emergency
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Individual duration in minutes from initial dispatch to on-scene resolution
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
            City Benchmark: &lt; 15 mins
          </span>
        </div>

        <div className="h-72 w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              No completed emergency calls found for the selected zone and date range.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="m" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                  formatter={(val, name) => [`${val} minutes`, 'Response Time']}
                />
                <Bar dataKey="responseTime" name="Response Time (mins)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Audit List of Completed Emergency Calls */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-base font-bold text-white">
            Resolved Emergency Incident Log ({analyticsData?.completedCalls?.length || 0})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Historical calls included in average calculation</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Call ID</th>
                <th className="py-3 px-4">Caller</th>
                <th className="py-3 px-4">Zone</th>
                <th className="py-3 px-4">Assigned Ambulance</th>
                <th className="py-3 px-4">Completion Time</th>
                <th className="py-3 px-4 text-right">Response Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {analyticsData?.completedCalls?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No completed calls in this timeframe.
                  </td>
                </tr>
              ) : (
                analyticsData?.completedCalls?.map((call) => (
                  <tr key={call.callId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-400">
                      #{call.callId}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {call.callerName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-bold text-slate-200">
                        {call.callerZone}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-blue-400">
                      {call.assignedAmbulanceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {call.completedAt}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      {call.responseTimeMinutes} mins
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
