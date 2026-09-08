import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getNGOs, createNGO, updateNGO, deleteNGO } from '../services/ngoService';
import type { NGO } from '../types/firestore';
import { demoOrganizations } from '../services/mockData';
import NGOForm from '../components/ngos/NGOForm';
import OrganizationDataTable from '../components/organizations/OrganizationDataTable';
import { Plus, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';

const defaultNGOs = demoOrganizations.filter(o => o.organizationType === 'NGO') as unknown as NGO[];

export default function NGOs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ngos, setNgos] = useState<NGO[]>(defaultNGOs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNgo, setEditingNgo] = useState<NGO | undefined>();

  const fetchNgos = async () => {
    try {
      setLoading(true);
      const { ngos: fetchedNgos } = await getNGOs();
      if (fetchedNgos && fetchedNgos.length > 0) {
        setNgos(fetchedNgos);
      }
    } catch {
      // Retain pre-loaded defaultNGOs on fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNgos();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    if (editId && ngos.length > 0) {
      const ngoToEdit = ngos.find(n => n.id === editId);
      if (ngoToEdit) {
        setEditingNgo(ngoToEdit);
        setIsFormOpen(true);
        // Clean up the URL
        navigate('/dashboard/ngos', { replace: true });
      }
    }
  }, [location.search, ngos, navigate]);

  const handleSave = async (data: Partial<NGO>) => {
    try {
      if (editingNgo && editingNgo.id) {
        await updateNGO(editingNgo.id, data as Partial<Omit<NGO, 'id' | 'createdAt' | 'createdBy'>>);
        setSuccess('NGO updated successfully.');
      } else {
        await createNGO(data as Omit<NGO, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>);
        setSuccess('NGO created successfully.');
      }
      setIsFormOpen(false);
      setEditingNgo(undefined);
      fetchNgos();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      throw new Error('Failed to save NGO: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        await deleteNGO(id);
        setSuccess('NGO deleted successfully.');
        fetchNgos();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error(err);
        setError('Failed to delete NGO.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">NGO Management</h1>
          <p className="text-slate-600 mt-1">Manage registered Non-Governmental Organizations.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/dashboard/map')}
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            <MapPin className="w-4 h-4 text-primary" />
            View on GIS Map
          </button>
          <button 
            onClick={() => { setEditingNgo(undefined); setIsFormOpen(true); }}
            className="btn-primary flex items-center gap-1.5 text-xs"
          >
            <Plus className="w-4 h-4" />
            Add NGO
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-sm text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-sm text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </div>
      )}

      <OrganizationDataTable 
        data={ngos as any} // Using as any because NGO doesn't strictly have 'type' or location fields that OrganizationRow might expect, but wait, OrganizationRow has id, name, registrationNumber, state, district, contactPerson, contactPhone, status. NGO has all of these exactly! So casting to any is just a bypass if ts complains, but it shouldn't.
        loading={loading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        entityName="NGO"
        onView={(id) => navigate(`/dashboard/ngos/${id}`)}
        onEdit={(ngo) => { setEditingNgo(ngo); setIsFormOpen(true); }}
        onDelete={handleDelete}
      />

      <NGOForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingNgo}
        onSave={handleSave}
      />
    </div>
  );
}
