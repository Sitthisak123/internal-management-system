
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { authService } from '../src/services/authService';
import { Search, Bell, HelpCircle, ChevronDown, Menu, LogOut, Languages, Mail, Briefcase, Building2 } from 'lucide-react';
import { useLanguage } from '../src/contexts/LanguageContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setUser } from '../store/userSlice';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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
  const currentUser = useAppSelector((state) => state.user.user);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!profileMenuRef.current?.contains(target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isDropdownOpen) return;

    const refetchCurrentUser = async () => {
      const tokenUser = authService.getCurrentUser();
      if (!tokenUser) return;

      try {
        const profile = await authService.getProfile();
        dispatch(setUser({ ...tokenUser, ...profile }));
      } catch {
        dispatch(setUser(tokenUser));
      }
    };

    void refetchCurrentUser();
  }, [dispatch, isDropdownOpen]);

  const roleInfo = useMemo(() => {
    const role = currentUser?.role ?? 0;
    switch (role) {
      case 1:
        return { name: 'Administrator', access: 'Full Access' };
      case 0:
        return { name: 'User', access: 'Standard Access' };
      case -1:
        return { name: 'Personnel', access: 'N/A' };
      default:
        return { name: 'Unknown', access: 'N/A' };
    }
  }, [currentUser?.role]);

  const statusInfo = useMemo(() => {
    const status = currentUser?.status ?? 1;
    switch (status) {
      case 1:
        return {
          text: 'Active',
          className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          dotClassName: 'bg-emerald-500 animate-pulse',
        };
      case 0:
        return {
          text: 'Inactive',
          className: 'bg-slate-500/10 text-dark-muted border-dark-border',
          dotClassName: 'bg-slate-500',
        };
      case -1:
        return {
          text: 'Suspended',
          className: 'bg-red-500/10 text-red-500 border-red-500/20',
          dotClassName: 'bg-red-500',
        };
      default:
        return {
          text: 'Unknown',
          className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
          dotClassName: 'bg-gray-500',
        };
    }
  }, [currentUser?.status]);

  const roleAvatarColor = useMemo(() => {
    const role = currentUser?.role ?? 0;
    switch (role) {
      case 1:
        return 'bg-gradient-to-br from-orange-600 to-purple-600';
      case 0:
        return 'bg-gradient-to-br from-blue-600 to-blue-400';
      case -1:
        return 'bg-gradient-to-br from-slate-600 to-slate-400';
      default:
        return 'bg-gradient-to-br from-gray-600 to-gray-400';
    }
  }, [currentUser?.role]);

  const displayName = useMemo(() => {
    const fullName = currentUser?.fullname?.trim();
    const display = currentUser?.display_name?.trim();
    const username = currentUser?.username?.trim();
    return fullName || display || username || t('admin_user');
  }, [currentUser?.fullname, currentUser?.display_name, currentUser?.username, t]);

  const userHandle = useMemo(() => {
    const username = currentUser?.username?.trim();
    if (username) return `@${username}`;
    if (currentUser?.email) return currentUser.email;
    return roleInfo.access;
  }, [currentUser?.username, currentUser?.email, roleInfo.access]);

  const userInitials = useMemo(() => {
    const source = currentUser?.fullname || currentUser?.display_name || currentUser?.username || '?';
    const parts = source.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }, [currentUser?.fullname, currentUser?.display_name, currentUser?.username]);

  const workplaceLabel = useMemo(() => {
    if (currentUser?.workplace?.building || currentUser?.workplace?.room) {
      return [currentUser.workplace.building, currentUser.workplace.room].filter(Boolean).join(' / ');
    }
    if (currentUser?.workplace_id) {
      return `Workplace #${currentUser.workplace_id}`;
    }
    return 'No workplace';
  }, [currentUser?.workplace?.building, currentUser?.workplace?.room, currentUser?.workplace_id]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-dark-bg">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-dark-border bg-dark-bg/80 backdrop-blur-md z-40 shrink-0 sticky top-0">
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
                ref={profileMenuRef}
              >
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((current) => !current)}
                  className="flex items-center gap-3 group rounded-lg px-1.5 py-1 hover:bg-dark-surface transition-colors"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="menu"
                >
                  <div className="relative">
                    <div className={`rounded-full size-8 ${roleAvatarColor} flex items-center justify-center text-white font-semibold text-[10px] ring-2 ring-transparent group-hover:ring-primary/50 transition-all`}>
                      {userInitials}
                    </div>
                    <div className={`absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-dark-bg ${statusInfo.dotClassName}`}></div>
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-white group-hover:text-primary transition-colors leading-tight">{displayName}</span>
                    <span className="text-[10px] text-dark-muted uppercase tracking-wider font-semibold">{roleInfo.name}</span>
                  </div>
                  <ChevronDown size={16} className="text-dark-muted hidden sm:block group-hover:text-white transition-colors" />
                </button>
                {isDropdownOpen && (
                  <div 
                  className="absolute top-full right-0 mt-1 z-50 w-80 bg-dark-surface rounded-lg shadow-lg border border-dark-border py-1"
                  role="menu"
                >
                    <div className="px-3 pt-3 pb-2">
                      <div className="rounded-xl border border-dark-border bg-dark-bg/70 p-3">
                        <div className="flex items-start gap-3">
                          <div className={`h-10 w-10 rounded-full ${roleAvatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                            {userInitials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                            <p className="text-xs text-dark-muted truncate">{userHandle}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium border bg-blue-500/10 text-blue-400 border-blue-500/20">
                                {roleInfo.name}
                              </span>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium border ${statusInfo.className}`}>
                                {statusInfo.text}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 space-y-2 text-xs text-dark-muted">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-purple-500/10 text-purple-400">
                              <Briefcase size={14} />
                            </span>
                            <span className="truncate">{currentUser?.position || roleInfo.access}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-blue-500/10 text-blue-400">
                              <Mail size={14} />
                            </span>
                            <span className="truncate">{currentUser?.email || 'No email'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-emerald-500/10 text-emerald-400">
                              <Building2 size={14} />
                            </span>
                            <span className="truncate">{workplaceLabel}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="h-px bg-dark-border my-1"></div>
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
