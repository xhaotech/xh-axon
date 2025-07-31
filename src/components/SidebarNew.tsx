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

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-10 bottom-6">
      {/* New Request Button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={handleNewRequest}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} className="mr-2" />
          新建请求
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'history', label: '历史记录', icon: History },
          { id: 'favorites', label: '收藏', icon: Star },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePanel(tab.id as any)}
            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors ${
              activePanel === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={16} className="mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* History Panel */}
        {activePanel === 'history' && (
          <div className="h-full flex flex-col">
            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索历史记录..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto">
              {history.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  暂无历史记录
                </div>
              ) : (
                <div className="p-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => {
                        const newTab = {
                          id: Date.now().toString(),
                          name: `${item.method} ${item.url}`,
                          url: item.url,
                          method: item.method,
                          params: {},
                          headers: item.headers,
                          body: item.body,
                          auth: { type: 'none' as const },
                          isSaved: false,
                          isModified: false
                        };
                        addTab(newTab);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded text-white ${
                            item.method === 'GET' ? 'bg-green-500' :
                            item.method === 'POST' ? 'bg-blue-500' :
                            item.method === 'PUT' ? 'bg-yellow-500' :
                            item.method === 'DELETE' ? 'bg-red-500' :
                            'bg-gray-500'
                          }`}>
                            {item.method}
                          </span>
                          <span className="text-sm text-gray-900 truncate">
                            {item.url}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
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
                        <Trash2 size={14} className="text-gray-400" />
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
            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索收藏..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Favorites List */}
            <div className="flex-1 overflow-y-auto">
              {favorites.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  暂无收藏
                </div>
              ) : (
                <div className="p-2">
                  {favorites.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => {
                        const newTab = {
                          id: Date.now().toString(),
                          name: `${item.method} ${item.url}`,
                          url: item.url,
                          method: item.method,
                          params: {},
                          headers: item.headers,
                          body: item.body,
                          auth: { type: 'none' as const },
                          isSaved: false,
                          isModified: false
                        };
                        addTab(newTab);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded text-white ${
                            item.method === 'GET' ? 'bg-green-500' :
                            item.method === 'POST' ? 'bg-blue-500' :
                            item.method === 'PUT' ? 'bg-yellow-500' :
                            item.method === 'DELETE' ? 'bg-red-500' :
                            'bg-gray-500'
                          }`}>
                            {item.method}
                          </span>
                          <span className="text-sm text-gray-900 truncate">
                            {item.url}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
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
                        <Trash2 size={14} className="text-gray-400" />
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
