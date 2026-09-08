import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { demoOrganizations } from '../services/mockData';
import { Building2, Search, Filter, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  type: 'GOVERNMENT_INSTITUTION' | 'NGO';
  title: string;
}

const OrganizationList = ({ type, title }: Props) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter by type (GOV vs NGO). Note: we treat CORPORATION/BOARD/COMMISSION/FOUNDATION as Government Institutions in this view.
  const filteredOrgs = demoOrganizations.filter(org => {
    const isGov = org.organizationType !== 'NGO';
    const matchesType = type === 'NGO' ? !isGov : isGov;
    const matchesSearch = org.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          org.state.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark">{title} Directory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and monitor registered {title.toLowerCase()}.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2">
             <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="btn-primary">
             + Add New
          </button>
        </div>
      </div>

      <div className="card">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
             <input 
               type="text" 
               placeholder={`Search ${title.toLowerCase()} by name or state...`}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
             />
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold">Organization Name</th>
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold text-center">Compliance</th>
                <th className="p-4 font-semibold">Risk Level</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrgs.map(org => (
                <tr key={org.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-primary-dark line-clamp-1">{org.organizationName}</p>
                        <p className="text-xs text-gray-500 font-mono">{org.id} {org.ngoDarpanId ? `| ${org.ngoDarpanId}` : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium">{org.state}</p>
                    <p className="text-xs text-gray-500">{org.district}</p>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center justify-center">
                      <div className="relative w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-100">
                         {/* Simple visual indicator */}
                         <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="18" cy="18" r="16" fill="none" strokeWidth="3" className="stroke-gray-100" />
                            <circle cx="18" cy="18" r="16" fill="none" strokeWidth="3" 
                                    className={org.complianceScore >= 80 ? 'stroke-semantic-success' : org.complianceScore >= 50 ? 'stroke-semantic-warning' : 'stroke-semantic-critical'}
                                    strokeDasharray="100" 
                                    strokeDashoffset={100 - org.complianceScore} 
                                    strokeLinecap="round" />
                         </svg>
                         <span className="text-[10px] font-bold z-10">{org.complianceScore}%</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1
                      ${org.riskLevel === 'CRITICAL' ? 'bg-semantic-critical/10 text-semantic-critical' : 
                        org.riskLevel === 'HIGH' ? 'bg-semantic-warning/10 text-semantic-warning' : 
                        'bg-semantic-success/10 text-semantic-success'}`}>
                      {org.riskLevel === 'CRITICAL' ? <ShieldAlert className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      {org.riskLevel}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => navigate(`/admin/organization/${org.id}`)}
                      className="inline-flex items-center justify-center p-2 rounded-lg text-primary hover:bg-primary hover:text-white transition-colors border border-primary/20"
                      title="Open Profile"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredOrgs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No organizations found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrganizationList;
