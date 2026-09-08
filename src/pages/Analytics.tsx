import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { demoInspectors, demoOrganizations } from '../services/mockData';
import { BarChart3, MapPin, ShieldCheck, AlertTriangle, CheckCircle2, TrendingUp, Filter } from 'lucide-react';

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#8b5cf6', '#0891b2', '#f43f5e', '#059669'];

// Regional aggregation data for places in India
const placeInspectionStats = [
  { place: 'Delhi (NCR)', state: 'Delhi', total: 18, completed: 14, inProgress: 3, scheduled: 1, avgScore: 84, criticalIssues: 2, cctvOnline: 8, totalCctv: 8 },
  { place: 'Bengaluru', state: 'Karnataka', total: 8, completed: 7, inProgress: 1, scheduled: 0, avgScore: 89, criticalIssues: 0, cctvOnline: 4, totalCctv: 4 },
  { place: 'Mumbai / Pune', state: 'Maharashtra', total: 7, completed: 4, inProgress: 2, scheduled: 1, avgScore: 68, criticalIssues: 3, cctvOnline: 4, totalCctv: 5 },
  { place: 'Lucknow', state: 'Uttar Pradesh', total: 5, completed: 3, inProgress: 1, scheduled: 1, avgScore: 72, criticalIssues: 1, cctvOnline: 2, totalCctv: 2 },
  { place: 'Hyderabad', state: 'Telangana', total: 4, completed: 2, inProgress: 1, scheduled: 1, avgScore: 61, criticalIssues: 2, cctvOnline: 2, totalCctv: 3 },
  { place: 'Guntur / Vijayawada', state: 'Andhra Pradesh', total: 4, completed: 3, inProgress: 1, scheduled: 0, avgScore: 76, criticalIssues: 1, cctvOnline: 2, totalCctv: 2 },
  { place: 'Jaipur', state: 'Rajasthan', total: 2, completed: 2, inProgress: 0, scheduled: 0, avgScore: 91, criticalIssues: 0, cctvOnline: 1, totalCctv: 1 },
  { place: 'Chennai', state: 'Tamil Nadu', total: 2, completed: 2, inProgress: 0, scheduled: 0, avgScore: 88, criticalIssues: 0, cctvOnline: 1, totalCctv: 1 },
];

export default function Analytics() {
  const [selectedPlace, setSelectedPlace] = useState<string>('ALL');
  const [inspectors] = useState<any[]>(demoInspectors);

  // Filter inspections based on place selection
  const filteredPlaceStats = selectedPlace === 'ALL' 
    ? placeInspectionStats 
    : placeInspectionStats.filter(p => p.place === selectedPlace || p.state === selectedPlace);

  // Aggregated metrics
  const totalInspectionsCount = filteredPlaceStats.reduce((acc, p) => acc + p.total, 0);
  const completedInspectionsCount = filteredPlaceStats.reduce((acc, p) => acc + p.completed, 0);
  const criticalFindingsCount = filteredPlaceStats.reduce((acc, p) => acc + p.criticalIssues, 0);
  const averageComplianceScore = Math.round(
    filteredPlaceStats.reduce((acc, p) => acc + (p.avgScore * p.total), 0) / (totalInspectionsCount || 1)
  );

  // Status breakdown
  const statusChartData = [
    { name: 'Completed', value: completedInspectionsCount, color: '#16a34a' },
    { name: 'In Progress', value: filteredPlaceStats.reduce((acc, p) => acc + p.inProgress, 0), color: '#d97706' },
    { name: 'Scheduled', value: filteredPlaceStats.reduce((acc, p) => acc + p.scheduled, 0), color: '#2563eb' },
    { name: 'Action Required', value: criticalFindingsCount, color: '#dc2626' }
  ];

  // Surprise vs Routine Inspections by Place
  const surpriseVsRoutineData = filteredPlaceStats.map(p => ({
    name: p.place.split(' ')[0],
    Routine: Math.round(p.total * 0.65),
    Surprise: Math.max(1, Math.round(p.total * 0.35))
  }));

  // Monthly Inspections Volume
  const monthlyData = [
    { month: 'Jan', count: Math.round(totalInspectionsCount * 0.12) + 2 },
    { month: 'Feb', count: Math.round(totalInspectionsCount * 0.16) + 3 },
    { month: 'Mar', count: Math.round(totalInspectionsCount * 0.14) + 2 },
    { month: 'Apr', count: Math.round(totalInspectionsCount * 0.18) + 4 },
    { month: 'May', count: Math.round(totalInspectionsCount * 0.22) + 5 },
    { month: 'Jun', count: Math.round(totalInspectionsCount * 0.18) + 3 }
  ];

  // Inspector Workload
  const inspectorWorkload = inspectors.slice(0, 6).map(ins => ({
    name: ins.name.split(' ')[0],
    completed: ins.assignedInspectionCount || Math.floor(Math.random() * 4) + 1,
    pending: Math.floor(Math.random() * 2) + 1
  }));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Page Header & Place Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Inspection Intelligence & Place-Wise Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live National Feed
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Data analysis of inspections, compliance scores, and risk distributions across institutions and NGOs by place.
          </p>
        </div>

        {/* Place Selector Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-primary" /> Filter by Place:
          </label>
          <select
            value={selectedPlace}
            onChange={(e) => setSelectedPlace(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded shadow-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-800 w-full md:w-60"
          >
            <option value="ALL">🇮🇳 All India (8 States / 50 Inspections)</option>
            <option value="Delhi (NCR)">🏛️ Delhi (NCR) - 18 Inspections</option>
            <option value="Bengaluru">🏢 Bengaluru (Karnataka) - 8 Inspections</option>
            <option value="Mumbai / Pune">🏙️ Mumbai & Pune (Maharashtra) - 7 Inspections</option>
            <option value="Lucknow">⚖️ Lucknow (Uttar Pradesh) - 5 Inspections</option>
            <option value="Hyderabad">🌐 Hyderabad (Telangana) - 4 Inspections</option>
            <option value="Guntur / Vijayawada">🌿 Guntur / Vijayawada (AP) - 4 Inspections</option>
            <option value="Jaipur">🏰 Jaipur (Rajasthan) - 2 Inspections</option>
            <option value="Chennai">⚓ Chennai (Tamil Nadu) - 2 Inspections</option>
          </select>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="nirikshan-panel-primary p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Inspections</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalInspectionsCount}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {completedInspectionsCount} Completed in Places
              </p>
            </div>
            <div className="p-2.5 bg-blue-50 text-primary rounded border border-blue-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="nirikshan-panel p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Compliance Score</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{averageComplianceScore}%</h3>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                National Standard: 70.0%
              </p>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="nirikshan-panel p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Places / Regions Monitored</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{filteredPlaceStats.length} Jurisdictions</h3>
              <p className="text-[11px] text-blue-600 font-semibold mt-1">
                {demoOrganizations.length} Total Facilities
              </p>
            </div>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded border border-purple-200">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="nirikshan-panel p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical Violations</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{criticalFindingsCount} Issues</h3>
              <p className="text-[11px] text-red-600 font-semibold mt-1">
                Under Corrective Review
              </p>
            </div>
            <div className="p-2.5 bg-red-50 text-red-600 rounded border border-red-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Place-Wise Inspection Volume */}
        <div className="nirikshan-panel p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">1. Inspection Volume by Place</h3>
              <p className="text-xs text-slate-500">Distribution of completed and pending visits across monitored cities/regions</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">Regional Breakdown</span>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredPlaceStats} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="place" angle={-15} textAnchor="end" interval={0} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="completed" name="Completed" fill="#16a34a" radius={[3, 3, 0, 0]} stackId="a" />
                <Bar dataKey="inProgress" name="In Progress" fill="#d97706" radius={[3, 3, 0, 0]} stackId="a" />
                <Bar dataKey="scheduled" name="Scheduled" fill="#2563eb" radius={[3, 3, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Place-Wise Compliance Score Comparison */}
        <div className="nirikshan-panel p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">2. Average Compliance Score by Place (/100)</h3>
              <p className="text-xs text-slate-500">Average audit and checklist score across institutions and NGOs in each location</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">Quality Index</span>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredPlaceStats} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis dataKey="place" type="category" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="avgScore" name="Avg Score" radius={[0, 4, 4, 0]} barSize={16}>
                  {filteredPlaceStats.map((p, idx) => (
                    <Cell 
                      key={`bar-${idx}`} 
                      fill={p.avgScore >= 80 ? '#16a34a' : p.avgScore >= 70 ? '#2563eb' : p.avgScore >= 60 ? '#d97706' : '#dc2626'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Surprise vs Routine Inspections by Place */}
        <div className="nirikshan-panel p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">3. Surprise vs Routine Inspections by Location</h3>
              <p className="text-xs text-slate-500">Unannounced surprise visits triggered via smart risk algorithm vs routine checks</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">MoSJE Protocol</span>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={surpriseVsRoutineData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Routine" fill="#2563eb" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Surprise" fill="#d97706" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Overall Inspection Status Breakdown */}
        <div className="nirikshan-panel p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">4. Inspection Status Portfolio</h3>
              <p className="text-xs text-slate-500">Live operational lifecycle status of all {totalInspectionsCount} inspections</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">National Status</span>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={statusChartData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={65} 
                  outerRadius={100} 
                  paddingAngle={4} 
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Monthly Inspection Throughput Trend */}
        <div className="nirikshan-panel p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">5. Monthly Inspection Volume (Throughput)</h3>
              <p className="text-xs text-slate-500">Cumulative inspection reports processed across all centers</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">YTD Trend</span>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" name="Inspections" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Active Field Officer Deployment */}
        <div className="nirikshan-panel p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">6. Inspector Workload & Deployment</h3>
              <p className="text-xs text-slate-500">Active assignments per empanelled lead officer</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">Cadre Metrics</span>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inspectorWorkload} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="completed" name="Completed" fill="#16a34a" radius={[3, 3, 0, 0]} />
                <Bar dataKey="pending" name="In Progress" fill="#d97706" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Place-wise Executive Summary Data Table */}
      <div className="nirikshan-panel overflow-hidden mt-6">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Place-Wise Inspection Audit Register</h3>
            <p className="text-xs text-slate-500">Comprehensive compliance summary categorized by state, city, and jurisdiction.</p>
          </div>
          <span className="text-xs font-bold text-slate-500">{filteredPlaceStats.length} Places Logged</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Place / City</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3 text-center">Total Inspections</th>
                <th className="px-4 py-3 text-center">Completed</th>
                <th className="px-4 py-3 text-center">Avg Score</th>
                <th className="px-4 py-3 text-center">Critical Issues</th>
                <th className="px-4 py-3 text-center">CCTV Cameras</th>
                <th className="px-4 py-3 text-right">Compliance Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-xs">
              {filteredPlaceStats.map((p) => (
                <tr key={p.place} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    {p.place}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.state}</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-800">{p.total}</td>
                  <td className="px-4 py-3 text-center text-emerald-700 font-medium">{p.completed}</td>
                  <td className="px-4 py-3 text-center font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      p.avgScore >= 80 ? 'bg-emerald-100 text-emerald-800' :
                      p.avgScore >= 70 ? 'bg-blue-100 text-blue-800' :
                      p.avgScore >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {p.avgScore}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">
                    {p.criticalIssues > 0 ? (
                      <span className="text-red-600 font-bold">{p.criticalIssues} Flags</span>
                    ) : (
                      <span className="text-emerald-600">0 Nil</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-slate-600">
                    {p.cctvOnline}/{p.totalCctv} Online
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                      p.avgScore >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      p.avgScore >= 70 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      p.avgScore >= 60 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {p.avgScore >= 80 ? 'HIGH COMPLIANCE' : p.avgScore >= 70 ? 'SATISFACTORY' : p.avgScore >= 60 ? 'NEEDS ATTENTION' : 'CRITICAL RISK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
