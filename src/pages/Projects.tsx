import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject, updateProject, deleteProject } from '../services/projectService';
import { getDocs } from 'firebase/firestore';
import { institutionsRef, ngosRef } from '../services/firebase/firestore';
import type { Project, Institution, NGO } from '../types/firestore';
import ProjectForm from '../components/projects/ProjectForm';
import { Plus, Search, Filter, Eye, Edit2, Trash2, Building2, AlertCircle, CheckCircle2, IndianRupee, Calendar } from 'lucide-react';

import { demoProjects, demoOrganizations } from '../services/mockData';

const defaultProjects: Project[] = demoProjects.map(p => ({
  id: p.projectId,
  name: p.projectName,
  description: p.description,
  organizationType: (demoOrganizations.find(o => o.id === p.organizationId)?.organizationType === 'NGO' ? 'NGO' : 'Institution') as 'NGO' | 'Institution',
  organizationId: p.organizationId,
  schemeName: p.schemeId,
  projectType: 'Construction', // Defaulting for demo
  state: p.state,
  district: p.district,
  budget: p.budget,
  startDate: new Date(p.startDate),
  endDate: new Date(p.endDate),
  status: (p.projectStatus || 'ACTIVE') as Project['status'],
  progress: 50,
  isDemo: true,
  createdAt: new Date(p.startDate),
  updatedAt: new Date(p.startDate),
  createdBy: 'system',
  updatedBy: 'system'
}));

const initialOrgMap: Record<string, string> = {};
demoOrganizations.forEach(o => { initialOrgMap[o.id] = o.organizationName; });

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [orgMap, setOrgMap] = useState<Record<string, string>>(initialOrgMap);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { projects: fetchedProjects } = await getProjects();

      if (fetchedProjects && fetchedProjects.length > 0) {
        setProjects(fetchedProjects);
      }

      // Fetch orgs to build a name map for the UI
      const orgPromise = Promise.all([getDocs(institutionsRef), getDocs(ngosRef)]);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 800));
      const [instSnap, ngoSnap]: any = await Promise.race([orgPromise, timeoutPromise]);
      
      if (instSnap && ngoSnap) {
        const map: Record<string, string> = { ...initialOrgMap };
        instSnap.docs.forEach((d: any) => { map[d.id] = (d.data() as Institution).name; });
        ngoSnap.docs.forEach((d: any) => { map[d.id] = (d.data() as NGO).name; });
        setOrgMap(map);
      }
    } catch {
      // Retain synchronous defaultProjects and initialOrgMap
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSave = async (data: Partial<Project>) => {
    try {
      if (editingProject && editingProject.id) {
        await updateProject(editingProject.id, data as Partial<Omit<Project, 'id' | 'createdAt' | 'createdBy'>>);
        setSuccess('Project updated successfully.');
      } else {
        await createProject(data as Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>);
        setSuccess('Project created successfully. Confirmation email sent to your registered address.');
      }
      setIsFormOpen(false);
      setEditingProject(undefined);
      fetchProjects();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      throw new Error('Failed to save project: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        await deleteProject(id);
        setSuccess('Project deleted successfully.');
        fetchProjects();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error(err);
        setError('Failed to delete project.');
      }
    }
  };

  // Client-side filtering
  const filteredProjects = projects.filter(proj => {
    const orgName = orgMap[proj.organizationId] || '';
    const matchesSearch = proj.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          proj.schemeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          orgName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proj.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700 border border-green-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'PLANNED': return 'bg-slate-100 text-slate-700 border border-slate-200';
      case 'SUSPENDED': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border border-red-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // Helper to format Date or Firestore Timestamp
  const formatDate = (dateData: any) => {
    if (!dateData) return 'N/A';
    if (dateData.seconds) return new Date(dateData.seconds * 1000).toLocaleDateString();
    return new Date(dateData).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Project Management</h1>
          <p className="text-slate-600 mt-1">Manage state and central schemes executed by NGOs and Institutions.</p>
        </div>
        <button 
          onClick={() => { setEditingProject(undefined); setIsFormOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-sm text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-sm text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </div>
      )}

      <div className="nirikshan-panel">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by project name, scheme, or organization..." 
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
                <option value="PLANNED">Planned</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="text-xs uppercase bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Project Details</th>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Timeline & Budget</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-2 text-slate-500">Loading projects...</p>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="font-medium text-slate-800">No projects found</p>
                    <p className="text-xs mt-1">Adjust your search or add a new project.</p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3">
                      <p className="font-bold text-primary">{proj.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium bg-slate-100 inline-block px-1.5 py-0.5 rounded-sm">{proj.schemeName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-1.5">
                        <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-800">{orgMap[proj.organizationId] || 'Unknown Organization'}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{proj.organizationType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-xs flex items-center gap-1.5 text-slate-600">
                          <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium">{proj.budget.toLocaleString('en-IN')}</span>
                        </p>
                        <p className="text-[11px] flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(proj.startDate)} - {formatDate(proj.endDate)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${getStatusColor(proj.status)}`}>
                        {proj.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigate(`/dashboard/projects/${proj.id}`)}
                          className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary-light/10 rounded-sm transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setEditingProject(proj); setIsFormOpen(true); }}
                          className="p-1.5 text-slate-400 hover:text-accent hover:bg-accent/10 rounded-sm transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => proj.id && handleDelete(proj.id, proj.name)}
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
        </div>
      </div>

      <ProjectForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingProject}
        onSave={handleSave}
      />
    </div>
  );
}
