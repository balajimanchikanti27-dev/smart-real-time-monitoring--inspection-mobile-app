import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  ClipboardCheck, 
  Camera, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  FileText, 
  Settings,
  MapPin,
  ShieldAlert,
  Landmark
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userData, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const adminNav = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Institutions', href: '/institutions', icon: Building2 },
    { name: 'NGOs', href: '/ngos', icon: Users },
    { name: 'Projects', href: '/projects', icon: ClipboardCheck },
    { name: 'Inspectors', href: '/inspectors', icon: Users },
    { name: 'Inspections', href: '/inspections', icon: ClipboardCheck },
    { name: 'Smart Assignment', href: '/smart-assignment', icon: MapPin },
    { name: 'Findings', href: '/findings', icon: ShieldAlert },
    { name: 'CCTV Monitoring', href: '/cctv', icon: Camera },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const inspectorNav = [
    { name: 'Dashboard', href: '/inspector', icon: LayoutDashboard },
    { name: 'My Assignments', href: '/inspector/assignments', icon: ClipboardCheck },
    { name: 'History', href: '/inspector/history', icon: FileText },
  ];

  const orgNav = [
    { name: 'Dashboard', href: '/organization', icon: LayoutDashboard },
    { name: 'My Projects', href: '/organization/projects', icon: Building2 },
    { name: 'Compliance', href: '/organization/compliance', icon: ShieldAlert },
  ];

  let navigation = adminNav;
  if (userData?.role === 'INSPECTOR') navigation = inspectorNav;
  if (userData?.role === 'ORGANIZATION') navigation = orgNav;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar overlay */}
      <div 
        className={clsx(
          "fixed inset-0 bg-slate-900/80 z-40 lg:hidden transition-opacity",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-200 bg-blue-50/50">
          <Landmark className="h-8 w-8 text-blue-600" />
          <span className="ml-3 text-lg font-bold text-slate-900 leading-tight">
            MoSJE<br/><span className="text-sm font-medium text-slate-500">Monitoring System</span>
          </span>
          <button 
            className="ml-auto lg:hidden text-slate-500"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={clsx(
                  "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                  isActive ? "text-blue-700" : "text-slate-400 group-hover:text-slate-500"
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center px-3 py-2 mb-2">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                {userData?.name.charAt(0) || 'U'}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-700">{userData?.name}</p>
              <p className="text-xs font-medium text-slate-500">{userData?.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30">
          <button
            className="text-slate-500 hover:text-slate-600 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 flex justify-end items-center space-x-4">
            <button className="text-slate-400 hover:text-slate-500 relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
