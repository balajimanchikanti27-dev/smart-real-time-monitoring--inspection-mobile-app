import { Search, Filter, Eye, Edit2, Trash2, MapPin, Building2 } from 'lucide-react';

export interface OrganizationRow {
  id?: string;
  name: string;
  registrationNumber: string;
  state: string;
  district: string;
  contactPerson: string;
  contactPhone: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface Props {
  data: OrganizationRow[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  onView: (id: string) => void;
  onEdit: (org: any) => void;
  onDelete: (id: string, name: string) => void;
  entityName: string;
}

export default function OrganizationDataTable({
  data, loading, searchTerm, setSearchTerm, statusFilter, setStatusFilter, onView, onEdit, onDelete, entityName
}: Props) {
  
  const filteredData = data.filter(org => {
    const name = org.name || (org as any).organizationName || '';
    const reg = org.registrationNumber || (org as any).id || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          reg.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (org.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="nirikshan-panel">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder={`Search ${entityName.toLowerCase()} by name or reg number...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border border-slate-300 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary bg-white appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700 hidden md:table">
          <thead className="text-xs uppercase bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">{entityName}</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2 text-slate-500">Loading {entityName.toLowerCase()}s...</p>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                  <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-medium text-slate-800">No {entityName.toLowerCase()}s found</p>
                  <p className="text-xs mt-1">Adjust your search or add a new {entityName.toLowerCase()}.</p>
                </td>
              </tr>
            ) : (
              filteredData.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-primary">{org.name || (org as any).organizationName}</p>
                      {(org as any).isDemo && (
                        <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-200">
                          DEMO DATA
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Reg: {org.registrationNumber || (org as any).id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">{org.district}</p>
                        <p className="text-xs text-slate-500">{org.state}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{org.contactPerson}</p>
                    <p className="text-xs text-slate-500">{org.contactPhone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                      org.status === 'active' ? 'bg-green-100 text-green-700' :
                      org.status === 'inactive' ? 'bg-slate-100 text-slate-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {org.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => org.id && onView(org.id)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary-light/10 rounded-sm transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onEdit(org)}
                        className="p-1.5 text-slate-400 hover:text-accent hover:bg-accent/10 rounded-sm transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => org.id && onDelete(org.id, org.name)}
                        className="p-1.5 text-slate-400 hover:text-semantic-critical hover:bg-red-50 rounded-sm transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-slate-500 text-sm">Loading {entityName.toLowerCase()}s...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-medium text-slate-800">No {entityName.toLowerCase()}s found</p>
            </div>
          ) : (
            filteredData.map((org) => (
              <div key={org.id} className="p-4 bg-white hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-primary">{org.name || (org as any).organizationName}</p>
                      {(org as any).isDemo && (
                        <span className="bg-indigo-100 text-indigo-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-200">
                          DEMO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Reg: {org.registrationNumber || (org as any).id}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                    org.status === 'active' ? 'bg-green-100 text-green-700' :
                    org.status === 'inactive' ? 'bg-slate-100 text-slate-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {org.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span className="text-slate-600 line-clamp-2">{org.district}, {org.state}</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="text-slate-500 font-medium shrink-0">Tel:</span>
                    <span className="text-slate-600 truncate">{org.contactPhone}</span>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-slate-100 pt-3 mt-1">
                  <button 
                    onClick={() => org.id && onView(org.id)}
                    className="flex-1 py-1.5 bg-slate-50 text-primary border border-slate-200 hover:bg-primary hover:text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button 
                    onClick={() => onEdit(org)}
                    className="flex-1 py-1.5 bg-slate-50 text-accent border border-slate-200 hover:bg-accent hover:text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button 
                    onClick={() => org.id && onDelete(org.id, org.name)}
                    className="py-1.5 px-3 bg-slate-50 text-semantic-critical border border-slate-200 hover:bg-semantic-critical hover:text-white rounded transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
