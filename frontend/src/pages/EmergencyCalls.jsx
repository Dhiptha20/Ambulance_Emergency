import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  PhoneCall, 
  Plus, 
  Search, 
  Zap, 
  CheckCircle2, 
  Clock, 
  Play, 
  XCircle, 
  Eye, 
  Trash2, 
  RefreshCw, 
  MapPin, 
  Truck, 
  User, 
  AlertTriangle 
} from 'lucide-react';
import { emergencyCallService } from '../services/emergencyCallService';
import { zoneService } from '../services/zoneService';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../hooks/useToast.jsx';
import { formatDateTime, formatTimeOnly } from '../utils/formatters';

export function EmergencyCalls() {
  const [calls, setCalls] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [zoneFilter, setZoneFilter] = useState('ALL');

  // Modals & Details
  const [selectedCall, setSelectedCall] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  // Confirmation state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
    variant: 'danger',
    confirmText: 'Confirm'
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [assigningId, setAssigningId] = useState(null);

  const { success, error, warning, info } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [callsRes, zonesRes] = await Promise.all([
        emergencyCallService.getAll(),
        zoneService.getAll()
      ]);
      setCalls(callsRes);
      setZones(zonesRes);
    } catch (err) {
      error(err.message || 'Failed to load emergency calls');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Core nearest ambulance assignment execution
  const handleAssignAmbulance = async (callId) => {
    try {
      setAssigningId(callId);
      const result = await emergencyCallService.assignNearestAmbulance(callId);
      setAssignmentResult(result);
      setIsResultModalOpen(true);
      success(`${result.ambulanceNumber} assigned successfully.`);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to assign ambulance');
    } finally {
      setAssigningId(null);
    }
  };

  const handleStartEmergency = async (callId) => {
    try {
      setActionLoading(true);
      await emergencyCallService.startEmergency(callId);
      success(`Emergency #${callId} marked as IN_PROGRESS (Ambulance on scene)`);
      loadData();
    } catch (err) {
      error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteEmergency = async (callId) => {
    try {
      setActionLoading(true);
      const res = await emergencyCallService.completeEmergency(callId);
      success(`Emergency #${callId} COMPLETED. Calculated Response Time: ${res.responseTimeMinutes} mins. Unit released to AVAILABLE.`);
      loadData();
    } catch (err) {
      error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelEmergency = (call) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Emergency Call',
      message: `Are you sure you want to cancel Emergency Call #${call.id} for caller ${call.callerName}? Any assigned ambulance will be released back to AVAILABLE.`,
      confirmText: 'Cancel Emergency',
      variant: 'danger',
      action: async () => {
        try {
          setActionLoading(true);
          await emergencyCallService.cancelEmergency(call.id);
          warning(`Emergency #${call.id} was cancelled.`);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          loadData();
        } catch (err) {
          error(err.message);
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleDeleteCall = (call) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Emergency Record',
      message: `Are you sure you want to delete the record for Emergency Call #${call.id}?`,
      confirmText: 'Delete Call',
      variant: 'danger',
      action: async () => {
        try {
          setActionLoading(true);
          await emergencyCallService.delete(call.id);
          success(`Call #${call.id} record removed.`);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          loadData();
        } catch (err) {
          error(err.message);
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  // Filtered Calls
  const filteredCalls = calls.filter((call) => {
    const matchesSearch = 
      call.callerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.callerPhone.includes(searchTerm) ||
      call.callerZoneCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.emergencyDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (call.assignedAmbulanceNumber && call.assignedAmbulanceNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || call.status === statusFilter;
    const matchesZone = zoneFilter === 'ALL' || call.callerZoneCode === zoneFilter;

    return matchesSearch && matchesStatus && matchesZone;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wide">
              Emergency Dispatch
            </span>
            <span className="text-xs text-slate-400">Total {calls.length} Logged Incidents</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            Emergency Dispatch Management
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/emergency-calls/new"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-900/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Emergency Call
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by caller, phone, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING Only</option>
            <option value="ASSIGNED">ASSIGNED Only</option>
            <option value="IN_PROGRESS">IN_PROGRESS Only</option>
            <option value="COMPLETED">COMPLETED Only</option>
            <option value="CANCELLED">CANCELLED Only</option>
          </select>

          {/* Caller Zone Filter */}
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500 font-medium"
          >
            <option value="ALL">All Caller Zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.zoneCode}>{z.zoneCode} - {z.zoneName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Emergency Calls Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Call ID</th>
                <th className="py-3.5 px-4">Caller & Description</th>
                <th className="py-3.5 px-4">Caller Zone</th>
                <th className="py-3.5 px-4">Assigned Unit</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Call Time</th>
                <th className="py-3.5 px-4">Response Time</th>
                <th className="py-3.5 px-4 text-right">Dispatch Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No emergency calls found.
                  </td>
                </tr>
              ) : (
                filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-rose-400">
                      #{call.id}
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-semibold text-white">{call.callerName}</div>
                      <div className="text-xs text-slate-400 line-clamp-1">{call.emergencyDescription}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{call.callerPhone}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        {call.callerZoneCode}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {call.assignedAmbulanceNumber ? (
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-blue-400" />
                            {call.assignedAmbulanceNumber}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            Dr: {call.assignedAmbulanceDriver}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs italic text-slate-500">Pending Assignment</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={call.status} type="emergency" />
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400">
                      <div>{formatTimeOnly(call.callTime)}</div>
                      <div className="text-[10px] text-slate-500">{formatDateTime(call.callTime).split(',')[0]}</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs">
                      {call.responseTimeMinutes ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                          {call.responseTimeMinutes} mins
                        </span>
                      ) : call.status === 'ASSIGNED' || call.status === 'IN_PROGRESS' ? (
                        <span className="text-amber-400 text-xs animate-pulse">Calculating...</span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* PENDING: Assign Nearest Ambulance */}
                        {call.status === 'PENDING' && (
                          <button
                            onClick={() => handleAssignAmbulance(call.id)}
                            disabled={assigningId === call.id}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md shadow-rose-900/30 transition-all flex items-center gap-1.5"
                          >
                            {assigningId === call.id ? (
                              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <Zap className="w-3.5 h-3.5" />
                            )}
                            Assign
                          </button>
                        )}

                        {/* ASSIGNED: Mark Start / On Scene */}
                        {call.status === 'ASSIGNED' && (
                          <button
                            onClick={() => handleStartEmergency(call.id)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-900/30 transition-all flex items-center gap-1"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Start
                          </button>
                        )}

                        {/* IN_PROGRESS: Complete Call */}
                        {call.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleCompleteEmergency(call.id)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-900/30 transition-all flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Complete
                          </button>
                        )}

                        {/* CANCEL: Only if not already completed or cancelled */}
                        {call.status !== 'COMPLETED' && call.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleCancelEmergency(call)}
                            title="Cancel Emergency"
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* View Details */}
                        <button
                          onClick={() => { setSelectedCall(call); setIsViewModalOpen(true); }}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Delete Record */}
                        <button
                          onClick={() => handleDeleteCall(call)}
                          title="Delete Record"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Success Result Modal */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title="Nearest Ambulance Allocation Result"
        subtitle="Automatic Nearest-Zone Proximity Resolution"
        maxWidth="max-w-lg"
      >
        {assignmentResult && (
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white text-base">{assignmentResult.ambulanceNumber} assigned successfully.</p>
                <p className="text-xs text-emerald-400/90 mt-1">
                  Selected by nearest distance algorithm with estimated arrival time calculated.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Assigned Unit:</span>
                <span className="font-bold text-white font-mono">{assignmentResult.ambulanceNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Paramedic Driver:</span>
                <span className="font-semibold text-white">{assignmentResult.driverName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Dispatched From:</span>
                <span className="font-semibold text-blue-400">{assignmentResult.ambulanceZoneCode} ({assignmentResult.ambulanceZoneName})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Destination (Caller Zone):</span>
                <span className="font-bold text-rose-400">{assignmentResult.callerZoneCode} ({assignmentResult.callerZoneName})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Calculated Proximity Distance:</span>
                <span className="font-mono font-bold text-amber-400">{assignmentResult.distanceKm} km</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Estimated Travel Time:</span>
                <span className="font-mono font-bold text-emerald-400">{assignmentResult.estimatedTravelTimeMinutes} minutes</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsResultModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-900/40"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Call Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Emergency Call #${selectedCall?.id}`}
        subtitle="Complete Dispatch Record & Audit Timestamps"
        maxWidth="max-w-lg"
      >
        {selectedCall && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs text-slate-400 block">Incident Status</span>
                <StatusBadge status={selectedCall.status} type="emergency" />
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Caller Zone</span>
                <span className="font-bold text-rose-400">{selectedCall.callerZoneCode}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Caller Information</h4>
              <div className="text-xs space-y-1">
                <p><strong className="text-white">Caller Name:</strong> {selectedCall.callerName}</p>
                <p><strong className="text-white">Phone:</strong> {selectedCall.callerPhone}</p>
                <p className="text-slate-300 mt-1"><strong className="text-white">Emergency Note:</strong> {selectedCall.emergencyDescription}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dispatch & Vehicle Assignment</h4>
              {selectedCall.assignedAmbulanceNumber ? (
                <div className="text-xs space-y-1">
                  <p><strong className="text-white">Unit Number:</strong> {selectedCall.assignedAmbulanceNumber}</p>
                  <p><strong className="text-white">Driver Name:</strong> {selectedCall.assignedAmbulanceDriver}</p>
                  <p><strong className="text-white">Station Zone:</strong> {selectedCall.assignedAmbulanceCurrentZoneCode}</p>
                </div>
              ) : (
                <p className="text-xs italic text-slate-500">No ambulance assigned to this call yet.</p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Timeline</h4>
              <div className="text-xs space-y-1 font-mono text-slate-300">
                <p>Call Logged: {formatDateTime(selectedCall.callTime)}</p>
                <p>Dispatched: {formatDateTime(selectedCall.dispatchTime)}</p>
                <p>Arrived On Scene: {formatDateTime(selectedCall.arrivalTime)}</p>
                <p>Completed: {formatDateTime(selectedCall.completionTime)}</p>
                {selectedCall.responseTimeMinutes && (
                  <p className="text-emerald-400 font-bold">Total Response Time: {selectedCall.responseTimeMinutes} minutes</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        confirmVariant={confirmDialog.variant}
        isLoading={actionLoading}
      />
    </div>
  );
}
