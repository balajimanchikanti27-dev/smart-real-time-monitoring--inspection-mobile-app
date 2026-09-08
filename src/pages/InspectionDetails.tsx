import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ClipboardCheck, ArrowLeft, MapPin, Calendar, 
  Building2, ShieldAlert, CheckCircle2, Clock, AlertTriangle, 
  FileText, Printer, Camera, Check, X, 
  ArrowUpRight, Video
} from 'lucide-react';
import { demoInspections, demoOrganizations, demoInspectors, demoProjects } from '../services/mockData';

export default function InspectionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find inspection or fallback gracefully to first demo inspection
  const inspection = demoInspections.find(i => i.inspectionId === id) || demoInspections[0];
  const org = demoOrganizations.find(o => o.id === inspection.organizationId);
  const inspector = demoInspectors.find(i => i.inspectorId === inspection.inspectorId);
  const project = demoProjects.find(p => p.projectId === inspection.projectId);

  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'findings' | 'evidence' | 'timeline'>('overview');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> COMPLETED
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 mr-1" /> IN PROGRESS
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Calendar className="w-3.5 h-3.5 mr-1" /> SCHEDULED
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> OVERDUE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  const getRiskBadge = (risk?: string) => {
    switch (risk) {
      case 'CRITICAL':
        return <span className="px-2.5 py-1 rounded text-xs font-black bg-red-600 text-white shadow-xs">CRITICAL RISK</span>;
      case 'HIGH':
        return <span className="px-2.5 py-1 rounded text-xs font-black bg-amber-500 text-white shadow-xs">HIGH RISK</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-1 rounded text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">MEDIUM RISK</span>;
      case 'LOW':
        return <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">LOW RISK</span>;
      default:
        return <span className="px-2.5 py-1 rounded text-xs font-bold bg-slate-100 text-slate-700">UNASSESSED</span>;
    }
  };

  const defaultChecklistItems = [
    { category: 'Infrastructure & Safety', item: 'Building structural integrity and barrier-free tactile ramps', status: 'PASS', remarks: 'Clear slope ramps with dual handrails' },
    { category: 'Infrastructure & Safety', item: 'Fire detection, functional alarms, and unexpired extinguishers', status: inspection.riskLevelFound === 'CRITICAL' || inspection.riskLevelFound === 'HIGH' ? 'FAIL' : 'PASS', remarks: inspection.riskLevelFound === 'CRITICAL' ? 'Extinguishers overdue for testing' : 'All equipment certified' },
    { category: 'Staffing & Biometrics', item: 'Daily staff attendance verified through biometric terminal', status: 'PASS', remarks: 'Aadhaar-based biometric attendance terminal active' },
    { category: 'Staffing & Biometrics', item: 'Qualified medical / rehabilitation officer present on-site', status: inspection.riskLevelFound === 'CRITICAL' ? 'FAIL' : 'PASS', remarks: inspection.riskLevelFound === 'CRITICAL' ? 'Medical officer absent during visit' : 'Registered officer present' },
    { category: 'Beneficiary Records', item: 'Physical register cross-verified with DBT stipend disbursal logs', status: inspection.riskLevelFound === 'CRITICAL' || inspection.riskLevelFound === 'HIGH' ? 'FAIL' : 'PASS', remarks: 'Sample audits conducted across 20 beneficiaries' },
    { category: 'CCTV & Surveillance', item: 'Real-time video feeds transmitted without uninterrupted latency', status: inspection.riskLevelFound === 'CRITICAL' ? 'FAIL' : 'PASS', remarks: inspection.riskLevelFound === 'CRITICAL' ? 'Primary camera offline for 6 hours' : 'Feed live on MoSJE Command Center' },
    { category: 'Hygiene & Food Safety', item: 'Potable water filtration and sanitary washrooms functional', status: 'PASS', remarks: 'TDS verified within permissible standards (85 ppm)' }
  ];

  const subScores = inspection.subScores || {
    infrastructure: 92,
    staffing: 88,
    beneficiaries: 90,
    records: 85,
    safety: 89
  };

  const findings = inspection.findingsList && inspection.findingsList.length > 0 ? inspection.findingsList : [
    ...(inspection.issuesFound && inspection.issuesFound > 0 ? [
      {
        id: 'FND-AUTO-1',
        title: inspection.riskLevelFound === 'CRITICAL' ? 'Mandatory Medical Officer Absent from Facility' : 'Minor Documentation Updating Required',
        severity: (inspection.riskLevelFound as any) || 'LOW',
        category: inspection.riskLevelFound === 'CRITICAL' ? 'Staffing' : 'Records',
        actionRequired: 'Ensure immediate corrective remediation within 14 days.',
        status: inspection.status === 'COMPLETED' ? 'RESOLVED' : 'OPEN'
      }
    ] : [])
  ];

  const evidencePhotos = inspection.evidencePhotos && inspection.evidencePhotos.length > 0 ? inspection.evidencePhotos : [
    {
      id: 'EV-DEF-1',
      title: 'Facility Entrance & Signage Verification',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
      timestamp: inspection.completedAt || inspection.scheduledDate || '2024-03-15T10:30:00Z',
      geotag: inspection.gpsCoordinates || { lat: 28.6139, lng: 77.2090 }
    },
    {
      id: 'EV-DEF-2',
      title: 'Beneficiary Activity Area & Equipment Check',
      url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
      timestamp: inspection.completedAt || inspection.scheduledDate || '2024-03-15T11:45:00Z',
      geotag: inspection.gpsCoordinates || { lat: 28.6139, lng: 77.2090 }
    }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/inspections')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Back to Register"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-primary">{inspection.inspectionId}</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wide">
                {inspection.type} INSPECTION
              </span>
              {getStatusBadge(inspection.status)}
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              {org?.organizationName || 'Government Welfare Facility'}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/dashboard/inspections/${inspection.inspectionId}/checklist`}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <ClipboardCheck className="w-4 h-4" /> Live Checklist
          </Link>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Print
          </button>
          <Link
            to="/dashboard/reports"
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-4 h-4 text-slate-500" /> Dossier
          </Link>
          <Link
            to="/dashboard/map"
            className="px-3 py-1.5 text-xs font-semibold text-primary bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <MapPin className="w-4 h-4 text-primary" /> GIS Map
          </Link>
          <Link
            to="/dashboard/cctv"
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Video className="w-4 h-4 text-slate-500" /> CCTV
          </Link>
        </div>
      </div>

      {/* KPI Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Compliance Score */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-lg ${
            (inspection.overallScore || 0) >= 80 ? 'bg-emerald-100 text-emerald-700 border-4 border-emerald-200' :
            (inspection.overallScore || 0) >= 60 ? 'bg-amber-100 text-amber-700 border-4 border-amber-200' :
            'bg-red-100 text-red-700 border-4 border-red-200'
          }`}>
            {inspection.overallScore ? `${Math.round(inspection.overallScore)}%` : 'N/A'}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compliance Score</p>
            <p className="text-sm font-extrabold text-slate-800 mt-0.5">
              {(inspection.overallScore || 0) >= 80 ? 'Class A (Exemplary)' :
               (inspection.overallScore || 0) >= 60 ? 'Class B (Satisfactory)' : 'Class C (Non-Compliant)'}
            </p>
          </div>
        </div>

        {/* Risk Level */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <ShieldAlert className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assessed Risk</p>
            <div className="mt-1">{getRiskBadge(inspection.riskLevelFound)}</div>
          </div>
        </div>

        {/* Geofence GPS Match */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            inspection.locationMatched ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Geofence Status</p>
            <p className={`text-sm font-bold mt-0.5 flex items-center gap-1 ${
              inspection.locationMatched ? 'text-emerald-700' : 'text-red-700'
            }`}>
              {inspection.locationMatched ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {inspection.locationMatched ? 'GPS Verified' : 'Location Alert'}
            </p>
          </div>
        </div>

        {/* Issues Count */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            (inspection.issuesFound || 0) > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Issues Identified</p>
            <p className="text-xl font-extrabold text-slate-800 mt-0.5">
              {inspection.issuesFound || 0} <span className="text-xs font-normal text-slate-500">findings</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex gap-2">
        {[
          { id: 'overview', label: 'Overview & Analytics', icon: Building2 },
          { id: 'checklist', label: 'Checklist Verification', icon: ClipboardCheck },
          { id: 'findings', label: `Findings & Violations (${findings.length})`, icon: AlertTriangle },
          { id: 'evidence', label: `Digital Evidence (${evidencePhotos.length})`, icon: Camera },
          { id: 'timeline', label: 'Audit Trail & Signature', icon: Clock }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Organization & Inspector Details */}
          <div className="space-y-6">
            {/* Facility Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Inspected Facility
              </h3>
              <p className="font-bold text-slate-900 text-base">{org?.organizationName}</p>
              <p className="text-xs text-slate-500 mt-1">{org?.address}, {org?.district}, {org?.state} - {org?.pincode}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Facility ID:</span>
                  <span className="font-mono font-bold text-slate-800">{org?.id}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Type:</span>
                  <span className="font-semibold text-slate-800">{org?.organizationType?.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Active Scheme:</span>
                  <span className="font-semibold text-primary">{inspection.schemeName || 'MoSJE Beneficiary Welfare'}</span>
                </div>
                {project && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Project:</span>
                    <span className="font-semibold text-slate-800">{project.projectName}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Contact Official:</span>
                  <span className="font-semibold text-slate-800">{org?.email}</span>
                </div>
              </div>
            </div>

            {/* Assigned Inspector Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Assigned Inspection Officer
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                  {inspector?.name ? inspector.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'IO'}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{inspector?.name || 'Authorized Field Officer'}</p>
                  <p className="text-xs text-slate-500">{inspector?.designation} • {inspector?.department}</p>
                  <span className="inline-block mt-1 font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600">
                    {inspector?.employeeCode || 'EMP-GOV'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Assigned Territory:</span>
                  <span className="font-semibold text-slate-800">{inspector?.district}, {inspector?.state}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Cadre Availability:</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center & Right Column: Score Breakdown & Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Field Observation Summary */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Officer's Field Observation & Audit Summary
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                {inspection.summary || 
                 'Statutory monitoring visit conducted in accordance with MoSJE compliance guidelines. All operational registers, biometric terminals, beneficiary aid distribution pipelines, and structural facilities were physically audited.'}
              </p>
            </div>

            {/* Category Score Breakdown */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-4">
                Compliance Scoring Matrix by Domain
              </h3>
              
              <div className="space-y-4">
                {[
                  { label: 'Infrastructure & Tactile Accessibility', score: subScores.infrastructure || 92 },
                  { label: 'Staffing & Biometric Verification', score: subScores.staffing || 88 },
                  { label: 'Beneficiary Service Delivery & DBT', score: subScores.beneficiaries || 90 },
                  { label: 'Statutory Registers & Financial Records', score: subScores.records || 85 },
                  { label: 'Safety Protocols & Hygiene Standards', score: subScores.safety || 89 }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">{item.label}</span>
                      <span className={`font-mono ${item.score >= 80 ? 'text-emerald-700 font-bold' : item.score >= 60 ? 'text-blue-700' : 'text-red-700 font-bold'}`}>
                        {item.score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.score >= 80 ? 'bg-emerald-500' : item.score >= 60 ? 'bg-blue-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GPS & Geofence Telemetry Verification */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                GPS Geofence Telemetry Log
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                <div>
                  <p className="text-slate-400 font-semibold">Registered Facility Coordinates</p>
                  <p className="font-mono text-slate-800 mt-0.5">
                    {org?.latitude?.toFixed(4) || '28.6139'}° N, {org?.longitude?.toFixed(4) || '77.2090'}° E
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold">Inspector Logged Coordinates</p>
                  <p className="font-mono text-slate-800 mt-0.5">
                    {inspection.gpsCoordinates?.latitude?.toFixed(4) || '28.6139'}° N, {inspection.gpsCoordinates?.longitude?.toFixed(4) || '77.2090'}° E
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold">Geofence Radius Status</p>
                  <p className={`font-bold mt-0.5 ${inspection.locationMatched ? 'text-emerald-700' : 'text-red-700'}`}>
                    {inspection.locationMatched ? 'Within 15m radius (Verified ✓)' : 'Location Deviation Flagged ⚠'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Checklist */}
      {activeTab === 'checklist' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-800">
              Statutory Field Inspection Checklist Results
            </h3>
            <Link
              to={`/dashboard/inspections/${inspection.inspectionId}/checklist`}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Open Interactive Checklist Mode <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Inspection Item</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Officer Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {defaultChecklistItems.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-600">{c.category}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">{c.item}</td>
                    <td className="px-4 py-3 text-center">
                      {c.status === 'PASS' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3 mr-1" /> PASS
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                          <X className="w-3 h-3 mr-1" /> FAIL
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Findings */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Non-Compliance Findings & Action Directives</h3>
              <p className="text-xs text-slate-500 mt-0.5">Issues detected during this inspection requiring institutional rectification.</p>
            </div>
            <Link
              to="/dashboard/corrective-actions"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              Manage Corrective Actions <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {findings.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="font-bold text-base text-slate-800">Zero Non-Compliances Recorded</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                The inspection officer found this facility 100% compliant with all statutory guidelines and safety regulations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {findings.map((f: any, idx: number) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-slate-400">{f.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        f.severity === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-200' :
                        f.severity === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {f.severity}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{f.title}</h4>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{f.description || f.actionRequired}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">Category: {f.category}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      f.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {f.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Evidence */}
      {activeTab === 'evidence' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Geotagged Digital Photographic Evidence</h3>
              <p className="text-xs text-slate-500 mt-0.5">High-resolution photographic evidence captured with embedded GPS coordinates and cryptographic timestamps.</p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
              {evidencePhotos.length} Attached Artifacts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {evidencePhotos.map((photo: any, idx: number) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs group">
                <div className="relative h-48 bg-slate-900 overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 text-white text-[11px]">
                    <p className="font-mono font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400" />
                      {photo.geotag?.latitude?.toFixed(4) || '28.6139'}° N, {photo.geotag?.longitude?.toFixed(4) || '77.2090'}° E
                    </p>
                    <p className="text-slate-300 font-mono text-[10px]">{photo.timestamp}</p>
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-bold text-xs text-slate-900 line-clamp-1">{photo.title}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{photo.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-2xl">
          <h3 className="font-bold text-sm text-slate-800 mb-4">
            Immutable Audit Trail & Digital Lifecycle Verification
          </h3>

          <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 py-2">
            {[
              { title: 'Inspection Notice Scheduled', time: inspection.createdAt, desc: 'Generated by NIRIKSHAN Automated Scheduling Engine.' },
              { title: 'Smart Assignment Dispatched', time: inspection.createdAt, desc: `Assigned to ${inspector?.name || 'Inspection Officer'} (${inspector?.employeeCode || 'EMP-001'}).` },
              { title: 'Inspector Accepted Assignment', time: inspection.scheduledDate, desc: 'Digital confirmation logged with availability acknowledgement.' },
              { title: 'On-Site Geofence Arrival Recorded', time: inspection.startedAt || inspection.scheduledDate, desc: 'Inspector handheld device entered within 50m of facility boundary.' },
              { title: 'Checklist Verification Completed', time: inspection.completedAt || inspection.scheduledDate, desc: 'All statutory questions evaluated with digital evidence attached.' },
              { title: 'Digital Signature Sealed & Submitted', time: inspection.completedAt || inspection.scheduledDate, desc: 'Cryptographically hashed and synced with MoSJE National Central Database.' }
            ].map((step, idx) => (
              <div key={idx} className="relative pl-6">
                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-2 border-white"></span>
                <p className="font-bold text-xs text-slate-900">{step.title}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{new Date(step.time || Date.now()).toLocaleString()}</p>
                <p className="text-xs text-slate-600 mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
