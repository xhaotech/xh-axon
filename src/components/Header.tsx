import React, { useState } from 'react';
import { Menu, LogOut, ChevronDown, Search, Users, Languages, UserCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { createTranslator, getDefaultLanguage } from '../lib/i18n';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
// import { UserSettingsModal } from './UserSettingsModal';
// import { UserManagementModal } from './UserManagementModal';

export const Header: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed, auth, logout } = useAppStore();
  const [language, setLanguage] = useState(getDefaultLanguage());
  const t = createTranslator(language);

  return (
    <>
    <header className="h-10 bg-white border-b border-gray-200 flex items-center justify-between px-3">
      {/* Left section */}
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-0.5 h-auto hover:bg-gray-100"
        >
          <Menu size={14} className="text-gray-600" />
        </Button>
        
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 px-2 py-1 h-auto text-xs"
              title={t('switchLanguage')}
            >
              <Languages size={14} className="text-gray-600" />
              <span className="text-gray-600">{language === 'zh' ? '中' : 'EN'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onClick={() => setLanguage('zh')}
              className={`text-xs ${language === 'zh' ? 'bg-blue-50 text-blue-600' : ''}`}
            >
              中文
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLanguage('en')}
              className={`text-xs ${language === 'en' ? 'bg-blue-50 text-blue-600' : ''}`}
            >
              English
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 px-2 py-1 h-auto"
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
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-900">{auth.user?.username || 'User'}</p>
              <p className="text-xs text-gray-500">{auth.user?.email || auth.user?.phone || 'xhaotech.cn'}</p>
            </div>
            
            <DropdownMenuItem
              onClick={() => {
                console.log('User management clicked - temporarily disabled');
              }}
              className="text-xs"
            >
              <Users size={12} className="mr-2" />
              <span>{t('userManagement')}</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={() => logout()}
              className="text-xs text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <LogOut size={12} className="mr-2" />
              <span>{t('signOut')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
