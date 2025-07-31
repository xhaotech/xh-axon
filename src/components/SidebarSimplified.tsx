import React from 'react';
import { History, Star, Plus, Search, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const Sidebar: React.FC = () => {
  const {
    sidebarCollapsed,
    activePanel,
    setActivePanel,
    history,
    favorites,
    addTab,
    deleteFromHistory,
    deleteFavorite,
  } = useAppStore();

  const handleNewRequest = () => {
    const newTab = {
      id: Date.now().toString(),
      name: 'New Request',
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
  };

  if (sidebarCollapsed) return null;

  const tabs = [
    { id: 'history', label: '历史记录', icon: History },
    { id: 'favorites', label: '收藏夹', icon: Star },
  ];

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-10 bottom-6">
      {/* New Request Button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={handleNewRequest}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={12} className="mr-2" />
          新建请求
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePanel(tab.id as any)}
            className={`
              flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium transition-colors
              ${activePanel === tab.id 
                ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
          >
            <tab.icon size={12} className="mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {/* History Panel */}
        {activePanel === 'history' && (
          <div className="h-full flex flex-col">
            <div className="p-3">
              <div className="relative mb-3">
                <Search size={12} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索历史记录..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {history.length === 0 ? (
                <div className="p-4 text-center">
                  <div className="text-gray-400 text-xs">暂无历史记录</div>
                </div>
              ) : (
                <div className="space-y-1 px-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => {
                        const newTab = {
                          id: Date.now().toString(),
                          name: `${item.method} ${item.url}`,
                          url: item.url,
                          method: item.method,
                          params: {},
                          headers: item.headers || {},
                          auth: { 
                            type: 'basic' as const,
                            username: 'wecise.admin',
                            password: 'admin'
                          },
                          isSaved: false,
                          isModified: false
                        };
                        addTab(newTab);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`
                            px-1.5 py-0.5 text-xs font-medium rounded
                            ${item.method === 'GET' ? 'bg-green-100 text-green-700' :
                              item.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                              item.method === 'PUT' ? 'bg-orange-100 text-orange-700' :
                              item.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }
                          `}>
                            {item.method}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 truncate mt-1">{item.url}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFromHistory(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                      >
                        <Trash2 size={12} className="text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Favorites Panel */}
        {activePanel === 'favorites' && (
          <div className="h-full flex flex-col">
            <div className="p-3">
              <div className="relative mb-3">
                <Search size={12} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索收藏..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {favorites.length === 0 ? (
                <div className="p-4 text-center">
                  <div className="text-gray-400 text-xs">暂无收藏</div>
                </div>
              ) : (
                <div className="space-y-1 px-2">
                  {favorites.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => {
                        const newTab = {
                          id: Date.now().toString(),
                          name: `${item.method} ${item.url}`,
                          url: item.url,
                          method: item.method,
                          params: {},
                          headers: item.headers || {},
                          auth: { 
                            type: 'basic' as const,
                            username: 'wecise.admin',
                            password: 'admin'
                          },
                          isSaved: false,
                          isModified: false
                        };
                        addTab(newTab);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`
                            px-1.5 py-0.5 text-xs font-medium rounded
                            ${item.method === 'GET' ? 'bg-green-100 text-green-700' :
                              item.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                              item.method === 'PUT' ? 'bg-orange-100 text-orange-700' :
                              item.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }
                          `}>
                            {item.method}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 truncate mt-1">{item.url}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFavorite(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                      >
                        <Trash2 size={12} className="text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
