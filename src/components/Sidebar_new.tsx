import React from 'react';
import { History, Star, Settings2, Plus, X, Search, FolderOpen } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const Sidebar: React.FC = () => {
  const {
    sidebarCollapsed,
    activePanel,
    setActivePanel,
    history,
    favorites,
    addTab
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
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-12 bottom-0">
      {/* Workspace Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-900">cnwangzd</h2>
          <div className="flex items-center space-x-1">
            <button className="p-1 hover:bg-gray-100 transition-colors">
              <Plus size={16} className="text-gray-600" />
            </button>
            <button className="p-1 hover:bg-gray-100 transition-colors">
              <Settings2 size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
        
        <button
          onClick={handleNewRequest}
          className="w-full bg-orange-500 text-white px-3 py-2 text-sm font-medium hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus size={16} />
          <span>New</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search collections"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Collections/Tabs Navigation */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {[
          { id: 'collections', label: 'Collections', icon: FolderOpen },
          { id: 'history', label: 'History', icon: History },
          { id: 'favorites', label: 'Favorites', icon: Star }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePanel(tab.id as any)}
            className={`flex-1 p-3 text-xs font-medium transition-colors flex items-center justify-center space-x-1 ${
              activePanel === tab.id
                ? 'text-orange-600 bg-white border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activePanel === 'collections' && (
          <div className="p-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer">
                <FolderOpen size={16} className="text-gray-600" />
                <span className="text-sm text-gray-900">bgirimm</span>
              </div>
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer">
                <FolderOpen size={16} className="text-gray-600" />
                <span className="text-sm text-gray-900">New Collection</span>
              </div>
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer">
                <FolderOpen size={16} className="text-gray-600" />
                <span className="text-sm text-gray-900">云数</span>
              </div>
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer">
                <FolderOpen size={16} className="text-gray-600" />
                <span className="text-sm text-gray-900">请求集合测试</span>
              </div>
            </div>
          </div>
        )}

        {activePanel === 'history' && (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Request History</h3>
            {history.length === 0 ? (
              <p className="text-gray-500 text-sm">No requests yet</p>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 50).map((request) => (
                  <div
                    key={request.id}
                    className="p-3 border border-gray-200 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium px-2 py-1 ${
                        request.method === 'GET' ? 'bg-green-100 text-green-700' :
                        request.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                        request.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                        request.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {request.method}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(request.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 truncate">{request.url}</p>
                    {request.response && (
                      <p className={`text-xs mt-1 ${
                        request.response.status >= 200 && request.response.status < 300
                          ? 'text-green-600'
                          : request.response.status >= 400
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}>
                        {request.response.status} {request.response.statusText}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activePanel === 'favorites' && (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Favorites</h3>
            {favorites.length === 0 ? (
              <p className="text-gray-500 text-sm">No favorites yet</p>
            ) : (
              <div className="space-y-2">
                {favorites.map((request) => (
                  <div
                    key={request.id}
                    className="p-3 border border-gray-200 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium px-2 py-1 ${
                        request.method === 'GET' ? 'bg-green-100 text-green-700' :
                        request.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                        request.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                        request.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {request.method}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-900 truncate">{request.url}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
