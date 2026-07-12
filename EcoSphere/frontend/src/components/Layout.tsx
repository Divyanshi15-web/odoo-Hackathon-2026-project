import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Leaf, Heart, LogOut, Target, Gift, ShieldCheck, ClipboardCheck, ShieldAlert, Bot, FileBarChart } from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Carbon Tracker', path: '/carbon', icon: Leaf },
    { name: 'CSR Activities', path: '/csr', icon: Heart },
    { name: 'Challenges', path: '/challenges', icon: Target },
    { name: 'Rewards', path: '/rewards', icon: Gift },
    { name: 'Governance', path: '/governance', icon: ShieldCheck },
    { name: 'Audits', path: '/audits', icon: ClipboardCheck },
    { name: 'Compliance', path: '/compliance', icon: ShieldAlert },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { name: 'Reports', path: '/reports', icon: FileBarChart },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">EcoSphere</h1>
        </div>
        
        <div className="p-4 flex-1">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
              {user?.firstName[0]}{user?.lastName[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.firstName}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-8 md:hidden">
           <h1 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">EcoSphere</h1>
           <button onClick={handleLogout} className="text-red-500"><LogOut size={20} /></button>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
