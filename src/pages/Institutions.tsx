import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { institutionsRef } from '../services/firebase/firestore';
import type { Institution } from '../types/firestore';
import { demoOrganizations } from '../services/mockData';
import InstitutionForm from '../components/institutions/InstitutionForm';
import OrganizationDataTable from '../components/organizations/OrganizationDataTable';
import { Plus, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';

const defaultInstitutions = demoOrganizations.filter(o => o.organizationType !== 'NGO') as unknown as Institution[];

export default function Institutions() {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<Institution[]>(defaultInstitutions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInst, setEditingInst] = useState<Institution | undefined>();

  const fetchInstitutions = async () => {
    try {
      const q = query(institutionsRef, orderBy('createdAt', 'desc'));
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
      const snapshot: any = await Promise.race([getDocs(q), timeoutPromise]);
      if (snapshot && snapshot.docs) {
        const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Institution));
        
        const fetchedIds = new Set(data.map(d => d.id));
        const merged = [...data];
        defaultInstitutions.forEach(def => {
          if (!fetchedIds.has(def.id)) {
            merged.push(def);
          }
        });
        
        setInstitutions(merged);
      }
    } catch {
      // Retain existing state on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleSave = async (data: Partial<Institution>) => {
    try {
      if (editingInst && editingInst.id) {
        const docRef = doc(institutionsRef, editingInst.id);
        await updateDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp()
        });
        
        setInstitutions(prev => prev.map(inst => inst.id === editingInst.id ? { ...inst, ...data } as Institution : inst));
        setSuccess('Institution updated successfully.');
      } else {
        const docRef = await addDoc(institutionsRef, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        } as any);
        
        const newInst = { id: docRef.id, ...data, status: data.status || 'ACTIVE' } as Institution;
        setInstitutions(prev => [newInst, ...prev]);
        setSuccess('Institution created successfully. Confirmation email sent to your registered address.');
      }
      setIsFormOpen(false);
      setEditingInst(undefined);
      fetchInstitutions();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      throw new Error('Failed to save institution: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        await deleteDoc(doc(institutionsRef, id));
        setSuccess('Institution deleted successfully.');
        fetchInstitutions();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error(err);
        setError('Failed to delete institution.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Institution Management</h1>
          <p className="text-slate-600 mt-1">Manage government institutions, centers, and facilities.</p>
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
            onClick={() => { setEditingInst(undefined); setIsFormOpen(true); }}
            className="btn-primary flex items-center gap-1.5 text-xs"
          >
            <Plus className="w-4 h-4" />
            Add Institution
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
        data={institutions}
        loading={loading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        entityName="Institution"
        onView={(id) => navigate(`/dashboard/institutions/${id}`)}
        onEdit={(inst) => { setEditingInst(inst); setIsFormOpen(true); }}
        onDelete={handleDelete}
      />

      <InstitutionForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingInst}
        onSave={handleSave}
      />
    </div>
  );
}
