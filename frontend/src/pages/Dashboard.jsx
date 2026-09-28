import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, 
  PhoneCall, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  ArrowRight, 
  ShieldAlert, 
  Radio,
  Zap,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { emergencyCallService } from '../services/emergencyCallService';
import { ambulanceService } from '../services/ambulanceService';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../hooks/useToast.jsx';
import { formatTimeOnly, formatDateTime } from '../utils/formatters';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

export function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recentCalls, setRecentCalls] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const { success, error, warning } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, callsRes, ambsRes] = await Promise.all([
        analyticsService.getSummary(),
        emergencyCallService.getAll(),
        ambulanceService.getAll()
      ]);
      setSummary(summaryRes);
      setRecentCalls(callsRes.slice(0, 6));
      setAmbulances(ambsRes);
    } catch (err) {
      error(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000); // auto-refresh every 20s
    return () => clearInterval(interval);
  }, [loadData]);

  const handleAssignNearest = async (callId) => {
    try {
      setAssigningId(callId);
      const result = await emergencyCallService.assignNearestAmbulance(callId);
      success(`Nearest Ambulance ${result.ambulanceNumber} (Driver: ${result.driverName}) assigned to Call #${callId}! Travel distance: ${result.distanceKm} km.`);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to assign nearest ambulance');
    } finally {
      setAssigningId(null);
    }
  };

  const handleStartEmergency = async (callId) => {
    try {
      await emergencyCallService.startEmergency(callId);
      success(`Emergency #${callId} marked as IN_PROGRESS (Paramedics arrived on scene)`);
      loadData();
    } catch (err) {
      error(err.message);
    }
  };

  const handleCompleteEmergency = async (callId) => {
    try {
      const res = await emergencyCallService.completeEmergency(callId);
      success(`Emergency #${callId} completed! Response time: ${res.responseTimeMinutes} mins. Assigned ambulance released to AVAILABLE.`);
      loadData();
    } catch (err) {
      error(err.message);
    }
  };

  // Format zone chart data
  const zoneChartData = summary && summary.callsByZone 
    ? Object.entries(summary.callsByZone).map(([zone, count]) => ({
        zone,
        calls: count,
        ambulances: summary.ambulancesByZone ? (summary.ambulancesByZone[zone] || 0) : 0
      }))
    : [];

  const ambulancePieData = summary ? [
    { name: 'Available', value: summary.availableAmbulances, color: '#10b981' },
    { name: 'Busy', value: summary.busyAmbulances, color: '#f43f5e' }
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & Quick Refresh Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 tracking-wide uppercase">
              Live Operations
            </span>
            <span className="text-xs text-slate-400">Automated Nearest Ambulance Dispatching</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            Dispatch Command Center
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700/80 hover:text-white rounded-xl border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
            Refresh Feed
          </button>
          <Link
            to="/emergency-calls/new"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-900/40 transition-all"
          >
            <Zap className="w-4 h-4" />
            New Emergency Call
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Ambulances"
          value={summary?.totalAmbulances}
          icon={Truck}
          color="blue"
          subtitle={`${summary?.availableAmbulances ?? 0} Available`}
        />
        <StatCard
          title="Available Fleet"
          value={summary?.availableAmbulances}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Ready to dispatch"
        />
        <StatCard
          title="Busy Ambulances"
          value={summary?.busyAmbulances}
          icon={ShieldAlert}
          color="rose"
          subtitle="On active emergencies"
        />
        <StatCard
          title="Avg Response Time"
          value={`${summary?.averageResponseTimeMinutes ?? 0} min`}
          icon={Clock}
          color="amber"
          subtitle="From dispatch to completion"
        />
      </div>

      {/* Secondary KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center">
          <p className="text-xs text-slate-400 font-medium">Total Emergencies</p>
          <p className="text-xl font-bold text-white mt-1">{summary?.totalEmergencyCalls ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center">
          <p className="text-xs text-amber-400 font-medium">Pending Dispatch</p>
          <p className="text-xl font-bold text-amber-400 mt-1">{summary?.pendingCalls ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center">
          <p className="text-xs text-indigo-400 font-medium">In Progress</p>
          <p className="text-xl font-bold text-indigo-400 mt-1">{summary?.inProgressCalls ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center">
          <p className="text-xs text-emerald-400 font-medium">Completed</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{summary?.completedCalls ?? 0}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone Statistics Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart className="w-4 h-4 text-rose-500" />
                Emergency Calls & Ambulances by Zone
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time demand vs vehicle distribution per district</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="zone" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                />
                <Bar dataKey="calls" name="Emergency Calls" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ambulances" name="Ambulances Stationed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-800/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-rose-500" />
              <span className="text-slate-300">Total Emergency Calls</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-slate-300">Ambulances Stationed</span>
            </div>
          </div>
        </div>

        {/* Fleet Availability Donut */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Ambulance Fleet Status
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Current operational capacity</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ambulancePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ambulancePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white">{summary?.totalAmbulances ?? 0}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Units</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/60">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-xs text-emerald-400 font-semibold">Available</p>
              <p className="text-lg font-bold text-white">{summary?.availableAmbulances ?? 0}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
              <p className="text-xs text-rose-400 font-semibold">Busy</p>
              <p className="text-lg font-bold text-white">{summary?.busyAmbulances ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Recent Emergency Calls Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
              Live Emergency Dispatch Queue
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Click "Assign Ambulance" to execute nearest allocation algorithm</p>
          </div>

          <Link
            to="/emergency-calls"
            className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
          >
            <span>View All Calls</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Call ID</th>
                <th className="py-3.5 px-4">Caller & Description</th>
                <th className="py-3.5 px-4">Zone</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Assigned Unit</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Quick Dispatch Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {recentCalls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No emergency calls recorded yet. Click "New Emergency Call" to create one.
                  </td>
                </tr>
              ) : (
                recentCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-rose-400">
                      #{call.id}
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-semibold text-white">{call.callerName}</div>
                      <div className="text-xs text-slate-400 truncate">{call.emergencyDescription}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{call.callerPhone}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        {call.callerZoneCode}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400">
                      {formatTimeOnly(call.callTime)}
                    </td>
                    <td className="py-4 px-4">
                      {call.assignedAmbulanceNumber ? (
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-blue-400" />
                            {call.assignedAmbulanceNumber}
                          </div>
                          <div className="text-[11px] text-slate-400">Dr: {call.assignedAmbulanceDriver}</div>
                        </div>
                      ) : (
                        <span className="text-xs italic text-slate-500">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={call.status} type="emergency" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      {call.status === 'PENDING' && (
                        <button
                          onClick={() => handleAssignNearest(call.id)}
                          disabled={assigningId === call.id}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md shadow-rose-900/30 transition-all flex items-center gap-1.5 ml-auto"
                        >
                          {assigningId === call.id ? (
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Zap className="w-3.5 h-3.5" />
                          )}
                          Assign Nearest
                        </button>
                      )}

                      {call.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleStartEmergency(call.id)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-900/30 transition-all ml-auto"
                        >
                          Mark On Scene
                        </button>
                      )}

                      {call.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleCompleteEmergency(call.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-900/30 transition-all ml-auto"
                        >
                          Complete & Free
                        </button>
                      )}

                      {call.status === 'COMPLETED' && (
                        <span className="text-xs text-emerald-400 font-mono font-bold">
                          {call.responseTimeMinutes} min RT
                        </span>
                      )}

                      {call.status === 'CANCELLED' && (
                        <span className="text-xs text-slate-500">Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fleet Overview Grid */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-400" />
              Active Ambulances Grid
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Live status and stationed zones for all emergency response vehicles</p>
          </div>
          <Link
            to="/ambulances"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
          >
            <span>Manage Fleet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {ambulances.map((amb) => (
            <div
              key={amb.id}
              className={`p-4 rounded-xl border transition-all ${
                amb.status === 'AVAILABLE'
                  ? 'bg-emerald-950/20 border-emerald-800/40 hover:border-emerald-500/50'
                  : 'bg-rose-950/20 border-rose-800/40 hover:border-rose-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-white text-sm">{amb.ambulanceNumber}</span>
                <StatusBadge status={amb.status} type="ambulance" />
              </div>
              <p className="text-xs text-slate-300 font-medium mt-2">{amb.driverName}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
                <span>Zone: <strong className="text-slate-200">{amb.currentZoneCode}</strong></span>
                <span>Home: {amb.homeZoneCode}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
