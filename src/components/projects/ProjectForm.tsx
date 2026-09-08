import { useState, useEffect } from 'react';
import { getDocs, query, orderBy } from 'firebase/firestore';
import { institutionsRef, ngosRef } from '../../services/firebase/firestore';
import type { Project, Institution, NGO } from '../../types/firestore';
import { X, Save, AlertCircle } from 'lucide-react';
import { demoOrganizations } from '../../services/mockData';

interface Props {
  initialData?: Project;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Project>) => Promise<void>;
}

export default function ProjectForm({ initialData, isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    organizationType: 'Institution',
    organizationId: '',
    schemeName: '',
    description: '',
    state: '',
    district: '',
    startDate: new Date(),
    budget: 0,
    status: 'PLANNED',
    progress: 0,
    projectType: '',
    isDemo: false
  });

  // State to hold both Institutions and NGOs for the dropdown
  const [organizations, setOrganizations] = useState<{id: string, name: string, type: 'Institution' | 'NGO'}[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Local state for dates because FirestoreDate needs conversion
  const [startDateStr, setStartDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [endDateStr, setEndDateStr] = useState('');

  useEffect(() => {
    const fetchOrgs = async () => {
      setLoadingOrgs(true);
      try {
        const [instSnap, ngoSnap] = await Promise.all([
          getDocs(institutionsRef),
          getDocs(ngosRef)
        ]);
        
        const insts = instSnap.docs.map(d => {
          const data = d.data() as any;
          return { id: d.id, name: data.name || data.organizationName || 'Unknown Institution', type: 'Institution' as const };
        });
        const ngos = ngoSnap.docs.map(d => {
          const data = d.data() as any;
          return { id: d.id, name: data.name || data.organizationName || 'Unknown NGO', type: 'NGO' as const };
        });
        
        const fetchedOrgs = [...insts, ...ngos];
        
        if (fetchedOrgs.length === 0) {
          // Fallback to mock data if database is completely empty
          const mockInsts = demoOrganizations
            .filter(o => o.organizationType !== 'NGO')
            .map(o => ({ id: o.id, name: o.organizationName, type: 'Institution' as const }));
          const mockNgos = demoOrganizations
            .filter(o => o.organizationType === 'NGO')
            .map(o => ({ id: o.id, name: o.organizationName, type: 'NGO' as const }));
          
          setOrganizations([...mockInsts, ...mockNgos].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
        } else {
          setOrganizations(fetchedOrgs.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
        }
      } catch (err) {
        console.error('Failed to load organizations', err);
        // Fallback on error
        const mockInsts = demoOrganizations
          .filter(o => o.organizationType !== 'NGO')
          .map(o => ({ id: o.id, name: o.organizationName, type: 'Institution' as const }));
        const mockNgos = demoOrganizations
          .filter(o => o.organizationType === 'NGO')
          .map(o => ({ id: o.id, name: o.organizationName, type: 'NGO' as const }));
        
        setOrganizations([...mockInsts, ...mockNgos].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
      } finally {
        setLoadingOrgs(false);
      }
    };
    
    if (isOpen) {
      fetchOrgs();
      
      if (initialData) {
        setFormData(initialData);
        // Convert Firestore dates to strings for input type="date"
        if (initialData.startDate) {
          const sd = (initialData.startDate as any).seconds 
            ? new Date((initialData.startDate as any).seconds * 1000) 
            : initialData.startDate as Date;
          setStartDateStr(sd.toISOString().split('T')[0]);
        }
        if (initialData.endDate) {
          const ed = (initialData.endDate as any).seconds 
            ? new Date((initialData.endDate as any).seconds * 1000) 
            : initialData.endDate as Date;
          setEndDateStr(ed.toISOString().split('T')[0]);
        } else {
          setEndDateStr('');
        }
      } else {
        setFormData({
          name: '',
          organizationType: 'Institution',
          organizationId: '',
          schemeName: '',
          description: '',
          state: '',
          district: '',
          budget: 0,
          status: 'PLANNED',
          progress: 0,
          projectType: '',
          isDemo: false
        });
        setStartDateStr(new Date().toISOString().split('T')[0]);
        setEndDateStr('');
      }
      setError('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.organizationId) {
      setError('Please select an organization.');
      setLoading(false);
      return;
    }

    try {
      // Find the selected org to accurately set organizationType
      const selectedOrg = organizations.find(o => o.id === formData.organizationId);
      
      const payload: Partial<Project> = {
        ...formData,
        organizationType: selectedOrg ? selectedOrg.type : 'Institution',
        startDate: new Date(startDateStr),
      };

      if (endDateStr) {
        payload.endDate = new Date(endDateStr);
      }

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">
            {initialData ? 'Edit Project' : 'Add New Project'}
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

          <form id="project-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Associated Organization</label>
                <select
                  required
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                  value={formData.organizationId}
                  onChange={(e) => setFormData({...formData, organizationId: e.target.value})}
                  disabled={loadingOrgs}
                >
                  <option value="" disabled>Select an Organization...</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scheme / Program</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  value={formData.schemeName}
                  onChange={(e) => setFormData({...formData, schemeName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                  value={formData.status || 'PLANNED'}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                >
                  <option value="PLANNED">Planned</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Type</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Construction, Awareness, Health"
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  value={formData.projectType || ''}
                  onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                />
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                <input 
                  type="date" 
                  required
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  value={startDateStr}
                  onChange={(e) => setStartDateStr(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">End Date (Optional)</label>
                <input 
                  type="date" 
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  value={endDateStr}
                  onChange={(e) => setEndDateStr(e.target.value)}
                  min={startDateStr}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Budget (₹)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Progress (%)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  max="100"
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  value={formData.progress || 0}
                  onChange={(e) => setFormData({...formData, progress: Number(e.target.value)})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Description</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full border border-slate-300 p-2 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
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
            form="project-form"
            type="submit" 
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-sm text-sm font-medium hover:bg-primary-light transition-colors flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {initialData ? 'Update Project' : 'Save Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
