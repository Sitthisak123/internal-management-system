
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Package, 
  Settings, 
  LogOut,
  Plus
} from 'lucide-react';
import { useLanguage } from '../src/contexts/LanguageContext';
import { authService } from '../src/services/authService';

const Sidebar: React.FC = () => {
  const { t } = useLanguage();
  const handleLogout = () => {
    authService.logout();
  };

  const navItems = [
    { name: t('dashboard'), path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: t('inventory'), path: '/materials', icon: <Package size={20} /> },
    { name: t('requisitions'), path: '/requisitions', icon: <FileText size={20} /> },
    { name: t('users_roles'), path: '/users', icon: <Users size={20} /> },
    { name: t('settings'), path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-dark-surface border-r border-dark-border hidden lg:flex h-screen sticky top-0">
      <div className="flex flex-col h-full justify-between p-4">
        <div className="flex flex-col gap-6">
          <div className="flex gap-3 items-center px-2 py-1">
            <div className="rounded-lg w-9 h-9 bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
              MS
            </div>
            <div className="flex flex-col">
              <h1 className="text-white text-base font-semibold leading-none mb-1">Management Sys</h1>
              <p className="text-dark-muted text-xs font-medium uppercase tracking-wider">{t('admin_portal')}</p>
            </div>
          </div>
          
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group
                  ${isActive 
                    ? 'bg-primary/10 text-primary font-semibold shadow-sm' 
                    : 'text-dark-muted hover:bg-slate-800 hover:text-white'}
                `}
              >
                {item.icon}
                <span className="text-sm">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          <div className="px-3 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-dark-muted">{t('storage_usage')}</span>
              <span className="text-xs font-bold text-white">78%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
          
          <NavLink to="/requisitions/create" className="flex w-full cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-primary-dark transition-colors text-white text-sm font-semibold shadow-lg shadow-blue-900/20 active:scale-[0.98]">
            <Plus size={18} className="mr-2" />
            <span className="truncate">{t('new_requisition')}</span>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-dark-muted hover:text-red-400 hover:bg-red-400/10 transition-colors w-full mt-2"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">{t('logout')}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
