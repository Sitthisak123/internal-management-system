import React, { createContext, useContext, useMemo, useState } from 'react';

export type Language = 'en' | 'th';

type TranslationKey =
  | 'dashboard'
  | 'personnel'
  | 'inventory'
  | 'requisitions'
  | 'users_roles'
  | 'settings'
  | 'storage_usage'
  | 'new_requisition'
  | 'logout'
  | 'search_placeholder'
  | 'admin_portal'
  | 'manager'
  | 'admin_user'
  | 'language'
  | 'eng'
  | 'thai';

type TranslationMap = Record<TranslationKey, string>;

const translations: Record<Language, TranslationMap> = {
  en: {
    dashboard: 'Dashboard',
    personnel: 'Personnel',
    inventory: 'Inventory',
    requisitions: 'Requisitions',
    users_roles: 'Users & Roles',
    settings: 'Settings',
    storage_usage: 'Storage Usage',
    new_requisition: 'New Requisition',
    logout: 'Logout',
    search_placeholder: 'Search...',
    admin_portal: 'Admin Portal',
    manager: 'Manager',
    admin_user: 'Admin User',
    language: 'Language',
    eng: 'Eng',
    thai: 'Thai',
  },
  th: {
    dashboard: 'แดชบอร์ด',
    personnel: 'บุคลากร',
    inventory: 'คลังวัสดุ',
    requisitions: 'ใบขอซื้อ',
    users_roles: 'ผู้ใช้และสิทธิ์',
    settings: 'ตั้งค่า',
    storage_usage: 'การใช้พื้นที่',
    new_requisition: 'สร้างใบขอซื้อ',
    logout: 'ออกจากระบบ',
    search_placeholder: 'ค้นหา...',
    admin_portal: 'พอร์ทัลผู้ดูแล',
    manager: 'ผู้จัดการ',
    admin_user: 'ผู้ดูแลระบบ',
    language: 'ภาษา',
    eng: 'อังกฤษ',
    thai: 'ไทย',
  },
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const LANGUAGE_STORAGE_KEY = 'app_language';

const resolveInitialLanguage = (): Language => {
  const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return storedLanguage === 'th' ? 'th' : 'en';
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(resolveInitialLanguage);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey) => translations[language][key],
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
};

