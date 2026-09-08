import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, AlertTriangle, Video, ShieldAlert, CheckCircle2, 
  FileText, Check, ArrowUpRight
} from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 'NOTIF-1',
      title: 'Unannounced Surprise Inspection Dispatched',
      message: 'Surprise inspection INSP-2024-004 triggered for Navjeevan Rehabilitation Society based on CCTV anomaly.',
      type: 'INSPECTION',
      severity: 'HIGH',
      timestamp: '15 mins ago',
      isRead: false,
      link: '/dashboard/inspections/INSP-2024-004'
    },
    {
      id: 'NOTIF-2',
      title: 'CCTV Camera Offline Alert Flagged',
      message: 'Main Entrance Camera CAM-03 at Navjeevan Rehab (NGO003) offline for over 6 hours.',
      type: 'CCTV',
      severity: 'CRITICAL',
      timestamp: '1 hour ago',
      isRead: false,
      link: '/dashboard/cctv'
    },
    {
      id: 'NOTIF-3',
      title: 'Corrective Action Remedy Verified',
      message: 'Remediation CA-001 (Fire extinguisher replacement) verified and approved by State Monitoring Cell.',
      type: 'CORRECTIVE_ACTION',
      severity: 'LOW',
      timestamp: '3 hours ago',
      isRead: true,
      link: '/dashboard/corrective-actions'
    },
    {
      id: 'NOTIF-4',
      title: 'New Beneficiary Grievance Received',
      message: 'CMP-002: Beneficiary stipend withholding reported for Nayi Disha Social Service Society.',
      type: 'COMPLAINT',
      severity: 'HIGH',
      timestamp: '5 hours ago',
      isRead: false,
      link: '/dashboard/complaints'
    },
    {
      id: 'NOTIF-5',
      title: 'Statutory Inspection Report Signed',
      message: 'Dr. Rajesh Verma submitted completed inspection dossier for National Institute of Social Defence.',
      type: 'REPORT',
      severity: 'LOW',
      timestamp: 'Yesterday',
      isRead: true,
      link: '/dashboard/reports'
    }
  ]);

  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'CRITICAL'>('ALL');

  const filtered = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'CRITICAL') return n.severity === 'CRITICAL' || n.severity === 'HIGH';
    return true;
  });

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'CCTV':
        return <Video className="w-4 h-4 text-red-600" />;
      case 'INSPECTION':
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      case 'COMPLAINT':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'REPORT':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'CORRECTIVE_ACTION':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">National Notifications Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {notifications.filter(n => !n.isRead).length} Unread
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Real-time automated alerts, surveillance anomalies, and inspection lifecycle updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Check className="w-4 h-4 text-emerald-600" /> Mark All as Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        {[
          { id: 'ALL', label: `All Notifications (${notifications.length})` },
          { id: 'UNREAD', label: `Unread Only (${notifications.filter(n => !n.isRead).length})` },
          { id: 'CRITICAL', label: `Urgent & Critical (${notifications.filter(n => n.severity === 'CRITICAL' || n.severity === 'HIGH').length})` }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id as any)}
            className={`pb-2.5 border-b-2 transition-colors ${
              filter === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No notifications in this view.</p>
          </div>
        ) : (
          filtered.map(notif => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                !notif.isRead 
                  ? 'bg-blue-50/40 border-blue-200 shadow-xs' 
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg mt-0.5 ${
                  notif.severity === 'CRITICAL' ? 'bg-red-100' :
                  notif.severity === 'HIGH' ? 'bg-amber-100' :
                  'bg-slate-100'
                }`}>
                  {getIcon(notif.type)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{notif.title}</h3>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-2">{notif.timestamp}</p>
                </div>
              </div>

              {notif.link && (
                <Link
                  to={notif.link}
                  className="px-3 py-1.5 text-xs font-semibold text-primary bg-white hover:bg-blue-50 border border-blue-200 rounded-lg shrink-0 flex items-center gap-1 transition-colors"
                >
                  View Details <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
