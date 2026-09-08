import { useState, useEffect } from 'react';
import type { NGO } from '../../types/firestore';
import { X, Save, AlertCircle } from 'lucide-react';

interface Props {
  initialData?: NGO;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<NGO>) => Promise<void>;
}

export default function NGOForm({ initialData, isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Partial<NGO>>({
    name: '',
    registrationNumber: '',
    state: '',
    district: '',
    address: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    status: 'ACTIVE',
    isDemo: false,
    latitude: 0,
    longitude: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        registrationNumber: '',
        state: '',
        district: '',
        address: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        status: 'ACTIVE',
        isDemo: false,
        latitude: 0,
        longitude: 0
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save NGO.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">
            {initialData ? 'Edit NGO' : 'Add New NGO'}
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2 rounded-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form id="ngo-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">NGO Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Registration Number</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status || 'ACTIVE'}
                  onChange={e => setFormData({...formData, status: e.target.value as any})}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Latitude</label>
                <input 
                  type="number" 
                  step="any"
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  value={formData.latitude || ''}
                  onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Longitude</label>
                <input 
                  type="number" 
                  step="any"
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  value={formData.longitude || ''}
                  onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Complete Address</label>
                <textarea 
                  required
                  rows={2}
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <div className="h-px bg-slate-200 my-2"></div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">Contact Information</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Name*</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  value={formData.contactName || ''}
                  onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                <input 
                  type="tel" 
                  required
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-slate-300 rounded-sm text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            form="ngo-form"
            type="submit" 
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-sm text-sm font-medium hover:bg-primary-light transition-colors flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {initialData ? 'Update NGO' : 'Save NGO'}
          </button>
        </div>
      </div>
    </div>
  );
}
