import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, FileWarning, ClipboardCheck, Building2, UserSquare2, Cctv, FolderKanban, AlertCircle } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase/firestore';
import { demoOrganizations, demoProjects, demoInspections, demoFindings, demoCCTV, demoInspectors } from '../services/mockData';

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  category: 'Institution' | 'NGO' | 'Project' | 'Inspector' | 'Inspection' | 'Finding' | 'CCTV';
  path: string;
};

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      performSearch(query);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    setLoading(true);
    setIsOpen(true);
    setError(null);
    const term = searchTerm.toLowerCase();

    try {
      // In a real production app with hundreds of thousands of records,
      // we would use Algolia or Typesense for global search.
      // For this prototype, we will fetch data and filter it locally,
      // falling back to mockData if offline.
      let allResults: SearchResult[] = [];

      try {
        // Attempt Firestore Queries (limited to prevent huge reads)
        const [instSnap, ngoSnap] = await Promise.all([
          getDocs(collection(db, 'institutions')),
          getDocs(collection(db, 'ngos'))
        ]);

        instSnap.docs.forEach(doc => {
          const data = doc.data();
          if ((data.name?.toLowerCase() || '').includes(term) || (data.registrationNumber?.toLowerCase() || '').includes(term)) {
            allResults.push({ id: doc.id, title: data.name, subtitle: `Reg: ${data.registrationNumber}`, category: 'Institution', path: `/dashboard/institutions/${doc.id}` });
          }
        });
        
        ngoSnap.docs.forEach(doc => {
          const data = doc.data();
          if ((data.name?.toLowerCase() || '').includes(term) || (data.registrationNumber?.toLowerCase() || '').includes(term)) {
            allResults.push({ id: doc.id, title: data.name, subtitle: `Reg: ${data.registrationNumber}`, category: 'NGO', path: `/dashboard/ngos/${doc.id}` });
          }
        });

        // Add logic for others...
        
      } catch (e) {
        console.warn("Firestore search failed, using local mock data fallback.", e);
        
        // Offline Fallback
        demoOrganizations.forEach(org => {
          if (org.organizationName.toLowerCase().includes(term) || org.id.toLowerCase().includes(term)) {
            allResults.push({
              id: org.id,
              title: org.organizationName,
              subtitle: `Location: ${org.district}`,
              category: org.organizationType as 'Institution' | 'NGO',
              path: `/dashboard/${org.organizationType === 'NGO' ? 'ngos' : 'institutions'}/${org.id}`
            });
          }
        });

        demoProjects.forEach(proj => {
          if (proj.projectName.toLowerCase().includes(term) || (proj as any).schemeName?.toLowerCase().includes(term)) {
            allResults.push({ id: proj.projectId, title: proj.projectName, subtitle: (proj as any).schemeName || '', category: 'Project', path: `/dashboard/projects/${proj.projectId}` });
          }
        });

        demoInspectors.forEach(insp => {
          if (insp.name.toLowerCase().includes(term) || insp.inspectorId.toLowerCase().includes(term)) {
            allResults.push({ id: insp.inspectorId, title: insp.name, subtitle: `State: ${insp.state}`, category: 'Inspector', path: `/dashboard/inspectors` });
          }
        });

        demoInspections.forEach(insp => {
          if (insp.inspectionId.toLowerCase().includes(term) || insp.type.toLowerCase().includes(term)) {
            allResults.push({ id: insp.inspectionId, title: insp.type, subtitle: `Status: ${insp.status}`, category: 'Inspection', path: `/dashboard/inspections/${insp.inspectionId}` });
          }
        });

        demoFindings.forEach(find => {
          if (find.title.toLowerCase().includes(term) || find.id.toLowerCase().includes(term)) {
            allResults.push({ id: find.id, title: find.title, subtitle: `Severity: ${find.severity}`, category: 'Finding', path: `/dashboard/findings` });
          }
        });

        demoCCTV.forEach(cam => {
          if (cam.name.toLowerCase().includes(term) || cam.location.toLowerCase().includes(term)) {
            allResults.push({ id: cam.id, title: cam.name, subtitle: cam.location, category: 'CCTV', path: `/dashboard/cctv` });
          }
        });
      }

      setResults(allResults.slice(0, 15)); // Cap at 15 results
    } catch (err: any) {
      setError("An error occurred during search.");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'Institution': return <Building2 className="w-4 h-4 text-blue-500" />;
      case 'NGO': return <Building2 className="w-4 h-4 text-green-500" />;
      case 'Project': return <FolderKanban className="w-4 h-4 text-orange-500" />;
      case 'Inspector': return <UserSquare2 className="w-4 h-4 text-purple-500" />;
      case 'Inspection': return <ClipboardCheck className="w-4 h-4 text-indigo-500" />;
      case 'Finding': return <FileWarning className="w-4 h-4 text-red-500" />;
      case 'CCTV': return <Cctv className="w-4 h-4 text-slate-500" />;
      default: return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  // Group results
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) acc[result.category] = [];
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="relative w-full md:w-80 z-50" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim()) setIsOpen(true); }}
          placeholder="Search global records..." 
          className="w-full pl-9 pr-3 py-1.5 bg-background border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-slate-800"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl max-h-[70vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="p-4 text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          
          {!loading && !error && results.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium">No results found for "{query}"</p>
            </div>
          )}

          {!loading && !error && Object.keys(groupedResults).map(category => (
            <div key={category} className="border-b border-slate-100 last:border-0">
              <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                {category}s
              </div>
              <div className="py-1">
                {groupedResults[category].map(res => (
                  <button
                    key={res.id}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery('');
                      navigate(res.path);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-start gap-3 transition-colors group"
                  >
                    <div className="mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                      {getIcon(res.category)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1">{res.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{res.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
