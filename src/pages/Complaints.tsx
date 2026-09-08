import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MessageSquareWarning, Search, Plus, ShieldAlert, 
  CheckCircle2, Building2
} from 'lucide-react';
import { demoComplaints, demoOrganizations } from '../services/mockData';

export default function Complaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState(demoComplaints);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    organizationId: demoOrganizations[0]?.id || 'GOV001',
    category: 'FACILITY',
    priority: 'HIGH' as const,
    description: ''
  });

  const filteredComplaints = complaints.filter(c => {
    const org = demoOrganizations.find(o => o.id === c.organizationId);
    const matchesSearch = 
      c.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org?.organizationName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleRegisterComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      complaintId: `CMP-${(complaints.length + 1).toString().padStart(3, '0')}`,
      organizationId: newComplaint.organizationId,
      category: newComplaint.category,
      description: newComplaint.description || 'Public grievance registered via central portal.',
      status: 'OPEN' as const,
      priority: newComplaint.priority,
      submittedAt: new Date().toISOString(),
      dataSourceType: 'DEMO' as const
    };

    setComplaints([created, ...complaints]);
    setIsModalOpen(false);
    setNewComplaint({
      organizationId: demoOrganizations[0]?.id || 'GOV001',
      category: 'FACILITY',
      priority: 'HIGH',
      description: ''
    });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-white">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">LOW</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">INFO</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Open</span>;
      case 'UNDER_INVESTIGATION':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Under Investigation</span>;
      case 'ACTION_REQUIRED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 animate-pulse">Action Required</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Resolved</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">Closed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Grievance & Public Redressal Portal</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
              {complaints.length} Total Cases
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Track, investigate, and resolve public complaints, beneficiary grievances, and institutional whistle-blower reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Log New Grievance
          </button>
          <Link
            to="/dashboard/inspections/surprise"
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-2 transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" /> Trigger Surprise Inspection
          </Link>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Received</p>
          <p className="text-2xl font-black text-slate-800 mt-0.5">{complaints.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-xs">
          <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Critical Priority</p>
          <p className="text-2xl font-black text-red-700 mt-0.5">
            {complaints.filter(c => c.priority === 'CRITICAL').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Under Investigation</p>
          <p className="text-2xl font-black text-amber-700 mt-0.5">
            {complaints.filter(c => c.status === 'UNDER_INVESTIGATION' || c.status === 'ACTION_REQUIRED').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Resolved Cases</p>
          <p className="text-2xl font-black text-emerald-700 mt-0.5">
            {complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length}
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, organization, details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
            />
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-primary text-slate-700"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-primary text-slate-700"
            >
              <option value="ALL">All Lifecycle Statuses</option>
              <option value="OPEN">Open</option>
              <option value="UNDER_INVESTIGATION">Under Investigation</option>
              <option value="ACTION_REQUIRED">Action Required</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        {filteredComplaints.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No grievance cases found matching criteria.</p>
          </div>
        ) : (
          filteredComplaints.map(complaint => {
            const org = demoOrganizations.find(o => o.id === complaint.organizationId);

            return (
              <div
                key={complaint.complaintId}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{complaint.complaintId}</span>
                    {getPriorityBadge(complaint.priority)}
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 uppercase">
                      {complaint.category}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Logged: {new Date(complaint.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900">{complaint.description}</p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                    <span className="font-medium flex items-center gap-1 text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {org?.organizationName || complaint.organizationId}
                    </span>
                    <span>•</span>
                    <span>{org?.district || 'Delhi'}, {org?.state || 'Delhi'}</span>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-slate-500">Facility ID: {complaint.organizationId}</span>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {getStatusBadge(complaint.status)}

                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => navigate('/dashboard/inspections/surprise')}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg flex items-center gap-1 transition-colors shadow-xs"
                      title="Initiate surprise inspection for this facility"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" /> Dispatch Inspection
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Complaint Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="bg-primary px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5 text-amber-400" />
                Register Formal Grievance
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleRegisterComplaint} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Organization / Facility</label>
                <select
                  value={newComplaint.organizationId}
                  onChange={(e) => setNewComplaint({ ...newComplaint, organizationId: e.target.value })}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-primary"
                >
                  {demoOrganizations.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.organizationName} ({o.district}, {o.state})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grievance Category</label>
                  <select
                    value={newComplaint.category}
                    onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value })}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="FACILITY">Facility & Infrastructure</option>
                    <option value="FINANCIAL">Financial / DBT Withholding</option>
                    <option value="STAFFING">Staff Misconduct / Absence</option>
                    <option value="EQUIPMENT">Aids & Assistive Gear</option>
                    <option value="NUTRITION">Diet / Meal Quality</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assessed Priority</label>
                  <select
                    value={newComplaint.priority}
                    onChange={(e) => setNewComplaint({ ...newComplaint, priority: e.target.value as any })}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="CRITICAL">Critical (Immediate Audit)</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Grievance Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide precise details of violation, non-attendance, or beneficiary grievance..."
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-xs"
                >
                  Submit & Log Grievance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
