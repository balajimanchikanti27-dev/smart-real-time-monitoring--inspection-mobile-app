import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { demoOrganizations, demoProjects, demoCCTV } from '../services/mockData';
import { Building2, MapPin, Phone, Mail, FileText, AlertTriangle, Video, ClipboardList, Camera, VideoOff, ArrowRight } from 'lucide-react';

const OrganizationProfile = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  
  // If no ID passed, default to ORG-003 for demo purposes
  const orgIdToUse = id || 'NGO003';
  const org = demoOrganizations.find(o => o.id === orgIdToUse);
  const projects = demoProjects.filter(p => p.organizationId === orgIdToUse);
  const cctvs = demoCCTV.filter(c => c.organizationId === orgIdToUse);

  if (!org) return <div className="p-8">Organization not found.</div>;

  const tabs = ['Overview', 'Projects', 'Inspections', 'Documents', 'CCTV Surveillance', 'Complaints', 'Corrective Actions'];

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header Profile */}
      <div className="card p-6 relative overflow-hidden">
        {org.dataSourceType === 'DEMO' && (
          <div className="absolute top-4 right-4 text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded border">
            PROTOTYPE / DEMO DATA
          </div>
        )}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-lg bg-primary-light flex items-center justify-center text-white shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-primary-dark">{org.organizationName}</h1>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${org.status === 'ACTIVE' ? 'bg-semantic-success text-white' : 'bg-semantic-warning text-white'}`}>
                {org.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1"/> {org.address}, {org.district}, {org.state}</span>
              <span className="flex items-center"><Phone className="w-4 h-4 mr-1"/> {org.phone}</span>
              <span className="flex items-center"><Mail className="w-4 h-4 mr-1"/> {org.email}</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Org Type</p>
                <p className="font-semibold text-primary">{org.organizationType.replace('_', ' ')}</p>
              </div>
              {org.ngoDarpanId && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">NGO DARPAN ID</p>
                  <p className="font-mono text-sm font-semibold">{org.ngoDarpanId}</p>
                </div>
              )}
               <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Compliance Score</p>
                <p className="font-semibold text-semantic-success">{org.complianceScore}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Risk Status</p>
                <p className={`font-semibold ${org.riskLevel === 'CRITICAL' ? 'text-semantic-critical' : org.riskLevel === 'HIGH' ? 'text-semantic-warning' : 'text-semantic-success'}`}>
                  {org.riskLevel} ({org.riskScore}/100)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex space-x-8 min-w-max">
          {tabs.map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content: Overview */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <div className="md:col-span-2 space-y-6">
            <div className="card p-5">
              <h3 className="font-bold text-lg mb-4 flex items-center"><FileText className="w-5 h-5 mr-2 text-gray-400"/> Assigned Projects</h3>
              {projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.map(p => (
                    <div key={p.projectId} className="border rounded p-3 bg-gray-50">
                      <p className="font-semibold text-primary">{p.projectName}</p>
                      <p className="text-xs text-gray-500 mt-1">Scheme ID: {p.schemeId} | Status: {p.projectStatus}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded text-center border border-dashed">No active projects assigned currently.</p>
              )}
            </div>
            
            <div className="card p-5 border-l-4 border-l-semantic-critical">
              <h3 className="font-bold text-lg mb-4 flex items-center text-semantic-critical"><AlertTriangle className="w-5 h-5 mr-2"/> Risk Factors</h3>
              <ul className="text-sm space-y-2 text-gray-700 list-disc pl-5">
                <li>Previous Violations Recorded: <strong>{org.previousViolations}</strong></li>
                <li>Days Delayed for Mandatory Inspection: <strong>{org.inspectionDelayDays}</strong></li>
                <li>Active Public Complaints: <strong>{org.complaintsCount}</strong></li>
                <li>Financial Irregularity Flags: <strong>{org.financialIrregularityFlags}</strong></li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
             <div className="card p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('CCTV Surveillance')}>
                <h3 className="font-bold text-lg mb-4 flex items-center"><Video className="w-5 h-5 mr-2 text-gray-400"/> Live CCTV Status</h3>
                <div className="aspect-video bg-gray-900 rounded-md flex items-center justify-center text-gray-600 mb-2 border border-gray-700 relative overflow-hidden group">
                   {org.cctvAnomalies > 0 ? <VideoOff className="w-8 h-8 text-semantic-critical opacity-50" /> : <Video className="w-8 h-8 opacity-50" />}
                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-bold border border-white px-3 py-1 rounded">VIEW FEEDS</span>
                   </div>
                </div>
                {org.cctvAnomalies > 0 ? (
                  <p className="text-xs text-semantic-critical font-bold text-center">FEED OFFLINE / ANOMALY DETECTED</p>
                ) : (
                  <p className="text-xs text-semantic-success font-bold text-center flex items-center justify-center"><span className="w-2 h-2 rounded-full bg-semantic-success animate-pulse mr-1"></span> ONLINE - {cctvs.length} CAMERAS</p>
                )}
             </div>

             <div className="card p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center"><ClipboardList className="w-5 h-5 mr-2 text-gray-400"/> Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex gap-3 relative">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-accent shrink-0"></div>
                    <div className="border-l-2 border-gray-100 absolute left-1 top-3 h-full -z-10"></div>
                    <div>
                      <p className="text-sm font-semibold">Complaint Registered</p>
                      <p className="text-xs text-gray-500">2 days ago by District Admin</p>
                    </div>
                  </div>
                  <div className="flex gap-3 relative">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-semantic-critical shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold">Risk Level Elevated</p>
                      <p className="text-xs text-gray-500">3 days ago (Automated Engine)</p>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Tab Content: CCTV Surveillance */}
      {activeTab === 'CCTV Surveillance' && (
        <div className="animate-in fade-in duration-300">
           <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-xl font-bold text-primary-dark">Live Surveillance Network</h2>
                <p className="text-sm text-gray-500">Real-time CCTV integration mapping from installed cameras.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                 <span className="px-3 py-1 bg-semantic-success/10 text-semantic-success text-xs font-bold rounded flex items-center gap-2 border border-semantic-success/20">
                    <span className="w-2 h-2 rounded-full bg-semantic-success animate-pulse"></span>
                    {cctvs.filter(c => c.status === 'LIVE').length} LIVE
                 </span>
                 <span className="px-3 py-1 bg-semantic-critical/10 text-semantic-critical text-xs font-bold rounded flex items-center gap-2 border border-semantic-critical/20">
                    <span className="w-2 h-2 rounded-full bg-semantic-critical"></span>
                    {cctvs.filter(c => c.status === 'OFFLINE').length} OFFLINE
                 </span>
                 <Link
                   to="/dashboard/cctv"
                   className="px-3 py-1 bg-slate-900 hover:bg-black text-amber-300 text-xs font-bold rounded flex items-center gap-1.5 transition-colors border border-amber-500/30"
                 >
                   <span>Command Center</span>
                   <ArrowRight className="w-3.5 h-3.5" />
                 </Link>
              </div>
           </div>

           {cctvs.length === 0 ? (
             <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-10 text-center rounded-lg">
                <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-600">No Cameras Registered</h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto">This organization does not currently have any MoSJE-integrated CCTV cameras configured in the system.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {cctvs.map(camera => (
                 <Link 
                   to="/dashboard/cctv" 
                   key={camera.id} 
                   className={`card overflow-hidden border-2 transition-all hover:shadow-lg ${camera.isAnomalous ? 'border-semantic-critical' : 'border-transparent'}`}
                 >
                    <div className="relative aspect-video bg-gray-900 flex items-center justify-center group">
                       <img
                         src="https://images.unsplash.com/photo-1577495508048-b635879837f1?w=500&auto=format&fit=crop&q=80"
                         alt={camera.name}
                         className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                       />
                       <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40"></div>
                       
                       <div className="absolute top-2 right-2 flex gap-1 z-10">
                          {camera.status === 'LIVE' && <span className="bg-semantic-success text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>REC</span>}
                          <span className="bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">{camera.resolution}</span>
                       </div>

                       {camera.isAnomalous && (
                          <div className="absolute bottom-0 left-0 w-full bg-semantic-critical/90 text-white text-xs font-bold p-1.5 text-center z-10 uppercase tracking-wide">
                             ⚠️ AI Tampering Anomaly Detected
                          </div>
                       )}
                    </div>
                    <div className="p-4 bg-white">
                       <h4 className="font-bold text-gray-800">{camera.name}</h4>
                       <p className="text-xs text-gray-500 flex justify-between mt-1">
                          <span>Loc: {camera.location}</span>
                          <span className="font-mono text-primary font-semibold">Open Live Feed →</span>
                       </p>
                    </div>
                 </Link>
               ))}
             </div>
           )}
        </div>
      )}

      {/* Placeholders for other tabs */}
      {['Projects', 'Inspections', 'Documents', 'Complaints', 'Corrective Actions'].includes(activeTab) && (
         <div className="card p-10 text-center text-gray-500 animate-in fade-in duration-300">
            <h3 className="font-semibold text-lg mb-2">{activeTab} Interface</h3>
            <p className="text-sm text-gray-400">This module is part of Phase 4 deployment.</p>
         </div>
      )}

    </div>
  );
};

export default OrganizationProfile;
