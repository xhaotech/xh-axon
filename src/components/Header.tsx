import React, { useState, useRef, useEffect } from 'react';
import { Menu, User, LogOut, ChevronDown, Search, Settings, Users, Languages, UserCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { createTranslator, getDefaultLanguage } from '../lib/i18n';
// import { UserSettingsModal } from './UserSettingsModal';
// import { UserManagementModal } from './UserManagementModal';

export const Header: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed, auth, logout } = useAppStore();
  const [language, setLanguage] = useState(getDefaultLanguage());
  const t = createTranslator(language);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  // Temporarily disabled to fix i18n issues
  // const [showSettingsModal, setShowSettingsModal] = useState(false);
  // const [showUserManagementModal, setShowUserManagementModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
    <header className="h-10 bg-white border-b border-gray-200 flex items-center justify-between px-3">
      {/* Left section */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-0.5 hover:bg-gray-100 transition-colors"
        >
          <Menu size={14} className="text-gray-600" />
        </button>
        
        <div className="flex items-center space-x-1">
          <div className="w-5 h-5 bg-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-xs">XH</span>
          </div>
          <span className="text-sm font-medium text-gray-900">Axon</span>
        </div>
      </div>

      {/* Center section - Search */}
      <div className="flex-1 max-w-xs mx-4">
        <div className="relative">
          <Search className="absolute left-1.5 top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-5 pr-8 py-0.5 text-xs border border-gray-300 focus:outline-none focus:border-blue-500 bg-gray-50"
          />
          <div className="absolute right-0.5 top-1/2 transform -translate-y-1/2">
            <kbd className="px-0.5 py-0.5 text-xs text-gray-500 bg-white border border-gray-200">⌘K</kbd>
          </div>
        </div>
      </div>
      
      {/* Right section */}
      <div className="flex items-center space-x-2">
        {/* Language switcher */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-100 rounded transition-colors"
            title={t('switchLanguage')}
          >
            <Languages size={14} className="text-gray-600" />
            <span className="text-xs text-gray-600">{language === 'zh' ? '中' : 'EN'}</span>
          </button>
          
          {/* Language dropdown */}
          {showLangMenu && (
            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  setLanguage('zh');
                  setShowLangMenu(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                  language === 'zh' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                中文
              </button>
              <button
                onClick={() => {
                  setLanguage('en');
                  setShowLangMenu(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                  language === 'en' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                English
              </button>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-100 rounded transition-colors"
          >
            {auth.user?.avatar ? (
              <img
                src={auth.user.avatar}
                alt={auth.user.username}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center rounded-full">
                <UserCircle size={16} className="text-white" />
              </div>
            )}
            <span className="text-xs text-gray-700 hidden sm:block">
              {auth.user?.username || 'User'}
            </span>
            <ChevronDown size={12} className="text-gray-400" />
          </button>
          
          {/* User dropdown menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-900">{auth.user?.username || 'User'}</p>
                <p className="text-xs text-gray-500">{auth.user?.email || auth.user?.phone || 'xhaotech.cn'}</p>
              </div>
              
              <button
                onClick={() => {
                  // setShowUserManagementModal(true);
                  setShowUserMenu(false);
                  console.log('User management clicked - temporarily disabled');
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
              >
                <Users size={12} />
                <span>{t('userManagement')}</span>
              </button>
              
              <button
                onClick={() => {
                  // setShowSettingsModal(true);
                  setShowUserMenu(false);
                  console.log('Settings clicked - temporarily disabled');
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
              >
                <Settings size={12} />
                <span>{t('settings')}</span>
              </button>
              
              <hr className="my-1" />
              
              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
              >
                <LogOut size={12} />
                <span>{t('signOut')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Modals */}
    {/* Temporarily disabled to fix i18n issues
    <UserSettingsModal 
      isOpen={showSettingsModal} 
      onClose={() => setShowSettingsModal(false)} 
    />
    <UserManagementModal 
      isOpen={showUserManagementModal} 
      onClose={() => setShowUserManagementModal(false)} 
    />
    */}
    </>
  );
};
