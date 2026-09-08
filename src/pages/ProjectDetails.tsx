import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { projectsRef, institutionsRef, ngosRef, inspectionsRef, inspectionFindingsRef } from '../services/firebase/firestore';
import type { Project, Institution, NGO, Inspection, InspectionFinding } from '../types/firestore';
import { ArrowLeft, Building2, IndianRupee, Calendar, ClipboardCheck, AlertTriangle, Clock, Target, Info } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [organization, setOrganization] = useState<Institution | NGO | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [findings, setFindings] = useState<InspectionFinding[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // 1. Fetch Project
        const docRef = doc(projectsRef, id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          setError('Project not found.');
          setLoading(false);
          return;
        }
        
        const projData = docSnap.data() as Project;
        setProject(projData);

        // 2. Fetch Organization
        let orgSnap;
        if (projData.organizationType === 'Institution') {
          orgSnap = await getDoc(doc(institutionsRef, projData.organizationId));
        } else {
          orgSnap = await getDoc(doc(ngosRef, projData.organizationId));
        }
        if (orgSnap.exists()) {
          setOrganization(orgSnap.data() as any);
        }

        // 3. Fetch related Inspections
        const qInspections = query(inspectionsRef, where('projectId', '==', id));
        const inspSnap = await getDocs(qInspections);
        const inspData = inspSnap.docs.map(d => ({ id: d.id, ...d.data() } as Inspection));
        setInspections(inspData);
        
        // 4. Fetch findings for these inspections
        if (inspData.length > 0) {
          const inspIds = inspData.map(i => i.id!);
          // Firestore 'in' query supports up to 10 items. For a robust app we might batch this, but for now:
          const chunks = [];
          for (let i = 0; i < inspIds.length; i += 10) {
            chunks.push(inspIds.slice(i, i + 10));
          }
          
          let allFindings: InspectionFinding[] = [];
          for (const chunk of chunks) {
            const qFindings = query(inspectionFindingsRef, where('inspectionId', 'in', chunk));
            const findingSnap = await getDocs(qFindings);
            allFindings = [...allFindings, ...findingSnap.docs.map(d => ({ id: d.id, ...d.data() } as InspectionFinding))];
          }
          setFindings(allFindings);
        }
        
      } catch (err: any) {
        console.error(err);
        setError('Failed to load project details.');
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

  if (error || !project) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-sm">
        {error || 'Something went wrong.'}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700';
      case 'PLANNED': return 'bg-slate-100 text-slate-700';
      case 'SUSPENDED': return 'bg-amber-100 text-amber-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const formatDate = (dateData: any) => {
    if (!dateData) return 'Ongoing';
    if (dateData.seconds) return new Date(dateData.seconds * 1000).toLocaleDateString();
    return new Date(dateData).toLocaleDateString();
  };

  // Calculate timeline progress
  let progress = 0;
  const now = new Date().getTime();
  const start = project.startDate && (project.startDate as any).seconds ? (project.startDate as any).seconds * 1000 : new Date(project.startDate as any as string).getTime();
  const end = project.endDate && (project.endDate as any).seconds ? (project.endDate as any).seconds * 1000 : project.endDate ? new Date(project.endDate as any as string).getTime() : null;
  
  if (end) {
    const total = end - start;
    const elapsed = now - start;
    progress = Math.max(0, Math.min(100, (elapsed / total) * 100));
  } else if (project.status === 'COMPLETED') {
    progress = 100;
  } else if (project.status === 'ACTIVE') {
    progress = 50; // Arbitrary for ongoing without end date
  }

  // Compliance metrics
  const openFindings = findings.filter(f => f.status === 'OPEN');
  const criticalFindings = openFindings.filter(f => f.severity === 'CRITICAL');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/dashboard/projects')}
          className="p-2 hover:bg-slate-100 rounded-sm transition-colors text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-primary">{project.name}</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
            <span className="bg-slate-100 px-2 py-0.5 rounded-sm text-xs font-medium text-slate-600">{project.schemeName}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="nirikshan-panel">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Project Overview</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{project.description}</p>
            </div>
            
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6 bg-slate-50">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5" /> Budget
                </p>
                <p className="font-bold text-slate-800 text-lg">₹{project.budget.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> State
                </p>
                <p className="font-semibold text-slate-800">{project.state}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> District
                </p>
                <p className="font-semibold text-slate-800">{project.district}</p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Project Timeline
              </h3>
              
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-sm text-primary bg-primary-light/10">
                      Progress
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-primary">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-200">
                  <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Start: {formatDate(project.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>End: {formatDate(project.endDate)}</span>
                    <Calendar className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="nirikshan-panel">
            <div className="nirikshan-panel-header">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" />
                Associated Inspections
              </h3>
            </div>
            <div className="nirikshan-panel-body p-0">
              {inspections.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm">No inspections have been conducted for this project yet.</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="text-xs uppercase bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inspections.map(i => (
                      <tr key={i.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/dashboard/inspections/${i.id}`)}>
                        <td className="px-4 py-3 font-medium text-slate-800">{i.inspectionType}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(i.scheduledDate)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm ${
                      i.status === 'CLOSED' ? 'bg-green-100 text-green-700' :
                      i.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      i.status === 'CREATED' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>{i.status.replace('_', ' ')}</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-primary">
                          {i.complianceScore !== undefined ? `${i.complianceScore}%` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Org & Compliance */}
        <div className="lg:col-span-1 space-y-6">
          <div className="nirikshan-panel">
            <div className="nirikshan-panel-header">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Executing Organization
              </h3>
            </div>
            <div className="nirikshan-panel-body">
              {organization ? (
                <div>
                  <p className="font-bold text-slate-800 text-base">{organization.name}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-4 mt-1">{project.organizationType}</p>
                  
                  <div className="space-y-3 text-sm text-slate-700">
                    <p><span className="text-xs font-bold text-slate-500 uppercase">Reg No:</span> {organization.registrationNumber}</p>
                    <p><span className="text-xs font-bold text-slate-500 uppercase">Contact:</span> {(organization as any).contactPerson || (organization as any).contactName}</p>
                    <p><span className="text-xs font-bold text-slate-500 uppercase">Email:</span> {organization.contactEmail}</p>
                    <p><span className="text-xs font-bold text-slate-500 uppercase">Phone:</span> {organization.contactPhone}</p>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/dashboard/${project.organizationType.toLowerCase()}s/${organization.id}`)}
                    className="mt-6 w-full py-2 border border-primary text-primary rounded-sm text-sm font-medium hover:bg-primary-light/5 transition-colors"
                  >
                    View Organization Profile
                  </button>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Organization data not available.</p>
              )}
            </div>
          </div>

          <div className="nirikshan-panel">
            <div className="nirikshan-panel-header">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Compliance Status
              </h3>
            </div>
            <div className="nirikshan-panel-body space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{inspections.length}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase">Total Inspections</p>
                </div>
                <ClipboardCheck className="w-8 h-8 text-slate-300" />
              </div>
              
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-sm flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-amber-700">{openFindings.length}</p>
                  <p className="text-xs font-bold text-amber-700/70 uppercase">Open Findings</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-amber-200" />
              </div>

              {criticalFindings.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-sm">
                  <p className="text-sm font-bold text-red-700 flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    Critical Issues Detected
                  </p>
                  <p className="text-xs text-red-600">
                    There are {criticalFindings.length} critical findings that require immediate corrective action.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
