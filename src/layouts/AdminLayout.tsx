import { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, ClipboardList, ShieldAlert, Bell, Search, UserCircle, MapPin, Camera, LogOut } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('nirikshan_user');
    if (!raw) {
      navigate('/login');
    }
  }, [navigate]);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'CCTV Surveillance', path: '/admin/cctv', icon: Camera },
    { name: 'Institutions', path: '/admin/institutions', icon: Building2 },
    { name: 'NGOs', path: '/admin/ngos', icon: Users },
    { name: 'Inspections', path: '/admin/inspections', icon: ClipboardList },
    { name: 'Smart Assignment', path: '/admin/smart-assignment', icon: ShieldAlert },
    { name: 'Map View', path: '/admin/map', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="bg-primary text-white h-16 flex items-center justify-between px-6 shadow-md z-10">
        <div className="flex items-center gap-3">
          {/* Logo Image Placeholder (User will save logo.png to public folder) */}
          <img src="/logo.png" alt="Smart Inspect Logo" className="h-10 w-auto object-contain fallback-icon" 
               onError={(e) => {
                 // Fallback if logo.png is not yet added to public folder
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.nextElementSibling?.classList.remove('hidden');
               }} 
          />
          <ShieldAlert className="w-8 h-8 text-accent hidden" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-wide leading-tight">Smart Inspect</h1>
            <p className="text-[10px] text-gray-300 tracking-wider">Smart Inspect & MONITORING</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Global Search..." 
              className="bg-primary-light border-none rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent w-64 text-white placeholder-gray-400"
            />
          </div>
          <button className="relative p-2 hover:bg-primary-light rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-semantic-critical rounded-full"></span>
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('nirikshan_user');
              navigate('/login');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold transition-colors border border-white/20"
            title="Go to Login Page / Switch Account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Login Page</span>
          </button>
          
          <div className="flex items-center gap-2 cursor-pointer hover:bg-primary-light p-1.5 rounded-md transition-colors">
            <UserCircle className="w-8 h-8 text-accent-light" />
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold leading-none">Super Admin</p>
              <p className="text-xs text-gray-400 mt-1">DoSJE HQ</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-surface border-r border-gray-200 hidden lg:block overflow-y-auto flex flex-col justify-between">
          <nav className="p-4 space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">Command Center</div>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-accent/10 text-accent-dark' 
                      : 'text-primary-light hover:bg-gray-100 hover:text-primary'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  localStorage.removeItem('nirikshan_user');
                  navigate('/login');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-primary hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
                <span>Return to Login</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
