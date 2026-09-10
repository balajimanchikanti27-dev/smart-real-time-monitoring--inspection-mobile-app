import { useState } from 'react';
import { sendSmsNotification } from '../services/smsService';
import { useNavigate } from 'react-router-dom';
import { 
  UserSquare2, Search, Plus, ShieldCheck, 
  MapPin, CheckCircle2, Clock, AlertCircle, Phone, 
  Mail, Award, ExternalLink, X
} from 'lucide-react';
import { demoInspectors } from '../services/mockData';
import type { Inspector } from '../types';

export default function Inspectors() {
  const navigate = useNavigate();
  const [inspectors, setInspectors] = useState<Inspector[]>(demoInspectors);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [specializationFilter, setSpecializationFilter] = useState('ALL');
  
  // Modal states
  const [selectedInspector, setSelectedInspector] = useState<Inspector | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newOfficer, setNewOfficer] = useState({
    name: '',
    employeeCode: '',
    designation: 'Senior Inspector',
    department: 'DoSJE',
    state: 'Delhi',
    district: 'New Delhi',
    specialization: 'INFRASTRUCTURE',
    availabilityStatus: 'AVAILABLE' as const,
    mobileNumber: ''
  });

  // Filtered list
  const filteredInspectors = inspectors.filter(insp => {
    const matchesSearch = 
      insp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.designation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || insp.availabilityStatus === statusFilter;
    const matchesDept = departmentFilter === 'ALL' || insp.department === departmentFilter;
    const matchesSpec = specializationFilter === 'ALL' || insp.specialization.includes(specializationFilter);

    return matchesSearch && matchesStatus && matchesDept && matchesSpec;
  });

  // Metrics
  const totalOfficers = inspectors.length;
  const availableOfficers = inspectors.filter(i => i.availabilityStatus === 'AVAILABLE').length;
  const onInspectionOfficers = inspectors.filter(i => i.availabilityStatus === 'ON_INSPECTION').length;
  const assignedOfficers = inspectors.filter(i => i.availabilityStatus === 'ASSIGNED').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Available
          </span>
        );
      case 'ON_INSPECTION':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 mr-1" /> On Inspection
          </span>
        );
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <ShieldCheck className="w-3 h-3 mr-1" /> Assigned
          </span>
        );
      case 'UNAVAILABLE':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <AlertCircle className="w-3 h-3 mr-1" /> On Leave / Offline
          </span>
        );
    }
  };

  const handleAddOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficer.name || !newOfficer.employeeCode) return;

    const created: Inspector = {
      inspectorId: `INS${String(inspectors.length + 1).padStart(3, '0')}`,
      name: newOfficer.name,
      employeeCode: newOfficer.employeeCode,
      designation: newOfficer.designation,
      specialization: [newOfficer.specialization],
      availabilityStatus: newOfficer.availabilityStatus,
      department: newOfficer.department,
      state: newOfficer.state,
      district: newOfficer.district,
      assignedInspectionCount: 0,
      dataSourceType: 'DEMO'
    };

    setInspectors([created, ...inspectors]);
    setIsAddModalOpen(false);
    
    // Trigger SMS
    if (newOfficer.mobileNumber) {
      sendSmsNotification({
        moduleType: 'Inspector',
        recordName: newOfficer.name,
        recordId: created.inspectorId,
        mobileNumber: newOfficer.mobileNumber
      }).then(smsResult => {
        if (smsResult.success) {
          const masked = newOfficer.mobileNumber.replace(/.(?=.{4})/g, '*');
          alert(`Inspector added successfully. SMS sent to ${masked}.`);
        } else {
          alert(`Inspector added successfully, but SMS could not be sent.`);
        }
      });
    } else {
      alert(`Inspector added successfully.`);
    }

    setNewOfficer({
      name: '',
      employeeCode: '',
      designation: 'Senior Inspector',
      department: 'DoSJE',
      state: 'Delhi',
      district: 'New Delhi',
      specialization: 'INFRASTRUCTURE',
      availabilityStatus: 'AVAILABLE',
      mobileNumber: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">National Inspector Cadre</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              MoSJE Official Cadre
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Empanelled field officers, lead inspectors, and auditors for national compliance oversight.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/dashboard/inspections/surprise')}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Smart Dispatch
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Register Officer
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="nirikshan-panel-primary">
          <div className="nirikshan-panel-body p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Officers</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalOfficers}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 text-primary rounded border border-blue-200">
              <UserSquare2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="nirikshan-panel">
          <div className="nirikshan-panel-body p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Available on Duty</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{availableOfficers}</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="nirikshan-panel">
          <div className="nirikshan-panel-body p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">In Field Inspection</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{onInspectionOfficers}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded border border-amber-200">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="nirikshan-panel">
          <div className="nirikshan-panel-body p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Assigned / Queued</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{assignedOfficers}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded border border-blue-200">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="nirikshan-panel p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, code, state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-sm bg-white border border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Availability Statuses</option>
              <option value="AVAILABLE">Available for Assignment</option>
              <option value="ON_INSPECTION">Currently on Inspection</option>
              <option value="ASSIGNED">Assigned / Scheduled</option>
              <option value="UNAVAILABLE">Unavailable / On Leave</option>
            </select>
          </div>

          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-sm bg-white border border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Departments</option>
              <option value="DoSJE">DoSJE (Central Ministry)</option>
              <option value="State Govt">State Government Cadre</option>
              <option value="Independent Auditor">Independent Certified Auditor</option>
            </select>
          </div>

          <div>
            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-sm bg-white border border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Specializations</option>
              <option value="INFRASTRUCTURE">Infrastructure & Civil</option>
              <option value="SERVICES">Services & Care Quality</option>
              <option value="FINANCIAL_SUPPORT">Financial & Grants Audit</option>
              <option value="REHABILITATION">Rehabilitation & Therapy</option>
              <option value="TRAINING">Vocational & Training</option>
              <option value="AWARENESS">Outreach & Rights</option>
            </select>
          </div>
        </div>
      </div>

      {/* Officers Table */}
      <div className="nirikshan-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Officer Details</th>
                <th className="px-4 py-3">Department & Cadre</th>
                <th className="px-4 py-3">Specialization</th>
                <th className="px-4 py-3">Jurisdiction</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Assigned Visits</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredInspectors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No inspectors found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInspectors.map((insp) => (
                  <tr key={insp.inspectorId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700 uppercase">
                          {insp.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{insp.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{insp.employeeCode} • {insp.designation}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${
                        insp.department === 'DoSJE' 
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : insp.department === 'State Govt'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {insp.department}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {insp.specialization.map((spec: string) => (
                          <span key={spec} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[11px] font-medium">
                            {spec.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center text-xs text-slate-600 gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{insp.district}, {insp.state}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {getStatusBadge(insp.availabilityStatus)}
                    </td>

                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-700">
                      {insp.assignedInspectionCount}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInspector(insp)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => navigate('/dashboard/inspections/surprise')}
                          className="px-2.5 py-1 text-xs font-medium text-primary bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                        >
                          Assign
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspector Profile Modal */}
      {selectedInspector && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="bg-primary px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                  {selectedInspector.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedInspector.name}</h3>
                  <p className="text-xs text-blue-100 font-mono">{selectedInspector.employeeCode} • {selectedInspector.designation}</p>
                </div>
              </div>
              <button onClick={() => setSelectedInspector(null)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Department</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedInspector.department}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Current Status</p>
                  <div className="mt-0.5">{getStatusBadge(selectedInspector.availabilityStatus)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Base Location</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedInspector.district}, {selectedInspector.state}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Total Field Audits</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedInspector.assignedInspectionCount} Completed</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1.5">Domain Specializations</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedInspector.specialization.map((s: string) => (
                    <span key={s} className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded text-xs font-semibold">
                      {s.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> official@mosje.gov.in</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> +91 (011) 2338-XXXX</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedInspector(null);
                    navigate('/dashboard/inspections/surprise');
                  }}
                  className="btn-primary text-xs flex items-center gap-1"
                >
                  Dispatch Officer <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register New Officer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <UserSquare2 className="w-4 h-4 text-primary-light" />
                Register New Inspector / Field Officer
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddOfficer} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Verma"
                  value={newOfficer.name}
                  onChange={(e) => setNewOfficer({...newOfficer, name: e.target.value})}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Employee Code</label>
                  <input
                    type="text"
                    required
                    placeholder="EMP-016"
                    value={newOfficer.employeeCode}
                    onChange={(e) => setNewOfficer({...newOfficer, employeeCode: e.target.value})}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={newOfficer.mobileNumber}
                    onChange={(e) => setNewOfficer({...newOfficer, mobileNumber: e.target.value})}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Designation</label>
                  <select
                    value={newOfficer.designation}
                    onChange={(e) => setNewOfficer({...newOfficer, designation: e.target.value})}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Senior Inspector">Senior Inspector</option>
                    <option value="Field Officer">Field Officer</option>
                    <option value="Lead Inspector">Lead Inspector</option>
                    <option value="Auditor">Auditor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department</label>
                  <select
                    value={newOfficer.department}
                    onChange={(e) => setNewOfficer({...newOfficer, department: e.target.value})}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="DoSJE">DoSJE</option>
                    <option value="State Govt">State Govt</option>
                    <option value="Independent Auditor">Independent Auditor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Specialization</label>
                  <select
                    value={newOfficer.specialization}
                    onChange={(e) => setNewOfficer({...newOfficer, specialization: e.target.value})}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="INFRASTRUCTURE">Infrastructure</option>
                    <option value="SERVICES">Services</option>
                    <option value="FINANCIAL_SUPPORT">Financial Support</option>
                    <option value="REHABILITATION">Rehabilitation</option>
                    <option value="TRAINING">Training</option>
                    <option value="AWARENESS">Awareness</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newOfficer.state}
                    onChange={(e) => setNewOfficer({...newOfficer, state: e.target.value})}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={newOfficer.district}
                    onChange={(e) => setNewOfficer({...newOfficer, district: e.target.value})}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs"
                >
                  Save & Empanel Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
