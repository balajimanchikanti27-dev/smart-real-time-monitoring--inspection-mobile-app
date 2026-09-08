import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { demoInspections, demoOrganizations, demoInspectors } from '../services/mockData';
import { ClipboardList, Search, Filter, Calendar, MapPin, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const InspectionsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const filteredInspections = demoInspections.filter(insp => {
    const org = demoOrganizations.find(o => o.id === insp.organizationId);
    const inspector = demoInspectors.find(i => i.inspectorId === insp.inspectorId);
    
    const matchesSearch = 
      insp.inspectionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org?.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspector?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'ALL' || insp.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.scheduledDate || 0).getTime() - new Date(a.scheduledDate || 0).getTime());

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'COMPLETED': return <span className="px-2.5 py-1 bg-semantic-success/10 text-semantic-success rounded-full text-xs font-bold inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Completed</span>;
      case 'IN_PROGRESS': return <span className="px-2.5 py-1 bg-semantic-warning/10 text-semantic-warning rounded-full text-xs font-bold inline-flex items-center gap-1"><Clock className="w-3 h-3" /> In Progress</span>;
      case 'SCHEDULED': return <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> Scheduled</span>;
      case 'OVERDUE': return <span className="px-2.5 py-1 bg-semantic-critical/10 text-semantic-critical rounded-full text-xs font-bold inline-flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Overdue</span>;
      default: return null;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch(risk) {
      case 'CRITICAL': return <span className="text-semantic-critical font-bold text-xs">CRITICAL</span>;
      case 'HIGH': return <span className="text-semantic-warning font-bold text-xs">HIGH</span>;
      case 'MEDIUM': return <span className="text-accent font-bold text-xs">MEDIUM</span>;
      case 'LOW': return <span className="text-semantic-success font-bold text-xs">LOW</span>;
      default: return <span className="text-gray-400 font-bold text-xs">-</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark">Inspections Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor all scheduled, ongoing, and completed field inspections.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2">
             <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="btn-primary" onClick={() => navigate('/admin/smart-assignment')}>
             + New Assignment
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-4 bg-gray-50/50">
           <div className="relative flex-1 w-full max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
             <input 
               type="text" 
               placeholder="Search by ID, Organization, or Inspector..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
             />
           </div>
           
           <div className="flex items-center gap-2 w-full sm:w-auto">
             <span className="text-sm text-gray-500 font-medium">Status:</span>
             <select 
               className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
             >
               <option value="ALL">All Inspections</option>
               <option value="SCHEDULED">Scheduled</option>
               <option value="IN_PROGRESS">In Progress</option>
               <option value="COMPLETED">Completed</option>
               <option value="OVERDUE">Overdue</option>
             </select>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px] hidden md:table">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold">Inspection ID</th>
                <th className="p-4 font-semibold">Target Organization</th>
                <th className="p-4 font-semibold">Assigned Inspector</th>
                <th className="p-4 font-semibold">Schedule</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-center">Risk Found</th>
                <th className="p-4 font-semibold text-center">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInspections.map(insp => {
                const org = demoOrganizations.find(o => o.id === insp.organizationId);
                const inspector = demoInspectors.find(i => i.inspectorId === insp.inspectorId);
                
                return (
                  <tr key={insp.inspectionId} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                         <ClipboardList className="w-4 h-4 text-gray-400" />
                         <span className="font-mono text-sm font-semibold text-primary">{insp.inspectionId}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-800 line-clamp-1 cursor-pointer hover:text-accent transition-colors" onClick={() => navigate(`/admin/organization/${org?.id}`)}>
                        {org?.organizationName || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {org?.district}, {org?.state}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-sm text-gray-800">{inspector?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{inspector?.department}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium">{insp.scheduledDate ? new Date(insp.scheduledDate).toLocaleDateString() : 'N/A'}</p>
                      <p className="text-xs text-gray-500">
                        {insp.scheduledDate ? new Date(insp.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(insp.status)}
                    </td>
                    <td className="p-4 text-center bg-gray-50/30">
                       {getRiskBadge(insp.riskLevelFound || '')}
                    </td>
                    <td className="p-4 text-center">
                       {insp.status === 'COMPLETED' ? (
                          <div className="inline-flex items-center justify-center font-mono font-bold text-sm bg-gray-100 px-2 py-1 rounded">
                             {Math.round(insp.overallScore || 0)}/100
                          </div>
                       ) : (
                          <span className="text-gray-300">-</span>
                       )}
                    </td>
                  </tr>
                );
              })}

              {filteredInspections.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-500">
                    <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No inspections found matching your current filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col divide-y divide-gray-100">
            {filteredInspections.map(insp => {
              const org = demoOrganizations.find(o => o.id === insp.organizationId);
              const inspector = demoInspectors.find(i => i.inspectorId === insp.inspectorId);
              
              return (
                <div key={insp.inspectionId} className="p-4 bg-white hover:bg-gray-50/80 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                       <ClipboardList className="w-4 h-4 text-gray-400" />
                       <span className="font-mono text-sm font-semibold text-primary">{insp.inspectionId}</span>
                    </div>
                    {getStatusBadge(insp.status)}
                  </div>
                  
                  <div className="mb-3">
                    <p className="font-semibold text-gray-800 line-clamp-1 cursor-pointer hover:text-accent transition-colors" onClick={() => navigate(`/admin/organization/${org?.id}`)}>
                      {org?.organizationName || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {org?.district}, {org?.state}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-2 rounded mb-3">
                    <div>
                      <p className="text-gray-500 font-medium">Inspector</p>
                      <p className="font-semibold text-gray-800 truncate">{inspector?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Schedule</p>
                      <p className="font-semibold text-gray-800">{insp.scheduledDate ? new Date(insp.scheduledDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">Risk:</span>
                      {getRiskBadge(insp.riskLevelFound || '')}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">Score:</span>
                      {insp.status === 'COMPLETED' ? (
                        <div className="inline-flex items-center justify-center font-mono font-bold text-sm bg-gray-100 px-2 py-1 rounded">
                           {Math.round(insp.overallScore || 0)}/100
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredInspections.length === 0 && (
              <div className="p-10 text-center text-gray-500">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No inspections found matching your current filters.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
           <span>Showing {filteredInspections.length} of {demoInspections.length} total inspections</span>
           <span className="font-mono">DATA_SOURCE: DEMO</span>
        </div>
      </div>
    </div>
  );
};

export default InspectionsList;
