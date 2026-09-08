import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Building2, 
  Users, 
  ClipboardCheck, 
  MessageSquareWarning, 
  TrendingUp, 
  TrendingDown,
  MapPin,
  Clock,
  Camera,
  ArrowRight
} from 'lucide-react';

const stats = [
  { name: 'Total Organizations', value: '2,405', change: '+12.5%', trend: 'up', icon: Building2 },
  { name: 'Active NGOs', value: '1,842', change: '+5.2%', trend: 'up', icon: Users },
  { name: 'Pending Inspections', value: '342', change: '-2.4%', trend: 'down', icon: ClipboardCheck },
  { name: 'Open Complaints', value: '89', change: '+14.1%', trend: 'up', icon: MessageSquareWarning },
];

const recentActivity = [
  { id: 1, type: 'Inspection', entity: 'Asha Bhavan NGO', status: 'Completed', time: '2026-09-03 14:30', location: 'Delhi', inspector: 'R. Sharma' },
  { id: 2, type: 'Complaint', entity: 'Snehalaya Shelter', status: 'Under Review', time: '2026-09-03 11:15', location: 'Mumbai', inspector: 'Unassigned' },
  { id: 3, type: 'Registration', entity: 'Care Foundation', status: 'Approved', time: '2026-09-02 16:45', location: 'Pune', inspector: 'A. Patel' },
  { id: 4, type: 'Inspection', entity: 'Vatsalya Trust', status: 'Scheduled', time: '2026-09-02 09:00', location: 'Bangalore', inspector: 'M. Singh' },
];

const throughputData = [
  { name: 'Week 1', inspections: 45, complaints: 12 },
  { name: 'Week 2', inspections: 52, complaints: 15 },
  { name: 'Week 3', inspections: 38, complaints: 8 },
  { name: 'Week 4', inspections: 65, complaints: 18 },
  { name: 'Week 5', inspections: 48, complaints: 14 },
  { name: 'Week 6', inspections: 55, complaints: 16 },
  { name: 'Week 7', inspections: 70, complaints: 20 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Command Center Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time metrics and network activity.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs">
            Export Data
          </button>
          <button className="btn-primary text-xs">
            New Assignment
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          // Assign different panel hierarchies to show off the design system
          const panelClass = index === 0 ? 'nirikshan-panel-primary' : 
                             index === 1 ? 'nirikshan-panel-accent' : 
                             'nirikshan-panel';
                             
          return (
            <div key={stat.name} className={panelClass}>
              <div className="nirikshan-panel-body flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.name}</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-sm border border-slate-200">
                    <Icon className="w-5 h-5 text-slate-600" />
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  {stat.trend === 'up' ? (
                    <span className="flex items-center text-semantic-success">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      {stat.change}
                    </span>
                  ) : (
                    <span className="flex items-center text-semantic-warning">
                      <TrendingDown className="w-3.5 h-3.5 mr-1" />
                      {stat.change}
                    </span>
                  )}
                  <span className="text-slate-400">vs last period</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Area */}
        <div className="lg:col-span-2 nirikshan-panel flex flex-col">
          <div className="nirikshan-panel-header">
            <h2 className="nirikshan-panel-title">Inspection Throughput</h2>
            <select className="bg-white border border-slate-300 text-slate-700 text-xs rounded-sm px-2 py-1 outline-none focus:ring-1 focus:ring-primary">
              <option>Q3 2026</option>
              <option>Q2 2026</option>
              <option>YTD</option>
            </select>
          </div>
          
          <div className="flex-1 min-h-[300px] bg-white p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={throughputData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInspections" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area type="monotone" dataKey="inspections" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorInspections)" name="Inspections" />
                <Area type="monotone" dataKey="complaints" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorComplaints)" name="Complaints" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live CCTV Surveillance Quick Card */}
        <div className="lg:col-span-1 nirikshan-panel flex flex-col justify-between">
          <div className="nirikshan-panel-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" />
              <h2 className="nirikshan-panel-title">Live CCTV Surveillance</h2>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              48 Live
            </span>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
            {/* Live Camera Snapshot Preview */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black border border-slate-700 shadow-inner group">
              <img
                src="https://images.unsplash.com/photo-1577495508048-b635879837f1?w=500&auto=format&fit=crop&q=80"
                alt="Live Surveillance"
                className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40"></div>
              
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="bg-black/75 text-white font-mono text-[9px] px-1.5 py-0.5 rounded border border-white/20">
                  CAM-01 • Main Gate
                </span>
              </div>
              <div className="absolute top-2 right-2 bg-red-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                REC
              </div>
              <div className="absolute bottom-2 inset-x-2 bg-black/75 text-amber-300 font-mono text-[9px] px-2 py-0.5 rounded flex justify-between">
                <span>NISD New Delhi</span>
                <span>30 FPS</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Online</p>
                <p className="font-bold text-emerald-700 mt-0.5">48 feeds</p>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Offline</p>
                <p className="font-bold text-slate-600 mt-0.5">6 feeds</p>
              </div>
              <div className="p-2 bg-red-50 rounded border border-red-200">
                <p className="text-[10px] text-red-500 font-bold uppercase">Alerts</p>
                <p className="font-bold text-red-700 mt-0.5">3 flags</p>
              </div>
            </div>

            <Link
              to="/dashboard/cctv"
              className="w-full py-2 px-3 bg-slate-900 hover:bg-black text-amber-300 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-amber-500/30 shadow-xs"
            >
              <span>Launch CCTV Command Center</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
            </Link>
          </div>
        </div>

        {/* Data Table Area replacing Recent Activity cards */}
        <div className="lg:col-span-3 nirikshan-panel flex flex-col">
          <div className="nirikshan-panel-header">
            <h2 className="nirikshan-panel-title">Operational Log</h2>
            <button className="text-xs font-medium text-accent hover:text-accent-dark">View Full Log</button>
          </div>
          
          <div className="nirikshan-table-container">
            <table className="nirikshan-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Type</th>
                  <th>Entity / Location</th>
                  <th>Inspector</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((activity) => (
                  <tr key={activity.id}>
                    <td className="font-mono text-xs flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {activity.time}
                    </td>
                    <td>
                      <span className="font-semibold text-slate-700">{activity.type}</span>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-medium">{activity.entity}</span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {activity.location}
                        </span>
                      </div>
                    </td>
                    <td>{activity.inspector}</td>
                    <td>
                      <span className={
                        activity.status === 'Completed' ? 'badge-success' : 
                        activity.status === 'Under Review' ? 'badge-warning' : 
                        activity.status === 'Approved' ? 'badge-success' : 
                        'badge-neutral'
                      }>
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
