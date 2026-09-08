import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Save, Info } from 'lucide-react';
import { calculateCompliance, type ComplianceResult } from '../utils/complianceCalculator';
import type { InspectionChecklist, InspectionFinding } from '../types/firestore';
import { serverTimestamp, Timestamp } from 'firebase/firestore';

// Mock initial checklist data for the prototype
const initialChecklist: InspectionChecklist[] = [
  {
    id: '1',
    inspectionId: '1',
    category: 'General',
    question: 'Are all required documents maintained properly?',
    response: 'PASS',
    applicable: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: '2',
    inspectionId: '1',
    category: 'Safety',
    question: 'Are fire extinguishers accessible?',
    response: 'FAIL',
    applicable: true,
    remarks: 'One extinguisher was blocked by boxes',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
];

export default function InspectionChecklistPage() {
  const { id: inspectionId } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState<InspectionChecklist[]>(initialChecklist);
  const [findings, setFindings] = useState<InspectionFinding[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('General');
  
  // Memoized compliance calculation
  const compliance: ComplianceResult = useMemo(() => calculateCompliance(items, findings), [items, findings]);

  const categories = Array.from(new Set(items.map(i => i.category)));

  const handleUpdateStatus = (itemId: string, response: 'PASS' | 'FAIL' | 'NOT_APPLICABLE' | 'PENDING') => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, response };
      }
      return item;
    }));
    
    // In a real app, debounce and save to Firestore here
  };

  const handleUpdateRemarks = (itemId: string, remarks: string) => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, remarks } : item));
  };

  const handleUpdateSeverity = (itemId: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
    // We don't store severity on checklist items anymore, just manage it in findings
    
    // Automatically generate/update a finding if marked critical
    if (severity === 'CRITICAL') {
      const item = items.find(i => i.id === itemId);
      if (item && !findings.some(f => f.id === `find-${itemId}`)) {
        setFindings(prev => [...prev, {
          id: `find-${itemId}`,
          inspectionId: inspectionId || '',
          category: item.category,
          title: `Failed: ${item.question.substring(0, 20)}...`,
          description: item.remarks || '',
          severity: 'CRITICAL',
          status: 'OPEN',
          createdAt: serverTimestamp() as any,
          updatedAt: serverTimestamp() as any
        }]);
      }
    } else {
      // Remove finding if severity downgraded (simplified logic for prototype)
      setFindings(prev => prev.filter(f => f.id !== `find-${itemId}`));
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* HEADER */}
      <div className="bg-primary text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/inspector')} className="p-1 hover:bg-primary-light rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="font-bold text-lg leading-tight">Inspection Checklist</h1>
            <p className="text-primary-100 text-xs">{inspectionId || 'Unknown Inspection'}</p>
          </div>
        </div>

        {/* PROGRESS INDICATOR */}
        <div className="bg-white/10 rounded-xl p-3">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-xs text-primary-100">Completion</p>
              <p className="font-bold text-xl">{Math.round((compliance.completed / compliance.total) * 100)}%</p>
            </div>
            <div className="text-right">
               <p className="text-xs text-primary-100">Live Score</p>
               <div className={`font-bold text-lg px-2 py-0.5 rounded ${compliance.bgClass} ${compliance.colorClass}`}>
                 {compliance.score}%
               </div>
            </div>
          </div>
          <div className="w-full bg-primary-dark/50 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-accent h-full transition-all duration-500 ease-out" 
              style={{ width: `${(compliance.completed / compliance.total) * 100}%` }}
            ></div>
          </div>
          
          {/* CRITICAL ALERT OVERRIDE */}
          {compliance.hasCriticalFinding && (
            <div className="mt-3 bg-red-500/20 text-red-100 border border-red-500/50 rounded p-2 text-xs flex items-center gap-2 font-bold animate-pulse">
              <AlertCircle className="w-4 h-4" />
              {compliance.alertMessage}
            </div>
          )}
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="flex overflow-x-auto gap-2 p-4 no-scrollbar border-b border-slate-200 bg-white">
         <div className="flex flex-col items-center min-w-[70px] p-2 bg-slate-50 rounded-lg border border-slate-100">
           <span className="text-lg font-bold text-slate-700">{compliance.total}</span>
           <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total</span>
         </div>
         <div className="flex flex-col items-center min-w-[70px] p-2 bg-blue-50 rounded-lg border border-blue-100">
           <span className="text-lg font-bold text-blue-700">{compliance.applicable}</span>
           <span className="text-[10px] text-blue-500 uppercase tracking-wider font-semibold">Applicable</span>
         </div>
         <div className="flex flex-col items-center min-w-[70px] p-2 bg-green-50 rounded-lg border border-green-100">
           <span className="text-lg font-bold text-green-700">{compliance.passed}</span>
           <span className="text-[10px] text-green-500 uppercase tracking-wider font-semibold">Passed</span>
         </div>
         <div className="flex flex-col items-center min-w-[70px] p-2 bg-red-50 rounded-lg border border-red-100">
           <span className="text-lg font-bold text-red-700">{compliance.failed}</span>
           <span className="text-[10px] text-red-500 uppercase tracking-wider font-semibold">Failed</span>
         </div>
         <div className="flex flex-col items-center min-w-[70px] p-2 bg-slate-100 rounded-lg border border-slate-200">
           <span className="text-lg font-bold text-slate-600">{compliance.remaining}</span>
           <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Remaining</span>
         </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex overflow-x-auto p-4 gap-2 no-scrollbar">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
              activeCategory === cat 
                ? 'bg-slate-800 text-white' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* QUESTIONS LIST */}
      <div className="p-4 space-y-4">
        {items.filter(i => i.category === activeCategory).map(item => (
          <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 transition-all focus-within:ring-2 focus-within:ring-primary/20">
            <h3 className="font-semibold text-slate-800 mb-4">{item.question}</h3>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button 
                onClick={() => handleUpdateStatus(item.id!, 'PASS')}
                className={`py-3 rounded-lg flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                  item.response === 'PASS' 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="text-xs font-bold">PASS</span>
              </button>
              
              <button 
                onClick={() => handleUpdateStatus(item.id!, 'FAIL')}
                className={`py-3 rounded-lg flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                  item.response === 'FAIL' 
                    ? 'border-red-500 bg-red-50 text-red-700' 
                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300'
                }`}
              >
                <XCircle className="w-5 h-5" />
                <span className="text-xs font-bold">FAIL</span>
              </button>

              <button 
                onClick={() => handleUpdateStatus(item.id!, 'NOT_APPLICABLE')}
                className={`py-3 rounded-lg flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                  item.response === 'NOT_APPLICABLE' 
                    ? 'border-slate-400 bg-slate-200 text-slate-800' 
                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300'
                }`}
              >
                <Info className="w-5 h-5" />
                <span className="text-xs font-bold">N/A</span>
              </button>
            </div>

            {/* EXPANDABLE SECTIONS IF FAILED */}
            {item.response === 'FAIL' && (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                 <div>
                   <label className="block text-xs font-bold text-slate-600 mb-1">Severity Required</label>
                   <select 
                     value={findings.find(f => f.id === `find-${item.id}`)?.severity || ''} 
                     onChange={(e) => handleUpdateSeverity(item.id!, e.target.value as any)}
                     className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                   >
                     <option value="" disabled>Select Severity...</option>
                     <option value="LOW">Low</option>
                     <option value="MEDIUM">Medium</option>
                     <option value="HIGH">High</option>
                     <option value="CRITICAL">CRITICAL</option>
                   </select>
                 </div>
              </div>
            )}
            
            {/* NOTES: Always available if not PENDING */}
            {item.response !== 'PENDING' && (
              <div className="mt-3 animate-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Inspector Notes {item.response === 'FAIL' && <span className="text-red-500">*</span>}
                </label>
                <textarea 
                  placeholder="Enter detailed observation..."
                  value={item.remarks || ''}
                  onChange={(e) => handleUpdateRemarks(item.id!, e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all min-h-[80px]"
                ></textarea>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FLOATING AUTOSAVE / SUBMIT STATUS */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 pb-safe flex justify-between items-center z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
         <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
           <Save className="w-4 h-4 text-emerald-600" />
           Autosaved to NIRIKSHAN cloud
         </div>
         <div className="flex items-center gap-2">
           <button
             onClick={() => navigate(`/dashboard/inspections/${inspectionId || 'INSP-2024-001'}`)}
             className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
           >
             Save Draft & Exit
           </button>
           <button 
             onClick={() => {
               alert('Inspection verification submitted successfully! Report generated.');
               navigate(`/dashboard/inspections/${inspectionId || 'INSP-2024-001'}`);
             }}
             className="px-6 py-2 rounded-lg font-bold text-xs text-white bg-primary hover:bg-primary-dark transition-all shadow-xs"
           >
             Submit & View Report
           </button>
         </div>
      </div>

    </div>
  );
}
