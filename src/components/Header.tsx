import React, { useState, useRef, useEffect } from 'react';
import { Menu, User, LogOut, ChevronDown, Search } from 'lucide-react';
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
      <div className="flex items-center space-x-1">
        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-0.5 p-0.5 hover:bg-gray-100 transition-colors"
          >
            {auth.user?.avatar ? (
              <img
                src={auth.user.avatar}
                alt={auth.user.username}
                className="w-4 h-4"
              />
            ) : (
              <div className="w-4 h-4 bg-gray-300 flex items-center justify-center">
                <User size={10} className="text-gray-600" />
              </div>
            )}
            <ChevronDown size={10} className="text-gray-400" />
          </button>
          
          {/* Dropdown menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 py-1 z-50">
              <div className="px-3 py-1 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-900">{auth.user?.username || 'User'}</p>
                <p className="text-xs text-gray-500">{auth.user?.email || auth.user?.phone || 'xhaotech.cn'}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
              >
                <LogOut size={10} />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
