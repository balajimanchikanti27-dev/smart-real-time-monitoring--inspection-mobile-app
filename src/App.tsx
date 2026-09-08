import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import MobileInspectorLayout from './layouts/MobileInspectorLayout';
import DashboardLayout from './layouts/DashboardLayout';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import AdminDashboard from './pages/AdminDashboard';
import SmartAssignment from './pages/SmartAssignment';
import InspectorHome from './pages/InspectorHome';
import OrganizationProfile from './pages/OrganizationProfile';
import OrganizationList from './pages/OrganizationList';
import InspectionsList from './pages/InspectionsList';
import MapView from './pages/MapView';
import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
import Organizations from './pages/Organizations';
import NGOs from './pages/NGOs';
import NGODetails from './pages/NGODetails';
import Institutions from './pages/Institutions';
import InstitutionDetails from './pages/InstitutionDetails';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Inspections from './pages/Inspections';
import InspectionDetails from './pages/InspectionDetails';
import Inspectors from './pages/Inspectors';
import Complaints from './pages/Complaints';
import CorrectiveActions from './pages/CorrectiveActions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

import SurpriseInspections from './pages/SurpriseInspections';
import Findings from './pages/Findings';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import Notifications from './pages/Notifications';
import AuditLogs from './pages/AuditLogs';
import InspectionChecklistPage from './pages/InspectionChecklist';
import CCTVDashboard from './pages/CCTVDashboard';

// Initialize Firebase
import './services/firebase/config';
import WelcomeAnimation from './components/WelcomeAnimation';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Root Route - Welcome Animation First */}
          <Route path="/" element={<WelcomeAnimation />} />
          
          {/* Auth Route */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="organizations" element={<Organizations />} />
            <Route path="ngos" element={<NGOs />} />
            <Route path="ngos/:id" element={<NGODetails />} />
            <Route path="institutions" element={<Institutions />} />
            <Route path="institutions/:id" element={<InstitutionDetails />} />
            <Route path="map" element={<MapView />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="inspections" element={<Inspections />} />
            <Route path="inspections/surprise" element={<SurpriseInspections />} />
            <Route path="inspections/:id" element={<InspectionDetails />} />
            <Route path="inspections/:id/checklist" element={<InspectionChecklistPage />} />
            <Route path="cctv" element={<CCTVDashboard />} />
            <Route path="corrective-actions" element={<CorrectiveActions />} />
            <Route path="inspectors" element={<Inspectors />} />
            <Route path="findings" element={<Findings />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="reports" element={<Reports />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="users" element={<Users />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Direct Root CCTV Route */}
          <Route path="/cctv" element={<Navigate to="/dashboard/cctv" replace />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="cctv" element={<CCTVDashboard />} />
            <Route path="institutions" element={<OrganizationList type="GOVERNMENT_INSTITUTION" title="Government Institutions" />} />
            <Route path="ngos" element={<OrganizationList type="NGO" title="Registered NGOs" />} />
            <Route path="inspections" element={<InspectionsList />} />
            <Route path="smart-assignment" element={<SmartAssignment />} />
            <Route path="organization/:id" element={<OrganizationProfile />} />
            <Route path="map" element={<MapView />} />
            {/* Catch all for admin placeholders */}
            <Route path="*" element={<div className="p-4">Content coming soon.</div>} />
          </Route>

          {/* Inspector Routes */}
          <Route path="/inspector" element={<ProtectedRoute allowedRoles={['INSPECTOR', 'SUPER_ADMIN', 'ADMIN']}><MobileInspectorLayout /></ProtectedRoute>}>
            <Route index element={<InspectorHome />} />
            <Route path="inspections/:id/checklist" element={<InspectionChecklistPage />} />
            <Route path="*" element={<div className="p-4 text-center mt-10">Coming soon.</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
