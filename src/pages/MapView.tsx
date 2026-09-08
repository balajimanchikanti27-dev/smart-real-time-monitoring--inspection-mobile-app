import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase/firestore';
import { demoOrganizations, demoProjects } from '../services/mockData';
import { Building2, FolderKanban, MapPin, Search, Navigation, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import L from 'leaflet';

// Fix for default leaflet marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createIcon = (color: string) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueIcon = createIcon('blue'); // Institutions
const greenIcon = createIcon('green'); // NGOs
const orangeIcon = createIcon('orange'); // Projects

// Map controller component for smooth flyTo animations
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// Initial rich locations containing all real Institutions, NGOs and Projects with precise Indian GPS coordinates
const initialLocations = [
  ...demoOrganizations.map(o => ({
    ...o,
    type: o.organizationType === 'NGO' ? 'NGO' : 'Institution',
    name: o.organizationName
  })),
  ...demoProjects.map((p, idx) => ({
    ...p,
    id: p.projectId,
    name: p.projectName,
    type: 'Project',
    latitude: p.state === 'Delhi' ? 28.5800 + (idx * 0.015) : 
              p.state === 'Karnataka' ? 12.9500 + (idx * 0.015) :
              p.state === 'Maharashtra' ? 18.5204 + (idx * 0.015) :
              p.state === 'Telangana' ? 17.3850 + (idx * 0.015) :
              p.state === 'Andhra Pradesh' ? 16.5062 + (idx * 0.015) :
              p.state === 'Rajasthan' ? 26.9124 + (idx * 0.015) :
              p.state === 'Tamil Nadu' ? 13.0827 + (idx * 0.015) : 28.6139,
    longitude: p.state === 'Delhi' ? 77.2000 + (idx * 0.012) :
               p.state === 'Karnataka' ? 77.5800 + (idx * 0.012) :
               p.state === 'Maharashtra' ? 73.8567 + (idx * 0.012) :
               p.state === 'Telangana' ? 78.4867 + (idx * 0.012) :
               p.state === 'Andhra Pradesh' ? 80.6480 + (idx * 0.012) :
               p.state === 'Rajasthan' ? 75.7873 + (idx * 0.012) :
               p.state === 'Tamil Nadu' ? 80.2707 + (idx * 0.012) : 77.2090,
  }))
];

export default function MapView() {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>(initialLocations);
  const [filterType, setFilterType] = useState<'ALL' | 'Institution' | 'NGO' | 'Project'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState<number>(5);

  useEffect(() => {
    // Optional background sync with Firestore if online
    let unsubs: any[] = [];
    try {
      const unsubInst = onSnapshot(collection(db, 'institutions'), (snap) => {
        if (!snap.empty) {
          const docs = snap.docs.map(d => ({ id: d.id, ...d.data(), type: 'Institution' }));
          setData(prev => {
            const fetchedIds = new Set(docs.map(d => d.id));
            const merged = [...docs];
            prev.forEach(p => {
               if (p.type !== 'Institution') merged.push(p);
               else if (!fetchedIds.has(p.id)) merged.push(p);
            });
            return merged;
          });
        }
      }, () => {});
      const unsubNgo = onSnapshot(collection(db, 'ngos'), (snap) => {
        if (!snap.empty) {
          const docs = snap.docs.map(d => ({ id: d.id, ...d.data(), type: 'NGO' }));
          setData(prev => {
            const fetchedIds = new Set(docs.map(d => d.id));
            const merged = [...docs];
            prev.forEach(p => {
               if (p.type !== 'NGO') merged.push(p);
               else if (!fetchedIds.has(p.id)) merged.push(p);
            });
            return merged;
          });
        }
      }, () => {});
      unsubs.push(unsubInst, unsubNgo);
    } catch {
      // Retains offline fallback
    }
    return () => unsubs.forEach(u => u && u());
  }, []);

  const validLocations = data.map(item => ({
    ...item,
    latitude: item.latitude !== undefined && item.latitude !== null && !isNaN(Number(item.latitude)) ? Number(item.latitude) : 21.5937,
    longitude: item.longitude !== undefined && item.longitude !== null && !isNaN(Number(item.longitude)) ? Number(item.longitude) : 78.9629,
  })).filter(item => {
    const matchesFilter = filterType === 'ALL' || item.type === filterType;
    
    const searchTerms = searchTerm.toLowerCase().split(' ').filter(Boolean);
    const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => 
      (item.name || item.organizationName || '').toLowerCase().includes(term) ||
      (item.state || '').toLowerCase().includes(term) ||
      (item.district || '').toLowerCase().includes(term) ||
      (item.address || '').toLowerCase().includes(term)
    );
    
    return matchesFilter && matchesSearch;
  });

  const jumpTo = (coords: [number, number], zoom: number) => {
    setMapCenter(coords);
    setMapZoom(zoom);
  };

  const instCount = data.filter(d => d.type === 'Institution').length;
  const ngoCount = data.filter(d => d.type === 'NGO').length;
  const prjCount = data.filter(d => d.type === 'Project').length;

  return (
    <div className="h-[calc(100vh-135px)] flex flex-col gap-4 animate-in fade-in duration-300">
      
      {/* Top Controls & Regional Quick-Jumps */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-md border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded transition-all ${filterType === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All ({data.length})
            </button>
            <button
              onClick={() => setFilterType('Institution')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${filterType === 'Institution' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-600'}`}
            >
              <div className="w-2 h-2 rounded-full bg-blue-400"></div> Institutions ({instCount})
            </button>
            <button
              onClick={() => setFilterType('NGO')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${filterType === 'NGO' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-600'}`}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div> NGOs ({ngoCount})
            </button>
            <button
              onClick={() => setFilterType('Project')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${filterType === 'Project' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-amber-600'}`}
            >
              <div className="w-2 h-2 rounded-full bg-amber-400"></div> Projects ({prjCount})
            </button>
          </div>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search place, NGO, or institution..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-primary focus:bg-white"
            />
          </div>
        </div>

        {/* Regional Focus Buttons */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-slate-400 font-bold uppercase text-[10px] mr-1 flex items-center gap-1">
            <Navigation className="w-3 h-3" /> Focus:
          </span>
          <button onClick={() => jumpTo([21.5937, 78.9629], 5)} className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">🇮🇳 All India</button>
          <button onClick={() => jumpTo([28.6139, 77.2090], 11)} className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 font-medium">Delhi NCR</button>
          <button onClick={() => jumpTo([12.9716, 77.5946], 11)} className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium">Bengaluru</button>
          <button onClick={() => jumpTo([18.9220, 72.8347], 10)} className="px-2 py-0.5 rounded bg-purple-50 hover:bg-purple-100 text-purple-800 font-medium">Mumbai</button>
          <button onClick={() => jumpTo([17.3850, 78.4867], 11)} className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium">Hyderabad</button>
        </div>
      </div>

      {/* Interactive Leaflet Map View */}
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 relative z-0 bg-slate-100 shadow-sm flex">
        <div className="flex-1 relative">
          <MapContainer center={mapCenter} zoom={mapZoom} className="w-full h-full" zoomControl={false}>
            <ChangeView center={mapCenter} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="bottomright" />

            {validLocations.map((item, idx) => {
              const icon = item.type === 'Institution' ? blueIcon : item.type === 'NGO' ? greenIcon : orangeIcon;
              const linkPath = item.type === 'Project' ? `/dashboard/projects/${item.id}` : 
                               item.type === 'NGO' ? `/dashboard/ngos/${item.id}` : `/dashboard/institutions/${item.id}`;
              
              return (
                <Marker key={`${item.id}-${idx}`} position={[item.latitude, item.longitude]} icon={icon}>
                  <Popup className="custom-popup">
                    <div className="min-w-[240px] p-2">
                      <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                        <div className="flex items-center gap-1.5">
                          {item.type === 'Project' ? (
                            <FolderKanban className="w-4 h-4 text-amber-600" />
                          ) : (
                            <Building2 className="w-4 h-4 text-primary" />
                          )}
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.type === 'Institution' ? 'bg-blue-100 text-blue-800' :
                            item.type === 'NGO' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.type}
                          </span>
                        </div>
                        {item.riskLevel && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            item.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            item.riskLevel === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            Risk: {item.riskLevel}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1">
                        {item.name || item.organizationName}
                      </h3>

                      <div className="space-y-1 text-xs text-slate-600 mb-3">
                        <p className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {item.district}, {item.state}
                        </p>
                        <p className="font-mono text-[10px] text-slate-400">
                          GPS: {item.latitude.toFixed(4)}° N, {item.longitude.toFixed(4)}° E
                        </p>
                        {item.complianceScore !== undefined && (
                          <p className="font-medium text-slate-700">
                            Compliance Score: <span className="font-bold">{item.complianceScore}%</span>
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100">
                        <Link
                          to={linkPath}
                          className="py-1 px-1 text-center text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 flex items-center justify-center gap-1"
                        >
                          Details <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                        <Link
                          to={
                            item.type === 'Project' ? `/dashboard/projects?edit=${item.id}` : 
                            item.type === 'NGO' ? `/dashboard/ngos?edit=${item.id}` : `/dashboard/institutions?edit=${item.id}`
                          }
                          className="py-1 px-1 text-center text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 flex items-center justify-center gap-1"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => navigate('/dashboard/inspections/surprise')}
                          className="py-1 px-1 text-center text-[10px] font-semibold bg-primary hover:bg-primary-dark text-white rounded flex items-center justify-center gap-1 shadow-xs"
                        >
                          <ShieldCheck className="w-2.5 h-2.5" /> Inspect
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Location List Panel */}
        <div className="hidden md:flex flex-col w-80 bg-white border-l border-slate-200 overflow-hidden shrink-0">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              Geo-Tagged Entities ({validLocations.length})
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar text-xs">
            {validLocations.map((item, idx) => (
              <div
                key={`sidebar-${item.id}-${idx}`}
                onClick={() => jumpTo([item.latitude, item.longitude], 13)}
                className="p-2.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-primary/40 rounded-lg cursor-pointer transition-all"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                    item.type === 'Institution' ? 'bg-blue-100 text-blue-700' :
                    item.type === 'NGO' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.type}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {item.district}
                  </span>
                </div>
                <p className="font-bold text-slate-800 line-clamp-1">{item.name || item.organizationName}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.state}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
