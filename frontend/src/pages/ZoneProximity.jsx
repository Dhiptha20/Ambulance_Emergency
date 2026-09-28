import React, { useState, useEffect, useCallback } from 'react';
import { 
  Route, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  RefreshCw, 
  ArrowRight, 
  Calculator, 
  Clock, 
  Milestone 
} from 'lucide-react';
import { proximityService } from '../services/proximityService';
import { zoneService } from '../services/zoneService';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../hooks/useToast.jsx';

export function ZoneProximity() {
  const [proximities, setProximities] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Proximity simulator state
  const [simFromZone, setSimFromZone] = useState('');
  const [simToZone, setSimToZone] = useState('');
  const [simResult, setSimResult] = useState(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProx, setSelectedProx] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [proxToDelete, setProxToDelete] = useState(null);

  // Forms
  const [formData, setFormData] = useState({
    fromZoneId: '',
    toZoneId: '',
    distance: '',
    estimatedTravelTime: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const { success, error, warning } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [proxRes, zonesRes] = await Promise.all([
        proximityService.getAll(),
        zoneService.getAll()
      ]);
      setProximities(proxRes);
      setZones(zonesRes);
      if (zonesRes.length >= 2) {
        setSimFromZone(String(zonesRes[0].id));
        setSimToZone(String(zonesRes[1].id));
      }
    } catch (err) {
      error(err.message || 'Failed to load proximity data');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle live calculation in the simulator
  useEffect(() => {
    if (!simFromZone || !simToZone) {
      setSimResult(null);
      return;
    }

    if (simFromZone === simToZone) {
      setSimResult({
        distance: 0.0,
        time: 2,
        isSameZone: true,
        message: 'Same Zone Dispatch (Immediate Local Response)'
      });
      return;
    }

    const match = proximities.find(
      (p) =>
        (String(p.fromZoneId) === String(simFromZone) && String(p.toZoneId) === String(simToZone)) ||
        (String(p.fromZoneId) === String(simToZone) && String(p.toZoneId) === String(simFromZone))
    );

    if (match) {
      setSimResult({
        distance: match.distance,
        time: match.estimatedTravelTime,
        isSameZone: false,
        message: `Direct Predefined Proximity Mapping (#${match.id})`
      });
    } else {
      setSimResult({
        distance: 999.0,
        time: 999,
        isSameZone: false,
        isUnmapped: true,
        message: 'No direct mapping defined between these zones.'
      });
    }
  }, [simFromZone, simToZone, proximities]);

  const handleOpenAdd = () => {
    if (zones.length < 2) {
      warning('At least 2 zones are required to create a proximity mapping.');
      return;
    }
    setFormData({
      fromZoneId: zones[0].id,
      toZoneId: zones[1].id,
      distance: '5.0',
      estimatedTravelTime: '10'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (prox) => {
    setSelectedProx(prox);
    setFormData({
      fromZoneId: prox.fromZoneId,
      toZoneId: prox.toZoneId,
      distance: String(prox.distance),
      estimatedTravelTime: String(prox.estimatedTravelTime)
    });
    setIsEditModalOpen(true);
  };

  const handleCreateProximity = async (e) => {
    e.preventDefault();
    if (formData.fromZoneId === formData.toZoneId) {
      warning('From Zone and To Zone cannot be identical');
      return;
    }

    try {
      setSubmitting(true);
      await proximityService.create({
        fromZoneId: Number(formData.fromZoneId),
        toZoneId: Number(formData.toZoneId),
        distance: parseFloat(formData.distance),
        estimatedTravelTime: parseInt(formData.estimatedTravelTime, 10)
      });
      success('Zone proximity mapping added!');
      setIsAddModalOpen(false);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to create proximity mapping');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProximity = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await proximityService.update(selectedProx.id, {
        fromZoneId: Number(formData.fromZoneId),
        toZoneId: Number(formData.toZoneId),
        distance: parseFloat(formData.distance),
        estimatedTravelTime: parseInt(formData.estimatedTravelTime, 10)
      });
      success('Zone proximity updated!');
      setIsEditModalOpen(false);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to update proximity mapping');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setSubmitting(true);
      await proximityService.delete(proxToDelete.id);
      success('Proximity mapping removed.');
      setDeleteDialogOpen(false);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to delete proximity');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProximities = proximities.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.fromZoneCode.toLowerCase().includes(term) ||
      p.fromZoneName.toLowerCase().includes(term) ||
      p.toZoneCode.toLowerCase().includes(term) ||
      p.toZoneName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wide">
              Allocation Matrix
            </span>
            <span className="text-xs text-slate-400">Total {proximities.length} Defined Proximity Pairs</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            Zone Distance & Proximity Network
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
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-900/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Proximity Mapping
          </button>
        </div>
      </div>

      {/* Interactive Distance Simulator Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-500/30 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Zone Proximity Calculator & Algorithm Inspector</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Ambulance Current Zone (Origin):</label>
            <select
              value={simFromZone}
              onChange={(e) => setSimFromZone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.zoneCode} — {z.zoneName}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-center items-center text-slate-500">
            <ArrowRight className="w-6 h-6 text-indigo-400 hidden md:block" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Emergency Caller Zone (Destination):</label>
            <select
              value={simToZone}
              onChange={(e) => setSimToZone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.zoneCode} — {z.zoneName}</option>
              ))}
            </select>
          </div>
        </div>

        {simResult && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Milestone className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-300">Resolved Proximity: </span>
                <span className="text-slate-400">{simResult.message}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Distance</span>
                <span className="font-mono font-bold text-base text-amber-400">{simResult.distance} km</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Travel</span>
                <span className="font-mono font-bold text-base text-emerald-400">{simResult.time} mins</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Proximity Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by zone code or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">From Zone</th>
                <th className="py-3.5 px-4">To Zone</th>
                <th className="py-3.5 px-4">Distance (km)</th>
                <th className="py-3.5 px-4">Estimated Travel Time</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredProximities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    No zone proximity records found.
                  </td>
                </tr>
              ) : (
                filteredProximities.map((prox) => (
                  <tr key={prox.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-semibold text-white">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700 mr-2">
                        {prox.fromZoneCode}
                      </span>
                      <span className="text-xs text-slate-400">{prox.fromZoneName}</span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-white">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700 mr-2">
                        {prox.toZoneCode}
                      </span>
                      <span className="text-xs text-slate-400">{prox.toZoneName}</span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-amber-400">
                      {prox.distance} km
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      {prox.estimatedTravelTime} mins
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(prox)}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Proximity"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setProxToDelete(prox); setDeleteDialogOpen(true); }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete Proximity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Proximity Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Zone Proximity Mapping"
        subtitle="Establish distance and travel time between two zones"
      >
        <form onSubmit={handleCreateProximity} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                From Zone *
              </label>
              <select
                required
                value={formData.fromZoneId}
                onChange={(e) => setFormData({ ...formData, fromZoneId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.zoneCode} - {z.zoneName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                To Zone *
              </label>
              <select
                required
                value={formData.toZoneId}
                onChange={(e) => setFormData({ ...formData, toZoneId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.zoneCode} - {z.zoneName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Distance (in km) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Estimated Travel (minutes) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.estimatedTravelTime}
                onChange={(e) => setFormData({ ...formData, estimatedTravelTime: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-900/30 transition-all flex items-center gap-2"
            >
              {submitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Save Mapping
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Proximity Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Zone Proximity"
        subtitle={`Updating mapping between ${selectedProx?.fromZoneCode} and ${selectedProx?.toZoneCode}`}
      >
        <form onSubmit={handleUpdateProximity} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                From Zone
              </label>
              <select
                value={formData.fromZoneId}
                onChange={(e) => setFormData({ ...formData, fromZoneId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.zoneCode} - {z.zoneName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                To Zone
              </label>
              <select
                value={formData.toZoneId}
                onChange={(e) => setFormData({ ...formData, toZoneId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.zoneCode} - {z.zoneName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Distance (in km) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Estimated Travel (minutes) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.estimatedTravelTime}
                onChange={(e) => setFormData({ ...formData, estimatedTravelTime: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-900/30 transition-all flex items-center gap-2"
            >
              {submitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Update Mapping
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Proximity Mapping"
        message={`Are you sure you want to delete the proximity mapping between ${proxToDelete?.fromZoneCode} and ${proxToDelete?.toZoneCode}?`}
        confirmText="Delete Mapping"
        confirmVariant="danger"
        isLoading={submitting}
      />
    </div>
  );
}
