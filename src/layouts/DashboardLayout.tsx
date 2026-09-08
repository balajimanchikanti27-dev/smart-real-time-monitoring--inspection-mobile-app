import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';

import { 
  LayoutDashboard, Users, Landmark, FolderKanban, 
  ClipboardCheck, UserSquare2, Cctv, Wrench, FileBarChart, 
  Settings, Bell, Menu, X, ShieldAlert, AlertTriangle,
  LineChart, FileWarning, Fingerprint, MapPin, LogOut
} from 'lucide-react';
import GlobalSearch from '../components/GlobalSearch';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'INSPECTOR' | 'ORGANIZATION';

type NavItem = {
  path: string;
  label: string;
  icon: any;
  roles: Role[];
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION', 'INSPECTOR'] },
    ]
  },
  {
    title: 'Monitoring',
    items: [
      { path: '/dashboard/institutions', label: 'Institutions', icon: Landmark, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/dashboard/ngos', label: 'NGOs', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/dashboard/map', label: 'GIS Geo-Map', icon: MapPin, roles: ['SUPER_ADMIN', 'ADMIN', 'INSPECTOR'] },
      { path: '/dashboard/projects', label: 'Projects', icon: FolderKanban, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/dashboard/inspections', label: 'Inspections', icon: ClipboardCheck, roles: ['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION', 'INSPECTOR'] },
      { path: '/dashboard/inspections/surprise', label: 'Surprise Inspections', icon: AlertTriangle, roles: ['SUPER_ADMIN', 'ADMIN', 'INSPECTOR'] },
    ]
  },
  {
    title: 'Operations',
    items: [
      { path: '/dashboard/inspectors', label: 'Inspectors', icon: UserSquare2, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/dashboard/findings', label: 'Findings', icon: FileWarning, roles: ['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION', 'INSPECTOR'] },
      { path: '/dashboard/corrective-actions', label: 'Corrective Actions', icon: Wrench, roles: ['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION'] },
      { path: '/dashboard/cctv', label: 'CCTV Monitoring', icon: Cctv, roles: ['SUPER_ADMIN', 'ADMIN', 'INSPECTOR'] },
    ]
  },
  {
    title: 'Reports',
    items: [
      { path: '/dashboard/reports', label: 'Inspection Reports', icon: FileBarChart, roles: ['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION'] },
      { path: '/dashboard/analytics', label: 'Analytics', icon: LineChart, roles: ['SUPER_ADMIN', 'ADMIN'] },
    ]
  },
  {
    title: 'Administration',
    items: [
      { path: '/dashboard/users', label: 'Users', icon: ShieldAlert, roles: ['SUPER_ADMIN'] },
      { path: '/dashboard/notifications', label: 'Notifications', icon: Bell, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/dashboard/audit-logs', label: 'Audit Logs', icon: Fingerprint, roles: ['SUPER_ADMIN'] },
      { path: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN', 'ORGANIZATION', 'INSPECTOR'] },
    ]
  }
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('nirikshan_user');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        setUserRole(u.role || 'SUPER_ADMIN');
        setUserName(u.name || (u.email ? u.email.split('@')[0] : 'MoSJE Admin'));
        setLoading(false);
        return;
      } catch (err) {
        console.warn("Session parse error:", err);
      }
    }
    // No session -> MUST start with Login page!
    navigate('/login');
  }, [navigate]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderNavLinks = () => {
    return navGroups.map((group, idx) => {
      // Filter items in this group based on user role
      const visibleItems = group.items.filter(item => userRole && item.roles.includes(userRole));
      
      if (visibleItems.length === 0) return null;

      return (
        <div key={idx} className="mb-6">
          {(sidebarOpen || mobileMenuOpen) && (
            <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {group.title}
            </p>
          )}
          <div className="space-y-1 px-2">
            {visibleItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2 rounded-sm transition-colors group relative text-sm
                    ${isActive 
                      ? 'bg-primary-light text-white font-medium border-l-4 border-accent' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-4 border-transparent'}
                  `}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-accent' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  
                  {(sidebarOpen || mobileMenuOpen) && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                  
                  {/* Tooltip for collapsed desktop state */}
                  {!sidebarOpen && !mobileMenuOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-primary-dark text-white text-xs rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-white/10 shadow-lg">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">
      
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-primary-dark/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarOpen ? 'w-64' : 'w-16'} 
          transition-all duration-300 ease-in-out bg-primary text-slate-300 flex flex-col shadow-panel
        `}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 bg-primary-dark shrink-0">
          {(sidebarOpen || mobileMenuOpen) && (
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="NIRIKSHAN" className="h-8 object-contain" />
              <span className="font-bold text-base tracking-widest text-white truncate">NIRIKSHAN</span>
            </div>
          )}
          {!sidebarOpen && !mobileMenuOpen && (
            <div className="w-full flex justify-center">
              <img src="/logo.png" alt="N" className="h-8 object-contain" />
            </div>
          )}
          {/* Mobile close button inside drawer */}
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <nav>
            {renderNavLinks()}
          </nav>
        </div>

        {/* User Profile Area */}
        <div className="p-4 border-t border-white/10 bg-primary-dark shrink-0">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${(!sidebarOpen && !mobileMenuOpen) && 'justify-center'} cursor-pointer`}>
              <div className="w-8 h-8 rounded-sm bg-slate-700 flex items-center justify-center text-xs font-bold text-white border border-slate-600 shrink-0">
                {userName.substring(0, 2).toUpperCase()}
              </div>
              {(sidebarOpen || mobileMenuOpen) && (
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-slate-200 truncate">{userName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{userRole?.replace('_', ' ')}</p>
                </div>
              )}
            </div>

            {(sidebarOpen || mobileMenuOpen) && (
              <button
                onClick={() => {
                  localStorage.removeItem('nirikshan_user');
                  navigate('/login');
                }}
                className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-white/10 rounded transition-colors"
                title="Go to Login Page / Switch Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative z-10">
        
        {/* Top Header */}
        <header className="h-16 bg-surface border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-sm text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Collapse Toggle */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-1.5 rounded-sm text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            <button
              onClick={() => {
                localStorage.removeItem('nirikshan_user');
                navigate('/login');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-primary bg-slate-100 hover:bg-slate-200 rounded-md transition-colors border border-slate-300 shadow-2xs"
              title="Go to Login Page / Switch Account"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-600" />
              <span>Login Page</span>
            </button>

            <button className="relative p-1.5 rounded-sm text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-semantic-critical rounded-full ring-2 ring-white"></span>
            </button>
            <div className="h-6 w-px bg-slate-300 hidden sm:block"></div>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">MoSJE</p>
              <p className="text-xs font-bold text-slate-800">Command Center</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
