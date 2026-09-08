import { useState } from 'react';
import { AlertCircle, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import { demoOrganizations } from '../services/mockData';
import type { CorrectiveAction } from '../types/firestore';
import { serverTimestamp } from 'firebase/firestore';

// Mock Data for Prototype
const demoCorrectiveActions: CorrectiveAction[] = [
  {
    id: 'CA-001',
    findingId: 'FIND-001',
    organizationId: 'GOV001',
    actionDescription: 'Replace all expired fire extinguishers in the main corridor and provide dated photographic evidence.',
    dueDate: serverTimestamp() as any, // Mocking
    status: 'OPEN',
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any
  },
  {
    id: 'CA-002',
    findingId: 'FIND-042',
    organizationId: 'NGO003',
    actionDescription: 'Submit updated beneficiary register for Q3 with auditor signature.',
    dueDate: serverTimestamp() as any,
    status: 'SUBMITTED',
    submittedEvidence: 'https://demo-storage.com/evidence/reg_q3.pdf',
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any
  },
  {
    id: 'CA-003',
    findingId: 'FIND-015',
    organizationId: 'GOV004',
    actionDescription: 'Repair structural damage in the eastern wing wall.',
    dueDate: serverTimestamp() as any,
    status: 'OVERDUE',
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any
  }
];

export default function CorrectiveActions() {
  const [actions, setActions] = useState<CorrectiveAction[]>(demoCorrectiveActions);
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'SUBMITTED' | 'OVERDUE' | 'VERIFIED'>('ALL');
  
  // Hardcoded role for demo purposes. In a real app, this comes from Auth context.
  const userRole = 'SUPER_ADMIN'; 
  
  const filteredActions = actions.filter(a => filter === 'ALL' || a.status === filter);

  const getOrgName = (orgId: string) => demoOrganizations.find(o => o.id === orgId)?.organizationName || orgId;

  const handleVerify = (actionId: string) => {
    setActions(prev => prev.map(a => 
      a.id === actionId ? { ...a, status: 'VERIFIED', verifiedBy: 'Admin', verifiedDate: serverTimestamp() as any } : a
    ));
    alert('Corrective Action successfully verified and closed.');
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'OPEN': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold tracking-wider">OPEN</span>;
      case 'IN_PROGRESS': return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold tracking-wider">IN PROGRESS</span>;
      case 'SUBMITTED': return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold tracking-wider animate-pulse">PENDING VERIFICATION</span>;
      case 'VERIFIED': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold tracking-wider">VERIFIED</span>;
      case 'OVERDUE': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold tracking-wider animate-pulse">OVERDUE</span>;
      case 'CLOSED': return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold tracking-wider">CLOSED</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle className="w-7 h-7 text-primary" />
            Corrective Action Management
          </h1>
          <p className="text-slate-600">Track and verify organizational compliance remedies.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search actions..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64 text-sm"
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
        {['ALL', 'OPEN', 'SUBMITTED', 'OVERDUE', 'VERIFIED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-6 py-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
              filter === f ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {f === 'SUBMITTED' ? 'PENDING VERIFICATION' : f}
          </button>
        ))}
      </div>

      {/* ACTIONS LIST */}
      <div className="space-y-4">
        {filteredActions.map(action => (
          <div key={action.id} className={`bg-white rounded-xl shadow-sm border transition-all ${
            action.status === 'OVERDUE' ? 'border-red-300' : 'border-slate-200 hover:border-slate-300'
          }`}>
            <div className="p-5 flex flex-col md:flex-row gap-6">
              
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {action.id}
                    </span>
                    {getStatusBadge(action.status)}
                  </div>
                  
                  {action.status === 'OVERDUE' && (
                    <div className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded">
                      <AlertCircle className="w-4 h-4" /> Action Required Immediately
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{getOrgName(action.organizationId)}</h3>
                  <p className="text-sm text-slate-600 mt-1">{action.actionDescription}</p>
                </div>
                
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                    <Clock className="w-4 h-4" />
                    Due: 24 Hours Ago (Simulated)
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    Linked Finding: <span className="text-primary hover:underline cursor-pointer">{action.findingId}</span>
                  </div>
                </div>
              </div>

              {/* ACTION AREA */}
              <div className="md:w-64 shrink-0 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                {action.status === 'SUBMITTED' && (
                  <div className="space-y-3">
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-wider text-center mb-2">Verification Required</p>
                     {action.submittedEvidence && (
                       <button className="w-full py-2 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-sm flex items-center justify-center gap-2">
                         View Evidence
                       </button>
                     )}
                     {(userRole === 'SUPER_ADMIN' || userRole === 'INSPECTION_OFFICER') && (
                       <button 
                         onClick={() => handleVerify(action.id!)}
                         className="w-full py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm"
                       >
                         Approve & Verify
                       </button>
                     )}
                  </div>
                )}
                
                {action.status === 'OPEN' && (
                  <div className="text-center space-y-2">
                    <p className="text-xs text-slate-500">Awaiting organization submission.</p>
                    <button className="text-sm text-primary font-bold hover:underline">Send Reminder</button>
                  </div>
                )}

                {action.status === 'OVERDUE' && (
                  <div className="text-center space-y-3">
                    <button className="w-full py-2 bg-red-50 text-red-700 font-bold rounded-lg border border-red-200 hover:bg-red-100 transition-colors text-sm">
                      Issue Penalty Notice
                    </button>
                    <button className="text-sm text-primary font-bold hover:underline">Contact Organization</button>
                  </div>
                )}
                
                {action.status === 'VERIFIED' && (
                   <div className="text-center">
                     <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                     <p className="text-sm font-bold text-slate-700">Action Verified</p>
                     <p className="text-xs text-slate-500 mt-1">by {action.verifiedBy}</p>
                   </div>
                )}
              </div>

            </div>
          </div>
        ))}
        
        {filteredActions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-600">No Actions Found</h3>
            <p className="text-slate-500">You're all caught up with this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
