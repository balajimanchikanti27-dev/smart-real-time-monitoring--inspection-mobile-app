import { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Briefcase, ClipboardCheck, Bell, User } from 'lucide-react';
import GlobalSearch from '../components/GlobalSearch';

const MobileInspectorLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('nirikshan_user');
    if (!raw) {
      navigate('/login');
    }
  }, [navigate]);
  
  const navItems = [
    { name: 'Home', path: '/inspector', icon: Home },
    { name: 'Tasks', path: '/inspector/tasks', icon: Briefcase },
    { name: 'Inspections', path: '/inspector/history', icon: ClipboardCheck },
    { name: 'Alerts', path: '/inspector/alerts', icon: Bell },
    { name: 'Profile', path: '/inspector/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      <header className="bg-primary text-white h-16 flex items-center justify-between px-4 shadow-md z-10 shrink-0">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Nirikshan Logo" className="h-8 w-auto object-contain" 
               onError={(e) => e.currentTarget.style.display = 'none'} />
          <div className="flex flex-col items-start">
             <h1 className="text-lg font-bold tracking-wide leading-none">NIRIKSHAN</h1>
             <span className="text-[9px] text-gray-300 tracking-wider">FIELD OPERATIONS</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <GlobalSearch />
          </div>
          <Link
            to="/login"
            onClick={() => localStorage.removeItem('nirikshan_user')}
            className="px-2.5 py-1 text-xs font-bold text-white bg-white/10 hover:bg-white/20 rounded border border-white/20 transition-colors flex items-center gap-1"
          >
            <span>Login Page</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-surface border-t border-gray-200 fixed bottom-0 w-full h-16 flex justify-around items-center z-20 pb-safe">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-accent' : 'text-gray-500 hover:text-primary-light'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'fill-accent/20' : ''}`} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileInspectorLayout;
