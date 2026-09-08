import { useState } from 'react';
import { FileText, Printer, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import { demoInspections, demoOrganizations, demoInspectors } from '../services/mockData';

export default function Reports() {
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);

  const completedInspections = demoInspections.filter(i => i.status === 'REPORT_SUBMITTED' || i.status === 'REVIEW' || i.status === 'COMPLETED');

  const selectedInspection = completedInspections.find(i => i.inspectionId === selectedInspectionId);
  const organization = selectedInspection ? demoOrganizations.find(o => o.id === selectedInspection.organizationId) : null;
  const inspector = selectedInspection ? demoInspectors.find(i => i.inspectorId === selectedInspection.inspectorId) : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col md:flex-row h-full gap-6">
      
      {/* LEFT PANE: Inspection List (Hidden on Print) */}
      <div className="w-full md:w-80 flex-shrink-0 flex flex-col gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-7 h-7 text-primary" />
            Inspection Reports
          </h1>
          <p className="text-sm text-slate-600 mt-1">Select a completed inspection to view its official report.</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex-1 flex flex-col">
          <div className="bg-slate-50 p-3 border-b border-slate-200 font-bold text-sm text-slate-700">
            Completed Inspections
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
            {completedInspections.map(insp => {
              const org = demoOrganizations.find(o => o.id === insp.organizationId);
              return (
                <button
                  key={insp.inspectionId}
                  onClick={() => setSelectedInspectionId(insp.inspectionId)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedInspectionId === insp.inspectionId 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold text-slate-800 text-sm line-clamp-1">
                    {org?.organizationName || insp.organizationId}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-slate-500 font-mono">{insp.inspectionId}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      insp.overallScore && insp.overallScore >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {insp.overallScore ? Math.round(insp.overallScore) : 0}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Report View */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col print:border-none print:shadow-none">
        {selectedInspection ? (
          <>
            {/* Toolbar (Hidden on Print) */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center print:hidden">
              <h2 className="font-bold text-slate-700">Report Preview</h2>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button onClick={handlePrint} className="btn-primary py-1.5 px-3 text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>
            </div>

            {/* A4 Report Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar print:p-0 print:overflow-visible">
              <div className="max-w-4xl mx-auto space-y-8 print:w-full">
                
                {/* Official Letterhead */}
                <div className="border-b-4 border-primary pb-6 text-center">
                  <div className="flex justify-center mb-4">
                     <img src="/logo.png" alt="NIRIKSHAN" className="h-16" />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-wider">NIRIKSHAN</h1>
                  <h2 className="text-xl font-bold text-slate-700 mt-1 uppercase tracking-widest">Official Inspection Report</h2>
                  <p className="text-slate-500 text-sm mt-2">Ministry of Social Justice and Empowerment</p>
                </div>

                {/* Report Metadata */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Inspection Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-3 gap-2"><span className="font-semibold text-slate-600 col-span-1">Report ID:</span> <span className="font-mono text-slate-900 col-span-2">{selectedInspection.inspectionId}</span></div>
                      <div className="grid grid-cols-3 gap-2"><span className="font-semibold text-slate-600 col-span-1">Type:</span> <span className="text-slate-900 col-span-2 font-semibold uppercase">{selectedInspection.type}</span></div>
                      <div className="grid grid-cols-3 gap-2"><span className="font-semibold text-slate-600 col-span-1">Date:</span> <span className="text-slate-900 col-span-2">{new Date(selectedInspection.createdAt as any).toLocaleDateString()}</span></div>
                      <div className="grid grid-cols-3 gap-2"><span className="font-semibold text-slate-600 col-span-1">Final Status:</span> <span className="text-slate-900 col-span-2 font-bold uppercase">{selectedInspection.status}</span></div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Entity Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-3 gap-2"><span className="font-semibold text-slate-600 col-span-1">Organization:</span> <span className="text-slate-900 font-bold col-span-2">{organization?.organizationName}</span></div>
                      <div className="grid grid-cols-3 gap-2"><span className="font-semibold text-slate-600 col-span-1">District/State:</span> <span className="text-slate-900 col-span-2">{organization?.district}, {organization?.state}</span></div>
                      <div className="grid grid-cols-3 gap-2"><span className="font-semibold text-slate-600 col-span-1">Inspector:</span> <span className="text-slate-900 col-span-2">{inspector?.name}</span></div>
                    </div>
                  </div>
                </div>

                {/* Compliance Score Block */}
                <div className={`p-6 rounded-lg border-2 flex items-center justify-between ${
                  selectedInspection.overallScore && selectedInspection.overallScore >= 75 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}>
                   <div>
                     <h3 className={`text-lg font-bold ${
                       selectedInspection.overallScore && selectedInspection.overallScore >= 75 ? 'text-green-800' : 'text-red-800'
                     }`}>
                       Final Compliance Score
                     </h3>
                     <p className={`text-sm mt-1 ${
                       selectedInspection.overallScore && selectedInspection.overallScore >= 75 ? 'text-green-600' : 'text-red-600'
                     }`}>
                       Based on mandatory checklist criteria.
                     </p>
                   </div>
                   <div className={`text-4xl font-black ${
                       selectedInspection.overallScore && selectedInspection.overallScore >= 75 ? 'text-green-700' : 'text-red-700'
                     }`}>
                     {selectedInspection.overallScore ? Math.round(selectedInspection.overallScore) : 0}%
                   </div>
                </div>

                {/* Findings & Corrective Actions */}
                <div>
                   <h3 className="text-lg font-bold text-slate-800 border-b-2 border-slate-200 pb-2 mb-4 flex items-center gap-2">
                     <AlertTriangle className="w-5 h-5 text-red-500" /> Key Findings & Remediation
                   </h3>
                   
                   {/* We will mock a few findings based on the compliance score for the prototype */}
                   {selectedInspection.overallScore && selectedInspection.overallScore < 100 ? (
                     <div className="space-y-4">
                       <div className="p-4 border border-slate-200 rounded-lg">
                         <div className="flex justify-between items-start mb-2">
                           <h4 className="font-bold text-slate-800">Safety Compliance Deficiency</h4>
                           <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200">CRITICAL</span>
                         </div>
                         <p className="text-sm text-slate-600 mb-3">Fire safety equipment found expired in main facility block.</p>
                         <div className="bg-slate-50 p-3 rounded border border-slate-100 text-sm">
                           <span className="font-bold text-slate-700 text-xs uppercase tracking-wider block mb-1">Corrective Action Issued</span>
                           Replace all expired fire extinguishers within 48 hours and submit photographic evidence (Ref: CA-001).
                         </div>
                       </div>
                       
                       <div className="p-4 border border-slate-200 rounded-lg">
                         <div className="flex justify-between items-start mb-2">
                           <h4 className="font-bold text-slate-800">Documentation Gap</h4>
                           <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">MEDIUM</span>
                         </div>
                         <p className="text-sm text-slate-600 mb-3">Beneficiary register signatures missing for current month.</p>
                         <div className="bg-slate-50 p-3 rounded border border-slate-100 text-sm">
                           <span className="font-bold text-slate-700 text-xs uppercase tracking-wider block mb-1">Corrective Action Issued</span>
                           Submit signed registers to district nodal officer (Ref: CA-002).
                         </div>
                       </div>
                     </div>
                   ) : (
                     <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg text-center">
                       <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                       <p className="font-bold text-slate-700">No Critical Findings</p>
                       <p className="text-sm text-slate-500">Institution is operating in full compliance.</p>
                     </div>
                   )}
                </div>

                {/* Signatures */}
                <div className="pt-16 pb-8 grid grid-cols-2 gap-12">
                   <div className="text-center border-t border-slate-300 pt-4">
                     <p className="font-bold text-slate-800">{inspector?.name}</p>
                     <p className="text-xs text-slate-500">Inspecting Officer Signature</p>
                   </div>
                   <div className="text-center border-t border-slate-300 pt-4">
                      <p><span className="text-xs font-bold text-slate-500 uppercase">Contact:</span> {(organization as any)?.contactPerson || 'N/A'}</p>
                     <p className="text-xs text-slate-500">Organization Representative</p>
                   </div>
                </div>
                
                {/* Footer */}
                <div className="text-center pt-8 border-t border-slate-200 text-xs text-slate-400">
                  <p>Generated by NIRIKSHAN System • {new Date().toLocaleString()}</p>
                  <p className="mt-1">This is an electronically generated official document.</p>
                </div>

              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 print:hidden">
            <FileText className="w-16 h-16 text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No Report Selected</h3>
            <p className="mt-1">Select an inspection from the list to view its report.</p>
          </div>
        )}
      </div>
    </div>
  );
}
