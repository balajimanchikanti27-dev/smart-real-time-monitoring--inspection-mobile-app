import { AlertTriangle, CheckCircle2, AlertCircle, Building2, Users, ClipboardList, ShieldAlert, ArrowRight, Activity, MapPin } from 'lucide-react';
import { demoOrganizations, demoInspections, demoAlerts, demoComplaints } from '../services/mockData';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-dark">Ministry of Social Justice and Empowerment</h1>
        <p className="text-sm text-gray-500 mt-1">DoSJE Real-Time Monitoring & Inspection Command Center.</p>
      </div>

      {/* Global Filters */}
      <div className="card p-4 flex flex-wrap gap-4 items-center">
        <select className="bg-gray-50 border border-gray-300 text-sm rounded-md focus:ring-accent focus:border-accent block p-2">
          <option>All Dates</option>
          <option>Today</option>
          <option>This Week</option>
        </select>
        <select className="bg-gray-50 border border-gray-300 text-sm rounded-md focus:ring-accent focus:border-accent block p-2">
          <option>All States</option>
          <option>Delhi</option>
          <option>Uttar Pradesh</option>
        </select>
        <select className="bg-gray-50 border border-gray-300 text-sm rounded-md focus:ring-accent focus:border-accent block p-2">
          <option>All Types</option>
          <option>Routine</option>
          <option>Surprise</option>
          <option>Risk Based</option>
        </select>
        <button className="text-sm text-accent font-medium hover:underline ml-auto">Reset Filters</button>
      </div>

      {/* LEVEL 1: Attention Required */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Priority Attention Required
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          
          {demoAlerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').map(alert => (
            <div key={alert.alertId} className={`card border-l-4 p-4 flex flex-col justify-between ${alert.severity === 'CRITICAL' ? 'border-l-semantic-critical' : 'border-l-semantic-warning'}`}>
              <div>
                <div className={`flex items-center gap-2 mb-2 ${alert.severity === 'CRITICAL' ? 'text-semantic-critical' : 'text-semantic-warning'}`}>
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">{alert.type.replace('_', ' ')}</span>
                </div>
                <p className="text-sm font-medium line-clamp-3">{alert.message}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border">
                    {alert.dataSourceType} DATA
                  </span>
                </div>
              </div>
              <Link to={`/admin/organization/${alert.entityId}`} className={`mt-4 text-xs font-semibold flex items-center hover:underline ${alert.severity === 'CRITICAL' ? 'text-semantic-critical' : 'text-semantic-warning'}`}>
                Investigate <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          ))}

          {demoComplaints.filter(c => c.status === 'UNDER_INVESTIGATION' || c.status === 'NEW').map(comp => (
            <div key={comp.complaintId} className="card border-l-4 border-l-accent p-4 flex flex-col justify-between">
               <div>
                <div className="flex items-center gap-2 text-accent mb-2">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Complaint: {comp.category}</span>
                </div>
                <p className="text-sm font-medium line-clamp-2">{comp.description}</p>
                <p className="text-xs text-gray-500 mt-2">Org: {demoOrganizations.find(i => i.id === comp.organizationId)?.organizationName}</p>
              </div>
              <button className="mt-4 text-xs font-semibold text-accent flex items-center hover:underline">
                View Complaint <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          ))}

        </div>
      </section>

      {/* LEVEL 2 & 3: Core Monitoring */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Network Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          
          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Organizations</span>
              <Building2 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-primary-dark mb-4">{demoOrganizations.length}</div>
            <div className="flex gap-4 text-xs">
              <div className="cursor-pointer hover:text-accent transition-colors">
                <span className="block text-gray-500">Active</span>
                <span className="font-semibold">{demoOrganizations.filter(i => i.status === 'ACTIVE').length}</span>
              </div>
              <div className="cursor-pointer hover:text-semantic-critical transition-colors">
                <span className="block text-gray-500">Critical Risk</span>
                <span className="font-semibold">{demoOrganizations.filter(i => i.riskLevel === 'CRITICAL').length}</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Inspections</span>
              <ClipboardList className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-primary-dark mb-4">{demoInspections.length}</div>
            <div className="flex gap-4 text-xs">
              <div className="cursor-pointer hover:text-accent transition-colors">
                <span className="block text-gray-500">Started</span>
                <span className="font-semibold">{demoInspections.filter(i => i.status === 'INSPECTION_STARTED').length}</span>
              </div>
              <div className="cursor-pointer hover:text-accent transition-colors">
                <span className="block text-gray-500">Assigned</span>
                <span className="font-semibold">{demoInspections.filter(i => i.status === 'ASSIGNED').length}</span>
              </div>
            </div>
          </div>

          {/* Surprise/Risk Inspections KPI */}
          <div className="card p-5 bg-primary text-white border-none shadow-md ring-1 ring-primary-light xl:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Risk-Based & Surprise Inspections</span>
              <ShieldAlert className="w-5 h-5 text-accent" />
            </div>
            <div className="text-3xl font-bold mb-4">{demoInspections.filter(i => i.type === 'SURPRISE' || i.type === 'RISK_BASED').length}</div>
            <div className="flex gap-4 text-xs border-t border-primary-light pt-3">
               <Link to="/admin/smart-assignment" className="flex items-center gap-1 text-accent-light hover:text-white transition-colors font-medium">
                  + Launch Smart Assignment Engine
               </Link>
            </div>
          </div>

          {/* Compliance KPI */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Avg Compliance</span>
              <CheckCircle2 className="w-5 h-5 text-semantic-success" />
            </div>
            <div className="text-3xl font-bold text-primary-dark mb-1">
              {Math.round(demoOrganizations.reduce((acc, curr) => acc + curr.complianceScore, 0) / demoOrganizations.length)}%
            </div>
            <p className="text-xs text-semantic-critical font-medium flex items-center mt-2">
              <AlertCircle className="w-3 h-3 mr-1" /> Requires monitoring
            </p>
          </div>

        </div>
      </section>

      {/* Real-time Organizations List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Monitored Organizations (Demo)</h2>
          <button className="text-sm text-accent hover:underline">View All Directory</button>
        </div>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Organization</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Risk Score</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Data Source</th>
                </tr>
              </thead>
              <tbody>
                {demoOrganizations.map(org => (
                  <tr key={org.id} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-primary-dark">
                      <Link to={`/admin/organization/${org.id}`} className="hover:text-accent hover:underline">{org.organizationName}</Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded border">
                        {org.organizationType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center text-gray-600"><MapPin className="w-3 h-3 mr-1"/> {org.district}, {org.state}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${org.riskLevel === 'CRITICAL' ? 'text-semantic-critical' : org.riskLevel === 'HIGH' ? 'text-semantic-warning' : 'text-semantic-success'}`}>
                        {org.riskScore}/100 ({org.riskLevel})
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`w-2 h-2 rounded-full inline-block mr-2 ${org.status === 'ACTIVE' ? 'bg-semantic-success' : 'bg-semantic-warning'}`}></span>
                      {org.status.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {org.dataSourceType === 'DEMO' && (
                         <span className="text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-300 px-2 py-1 rounded">PROTOTYPE / DEMO</span>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
