import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, CheckCircle2, 
  ArrowUpRight, Building2, Eye
} from 'lucide-react';
import { demoFindings, demoOrganizations, demoInspections } from '../services/mockData';

export default function Findings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredFindings = demoFindings.filter(f => {
    const org = demoOrganizations.find(o => o.id === f.organizationId);
    const matchesSearch = 
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org?.organizationName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || f.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || f.category === categoryFilter;

    return matchesSearch && matchesSeverity && matchesStatus && matchesCategory;
  });

  const totalCount = demoFindings.length;
  const criticalCount = demoFindings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = demoFindings.filter(f => f.severity === 'HIGH').length;
  const openCount = demoFindings.filter(f => f.status === 'OPEN').length;
  const resolvedCount = demoFindings.filter(f => f.status === 'RESOLVED').length;

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Findings & Non-Compliances Register</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {totalCount} Total Detected
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Central repository of non-compliances, physical deficiencies, and statutory breaches identified during field inspections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/corrective-actions"
            className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg flex items-center gap-2 transition-colors shadow-xs"
          >
            Corrective Action Portal <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Findings</p>
          <p className="text-xl font-black text-slate-800 mt-0.5">{totalCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-red-200 bg-red-50/20 shadow-xs">
          <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Critical Breaches</p>
          <p className="text-xl font-black text-red-700 mt-0.5">{criticalCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">High Severity</p>
          <p className="text-xl font-black text-amber-700 mt-0.5">{highCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Active Open</p>
          <p className="text-xl font-black text-blue-700 mt-0.5">{openCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Rectified</p>
          <p className="text-xl font-black text-emerald-700 mt-0.5">{resolvedCount}</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search finding, facility, keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
            />
          </div>

          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-primary text-slate-700"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-primary text-slate-700"
            >
              <option value="ALL">All Categories</option>
              <option value="Staffing">Staffing & Attendance</option>
              <option value="Safety">Safety & Hygiene</option>
              <option value="Infrastructure">Infrastructure & Accessibility</option>
              <option value="Beneficiaries">Beneficiary Verification</option>
              <option value="Finance">Financial Records</option>
              <option value="Records">Registers & Documentation</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-primary text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Active Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved / Verified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Findings Data Cards */}
      <div className="space-y-3">
        {filteredFindings.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No findings matched your criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the filters or modifying your search keywords.</p>
          </div>
        ) : (
          filteredFindings.map(finding => {
            const org = demoOrganizations.find(o => o.id === finding.organizationId);
            const insp = demoInspections.find(i => i.inspectionId === finding.inspectionId);

            return (
              <div
                key={finding.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{finding.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wide ${
                      finding.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                      finding.severity === 'HIGH' ? 'bg-amber-500 text-white' :
                      finding.severity === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {finding.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                      {finding.category}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Reported: {finding.reportedDate || '2024-03-15'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{finding.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{finding.description}</p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                    <span className="font-medium flex items-center gap-1 text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {org?.organizationName || finding.organizationId}
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">District: {org?.district || 'Delhi'}</span>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-primary">Inspection: {finding.inspectionId}</span>
                  </div>

                  {finding.actionRequired && (
                    <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded border border-slate-100 text-slate-700">
                      <span className="font-bold text-slate-800">Action Required: </span>
                      {finding.actionRequired}
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    finding.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                    finding.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {finding.status}
                  </span>

                  <div className="flex items-center gap-2">
                    {insp && (
                      <Link
                        to={`/dashboard/inspections/${finding.inspectionId}`}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspection
                      </Link>
                    )}
                    <Link
                      to="/dashboard/corrective-actions"
                      className="px-3 py-1.5 text-xs font-semibold text-primary bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      Remedy <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
