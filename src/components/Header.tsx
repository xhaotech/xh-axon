import React, { useState, useRef, useEffect } from 'react';
import { Menu, Settings, HelpCircle, User, LogOut, ChevronDown } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const Header: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed, auth, logout } = useAppStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="h-10 bg-white border-b border-gray-200 flex items-center justify-between px-3">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1 hover:bg-gray-50 transition-colors"
        >
          <Menu size={16} />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-xs">XH</span>
          </div>
          <h1 className="text-base font-semibold text-gray-900">Axon</h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        <button className="p-1 hover:bg-gray-50 transition-colors">
          <HelpCircle size={16} />
        </button>
        <button className="p-1 hover:bg-gray-50 transition-colors">
          <Settings size={16} />
        </button>
        
        {/* 用户菜单 */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 hover:bg-gray-50 transition-colors"
          >
            {auth.user?.avatar ? (
              <img
                src={auth.user.avatar}
                alt={auth.user.username}
                className="w-8 h-8"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 flex items-center justify-center">
                <User size={16} />
              </div>
            )}
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {auth.user?.username}
            </span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
          
          {/* 下拉菜单 */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{auth.user?.username}</p>
                <p className="text-xs text-gray-500">{auth.user?.email || auth.user?.phone}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>退出登录</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
