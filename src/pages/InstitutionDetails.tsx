import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { institutionsRef, projectsRef, inspectionsRef } from '../services/firebase/firestore';
import type { Institution, Project, Inspection } from '../types/firestore';
import { ArrowLeft, MapPin, Phone, Mail, Building2, Calendar, ClipboardCheck, FolderKanban } from 'lucide-react';

export default function InstitutionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Fetch Institution
        const docRef = doc(institutionsRef, id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          setError('Institution not found.');
          setLoading(false);
          return;
        }
        
        setInstitution(docSnap.data() as Institution);

        // Fetch related Projects
        const qProjects = query(projectsRef, where('organizationId', '==', id));
        const projSnap = await getDocs(qProjects);
        setProjects(projSnap.docs.map(d => d.data() as Project));

        // Fetch related Inspections
        const qInspections = query(inspectionsRef, where('institutionId', '==', id));
        const inspSnap = await getDocs(qInspections);
        setInspections(inspSnap.docs.map(d => d.data() as Inspection));
        
      } catch (err: any) {
        console.error(err);
        setError('Failed to load institution details.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-sm">
        {error || 'Something went wrong.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/dashboard/institutions')}
          className="p-2 hover:bg-slate-100 rounded-sm transition-colors text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-primary">{institution.name}</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              institution.status === 'active' ? 'bg-green-100 text-green-700' :
              institution.status === 'inactive' ? 'bg-slate-100 text-slate-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {institution.status.toUpperCase()}
            </span>
            <span>Reg. No: {institution.registrationNumber}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="nirikshan-panel">
            <div className="nirikshan-panel-header">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Contact Details
              </h3>
            </div>
            <div className="nirikshan-panel-body space-y-4 text-sm text-slate-700">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Contact Person</p>
                <p className="font-medium">{institution.contactPerson}</p>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                <p>{institution.contactEmail}</p>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                <p>{institution.contactPhone}</p>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <p>{institution.address}, {institution.district}, {institution.state}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="nirikshan-panel">
            <div className="nirikshan-panel-header">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <FolderKanban className="w-4 h-4" />
                Associated Projects
              </h3>
            </div>
            <div className="nirikshan-panel-body">
              {projects.length === 0 ? (
                <p className="text-slate-500 text-sm">No projects associated with this institution.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {projects.map(p => (
                    <div key={p.id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.schemeName}</p>
                      </div>
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${p.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                        <span className="text-xs font-semibold text-slate-700">
                          {p.status}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="nirikshan-panel">
            <div className="nirikshan-panel-header">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" />
                Recent Inspections
              </h3>
            </div>
            <div className="nirikshan-panel-body">
              {inspections.length === 0 ? (
                <p className="text-slate-500 text-sm">No inspections found for this institution.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {inspections.map(i => (
                    <div key={i.id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-800">{i.inspectionType} Inspection</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {i.scheduledDate ? new Date((i.scheduledDate as any).seconds * 1000).toLocaleDateString() : 'Unscheduled'}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-sm ${
                        i.status === 'CLOSED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {i.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
