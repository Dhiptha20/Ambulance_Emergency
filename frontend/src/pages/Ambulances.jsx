import React, { useState, useEffect, useCallback } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  MapPin, 
  RefreshCw, 
  Eye, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { ambulanceService } from '../services/ambulanceService';
import { zoneService } from '../services/zoneService';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../hooks/useToast.jsx';
import { formatDateOnly } from '../utils/formatters';

export function Ambulances() {
  const [ambulances, setAmbulances] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [zoneFilter, setZoneFilter] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isChangeZoneModalOpen, setIsChangeZoneModalOpen] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ambulanceToDelete, setAmbulanceToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    ambulanceNumber: '',
    driverName: '',
    homeZoneId: '',
    currentZoneId: '',
    status: 'AVAILABLE'
  });
  const [selectedNewZoneId, setSelectedNewZoneId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { success, error, warning } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [ambsRes, zonesRes] = await Promise.all([
        ambulanceService.getAll(),
        zoneService.getAll()
      ]);
      setAmbulances(ambsRes);
      setZones(zonesRes);
      if (zonesRes.length > 0 && !formData.homeZoneId) {
        setFormData(prev => ({ ...prev, homeZoneId: zonesRes[0].id, currentZoneId: zonesRes[0].id }));
      }
    } catch (err) {
      error(err.message || 'Failed to load ambulances');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setFormData({
      ambulanceNumber: `AMB-00${ambulances.length + 1}`,
      driverName: '',
      homeZoneId: zones[0]?.id || '',
      currentZoneId: zones[0]?.id || '',
      status: 'AVAILABLE'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (amb) => {
    setSelectedAmbulance(amb);
    setFormData({
      ambulanceNumber: amb.ambulanceNumber,
      driverName: amb.driverName,
      homeZoneId: amb.homeZoneId,
      currentZoneId: amb.currentZoneId,
      status: amb.status
    });
    setIsEditModalOpen(true);
  };

  const handleOpenChangeZone = (amb) => {
    setSelectedAmbulance(amb);
    setSelectedNewZoneId(amb.currentZoneId);
    setIsChangeZoneModalOpen(true);
  };

  const handleCreateAmbulance = async (e) => {
    e.preventDefault();
    if (!formData.ambulanceNumber || !formData.driverName || !formData.homeZoneId) {
      warning('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await ambulanceService.create({
        ...formData,
        homeZoneId: Number(formData.homeZoneId),
        currentZoneId: formData.currentZoneId ? Number(formData.currentZoneId) : Number(formData.homeZoneId)
      });
      success(`Ambulance ${formData.ambulanceNumber} registered successfully!`);
      setIsAddModalOpen(false);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to register ambulance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAmbulance = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await ambulanceService.update(selectedAmbulance.id, {
        ...formData,
        homeZoneId: Number(formData.homeZoneId),
        currentZoneId: Number(formData.currentZoneId)
      });
      success(`Ambulance ${formData.ambulanceNumber} updated successfully!`);
      setIsEditModalOpen(false);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to update ambulance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (amb) => {
    const newStatus = amb.status === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE';
    try {
      await ambulanceService.updateStatus(amb.id, newStatus);
      success(`Ambulance ${amb.ambulanceNumber} status changed to ${newStatus}`);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to update status');
    }
  };

  const handleChangeZoneSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await ambulanceService.updateCurrentZone(selectedAmbulance.id, Number(selectedNewZoneId));
      success(`Ambulance ${selectedAmbulance.ambulanceNumber} relocated to new zone.`);
      setIsChangeZoneModalOpen(false);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to relocate ambulance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setSubmitting(true);
      await ambulanceService.delete(ambulanceToDelete.id);
      success(`Ambulance ${ambulanceToDelete.ambulanceNumber} removed.`);
      setDeleteDialogOpen(false);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to delete ambulance');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered ambulances
  const filteredAmbulances = ambulances.filter((amb) => {
    const matchesSearch = 
      amb.ambulanceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      amb.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      amb.currentZoneCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || amb.status === statusFilter;
    const matchesZone = zoneFilter === 'ALL' || amb.currentZoneCode === zoneFilter;

    return matchesSearch && matchesStatus && matchesZone;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wide">
              Fleet Management
            </span>
            <span className="text-xs text-slate-400">Total {ambulances.length} Active Ambulances</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            Ambulance Fleet Directory
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
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-900/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            Register Ambulance
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by number, driver, zone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available Only</option>
            <option value="BUSY">Busy Only</option>
          </select>

          {/* Zone Filter */}
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="ALL">All Current Zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.zoneCode}>{z.zoneCode} - {z.zoneName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ambulance Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Ambulance No</th>
                <th className="py-3.5 px-4">Driver Name</th>
                <th className="py-3.5 px-4">Home Zone</th>
                <th className="py-3.5 px-4">Current Station</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Registered</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredAmbulances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No ambulances found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredAmbulances.map((amb) => (
                  <tr key={amb.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-white flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-400" />
                      {amb.ambulanceNumber}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-200">
                      {amb.driverName}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs text-slate-400">
                        {amb.homeZoneCode} ({amb.homeZoneName})
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-bold text-slate-100 border border-slate-700">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        {amb.currentZoneCode}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={amb.status} type="ambulance" />
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400">
                      {formatDateOnly(amb.registrationDate)}
                    </td>
                    <td className="py-4 px-4 text-right space-x-1">
                      {/* Change Status Toggle */}
                      <button
                        onClick={() => handleToggleStatus(amb)}
                        title={`Switch to ${amb.status === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE'}`}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        {amb.status === 'AVAILABLE' ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-rose-400" />}
                      </button>

                      {/* Relocate Zone */}
                      <button
                        onClick={() => handleOpenChangeZone(amb)}
                        title="Relocate Current Zone"
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <MapPin className="w-4 h-4" />
                      </button>

                      {/* View Details */}
                      <button
                        onClick={() => { setSelectedAmbulance(amb); setIsViewModalOpen(true); }}
                        title="View Details"
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEdit(amb)}
                        title="Edit Ambulance"
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => { setAmbulanceToDelete(amb); setDeleteDialogOpen(true); }}
                        title="Delete Ambulance"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
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

      {/* Add Ambulance Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Ambulance"
        subtitle="Add a new emergency unit to the dispatch network"
      >
        <form onSubmit={handleCreateAmbulance} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Ambulance Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AMB-009"
              value={formData.ambulanceNumber}
              onChange={(e) => setFormData({ ...formData, ambulanceNumber: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Driver Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rajesh Kannan"
              value={formData.driverName}
              onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Home Zone *
              </label>
              <select
                required
                value={formData.homeZoneId}
                onChange={(e) => setFormData({ ...formData, homeZoneId: e.target.value, currentZoneId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.zoneCode} - {z.zoneName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="BUSY">BUSY</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2"
            >
              {submitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Save Ambulance
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Ambulance Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit ${selectedAmbulance?.ambulanceNumber}`}
        subtitle="Update ambulance driver or assigned home zone"
      >
        <form onSubmit={handleUpdateAmbulance} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Ambulance Number *
            </label>
            <input
              type="text"
              required
              value={formData.ambulanceNumber}
              onChange={(e) => setFormData({ ...formData, ambulanceNumber: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Driver Name *
            </label>
            <input
              type="text"
              required
              value={formData.driverName}
              onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Home Zone
              </label>
              <select
                value={formData.homeZoneId}
                onChange={(e) => setFormData({ ...formData, homeZoneId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.zoneCode} - {z.zoneName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="BUSY">BUSY</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2"
            >
              {submitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Update Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Relocate Zone Modal */}
      <Modal
        isOpen={isChangeZoneModalOpen}
        onClose={() => setIsChangeZoneModalOpen(false)}
        title="Relocate Ambulance Station"
        subtitle={`Select new active zone for ${selectedAmbulance?.ambulanceNumber}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleChangeZoneSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select New Station Zone
            </label>
            <select
              value={selectedNewZoneId}
              onChange={(e) => setSelectedNewZoneId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.zoneCode} - {z.zoneName}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsChangeZoneModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg shadow-amber-900/30 transition-all"
            >
              Relocate Station
            </button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Ambulance Details"
        subtitle={`Registration & Station Record: ${selectedAmbulance?.ambulanceNumber}`}
        maxWidth="max-w-md"
      >
        {selectedAmbulance && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Status</span>
              <StatusBadge status={selectedAmbulance.status} type="ambulance" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Ambulance ID:</span>
                <span className="font-mono text-white">#{selectedAmbulance.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Driver Assigned:</span>
                <span className="font-semibold text-white">{selectedAmbulance.driverName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Current Station:</span>
                <span className="font-bold text-rose-400">{selectedAmbulance.currentZoneCode} ({selectedAmbulance.currentZoneName})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Home Base Zone:</span>
                <span className="text-white">{selectedAmbulance.homeZoneCode} ({selectedAmbulance.homeZoneName})</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Registration Date:</span>
                <span className="text-white">{formatDateOnly(selectedAmbulance.registrationDate)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Ambulance"
        message={`Are you sure you want to remove ambulance ${ambulanceToDelete?.ambulanceNumber}? This action cannot be undone.`}
        confirmText="Delete Ambulance"
        confirmVariant="danger"
        isLoading={submitting}
      />
    </div>
  );
}
