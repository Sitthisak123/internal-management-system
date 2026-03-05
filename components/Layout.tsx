
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { authService } from '../src/services/authService';
import { Search, Bell, HelpCircle, ChevronDown, Menu, LogOut, Languages } from 'lucide-react';
import { useLanguage } from '../src/contexts/LanguageContext';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const pageTitle = location.pathname.split('/')[1];
  const pageTitleKeyMap: Record<string, Parameters<typeof t>[0]> = {
    dashboard: 'dashboard',
    personnel: 'personnel',
    materials: 'inventory',
    requisitions: 'requisitions',
    users: 'users_roles',
    settings: 'settings',
  };
  const currentTitleKey = pageTitleKeyMap[pageTitle] ?? 'dashboard';
  const headerTitle = pageTitle ? t(currentTitleKey) : t('dashboard');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-dark-bg">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-dark-border bg-dark-bg/80 backdrop-blur-md z-10 shrink-0 sticky top-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-dark-muted hover:text-white transition-colors">
              <Menu size={24} />
            </button>
            <h2 className="text-white text-lg font-bold tracking-tight">{headerTitle}</h2>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="hidden md:flex items-center bg-dark-surface rounded-lg px-3 py-2 w-64 border border-dark-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <Search size={18} className="text-dark-muted" />
              <input 
                className="bg-transparent border-none text-sm text-white placeholder-dark-muted focus:ring-0 w-full ml-2 p-0 h-auto leading-none" 
                placeholder={t('search_placeholder')} 
                type="text" 
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-full hover:bg-dark-surface transition-colors text-dark-muted hover:text-white">
                <Bell size={20} />
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-dark-bg"></span>
              </button>
              <button className="p-2 rounded-full hover:bg-dark-surface transition-colors text-dark-muted hover:text-white hidden sm:block">
                <HelpCircle size={20} />
              </button>
              
              <div className="h-6 w-[1px] bg-dark-border mx-1 hidden sm:block"></div>
              
              <div 
                className="relative"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button className="flex items-center gap-3 group">
                  <div className="relative">
                    <div 
                      className="bg-center bg-no-repeat bg-cover rounded-full size-8 bg-slate-700 ring-2 ring-transparent group-hover:ring-primary/50 transition-all" 
                      style={{ backgroundImage: 'url("https://picsum.photos/seed/admin/100/100")' }}
                    ></div>
                    <div className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full ring-2 ring-dark-bg"></div>
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-white group-hover:text-primary transition-colors leading-tight">{t('admin_user')}</span>
                    <span className="text-[10px] text-dark-muted uppercase tracking-wider font-semibold">{t('manager')}</span>
                  </div>
                  <ChevronDown size={16} className="text-dark-muted hidden sm:block group-hover:text-white transition-colors" />
                </button>
                {(isDropdownOpen || isLogoutModalOpen) && (
                  <div 
                  className="absolute top-full right-0 mt-0 w-48 bg-dark-surface rounded-lg shadow-lg border border-dark-border py-1"
                  onMouseEnter={() => setIsLogoutModalOpen(true)}
                  onMouseLeave={() => setIsLogoutModalOpen(false)}
                >
                    <div className="px-3 pt-3 pb-2">
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-dark-muted">
                        <Languages size={14} />
                        <span>{t('language')}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                          onClick={() => setLanguage('en')}
                          className={`text-xs rounded-md px-3 py-1.5 border transition-colors ${
                            language === 'en'
                              ? 'bg-primary/20 border-primary/60 text-white'
                              : 'bg-dark-bg border-dark-border text-dark-muted hover:text-white'
                          }`}
                        >
                          {t('eng')}
                        </button>
                        <button
                          onClick={() => setLanguage('th')}
                          className={`text-xs rounded-md px-3 py-1.5 border transition-colors ${
                            language === 'th'
                              ? 'bg-primary/20 border-primary/60 text-white'
                              : 'bg-dark-bg border-dark-border text-dark-muted hover:text-white'
                          }`}
                        >
                          {t('thai')}
                        </button>
                      </div>
                    </div>
                    <div className="h-px bg-dark-border my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 w-full"
                    >
                      <LogOut size={16} />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
