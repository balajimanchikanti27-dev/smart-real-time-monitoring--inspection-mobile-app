import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, ArrowRight, ShieldAlert, CheckCircle, FileText, AlertTriangle } from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../services/firebase/firestore';
import { demoInspections, demoOrganizations } from '../services/mockData';

export default function InspectorHome() {
  const navigate = useNavigate();



  // Real-time state
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [assignedInspections, setAssignedInspections] = useState<any[]>([]);
  const [acceptedInspections, setAcceptedInspections] = useState<any[]>([]);
  const [inProgressInspections, setInProgressInspections] = useState<any[]>([]);
  const [completedInspections, setCompletedInspections] = useState<any[]>([]);

  useEffect(() => {
    // In production we would filter by inspectorId using a `where` clause
    const q = query(collection(db, 'inspections'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      setAssignedInspections(liveData.filter(i => i.status === 'ASSIGNED' || i.status === 'CREATED'));
      setAcceptedInspections(liveData.filter(i => i.status === 'SCHEDULED' || i.status === 'INSPECTOR_ACCEPTED'));
      setInProgressInspections(liveData.filter(i => i.status === 'IN_PROGRESS' || i.status === 'INSPECTION_STARTED'));
      setCompletedInspections(liveData.filter(i => i.status === 'COMPLETED' || i.status === 'REPORT_SUBMITTED'));
      
      setIsOffline(false);
      setLoading(false);
    }, (error) => {
      console.warn("Firestore listener error, falling back to mock data", error);
      setIsOffline(true);
      
      setAssignedInspections(demoInspections.filter(i => (i.status as string) === 'ASSIGNED' || i.status === 'CREATED'));
      setAcceptedInspections(demoInspections.filter(i => (i.status as string) === 'SCHEDULED' || i.status === 'INSPECTOR_ACCEPTED'));
      setInProgressInspections(demoInspections.filter(i => (i.status as string) === 'IN_PROGRESS' || i.status === 'INSPECTION_STARTED'));
      setCompletedInspections(demoInspections.filter(i => (i.status as string) === 'COMPLETED' || i.status === 'REPORT_SUBMITTED'));
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Mock pending corrective verification (Findings that are RESOLVED, waiting for VERIFIED)
  const pendingVerifications = [
    { id: 'FIND-001', title: 'Fire Safety Equipment Expired', orgId: 'GOV001', severity: 'CRITICAL', status: 'RESOLVED' }
  ];

  const handleAction = (inspectionId: string, action: string) => {
    // In a real app, this would trigger an update to Firestore
    console.log(`Action: ${action} on Inspection: ${inspectionId}`);
    if (action === 'start' || action === 'continue') {
      navigate(`/inspector/inspection/${inspectionId}/checklist`);
    } else if (action === 'accept') {
      // Simulate state change visually for demo (this would usually be a backend call)
      alert(`Inspection ${inspectionId} Accepted!`);
    }
  };

  const getOrgDetails = (orgId: string) => demoOrganizations.find(o => o.id === orgId);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header Profile */}
      <div className="bg-primary text-white p-5 rounded-b-2xl shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm font-medium flex items-center gap-2">
              Field Operations 
              {isOffline && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold">OFFLINE</span>}
            </p>
            <h2 className="text-2xl font-bold tracking-tight">Inspector Arun</h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center font-bold text-lg shadow-inner">
            AK
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 -mt-2">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-medium">Connecting to Field Ops...</p>
          </div>
        ) : (
          <>
            {/* URGENT ACTION ZONE (Assigned) */}
        {assignedInspections.length > 0 && (
          <section className="animate-in slide-in-from-bottom-4 duration-300">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Action Required
            </h3>
            <div className="space-y-3">
              {assignedInspections.map(insp => {
                const org = getOrgDetails(insp.organizationId);
                return (
                  <div key={insp.inspectionId} className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-2">
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-sm tracking-wider">NEW ASSIGNMENT</span>
                        <span className="text-red-700 text-xs font-semibold">{insp.type}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg leading-tight mb-1">{org?.organizationName || 'Unknown Target'}</h4>
                      <div className="text-slate-600 text-sm space-y-1 mb-4">
                        <p className="flex items-start gap-1"><MapPin className="w-4 h-4 shrink-0 mt-0.5 text-red-400" /> {org?.address}, {org?.district}</p>
                        <p className="flex items-center gap-1"><Clock className="w-4 h-4 text-red-400" /> Assigned Today</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAction(insp.inspectionId, 'accept')}
                          className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-3.5 rounded-lg shadow-md transition-colors"
                        >
                          Accept Inspection
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ACTIVE ZONE (In Progress) */}
        {inProgressInspections.length > 0 && (
          <section>
             <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
               Active Operation
             </h3>
             <div className="space-y-3">
               {inProgressInspections.map(insp => {
                 const org = getOrgDetails(insp.organizationId);
                 return (
                   <div key={insp.inspectionId} className="bg-white border-l-4 border-l-blue-500 border border-slate-200 rounded-r-xl p-4 shadow-sm">
                     <h4 className="font-bold text-slate-900 text-lg mb-1">{org?.organizationName}</h4>
                     <p className="text-slate-500 text-sm mb-4 line-clamp-1">{org?.address}</p>
                     
                     <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col items-center justify-center">
                           <span className="text-xs text-slate-500 font-semibold mb-1">Checklist</span>
                           <span className="text-blue-600 font-bold">45% Done</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col items-center justify-center">
                           <span className="text-xs text-slate-500 font-semibold mb-1">Findings</span>
                           <span className="text-red-600 font-bold">2 Logged</span>
                        </div>
                     </div>

                     <button 
                        onClick={() => handleAction(insp.inspectionId, 'continue')}
                        className="w-full bg-blue-600 active:bg-blue-700 text-white font-bold py-3.5 rounded-lg shadow-md flex justify-center items-center gap-2"
                     >
                       Continue Inspection <ArrowRight className="w-5 h-5" />
                     </button>
                   </div>
                 );
               })}
             </div>
          </section>
        )}

        {/* VERIFICATION QUEUE */}
        {pendingVerifications.length > 0 && (
          <section>
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
               <AlertTriangle className="w-5 h-5 text-amber-500" />
               Pending Verifications
             </h3>
             <div className="space-y-3">
               {pendingVerifications.map(finding => {
                 const org = getOrgDetails(finding.orgId);
                 return (
                   <div key={finding.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">CRITICAL</span>
                          <span className="text-xs text-slate-500">{finding.id}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm leading-tight">{finding.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{org?.organizationName}</p>
                      </div>
                      <button className="bg-white border border-amber-300 text-amber-700 p-2 rounded-lg active:bg-amber-100">
                         Verify
                      </button>
                   </div>
                 );
               })}
             </div>
          </section>
        )}

        {/* TODAY'S ITINERARY (Accepted/Scheduled) */}
        {acceptedInspections.length > 0 && (
          <section>
            <h3 className="font-bold text-slate-800 mb-3">Today's Itinerary</h3>
            <div className="space-y-3">
              {acceptedInspections.map(insp => {
                const org = getOrgDetails(insp.organizationId);
                return (
                  <div key={insp.inspectionId} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-slate-500">{insp.inspectionId}</span>
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">{insp.type}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-base mb-1">{org?.organizationName}</h4>
                      <p className="text-slate-500 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> {org?.district}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <button 
                        onClick={() => handleAction(insp.inspectionId, 'start')}
                        className="w-full bg-slate-800 active:bg-black text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2"
                      >
                        Start Inspection
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* RECENTLY COMPLETED */}
        {completedInspections.length > 0 && (
          <section>
            <h3 className="font-bold text-slate-800 mb-3 text-sm text-slate-500">Recent Activity</h3>
            <div className="space-y-2">
              {completedInspections.slice(0, 3).map(insp => {
                const org = getOrgDetails(insp.organizationId);
                return (
                  <div key={insp.inspectionId} className="bg-white border border-slate-100 rounded-lg p-3 flex items-center justify-between opacity-80">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">{org?.organizationName}</h4>
                        <p className="text-xs text-slate-500">Submitted Today</p>
                      </div>
                    </div>
                    <button className="text-primary p-2">
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

          </>
        )}
      </div>
    </div>
  );
}
