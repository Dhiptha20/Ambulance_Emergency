import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Truck, 
  RefreshCw, 
  Building2 
} from 'lucide-react';
import { zoneService } from '../services/zoneService';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../hooks/useToast.jsx';

export function Zones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState(null);

  // Forms
  const [formData, setFormData] = useState({ zoneCode: '', zoneName: '' });
  const [submitting, setSubmitting] = useState(false);

  const { success, error, warning } = useToast();

  const loadZones = useCallback(async () => {
    try {
      setLoading(true);
      const data = await zoneService.getAll();
      setZones(data);
    } catch (err) {
      error(err.message || 'Failed to load zones');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  const handleOpenAdd = () => {
    setFormData({ zoneCode: '', zoneName: '' });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (zone) => {
    setSelectedZone(zone);
    setFormData({ zoneCode: zone.zoneCode, zoneName: zone.zoneName });
    setIsEditModalOpen(true);
  };

  const handleCreateZone = async (e) => {
    e.preventDefault();
    if (!formData.zoneCode.trim() || !formData.zoneName.trim()) {
      warning('Please enter both zone code and zone name');
      return;
    }

    try {
      setSubmitting(true);
      await zoneService.create(formData);
      success(`Zone ${formData.zoneCode} created successfully!`);
      setIsAddModalOpen(false);
      loadZones();
    } catch (err) {
      error(err.message || 'Failed to create zone');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateZone = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await zoneService.update(selectedZone.id, formData);
      success(`Zone ${formData.zoneCode} updated successfully!`);
      setIsEditModalOpen(false);
      loadZones();
    } catch (err) {
      error(err.message || 'Failed to update zone');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setSubmitting(true);
      await zoneService.delete(zoneToDelete.id);
      success(`Zone ${zoneToDelete.zoneCode} removed successfully.`);
      setDeleteDialogOpen(false);
      loadZones();
    } catch (err) {
      error(err.message || 'Failed to delete zone');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredZones = zones.filter(z => 
    z.zoneCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    z.zoneName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wide">
              District Partitioning
            </span>
            <span className="text-xs text-slate-400">Total {zones.length} Service Sectors</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            Service Zones Directory
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadZones}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg shadow-amber-900/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Zone
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search zones by code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredZones.map((zone) => (
          <div
            key={zone.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
                  {zone.zoneCode}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                  <Truck className="w-3.5 h-3.5 text-blue-400" />
                  {zone.ambulanceCount} Ambulances
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mt-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                {zone.zoneName}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                District Sector ID #{zone.id}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-800/60">
              <button
                onClick={() => handleOpenEdit(zone)}
                className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Edit Zone"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setZoneToDelete(zone); setDeleteDialogOpen(true); }}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Delete Zone"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Zone Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Service Zone"
        subtitle="Create a new zone partition for ambulance coverage"
      >
        <form onSubmit={handleCreateZone} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Zone Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ZONE-F"
              value={formData.zoneCode}
              onChange={(e) => setFormData({ ...formData, zoneCode: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Zone Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. South-East Suburbs"
              value={formData.zoneName}
              onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
            />
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
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg shadow-amber-900/30 transition-all flex items-center gap-2"
            >
              {submitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Save Zone
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Zone Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Zone ${selectedZone?.zoneCode}`}
        subtitle="Modify zone code or descriptive title"
      >
        <form onSubmit={handleUpdateZone} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Zone Code *
            </label>
            <input
              type="text"
              required
              value={formData.zoneCode}
              onChange={(e) => setFormData({ ...formData, zoneCode: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Zone Name *
            </label>
            <input
              type="text"
              required
              value={formData.zoneName}
              onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
            />
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
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg shadow-amber-900/30 transition-all flex items-center gap-2"
            >
              {submitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Update Zone
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Zone"
        message={`Are you sure you want to delete zone ${zoneToDelete?.zoneCode}? Note: A zone cannot be deleted if ambulances are currently stationed inside it.`}
        confirmText="Delete Zone"
        confirmVariant="danger"
        isLoading={submitting}
      />
    </div>
  );
}
