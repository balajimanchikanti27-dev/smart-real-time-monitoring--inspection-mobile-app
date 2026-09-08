import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocs, query, where } from 'firebase/firestore';
import { institutionsRef, ngosRef, projectsRef } from '../services/firebase/firestore';
import { assignmentService } from '../services/api/assignmentService';
import type { Institution, NGO, Project } from '../types/firestore';
import { demoOrganizations, demoProjects } from '../services/mockData';
import { AlertTriangle, Building2, MapPin, Target, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SurpriseInspections() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const [targetType, setTargetType] = useState<'NGO' | 'Institution' | null>(null);
  
  const defaultInsts = demoOrganizations
    .filter(o => o.organizationType === 'GOVERNMENT_INSTITUTION' || o.organizationType === 'CORPORATION')
    .map(m => ({
      id: m.id,
      name: m.organizationName,
      state: m.state,
      district: m.district
    } as any));

  const defaultNgos = demoOrganizations
    .filter(o => o.organizationType === 'NGO')
    .map(m => ({
      id: m.id,
      name: m.organizationName,
      state: m.state,
      district: m.district
    } as any));

  const [institutions, setInstitutions] = useState<Institution[]>(defaultInsts);
  const [ngos, setNgos] = useState<NGO[]>(defaultNgos);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [selectedTarget, setSelectedTarget] = useState<Institution | NGO | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState<{success: boolean, inspectorName?: string, inspectionId?: string} | null>(null);

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 800));
        const instPromise = getDocs(institutionsRef);
        const ngoPromise = getDocs(ngosRef);
        const [instSnap, ngoSnap]: any = await Promise.race([
          Promise.all([instPromise, ngoPromise]),
          timeoutPromise
        ]);
        if (instSnap?.docs?.length > 0) {
          setInstitutions(instSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Institution)));
        }
        if (ngoSnap?.docs?.length > 0) {
          setNgos(ngoSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as NGO)));
        }
      } catch {
        // Retain pre-loaded defaults
      }
    };
    fetchTargets();
  }, []);

  const handleSelectTarget = async (target: Institution | NGO, type: 'NGO' | 'Institution') => {
    setSelectedTarget(target);
    setTargetType(type);
    setSelectedProject(null);
    setStep(2);
    
    // Fetch associated projects
    try {
      const qProj = query(projectsRef, where('organizationId', '==', target.id!));
      const projSnap = await getDocs(qProj);
      setProjects(projSnap.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
    } catch (err) {
      console.error('Firebase error, falling back to mock projects:', err);
      // Fallback for demo
      const mockProjs = demoProjects.filter(p => p.organizationId === target.id);
      setProjects(mockProjs.map(m => ({
        id: m.projectId,
        name: m.projectName,
        schemeName: demoOrganizations.find(o => o.id === target.id)?.schemeIds[0] || 'Unknown Scheme'
      } as any)));
    }
  };

  const handleConfirm = async () => {
    if (!selectedTarget || !targetType) return;
    
    setLoading(true);
    setError('');
    
    // We assume the user has a mock ID for now
    const adminId = 'admin-123';
    
    const targetName = targetType === 'NGO' ? (selectedTarget as NGO).name : (selectedTarget as Institution).name;
    const state = targetType === 'NGO' ? (selectedTarget as NGO).state : (selectedTarget as Institution).state;
    const district = targetType === 'NGO' ? (selectedTarget as NGO).district : (selectedTarget as Institution).district;
    
    const result = await assignmentService.createSurpriseInspection({
      targetType,
      targetId: selectedTarget.id!,
      targetName,
      state,
      district,
      priority,
      projectId: selectedProject?.id,
      projectName: selectedProject?.name,
      adminId
    });
    
    setLoading(false);
    
    if (result.success) {
      setAssignmentResult({
        success: true,
        inspectorName: result.inspectorName,
        inspectionId: result.inspectionId
      });
    } else {
      setError(result.error || 'Failed to create inspection.');
      setShowConfirm(false);
    }
  };

  if (assignmentResult) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <div className="card text-center p-10 animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Surprise Inspection Deployed!</h2>
          <p className="text-slate-600 mb-6">
            The intelligent assignment algorithm has securely selected an inspector.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8 text-left space-y-3">
             <div className="flex justify-between border-b border-slate-200 pb-2">
               <span className="text-slate-500 text-sm font-semibold">Target</span>
               <span className="text-slate-800 font-bold">
                 {targetType === 'NGO' ? (selectedTarget as NGO).name : (selectedTarget as Institution).name}
               </span>
             </div>
             <div className="flex justify-between border-b border-slate-200 pb-2">
               <span className="text-slate-500 text-sm font-semibold">Assigned Inspector</span>
               <span className="text-primary font-bold">{assignmentResult.inspectorName}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-slate-500 text-sm font-semibold">Priority</span>
               <span className="text-red-600 font-bold">{priority}</span>
             </div>
          </div>
          
          <button 
            onClick={() => navigate(`/dashboard/inspections/${assignmentResult.inspectionId}`)}
            className="btn-primary w-full justify-center"
          >
            View Inspection Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-red-700 flex items-center gap-3">
           <AlertTriangle className="w-8 h-8" />
           Surprise Inspection Deployment
        </h1>
        <p className="text-slate-600 mt-1">Configure and deploy unannounced audits. Inspector identity remains hidden until assignment is finalized.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Deployment Failed</h4>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <div className="nirikshan-panel animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="nirikshan-panel-header bg-slate-50">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
               <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</span>
               Select Target Organization
             </h3>
           </div>
           <div className="nirikshan-panel-body">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Government Institutions */}
                <div>
                   <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                     <Building2 className="w-4 h-4 text-primary" /> Government Institutions
                   </h4>
                   <div className="space-y-3">
                     {institutions.map(inst => (
                       <button 
                         key={inst.id}
                         onClick={() => handleSelectTarget(inst, 'Institution')}
                         className="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group"
                       >
                         <p className="font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-1">{inst.name}</p>
                         <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {inst.district}, {inst.state}</p>
                       </button>
                     ))}
                   </div>
                </div>
                
                {/* NGOs */}
                <div>
                   <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                     <Target className="w-4 h-4 text-accent" /> Registered NGOs
                   </h4>
                   <div className="space-y-3">
                     {ngos.map(ngo => (
                       <button 
                         key={ngo.id}
                         onClick={() => handleSelectTarget(ngo, 'NGO')}
                         className="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-accent hover:bg-accent/5 transition-all group"
                       >
                         <p className="font-bold text-slate-800 group-hover:text-accent transition-colors line-clamp-1">{ngo.name}</p>
                         <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {ngo.district}, {ngo.state}</p>
                       </button>
                     ))}
                   </div>
                </div>
             </div>
           </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="nirikshan-panel animate-in fade-in slide-in-from-right-8 duration-500">
           <div className="nirikshan-panel-header bg-slate-50 flex justify-between items-center">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
               <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">2</span>
               Select Specific Project (Optional)
             </h3>
             <button onClick={() => setStep(1)} className="text-sm text-slate-500 hover:text-primary">Change Target</button>
           </div>
           <div className="nirikshan-panel-body">
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-4">
                 <Building2 className="w-8 h-8 text-primary shrink-0" />
                 <div>
                   <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">Selected Target</p>
                   <p className="font-bold text-lg text-slate-800">
                     {targetType === 'NGO' ? (selectedTarget as NGO).name : (selectedTarget as Institution).name}
                   </p>
                 </div>
              </div>
              
              {projects.length === 0 ? (
                <div className="text-center p-8 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-slate-600 mb-4">No specific projects found for this organization.</p>
                  <button onClick={() => setStep(3)} className="btn-primary">Continue with General Inspection <ArrowRight className="w-4 h-4 ml-2" /></button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">Select a project to focus the surprise inspection, or skip to inspect the organization generally.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {projects.map(p => (
                       <button 
                         key={p.id}
                         onClick={() => { setSelectedProject(p); setStep(3); }}
                         className="text-left p-4 rounded-lg border border-slate-200 hover:border-primary focus:border-primary focus:ring-1 focus:ring-primary hover:bg-slate-50 transition-all"
                       >
                         <p className="font-bold text-slate-800">{p.name}</p>
                         <p className="text-xs text-slate-500 mt-1">{p.schemeName}</p>
                       </button>
                     ))}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button onClick={() => setStep(3)} className="text-sm font-semibold text-primary hover:underline">Skip Project Selection</button>
                  </div>
                </div>
              )}
           </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="nirikshan-panel animate-in fade-in slide-in-from-right-8 duration-500">
           <div className="nirikshan-panel-header bg-slate-50 flex justify-between items-center">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
               <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">3</span>
               Configure & Deploy
             </h3>
             <button onClick={() => setStep(2)} className="text-sm text-slate-500 hover:text-primary">Back</button>
           </div>
           <div className="nirikshan-panel-body">
              <div className="max-w-xl mx-auto space-y-8">
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-3">Priority Level</label>
                   <div className="grid grid-cols-3 gap-4">
                      {['medium', 'high', 'critical'].map((p) => (
                        <button
                          key={p}
                          onClick={() => setPriority(p as any)}
                          className={`p-3 rounded-lg border-2 text-center font-bold text-sm transition-all uppercase ${
                            priority === p 
                              ? (p === 'critical' ? 'border-red-500 bg-red-50 text-red-700' : p === 'high' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-blue-500 bg-blue-50 text-blue-700')
                              : 'border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                   </div>
                 </div>
                 
                 <div className="p-6 bg-red-50 rounded-xl border border-red-100 space-y-4">
                    <div className="flex items-start gap-3 text-red-800">
                      <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-lg">Confidential Assignment</h4>
                        <p className="text-sm mt-1 opacity-90">
                          The system will now securely scan active inspector workloads in the target district and randomly assign an eligible inspector.
                        </p>
                      </div>
                    </div>
                 </div>

                 <button 
                   onClick={() => setShowConfirm(true)}
                   className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 text-lg"
                 >
                   Deploy Surprise Inspection
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6 text-center">
               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertTriangle className="w-8 h-8 text-red-600" />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Deployment</h3>
               <p className="text-slate-600 text-sm">
                 You are about to authorize a highly confidential surprise inspection for:
               </p>
               <p className="font-bold text-slate-800 mt-2">
                 {targetType === 'NGO' ? (selectedTarget as NGO).name : (selectedTarget as Institution)?.name}
               </p>
               
               <p className="text-xs text-slate-500 mt-6 bg-slate-50 p-3 rounded text-left">
                 <strong>Audit Trail Notice:</strong> This action will be permanently recorded in the system logs to ensure compliance and accountability.
               </p>
             </div>
             
             <div className="flex border-t border-slate-100">
               <button 
                 onClick={() => setShowConfirm(false)}
                 disabled={loading}
                 className="flex-1 p-4 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleConfirm}
                 disabled={loading}
                 className="flex-1 p-4 bg-red-600 hover:bg-red-700 text-white font-bold transition-colors flex justify-center items-center gap-2"
               >
                 {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Authorize & Assign'}
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
