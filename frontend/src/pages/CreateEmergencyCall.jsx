import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PhoneCall, 
  MapPin, 
  User, 
  Phone, 
  FileText, 
  Zap, 
  ArrowLeft, 
  ShieldAlert, 
  Truck, 
  CheckCircle2 
} from 'lucide-react';
import { emergencyCallService } from '../services/emergencyCallService';
import { zoneService } from '../services/zoneService';
import { proximityService } from '../services/proximityService';
import { useToast } from '../hooks/useToast.jsx';

export function CreateEmergencyCall() {
  const navigate = useNavigate();
  const { success, error, warning } = useToast();

  const [zones, setZones] = useState([]);
  const [proximities, setProximities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    callerName: '',
    callerPhone: '',
    emergencyDescription: '',
    callerZoneId: '',
    autoAssign: true
  });

  useEffect(() => {
    async function loadMetadata() {
      try {
        setLoading(true);
        const [zonesRes, proxRes] = await Promise.all([
          zoneService.getAll(),
          proximityService.getAll()
        ]);
        setZones(zonesRes);
        setProximities(proxRes);
        if (zonesRes.length > 0) {
          setFormData(prev => ({ ...prev, callerZoneId: zonesRes[0].id }));
        }
      } catch (err) {
        error('Failed to load zone list');
      } finally {
        setLoading(false);
      }
    }
    loadMetadata();
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.callerName.trim() || !formData.callerPhone.trim() || !formData.emergencyDescription.trim() || !formData.callerZoneId) {
      warning('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const created = await emergencyCallService.create({
        callerName: formData.callerName.trim(),
        callerPhone: formData.callerPhone.trim(),
        emergencyDescription: formData.emergencyDescription.trim(),
        callerZoneId: Number(formData.callerZoneId),
        autoAssign: formData.autoAssign
      });

      if (formData.autoAssign && created.assignedAmbulanceNumber) {
        success(`Emergency Call #${created.id} registered & assigned to nearest ambulance ${created.assignedAmbulanceNumber}!`);
      } else {
        success(`Emergency Call #${created.id} registered in ${created.callerZoneCode}!`);
      }

      navigate('/emergency-calls');
    } catch (err) {
      error(err.message || 'Failed to create emergency call');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedZoneObj = zones.find(z => String(z.id) === String(formData.callerZoneId));

  // Find nearest neighbor zones from proximity
  const neighborProximities = proximities.filter(
    p => String(p.fromZoneId) === String(formData.callerZoneId) || String(p.toZoneId) === String(formData.callerZoneId)
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dispatch
        </button>
        <span className="text-xs text-rose-400 font-mono font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          EMERGENCY INTAKE PORTAL
        </span>
      </div>

      {/* Main Intake Card */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Log New Emergency Call
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Record incoming emergency details. The system will automatically compute nearest available ambulance allocation.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Caller Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Caller / Patient Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe / Caretaker"
                  value={formData.callerName}
                  onChange={(e) => setFormData({ ...formData, callerName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Contact Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98400 12345"
                  value={formData.callerPhone}
                  onChange={(e) => setFormData({ ...formData, callerPhone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Caller Zone Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Caller Location Zone *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
              <select
                required
                value={formData.callerZoneId}
                onChange={(e) => setFormData({ ...formData, callerZoneId: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500 transition-colors font-medium"
              >
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.zoneCode} — {zone.zoneName} ({zone.ambulanceCount} Ambulances stationed)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Emergency Nature Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Emergency Nature / Symptoms / Location Details *
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <textarea
                required
                rows={3}
                placeholder="Describe critical symptoms, exact street address, patient condition, trauma, medical history..."
                value={formData.emergencyDescription}
                onChange={(e) => setFormData({ ...formData, emergencyDescription: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          {/* Auto-Assign Switch */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Auto-Assign Nearest Ambulance</p>
                <p className="text-xs text-slate-400">
                  Immediately execute nearest zone allocation algorithm upon intake
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoAssign}
                onChange={(e) => setFormData({ ...formData, autoAssign: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {/* Zone Distance Proximity Preview Info */}
          {selectedZoneObj && (
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Zone Proximity Context for {selectedZoneObj.zoneCode}:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-400">
                {neighborProximities.map((np) => {
                  const otherCode = String(np.fromZoneId) === String(selectedZoneObj.id) ? np.toZoneCode : np.fromZoneCode;
                  return (
                    <div key={np.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-300">{otherCode}:</span>
                      <span className="font-mono text-amber-400">{np.distance} km ({np.estimatedTravelTime}m)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/emergency-calls')}
              className="px-5 py-2.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-900/40 transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Submit & Dispatch</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
