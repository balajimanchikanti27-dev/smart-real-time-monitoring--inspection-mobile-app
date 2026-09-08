import { useState } from 'react';
import { Fingerprint, Search, Filter, ShieldAlert, User, FileText } from 'lucide-react';

type AuditLogMock = {
  id: string;
  user: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  timestamp: string;
};

// Creating highly realistic mock audit logs matching system behavior
const demoAuditLogs: AuditLogMock[] = [
  { id: 'AL-1001', user: 'admin@mojse.gov.in', role: 'SUPER_ADMIN', action: 'LOGIN', entity: 'System', entityId: '-', description: 'Successful login via OTP.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: 'AL-1002', user: 'admin@mojse.gov.in', role: 'SUPER_ADMIN', action: 'ASSIGN_INSPECTOR', entity: 'Inspection', entityId: 'INSP-4029', description: 'Assigned inspector INS001 to GOV001 surprise inspection.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 'AL-1003', user: 'inspector_rao@mojse.gov.in', role: 'INSPECTOR', action: 'ACCEPT_INSPECTION', entity: 'Inspection', entityId: 'INSP-4029', description: 'Inspector accepted the assignment.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
  { id: 'AL-1004', user: 'inspector_rao@mojse.gov.in', role: 'INSPECTOR', action: 'START_INSPECTION', entity: 'Inspection', entityId: 'INSP-4029', description: 'Geofence verified. Inspection started.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
  { id: 'AL-1005', user: 'inspector_rao@mojse.gov.in', role: 'INSPECTOR', action: 'CREATE_FINDING', entity: 'Finding', entityId: 'FIND-001', description: 'Logged CRITICAL finding: Expired fire extinguishers.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4.5).toISOString() },
  { id: 'AL-1006', user: 'inspector_rao@mojse.gov.in', role: 'INSPECTOR', action: 'UPLOAD_EVIDENCE', entity: 'Evidence', entityId: 'EVD-992', description: 'Uploaded 2 images to Firebase Storage.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4.6).toISOString() },
  { id: 'AL-1007', user: 'inspector_rao@mojse.gov.in', role: 'INSPECTOR', action: 'SUBMIT_INSPECTION', entity: 'Inspection', entityId: 'INSP-4029', description: 'Inspection submitted with compliance score 68%.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: 'AL-1008', user: 'admin@mojse.gov.in', role: 'SUPER_ADMIN', action: 'VERIFY_FINDING', entity: 'CorrectiveAction', entityId: 'CA-001', description: 'Admin verified and closed finding CA-001.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: 'AL-1009', user: 'admin@mojse.gov.in', role: 'SUPER_ADMIN', action: 'GENERATE_REPORT', entity: 'Report', entityId: 'INSP-3911', description: 'Generated official inspection report PDF.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
  { id: 'AL-1010', user: 'sys_daemon', role: 'SYSTEM', action: 'DELETE', entity: 'DemoData', entityId: 'BATCH', description: 'Executed Remove Demo Data sequence.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
];

export default function AuditLogs() {
  const [logs] = useState<AuditLogMock[]>(demoAuditLogs);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const actions = ['ALL', 'LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'ASSIGN_INSPECTOR', 'ACCEPT_INSPECTION', 'START_INSPECTION', 'SUBMIT_INSPECTION', 'CREATE_FINDING', 'UPLOAD_EVIDENCE', 'VERIFY_FINDING', 'GENERATE_REPORT'];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(search.toLowerCase()) || 
                          log.entityId.toLowerCase().includes(search.toLowerCase()) ||
                          log.description.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('CRITICAL')) return 'text-red-600 bg-red-50 border-red-200';
    if (action.includes('CREATE') || action.includes('START') || action.includes('ACCEPT')) return 'text-green-600 bg-green-50 border-green-200';
    if (action.includes('UPLOAD') || action.includes('GENERATE')) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (action.includes('LOGIN')) return 'text-purple-600 bg-purple-50 border-purple-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Fingerprint className="w-7 h-7 text-primary" />
            Audit Logs
          </h1>
          <p className="text-slate-600 mt-1">Immutable record of system changes, logins, and administrative actions.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search user, entity, description..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shrink-0">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* Action Filters */}
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex gap-2 overflow-x-auto no-scrollbar">
           {actions.map(a => (
             <button
               key={a}
               onClick={() => setActionFilter(a)}
               className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                 actionFilter === a ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
               }`}
             >
               {a.replace('_', ' ')}
             </button>
           ))}
        </div>

        {/* Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-bold">Timestamp</th>
                <th className="p-4 font-bold">User / Role</th>
                <th className="p-4 font-bold">Action</th>
                <th className="p-4 font-bold">Entity & ID</th>
                <th className="p-4 font-bold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4 text-xs text-slate-500 font-mono whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                        <User className="w-3 h-3 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{log.user}</p>
                        <p className="text-[10px] font-bold text-slate-400">{log.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded border ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-bold text-slate-700">{log.entity}</p>
                        <p className="text-xs font-mono text-primary">{log.entityId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {log.description}
                  </td>
                </tr>
              ))}
              
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="font-bold">No Audit Logs Found</p>
                    <p className="text-sm">Try adjusting your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
