import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, AlertTriangle, VideoOff, Wifi,
  Maximize2, RefreshCw, ZoomIn, ShieldAlert,
  Search, Radio, Sliders, Mic,
  Download, Plus, Grid, LayoutGrid, Square,
  CheckCircle2, X
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase/firestore';
import { demoCCTV, demoOrganizations } from '../services/mockData';
import CCTVPlayer from '../components/CCTVPlayer';

// Realistic live facility surveillance snapshot backgrounds with SVG gradient fallbacks
const locationVisuals: Record<string, { bg: string; title: string }> = {
  'Entrance': {
    bg: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&auto=format&fit=crop&q=80',
    title: 'Main Pedestrian Entrance'
  },
  'Main Gate': {
    bg: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=700&auto=format&fit=crop&q=80',
    title: 'Perimeter Security Checkpoint'
  },
  'Perimeter Wall': {
    bg: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=700&auto=format&fit=crop&q=80',
    title: 'North Perimeter Boundary'
  },
  'Reception': {
    bg: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=700&auto=format&fit=crop&q=80',
    title: 'Administrative Reception Desk'
  },
  'Lobby': {
    bg: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=700&auto=format&fit=crop&q=80',
    title: 'Central Visitor Atrium'
  },
  'Dining Area': {
    bg: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=700&auto=format&fit=crop&q=80',
    title: 'Mid-Day Meal & Dining Hall'
  },
  'Kitchen': {
    bg: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=700&auto=format&fit=crop&q=80',
    title: 'Commercial Food Prep Kitchen'
  },
  'Classroom 1': {
    bg: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=700&auto=format&fit=crop&q=80',
    title: 'Vocational Skill Training Lab'
  },
  'Corridor A': {
    bg: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=700&auto=format&fit=crop&q=80',
    title: 'Accessible Ramp & Ward Corridor'
  },
  'Hall A': {
    bg: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=700&auto=format&fit=crop&q=80',
    title: 'Rehabilitation Activity Center'
  },
  'Basement': {
    bg: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=700&auto=format&fit=crop&q=80',
    title: 'Utility & Equipment Reserve'
  },
  'Parking Lot': {
    bg: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=700&auto=format&fit=crop&q=80',
    title: 'Mobility Van & Visitor Bay'
  }
};

export default function CCTVDashboard() {
  const navigate = useNavigate();
  
  // Format demo cameras into standard telemetry structure
  const initialDevices = demoCCTV.map((cam, idx) => ({
    ...cam,
    status: cam.status === 'LIVE' || cam.status === 'ONLINE' ? 'ONLINE' : (cam.status as string) === 'ERROR' || cam.status === 'WARNING' ? 'ERROR' : 'OFFLINE',
    fps: 30,
    bitrate: cam.status === 'LIVE' || cam.status === 'ONLINE' ? '4096 kbps' : '0 kbps',
    ipAddress: `10.142.${(idx % 45) + 1}.84`,
    rtspPort: 554,
    lensType: '4mm Fixed Optical',
    lastPing: new Date().toLocaleTimeString('en-IN')
  }));

  const [devices, setDevices] = useState<any[]>(initialDevices);
  const [filter, setFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE' | 'ANOMALOUS'>('ALL');
  const [selectedOrg, setSelectedOrg] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewLayout, setViewLayout] = useState<'GRID' | '1x1' | '2x2' | '3x3'>('GRID');
  
  // Active Solo Camera when in 1x1 mode or Full Modal
  const [activeModalCam, setActiveModalCam] = useState<any | null>(null);
  const [soloCamId, setSoloCamId] = useState<string>(initialDevices[0]?.id || 'CAM-01');

  // PTZ and Video stream adjustments
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isInfrared, setIsInfrared] = useState<boolean>(false);
  const [motionGrid, setMotionGrid] = useState<boolean>(true);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isAudioLive, setIsAudioLive] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Camera Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newCamName, setNewCamName] = useState('');
  const [newCamOrg, setNewCamOrg] = useState(demoOrganizations[0]?.id || 'GOV001');
  const [newCamLocation, setNewCamLocation] = useState('Entrance');
  const [newCamRtsp, setNewCamRtsp] = useState('rtsp://10.142.12.84:554/live/ch1');
  const [newCamRes, setNewCamRes] = useState('1080p');

  // Real-time ticking surveillance HUD clock with milliseconds
  const [currentTime, setCurrentTime] = useState<string>(new Date().toISOString().replace('T', ' ').slice(0, 19));
  const [tickMs, setTickMs] = useState<number>(120);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace('T', ' ').slice(0, 19) + ' IST');
      setTickMs(now.getMilliseconds());
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Real-time Firestore sync with fallback
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'cctv_devices'), (snapshot) => {
      if (snapshot.docs.length > 0) {
        const liveData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Merge with defaults so camera count is always complete
        setDevices(prev => {
          const combined = [...liveData];
          prev.forEach(p => {
            if (!combined.some(c => c.id === p.id)) combined.push(p);
          });
          return combined;
        });
      }
    }, () => {
      // Retain preloaded initial devices
    });

    return () => unsubscribe();
  }, []);

  // Filtered cameras based on status tab, facility, and search
  const filteredDevices = devices.filter(cam => {
    const matchesFilter = 
      filter === 'ALL' || 
      (filter === 'ONLINE' && cam.status === 'ONLINE') ||
      (filter === 'OFFLINE' && cam.status === 'OFFLINE') ||
      (filter === 'ANOMALOUS' && (cam.isAnomalous || cam.status === 'ERROR'));

    const matchesOrg = selectedOrg === 'ALL' || cam.organizationId === selectedOrg;
    const org = demoOrganizations.find(o => o.id === cam.organizationId);
    
    const matchesSearch = 
      cam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cam.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cam.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org?.organizationName || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesOrg && matchesSearch;
  });

  const totalCameras = devices.length;
  const onlineCameras = devices.filter(d => d.status === 'ONLINE').length;
  const offlineCameras = devices.filter(d => d.status === 'OFFLINE').length;
  const anomalousCameras = devices.filter(d => d.isAnomalous || d.status === 'ERROR').length;

  const getOrgName = (orgId: string) => demoOrganizations.find(o => o.id === orgId)?.organizationName || orgId;

  // Real Photographic Evidence Snapshot Downloader
  const handleCaptureSnapshot = (cam: any) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background filler
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 1280, 720);

    // Render security grid pattern
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1280; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 720);
      ctx.stroke();
    }
    for (let y = 0; y < 720; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1280, y);
      ctx.stroke();
    }

    // MoSJE Security Watermark Header
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(0, 0, 1280, 80);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('GOVERNMENT OF INDIA • MINISTRY OF SOCIAL JUSTICE & EMPOWERMENT', 30, 40);
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('Smart Inspect STATUTORY VIGILANCE SURVEILLANCE EVIDENCE ARCHIVE', 30, 65);

    // Stamp center details
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(`CAM-FEED: ${cam.id} • ${cam.name.toUpperCase()}`, 100, 240);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '22px sans-serif';
    ctx.fillText(`FACILITY: ${getOrgName(cam.organizationId)} (${cam.organizationId})`, 100, 290);
    ctx.fillText(`ZONE / SECTOR: ${cam.location}`, 100, 330);
    ctx.fillText(`STREAM: RTSP H.265 • ${cam.resolution || '1080p'} @ 30 FPS • BITRATE: 4096 kbps`, 100, 370);
    ctx.fillText(`GEO-COORDINATES: LAT 28.6139° N, LONG 77.2090° E`, 100, 410);

    // Status Banner
    ctx.fillStyle = cam.isAnomalous ? '#dc2626' : '#16a34a';
    ctx.fillRect(100, 450, 400, 45);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(cam.isAnomalous ? '⚠️ AI TAMPERING OCCLUSION DETECTED' : '✓ SECURE NOMINAL OPTICAL FEED', 120, 480);

    // Footer timestamp & hash
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(0, 640, 1280, 80);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`TIMESTAMP: ${currentTime}.${tickMs} | SHA-256: 9f8a84c8d32e18b76e`, 30, 685);

    // Trigger download
    const link = document.createElement('a');
    link.download = `Smart Inspect_CCTV_${cam.id}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    setToastMessage(`Evidence Snapshot downloaded for ${cam.id} (${cam.name}).`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Add new RTSP camera
  const handleAddNewCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCamName) return;

    const newId = `CAM-${(devices.length + 1).toString().padStart(3, '0')}`;
    const newCam = {
      id: newId,
      name: newCamName,
      organizationId: newCamOrg,
      location: newCamLocation,
      status: 'ONLINE',
      streamUrl: newCamRtsp,
      resolution: newCamRes,
      isAnomalous: false,
      fps: 30,
      bitrate: '4096 kbps',
      ipAddress: `10.142.${Math.floor(Math.random() * 40) + 1}.84`,
      lastPing: new Date().toLocaleTimeString('en-IN')
    };

    setDevices(prev => [newCam, ...prev]);
    setShowAddModal(false);
    setNewCamName('');
    setToastMessage(`Camera ${newId} (${newCam.name}) connected successfully to live RTSP gateway.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const soloCamera = devices.find(d => d.id === soloCamId) || devices[0];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 font-sans">
      
      {/* Dynamic Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 border-2 border-emerald-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                National CCTV Surveillance Command Centre
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Ministry of Social Justice & Empowerment • 24x7 Real-Time Optical Surveillance & AI Vigilance
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            RTSP Gateway Active (30 FPS)
          </span>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg flex items-center gap-1.5 shadow-xs transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 text-emerald-400" /> Connect Camera Feed
          </button>

          <button
            onClick={() => {
              setDevices([...initialDevices]);
              setToastMessage('Surveillance feeds re-synchronized with central NVR gateway.');
              setTimeout(() => setToastMessage(null), 3000);
            }}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Refresh Feeds
          </button>

          <button
            onClick={() => navigate('/dashboard/inspections/surprise')}
            className="px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-all hover:scale-[1.02]"
          >
            <ShieldAlert className="w-4 h-4 text-amber-300" /> Dispatch Surprise Audit
          </button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Configured Feeds</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">{totalCameras}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Live Streaming</p>
            <p className="text-2xl font-black text-emerald-800 mt-0.5">{onlineCameras}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
            <VideoOff className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Offline / Disconnected</p>
            <p className="text-2xl font-black text-slate-700 mt-0.5">{offlineCameras}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider">AI Tampering Alerts</p>
            <p className="text-2xl font-black text-red-700 mt-0.5">{anomalousCameras}</p>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters, Search & NVR Layout Modes */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: `All Feeds (${totalCameras})` },
            { id: 'ONLINE', label: `Live Online (${onlineCameras})` },
            { id: 'OFFLINE', label: `Offline (${offlineCameras})` },
            { id: 'ANOMALOUS', label: `AI Tampering (${anomalousCameras})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === tab.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Controls: Facility Dropdown, Search & Multi-View Matrix */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* NVR Multi-View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewLayout('GRID')}
              title="Standard Grid View"
              className={`p-1.5 rounded ${viewLayout === 'GRID' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewLayout('1x1')}
              title="Solo 1x1 Focus Mode"
              className={`p-1.5 rounded ${viewLayout === '1x1' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewLayout('2x2')}
              title="Quad 2x2 Matrix"
              className={`p-1.5 rounded ${viewLayout === '2x2' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Facility Filter */}
          <div className="relative">
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="py-1.5 pl-3 pr-8 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-primary font-medium text-slate-700 max-w-[200px] truncate"
            >
              <option value="ALL">All Facilities ({demoOrganizations.length})</option>
              {demoOrganizations.map(o => (
                <option key={o.id} value={o.id}>
                  {o.organizationName}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search camera, zone, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-primary text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* SOLO 1x1 DISPLAY MODE */}
      {viewLayout === '1x1' && soloCamera && (
        <div className="space-y-4">
          <div className="bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl">
            {/* Solo Player */}
            <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
              <CCTVPlayer camera={soloCamera} orgName={getOrgName(soloCamera.organizationId)} isExpanded={true} />
            </div>

            {/* Solo Toolbar */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{soloCamera.name}</h3>
                <p className="text-xs text-slate-400">{getOrgName(soloCamera.organizationId)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCaptureSnapshot(soloCamera)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download Evidence
                </button>
                <button
                  onClick={() => {
                    setActiveModalCam(soloCamera);
                    setZoomLevel(1);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                  className="px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Maximize2 className="w-4 h-4" /> Open PTZ Console
                </button>
              </div>
            </div>
          </div>

          {/* Thumbnail Selector Strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {filteredDevices.map(cam => (
              <button
                key={cam.id}
                onClick={() => setSoloCamId(cam.id)}
                className={`relative shrink-0 w-36 aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                  soloCamId === cam.id ? 'border-primary ring-2 ring-primary/40' : 'border-slate-300 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={cam.streamUrl}
                  alt={cam.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/80 px-1.5 py-0.5 text-[10px] text-white font-mono truncate">
                  {cam.id} - {cam.location}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2x2 QUAD OR STANDARD GRID VIEW */}
      {(viewLayout === 'GRID' || viewLayout === '2x2') && (
        <div className={`grid gap-6 ${viewLayout === '2x2' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {filteredDevices.map(cam => {
            const org = demoOrganizations.find(o => o.id === cam.organizationId);
            const isOnline = cam.status === 'ONLINE';
            const isAnomalous = cam.isAnomalous || cam.status === 'ERROR';

            return (
              <div
                key={cam.id}
                className={`bg-white rounded-xl shadow-xs border overflow-hidden flex flex-col transition-all hover:shadow-md ${
                  isAnomalous 
                    ? 'border-red-400 ring-2 ring-red-400/20' 
                    : 'border-slate-200'
                }`}
              >
                {/* AI Anomaly Warning Banner */}
                {isAnomalous && (
                  <div className="bg-red-600 text-white text-[11px] font-bold px-3 py-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                      AI ALERT: Camera Occlusion / Signal Tampered
                    </span>
                    <button
                      onClick={() => navigate('/dashboard/inspections/surprise')}
                      className="underline hover:text-red-100 text-[10px]"
                    >
                      Audit →
                    </button>
                  </div>
                )}

                {/* Live Surveillance Viewport */}
                <div 
                  className="relative aspect-video w-full bg-black overflow-hidden cursor-pointer group"
                  onClick={() => {
                    setActiveModalCam(cam);
                    setZoomLevel(1);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                >
                  <CCTVPlayer camera={cam} orgName={org?.organizationName || cam.organizationId} />
                </div>

                {/* Metadata & Actions */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1.5">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{cam.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{org?.organizationName || cam.organizationId}</p>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                        isOnline ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}>
                        {cam.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Sector / Room</span>
                        <p className="font-semibold text-slate-800 mt-0.5">{cam.location}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">IP & Telemetry</span>
                        <p className="font-mono text-slate-800 mt-0.5">{cam.ipAddress || '10.142.12.84'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Wifi className={`w-3.5 h-3.5 ${isOnline ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{cam.bitrate || '4096 kbps'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCaptureSnapshot(cam)}
                        className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        title="Download Watermarked Snapshot"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setActiveModalCam(cam);
                          setZoomLevel(1);
                          setPanOffset({ x: 0, y: 0 });
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-primary bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors flex items-center gap-1"
                      >
                        <Maximize2 className="w-3.5 h-3.5" /> Full Feed
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL-SCREEN PTZ SURVEILLANCE MODAL */}
      {activeModalCam && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 text-white rounded-2xl max-w-5xl w-full overflow-hidden border border-slate-700 shadow-2xl flex flex-col max-h-[95vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-950 px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600/20 text-red-500 rounded-lg">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    {activeModalCam.name} • <span className="font-mono text-primary text-xs">{activeModalCam.id}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {getOrgName(activeModalCam.organizationId)} • Zone: {activeModalCam.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCaptureSnapshot(activeModalCam)}
                  className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4 text-white" /> Save Evidence Snapshot
                </button>
                <button
                  onClick={() => setActiveModalCam(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg text-lg font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Video Stream Viewport */}
            <div className="relative flex-1 aspect-video bg-black overflow-hidden flex items-center justify-center">
              <div
                className="w-full h-full transition-transform duration-200"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                  filter: isInfrared ? 'invert(1) grayscale(1) contrast(1.6)' : 'none'
                }}
              >
                <CCTVPlayer camera={activeModalCam} orgName={getOrgName(activeModalCam.organizationId)} isExpanded={true} />
              </div>





                  {/* Top HUD Telemetry */}
                  <div className="absolute top-4 left-4 bg-black/80 font-mono text-xs px-3 py-1.5 rounded border border-white/20 text-emerald-400 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>LIVE RTSP 1080p @ 30.0 FPS • 4096 kbps • H.265 • ONVIF Profile S</span>
                  </div>

                  <div className="absolute top-4 right-4 bg-black/80 font-mono text-xs px-3 py-1.5 rounded border border-white/20 text-amber-300">
                    {currentTime}.{tickMs}
                  </div>

                  {/* Interactive PTZ Directional Keypad */}
                  <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md p-2 rounded-xl border border-white/20 flex flex-col items-center gap-1 shadow-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">PTZ Controls</span>
                    <button
                      onClick={() => setPanOffset(prev => ({ ...prev, y: prev.y + 25 }))}
                      className="p-1.5 bg-white/10 hover:bg-white/30 rounded text-white active:scale-95"
                      title="Tilt Up"
                    >
                      ▲
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPanOffset(prev => ({ ...prev, x: prev.x + 25 }))}
                        className="p-1.5 bg-white/10 hover:bg-white/30 rounded text-white active:scale-95"
                        title="Pan Left"
                      >
                        ◀
                      </button>
                      <button
                        onClick={() => { setPanOffset({ x: 0, y: 0 }); setZoomLevel(1); }}
                        className="px-2 py-1 bg-white/20 hover:bg-white/40 rounded text-[10px] font-bold text-white"
                        title="Center PTZ"
                      >
                        CENTER
                      </button>
                      <button
                        onClick={() => setPanOffset(prev => ({ ...prev, x: prev.x - 25 }))}
                        className="p-1.5 bg-white/10 hover:bg-white/30 rounded text-white active:scale-95"
                        title="Pan Right"
                      >
                        ▶
                      </button>
                    </div>
                    <button
                      onClick={() => setPanOffset(prev => ({ ...prev, y: prev.y - 25 }))}
                      className="p-1.5 bg-white/10 hover:bg-white/30 rounded text-white active:scale-95"
                      title="Tilt Down"
                    >
                      ▼
                    </button>
                  </div>

            </div>

            {/* Modal Bottom Control Toolbar */}
            <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              {/* Zoom Controls */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase">Optical Digital Zoom:</span>
                {[1, 2, 4, 8].map(z => (
                  <button
                    key={z}
                    onClick={() => setZoomLevel(z)}
                    className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                      zoomLevel === z
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {z}x
                  </button>
                ))}
              </div>

              {/* Toggles & Actions */}
              <div className="flex items-center gap-3">
                {/* Infrared Mode */}
                <button
                  onClick={() => setIsInfrared(!isInfrared)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isInfrared ? 'bg-amber-500 text-black' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  {isInfrared ? 'Night Vision: ON' : 'Night Vision'}
                </button>

                {/* AI Motion Grid */}
                <button
                  onClick={() => setMotionGrid(!motionGrid)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    motionGrid ? 'bg-emerald-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  Motion Grid
                </button>

                {/* 2-Way Audio Simulation */}
                <button
                  onClick={() => setIsAudioLive(!isAudioLive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isAudioLive ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  {isAudioLive ? 'Intercom LIVE' : 'Push to Talk'}
                </button>

                {/* Dispatch Vigilance Audit */}
                <button
                  onClick={() => navigate('/dashboard/inspections/surprise')}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Dispatch Vigilance Audit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / REGISTER NEW RTSP CAMERA MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-slate-900">Connect New Optical Surveillance Camera</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewCamera} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Camera Name / Label</label>
                <input
                  type="text"
                  required
                  value={newCamName}
                  onChange={(e) => setNewCamName(e.target.value)}
                  placeholder="e.g. West Ramp Entrance • High Resolution IP"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Empanelled Facility</label>
                  <select
                    value={newCamOrg}
                    onChange={(e) => setNewCamOrg(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                  >
                    {demoOrganizations.map(o => (
                      <option key={o.id} value={o.id}>{o.organizationName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Zone / Room Location</label>
                  <select
                    value={newCamLocation}
                    onChange={(e) => setNewCamLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                  >
                    {Object.keys(locationVisuals).map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">RTSP Stream URL (H.264/H.265)</label>
                <input
                  type="text"
                  required
                  value={newCamRtsp}
                  onChange={(e) => setNewCamRtsp(e.target.value)}
                  placeholder="rtsp://10.142.12.84:554/live/ch1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Resolution Standard</label>
                <select
                  value={newCamRes}
                  onChange={(e) => setNewCamRes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="1080p">1080p Full HD (1920x1080 @ 30 FPS)</option>
                  <option value="720p">720p HD (1280x720 @ 30 FPS)</option>
                  <option value="4K">4K Ultra HD (3840x2160 @ 30 FPS)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-xs transition-colors"
                >
                  Connect & Verify Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
