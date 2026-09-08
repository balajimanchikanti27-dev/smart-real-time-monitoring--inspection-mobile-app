import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ClipboardCheck, Search, Plus, ShieldAlert, 
  MapPin, CheckCircle2, Clock, AlertCircle, Calendar, 
  Check, X
} from 'lucide-react';
import { demoInspections, demoOrganizations, demoInspectors } from '../services/mockData';
import type { Inspection } from '../types';

export default function Inspections() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<Inspection[]>(demoInspections);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  // Schedule modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newInspection, setNewInspection] = useState({
    organizationId: demoOrganizations[0]?.id || 'GOV001',
    inspectorId: demoInspectors[0]?.inspectorId || 'INS001',
    type: 'ROUTINE' as const,
    scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16)
  });

  // Filtered Inspections
  const filteredInspections = inspections.filter(insp => {
    const org = demoOrganizations.find(o => o.id === insp.organizationId);
    const inspector = demoInspectors.find(i => i.inspectorId === insp.inspectorId);

    const matchesSearch = 
      insp.inspectionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org?.organizationName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inspector?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org?.state || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org?.district || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || insp.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || insp.type === typeFilter;
    const matchesRisk = riskFilter === 'ALL' || insp.riskLevelFound === riskFilter;

    return matchesSearch && matchesStatus && matchesType && matchesRisk;
  }).sort((a, b) => new Date(b.scheduledDate || 0).getTime() - new Date(a.scheduledDate || 0).getTime());

  // Metrics
  const totalCount = inspections.length;
  const completedCount = inspections.filter(i => i.status === 'COMPLETED').length;
  const inProgressCount = inspections.filter(i => i.status === 'IN_PROGRESS').length;
  const scheduledCount = inspections.filter(i => i.status === 'SCHEDULED').length;
  const overdueCount = inspections.filter(i => i.status === 'OVERDUE').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 mr-1" /> In Progress
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Calendar className="w-3 h-3 mr-1" /> Scheduled
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" /> Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const getRiskBadge = (risk?: string) => {
    switch (risk) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">LOW</span>;
      default:
        return <span className="text-slate-400 font-medium text-xs">-</span>;
    }
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Inspection = {
      inspectionId: `INSP-2026-${String(inspections.length + 1).padStart(3, '0')}`,
      type: newInspection.type,
      organizationId: newInspection.organizationId,
      inspectorId: newInspection.inspectorId,
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
      scheduledDate: new Date(newInspection.scheduledDate).toISOString(),
      riskLevelFound: 'LOW',
      overallScore: 0,
      issuesFound: 0,
      locationMatched: true,
      dataSourceType: 'DEMO'
    };

    setInspections([created, ...inspections]);
    setIsScheduleModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-primary" />
              National Field Inspections Register
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              {inspections.length} Total Records
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time compliance monitoring, surprise inspections dispatch, and audit verification.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/dashboard/inspections/surprise')}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            Surprise Inspection
          </button>
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule Inspection
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="nirikshan-panel-primary p-3.5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">All Inspections</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{totalCount}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">National Oversight</p>
        </div>

        <div className="nirikshan-panel p-3.5">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Completed</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{completedCount}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{Math.round((completedCount / totalCount) * 100)}% Pass / Certified</p>
        </div>

        <div className="nirikshan-panel p-3.5">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">In Progress</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{inProgressCount}</h3>
          <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Active in Field</p>
        </div>

        <div className="nirikshan-panel p-3.5">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Scheduled</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{scheduledCount}</h3>
          <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Queued Visits</p>
        </div>

        <div className="nirikshan-panel p-3.5">
          <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Overdue</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{overdueCount}</h3>
          <p className="text-[11px] text-red-600 font-semibold mt-0.5">Urgent Attention</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="nirikshan-panel p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, facility, officer, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary text-slate-700"
            >
              <option value="ALL">All Lifecycle Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary text-slate-700"
            >
              <option value="ALL">All Inspection Types</option>
              <option value="ROUTINE">Routine Scheduled</option>
              <option value="SURPRISE">Unannounced Surprise</option>
              <option value="RISK_BASED">Risk-Based AI Triggered</option>
              <option value="COMPLAINT_BASED">Complaint-Triggered</option>
              <option value="FOLLOW_UP">Follow-Up Verification</option>
            </select>
          </div>

          <div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-white border border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary text-slate-700"
            >
              <option value="ALL">All Risk Ratings</option>
              <option value="CRITICAL">Critical Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inspections Data Table */}
      <div className="nirikshan-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Inspection ID & Type</th>
                <th className="px-4 py-3">Facility / Organization</th>
                <th className="px-4 py-3">Assigned Inspector</th>
                <th className="px-4 py-3">Jurisdiction</th>
                <th className="px-4 py-3">Schedule Date</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Audit Score</th>
                <th className="px-4 py-3 text-center">Risk Level</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-xs">
              {filteredInspections.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    No inspections found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredInspections.map((insp) => {
                  const org = demoOrganizations.find(o => o.id === insp.organizationId);
                  const inspector = demoInspectors.find(i => i.inspectorId === insp.inspectorId);

                  return (
                    <tr key={insp.inspectionId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900">{insp.inspectionId}</span>
                        </div>
                        <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                          insp.type === 'SURPRISE' 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : insp.type === 'COMPLAINT_BASED'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : insp.type === 'RISK_BASED'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : insp.type === 'FOLLOW_UP'
                            ? 'bg-teal-100 text-teal-800 border border-teal-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {insp.type.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-bold text-slate-900 truncate">
                          {org?.organizationName || 'Government Facility'}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {insp.organizationId} • {org?.organizationType || 'ORGANIZATION'}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-100 text-[10px] font-bold flex items-center justify-center text-slate-700 border border-slate-300">
                            {inspector?.name ? inspector.name[0] : 'I'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 leading-none">{inspector?.name || 'Unassigned'}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{inspector?.employeeCode || 'CADRE'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{org?.district || 'Delhi'}, {org?.state || 'Delhi'}</span>
                        </div>
                        {insp.locationMatched && (
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                            <Check className="w-3 h-3" /> GPS Verified
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">
                          {insp.scheduledDate ? new Date(insp.scheduledDate).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {insp.completedAt ? `Completed: ${new Date(insp.completedAt).toLocaleDateString()}` : 'Pending Visit'}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(insp.status)}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {insp.status === 'COMPLETED' ? (
                          <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                            (insp.overallScore || 0) >= 80 ? 'bg-emerald-100 text-emerald-800' :
                            (insp.overallScore || 0) >= 60 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {Math.round(insp.overallScore || 0)}/100
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {getRiskBadge(insp.riskLevelFound)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Link
                            to={`/dashboard/inspections/${insp.inspectionId}/checklist`}
                            className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
                            title="Open Checklist"
                          >
                            Checklist
                          </Link>
                          <Link
                            to={`/dashboard/inspections/${insp.inspectionId}`}
                            className="px-2 py-1 text-xs font-semibold text-primary bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                            title="View Full Report"
                          >
                            Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Inspection Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="bg-primary px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-200" />
                Schedule Field Inspection
              </h3>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Facility / Organization</label>
                <select
                  value={newInspection.organizationId}
                  onChange={(e) => setNewInspection({...newInspection, organizationId: e.target.value})}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary text-xs"
                >
                  {demoOrganizations.map(o => (
                    <option key={o.id} value={o.id}>
                      [{o.organizationType}] {o.organizationName} ({o.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assigned Inspector / Officer</label>
                <select
                  value={newInspection.inspectorId}
                  onChange={(e) => setNewInspection({...newInspection, inspectorId: e.target.value})}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary text-xs"
                >
                  {demoInspectors.map(i => (
                    <option key={i.inspectorId} value={i.inspectorId}>
                      {i.name} ({i.employeeCode}) - {i.designation} [{i.department}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Inspection Protocol</label>
                  <select
                    value={newInspection.type}
                    onChange={(e) => setNewInspection({...newInspection, type: e.target.value as any})}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary text-xs"
                  >
                    <option value="ROUTINE">Routine Annual</option>
                    <option value="SURPRISE">Surprise Audit</option>
                    <option value="COMPLAINT">Complaint Redressal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newInspection.scheduledDate}
                    onChange={(e) => setNewInspection({...newInspection, scheduledDate: e.target.value})}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs"
                >
                  Issue Inspection Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
