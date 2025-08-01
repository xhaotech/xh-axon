import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, XCircle, Square, SquareStack, FileX, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { createTranslator, getDefaultLanguage } from '../lib/i18n';
import { Button } from './ui/button';
import { Input } from './ui/input';

export const RequestTabs: React.FC = () => {
  const { tabs, activeTab, setActiveTab, closeTab, addTab, updateTab } = useAppStore();
  const t = createTranslator(getDefaultLanguage());
  const [showTabMenu, setShowTabMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // 简单的滚动状态检查函数
  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    const newCanScrollLeft = scrollLeft > 0;
    const newCanScrollRight = scrollLeft < scrollWidth - clientWidth;
    
    // 添加调试信息
    console.log('Scroll状态:', {
      scrollLeft,
      scrollWidth,
      clientWidth,
      canScrollLeft: newCanScrollLeft,
      canScrollRight: newCanScrollRight
    });
    
    setCanScrollLeft(newCanScrollLeft);
    setCanScrollRight(newCanScrollRight);
  };

  // 初始化和监听
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // 初始检查
    checkScrollButtons();
    
    // 滚动事件监听
    const handleScroll = () => checkScrollButtons();
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // 窗口大小变化监听
    const handleResize = () => {
      setTimeout(checkScrollButtons, 50);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 标签页变化时检查
  useEffect(() => {
    const timer = setTimeout(checkScrollButtons, 100);
    return () => clearTimeout(timer);
  }, [tabs]);

  // 滚动函数 - Mini模式：更小的滚动距离
  const handleScrollLeft = () => {
    console.log('点击了左滚动按钮, canScrollLeft:', canScrollLeft);
    const container = scrollContainerRef.current;
    if (!container) return;
    
    container.scrollBy({
      left: -150, // Mini模式：更小的滚动距离
      behavior: 'smooth'
    });
  };

  const handleScrollRight = () => {
    console.log('点击了右滚动按钮, canScrollRight:', canScrollRight);
    const container = scrollContainerRef.current;
    if (!container) return;
    
    container.scrollBy({
      left: 150, // Mini模式：更小的滚动距离
      behavior: 'smooth'
    });
  };

  // 滚动到指定标签页
  const scrollToTab = (tabId: string) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const tabElement = container.querySelector(`[data-tab-id="${tabId}"]`) as HTMLElement;
    if (!tabElement) return;
    
    const containerRect = container.getBoundingClientRect();
    const tabRect = tabElement.getBoundingClientRect();
    
    // 如果标签页不在可见区域，滚动使其可见
    if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
      tabElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };

  // 活动标签页变化时滚动到可见区域
  useEffect(() => {
    if (activeTab) {
      const timer = setTimeout(() => scrollToTab(activeTab), 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowTabMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNewTab = () => {
    const newTab = {
      id: Date.now().toString(),
      name: t('newRequest'),
      url: '',
      method: 'GET' as const,
      params: {},
      headers: {},
      auth: { 
        type: 'basic' as const,
        username: 'wecise.admin',
        password: 'admin'
      },
      isSaved: false,
      isModified: false
    };
    
    addTab(newTab);
    setActiveTab(newTab.id);
    
    // 滚动到最右侧显示新标签页
    setTimeout(() => {
      const container = scrollContainerRef.current;
      if (container) {
        container.scrollTo({
          left: container.scrollWidth,
          behavior: 'smooth'
        });
      }
    }, 150);
  };

  // 重命名功能
  const handleStartRename = (tabId: string, currentName: string) => {
    setEditingTabId(tabId);
    setEditingName(currentName);
    setShowTabMenu(null);
    
    // 聚焦到输入框
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 50);
  };

  const handleFinishRename = (tabId: string) => {
    if (editingName.trim() && updateTab) {
      updateTab(tabId, { name: editingName.trim() });
    }
    setEditingTabId(null);
    setEditingName('');
  };

  const handleCancelRename = () => {
    setEditingTabId(null);
    setEditingName('');
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    if (e.key === 'Enter') {
      handleFinishRename(tabId);
    } else if (e.key === 'Escape') {
      handleCancelRename();
    }
  };

  const handleTabContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 计算菜单位置，确保不超出屏幕边界
    const menuWidth = 192; // min-w-48 = 192px
    const menuHeight = 200; // 估算菜单高度
    
    let x = e.clientX;
    let y = e.clientY;
    
    // 确保菜单不超出右边界
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 5;
    }
    
    // 确保菜单不超出底部边界
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 5;
    }
    
    setMenuPosition({ x, y });
    setShowTabMenu(tabId);
  };

  const handleCloseTab = (tabId: string) => {
    closeTab(tabId);
    setShowTabMenu(null);
  };

  const handleCloseOthers = (tabId: string) => {
    tabs.forEach(tab => {
      if (tab.id !== tabId) {
        closeTab(tab.id);
      }
    });
    setShowTabMenu(null);
  };

  const handleCloseToRight = (tabId: string) => {
    const currentIndex = tabs.findIndex(tab => tab.id === tabId);
    if (currentIndex >= 0) {
      for (let i = currentIndex + 1; i < tabs.length; i++) {
        closeTab(tabs[i].id);
      }
    }
    setShowTabMenu(null);
  };

  const handleCloseToLeft = (tabId: string) => {
    const currentIndex = tabs.findIndex(tab => tab.id === tabId);
    if (currentIndex >= 0) {
      for (let i = 0; i < currentIndex; i++) {
        closeTab(tabs[i].id);
      }
    }
    setShowTabMenu(null);
  };

  const handleCloseSaved = () => {
    tabs.forEach(tab => {
      if (tab.isSaved && !tab.isModified) {
        closeTab(tab.id);
      }
    });
    setShowTabMenu(null);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-green-600 bg-green-50';
      case 'POST': return 'text-blue-600 bg-blue-50';
      case 'PUT': return 'text-yellow-600 bg-yellow-50';
      case 'DELETE': return 'text-red-600 bg-red-50';
      case 'PATCH': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-gray-50 border-b border-gray-200 h-8 w-full flex items-center relative overflow-hidden">
      {/* 左滚动按钮 - Mini模式 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleScrollLeft}
        disabled={!canScrollLeft}
        className="flex-shrink-0 w-6 h-full border-r border-gray-200 rounded-none p-0"
        aria-label={t('scrollLeft')}
      >
        <ChevronLeft size={10} />
      </Button>
      
      {/* 滚动容器 - Mini模式：更紧凑的宽度计算 */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto overflow-y-hidden scrollbar-hide h-full"
        style={{ 
          scrollBehavior: 'smooth',
          width: 'calc(100% - 72px)', // 减去左右按钮和新建按钮的宽度
          minWidth: '0px'
        }}
      >
        {/* 内容容器 - Mini模式 */}
        <div className="flex h-full" style={{ width: 'max-content' }}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              data-tab-id={tab.id}
              className={`flex items-center gap-1 px-2 py-0.5 border-r border-gray-200 cursor-pointer group relative flex-shrink-0 h-full transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-white border-b border-blue-500 text-gray-900'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              style={{
                minWidth: '60px',   // Mini模式：更小的最小宽度
                maxWidth: '120px',  // Mini模式：更小的最大宽度
                width: 'auto'
              }}
              onClick={() => setActiveTab(tab.id)}
              onContextMenu={(e) => handleTabContextMenu(e, tab.id)}
            >
              {/* HTTP方法标签 - Mini模式 */}
              <span className={`text-xs font-bold px-1 py-0.5 flex-shrink-0 rounded text-center min-w-6 ${getMethodColor(tab.method)}`}>
                {tab.method.substring(0, 3)} {/* 只显示前3个字符 */}
              </span>
              
              {/* 标签名称 - Mini模式，支持重命名 */}
              {editingTabId === tab.id ? (
                <Input
                  ref={editInputRef}
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleFinishRename(tab.id)}
                  onKeyDown={(e) => handleRenameKeyDown(e, tab.id)}
                  className="text-xs h-5 border-blue-400 px-1 py-0 flex-1 min-w-0 font-medium focus:ring-1 focus:ring-blue-500"
                  style={{ 
                    minWidth: '15px',
                    maxWidth: '60px'
                  }}
                  placeholder={t('enterTabName')}
                />
              ) : (
                <span 
                  className="text-xs truncate flex-1 min-w-0 font-medium cursor-pointer" 
                  title={tab.name}
                  style={{ 
                    minWidth: '15px',
                    maxWidth: '60px'
                  }}
                  onDoubleClick={() => handleStartRename(tab.id, tab.name)}
                >
                  {tab.name.length > 8 ? tab.name.substring(0, 8) + '...' : tab.name}
                </span>
              )}
              
              {/* 修改状态指示器 - Mini模式：更小 */}
              {tab.isModified && (
                <div className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0"></div>
              )}
              
              {/* 关闭按钮 - Mini模式：移除菜单按钮，只保留关闭 */}
                            <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseTab(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 h-4 w-4 hover:bg-red-100 hover:text-red-600 transition-all duration-150"
                title={t('closeTab')}
              >
                <X size={6} />
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      {/* 右滚动按钮 - Mini模式 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleScrollRight}
        disabled={!canScrollRight}
        className="flex-shrink-0 w-6 h-full border-l border-gray-200 rounded-none p-0"
        aria-label={t('scrollRight')}
      >
        <ChevronRight size={10} />
      </Button>
      
      {/* 新建标签页按钮 - Mini模式 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNewTab}
        className="flex-shrink-0 w-6 h-full border-l border-gray-200 rounded-none p-0"
        title={t('newTab')}
      >
        <Plus size={10} />
      </Button>

      {/* 右键菜单 - Mini模式：通过右键触发 */}
      {showTabMenu && (
        <div
          ref={menuRef}
          className="fixed bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 min-w-32"
          style={{
            left: menuPosition.x,
            top: menuPosition.y,
          }}
        >
          <button
            onClick={() => {
              const tab = tabs.find(t => t.id === showTabMenu);
              if (tab) {
                handleStartRename(tab.id, tab.name);
              }
            }}
            className="w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
          >
            <Edit3 size={10} />
            <span>{t('rename')}</span>
          </button>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={() => handleCloseTab(showTabMenu)}
            className="w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
          >
            <XCircle size={10} />
            <span>{t('close')}</span>
          </button>
          <button
            onClick={() => handleCloseOthers(showTabMenu)}
            className="w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
          >
            <Square size={10} />
            <span>{t('closeOthers')}</span>
          </button>
          <button
            onClick={() => handleCloseToRight(showTabMenu)}
            className="w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
          >
            <SquareStack size={10} />
            <span>{t('closeRight')}</span>
          </button>
          <button
            onClick={() => handleCloseToLeft(showTabMenu)}
            className="w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
          >
            <SquareStack size={10} className="transform rotate-180" />
            <span>{t('closeLeft')}</span>
          </button>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={() => handleCloseSaved}
            className="w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
          >
            <FileX size={10} />
            <span>{t('closeSaved')}</span>
          </button>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={() => {
              const tab = tabs.find(t => t.id === showTabMenu);
              if (tab && tab.url) {
                navigator.clipboard.writeText(tab.url).then(() => {
                  console.log('URL copied to clipboard');
                }).catch(err => {
                  console.error('Failed to copy URL:', err);
                });
              }
              setShowTabMenu(null);
            }}
            className="w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{t('copyUrl')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
