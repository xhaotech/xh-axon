import React, { useState } from 'react';
import { Menu, LogOut, ChevronDown, Search, Languages, UserCircle, Settings } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { createTranslator, getDefaultLanguage } from '../lib/i18n';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { UserSettingsModal } from './UserSettingsModal';

export const Header: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed, auth, logout } = useAppStore();
  const [language, setLanguage] = useState(getDefaultLanguage());
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);
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
            >
              <Languages size={12} />
              <span className="hidden sm:block">{language === 'zh' ? '中文' : 'EN'}</span>
              <ChevronDown size={10} className="text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32 bg-white">
            <DropdownMenuItem
              onClick={() => setLanguage('zh')}
              className={`text-xs ${language === 'zh' ? 'bg-blue-50 text-blue-700' : ''}`}
            >
              简体中文
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLanguage('en')}
              className={`text-xs ${language === 'en' ? 'bg-blue-50 text-blue-700' : ''}`}
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
              className="flex items-center space-x-2 px-2 py-1 h-auto hover:bg-blue-50 transition-colors"
            >
              {auth.user?.avatar ? (
                <img
                  src={auth.user.avatar}
                  alt={auth.user.username}
                  className="w-6 h-6 rounded-full border border-gray-200"
                />
              ) : (
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center rounded-full border border-gray-200">
                  <UserCircle size={16} className="text-white" />
                </div>
              )}
              <span className="text-xs text-gray-700 hidden sm:block font-medium">
                {auth.user?.username || 'User'}
              </span>
              <ChevronDown size={12} className="text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-white border border-gray-200 shadow-lg">
            {/* 用户信息区域 */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-3">
                {auth.user?.avatar ? (
                  <img
                    src={auth.user.avatar}
                    alt={auth.user.username}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    <UserCircle size={20} className="text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {auth.user?.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {auth.user?.email || auth.user?.phone || 'xhaotech.cn'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* 菜单项 */}
            <div className="py-2">
              <DropdownMenuItem
                onClick={() => setIsUserSettingsOpen(true)}
                className="px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer flex items-center space-x-3"
              >
                <Settings size={16} className="text-gray-500" />
                <span>用户设置</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="my-1 border-gray-100" />
              
              <DropdownMenuItem
                onClick={() => logout()}
                className="px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer flex items-center space-x-3"
              >
                <LogOut size={16} className="text-red-500" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

    {/* 用户设置模态框 */}
    <UserSettingsModal 
      isOpen={isUserSettingsOpen}
      onClose={() => setIsUserSettingsOpen(false)}
    />
    </>
  );
};
