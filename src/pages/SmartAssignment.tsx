import { useState } from 'react';
import { demoOrganizations, demoInspectors } from '../services/mockData';
import { Zap, MapPin, Briefcase, Calculator, CheckCircle2 } from 'lucide-react';

const SmartAssignment = () => {
  const criticalOrgs = demoOrganizations.filter(o => o.riskLevel === 'CRITICAL' || o.riskLevel === 'HIGH');
  const [selectedOrgId, setSelectedOrgId] = useState(criticalOrgs[0]?.id || demoOrganizations[0].id);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedInspector, setAssignedInspector] = useState<string | null>(null);

  const targetOrg = demoOrganizations.find(i => i.id === selectedOrgId);

  const handleSmartAssign = () => {
    setIsAssigning(true);
    // Simulate backend algorithm:
    // 1. High/Critical organizations -> Priority pool
    // 2. Randomized selection
    // 3. Geographical matching
    // 4. Conflict of interest check
    setTimeout(() => {
      const eligible = demoInspectors.filter(i => i.availabilityStatus === 'AVAILABLE' && i.state === targetOrg?.state);
      if(eligible.length > 0) {
        setAssignedInspector(eligible[0].inspectorId);
      }
      setIsAssigning(false);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">Risk-Based Smart Assignment Engine</h1>
        <p className="text-sm text-gray-500 mt-1">Algorithmically dispatch inspectors for surprise visits based on calculated risk models, availability, and geographical matching.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Assignment Config */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center"><Calculator className="w-5 h-5 mr-2 text-accent"/> 1. Target Selection & Risk Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Priority Organization</label>
                <select 
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-accent focus:border-accent"
                  value={selectedOrgId}
                  onChange={(e) => {setSelectedOrgId(e.target.value); setAssignedInspector(null);}}
                >
                  {demoOrganizations.map(org => (
                    <option key={org.id} value={org.id}>{org.organizationName} - Risk: {org.riskLevel}</option>
                  ))}
                </select>
              </div>
              
              {targetOrg && (
                <div className="bg-gray-50 border p-4 rounded-md text-sm text-gray-700 grid grid-cols-2 gap-4">
                  <div className="space-y-2 border-r pr-4">
                    <p className="font-semibold border-b pb-1 mb-2">Live Risk Calculation (100pt scale)</p>
                    <div className="flex justify-between"><span>Previous Violations (30% weight):</span> <strong>{targetOrg.previousViolations * 10} pts</strong></div>
                    <div className="flex justify-between"><span>Inspection Delay (20% weight):</span> <strong>{targetOrg.inspectionDelayDays > 30 ? 20 : 0} pts</strong></div>
                    <div className="flex justify-between"><span>Complaints (10% weight):</span> <strong>{targetOrg.complaintsCount * 5} pts</strong></div>
                    <div className="flex justify-between"><span>CCTV Anomalies (10% weight):</span> <strong>{targetOrg.cctvAnomalies * 5} pts</strong></div>
                    <div className="flex justify-between"><span>Financial Flags (20% weight):</span> <strong>{targetOrg.financialIrregularityFlags * 20} pts</strong></div>
                  </div>
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <span className="text-gray-500 uppercase text-xs font-bold tracking-wider">Calculated Risk Score</span>
                    <span className={`text-4xl font-bold ${targetOrg.riskLevel === 'CRITICAL' ? 'text-semantic-critical' : targetOrg.riskLevel === 'HIGH' ? 'text-semantic-warning' : 'text-semantic-success'}`}>
                      {targetOrg.riskScore}
                    </span>
                    <span className={`px-2 py-1 text-xs font-bold rounded text-white ${targetOrg.riskLevel === 'CRITICAL' ? 'bg-semantic-critical' : targetOrg.riskLevel === 'HIGH' ? 'bg-semantic-warning' : 'bg-semantic-success'}`}>
                      {targetOrg.riskLevel} RISK
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center"><Zap className="w-5 h-5 mr-2 text-accent"/> 2. Engine Execution</h2>
            <p className="text-sm text-gray-600 mb-6">
              The engine filters the priority pool, performs randomized selection among eligible candidates, matches geographical regions, and ensures strict conflict-of-interest isolation.
            </p>
            
            {assignedInspector ? (
              <div className="bg-semantic-success/10 border border-semantic-success text-semantic-success-dark p-5 rounded-md flex items-center justify-between">
                <div>
                  <h3 className="font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Assignment Dispatched Securely</h3>
                  <p className="text-sm mt-1">Official <strong>{demoInspectors.find(i=>i.inspectorId === assignedInspector)?.name}</strong> ({demoInspectors.find(i=>i.inspectorId === assignedInspector)?.employeeCode}) has received encrypted field orders.</p>
                </div>
                <button 
                  onClick={() => setAssignedInspector(null)}
                  className="px-4 py-2 bg-white rounded-md text-sm font-semibold border shadow-sm hover:bg-gray-50"
                >Reset Engine</button>
              </div>
            ) : (
              <button 
                onClick={handleSmartAssign}
                disabled={isAssigning}
                className="btn-primary w-full flex justify-center items-center gap-2 py-3 text-base shadow-lg"
              >
                {isAssigning ? (
                  <span className="animate-pulse">Running MoSJE dispatch algorithms...</span>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-accent" />
                    Execute Secure Random Assignment
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Real-time Eligible Inspectors Panel */}
        <div className="card p-6 h-fit">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Eligible Official Pool</h2>
          <div className="space-y-3">
            {demoInspectors.map(inspector => {
              const isEligible = inspector.availabilityStatus === 'AVAILABLE' && inspector.state === targetOrg?.state;
              return (
                <div key={inspector.inspectorId} className={`p-3 rounded-md border text-sm ${isEligible ? 'bg-white border-green-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="font-semibold block">{inspector.name}</span>
                      <span className="text-xs text-gray-500">{inspector.designation}</span>
                    </div>
                    <span className={`badge text-[10px] ${inspector.availabilityStatus === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {inspector.availabilityStatus}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-3 mt-3 border-t pt-2">
                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1"/>{inspector.district}</span>
                    <span className="flex items-center"><Briefcase className="w-3 h-3 mr-1"/>Load: {inspector.assignedInspectionCount}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SmartAssignment;
