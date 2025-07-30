import React from 'react';
import { History, Star, Plus, Search, FolderOpen, Trash2 } from 'lucide-react';
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
      {/* Workspace Header */}
      <div className="p-2 border-b border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xs font-medium text-gray-900">Workspace</h2>
          <div className="flex items-center space-x-0.5">
            <button className="p-0.5 hover:bg-gray-100 transition-colors">
              <Plus size={12} className="text-gray-600" />
            </button>
          </div>
        </div>
        
        <button
          onClick={handleNewRequest}
          className="w-full bg-blue-500 text-white px-2 py-1 text-xs font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1"
        >
          <Plus size={12} />
          <span>New</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-6 pr-2 py-1 text-xs border border-gray-300 focus:outline-none focus:border-blue-500"
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
            className={`flex-1 p-1.5 text-xs font-medium transition-colors flex items-center justify-center space-x-0.5 ${
              activePanel === tab.id
                ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <tab.icon size={10} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activePanel === 'collections' && (
          <div className="p-2">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1 p-1 hover:bg-gray-50 cursor-pointer">
                <FolderOpen size={12} className="text-gray-600" />
                <span className="text-xs text-gray-900">bgirimm</span>
              </div>
              <div className="flex items-center space-x-1 p-1 hover:bg-gray-50 cursor-pointer">
                <FolderOpen size={12} className="text-gray-600" />
                <span className="text-xs text-gray-900">New Collection</span>
              </div>
              <div className="flex items-center space-x-1 p-1 hover:bg-gray-50 cursor-pointer">
                <FolderOpen size={12} className="text-gray-600" />
                <span className="text-xs text-gray-900">云数</span>
              </div>
              <div className="flex items-center space-x-1 p-1 hover:bg-gray-50 cursor-pointer">
                <FolderOpen size={12} className="text-gray-600" />
                <span className="text-xs text-gray-900">请求集合测试</span>
              </div>
            </div>
          </div>
        )}

        {activePanel === 'history' && (
          <div className="p-2">
            <h3 className="text-xs font-medium text-gray-900 mb-1">Request History</h3>
            {history.length === 0 ? (
              <p className="text-gray-500 text-xs">No requests yet</p>
            ) : (
              <div className="space-y-0.5">
                {history.slice(0, 50).map((request) => (
                  <div
                    key={request.id}
                    className="p-1.5 border border-gray-200 hover:bg-gray-50 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-xs font-medium px-1 py-0.5 ${
                        request.method === 'GET' ? 'bg-green-100 text-green-700' :
                        request.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                        request.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                        request.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {request.method}
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">
                          {new Date(request.timestamp).toLocaleTimeString()}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFromHistory(request.id);
                          }}
                          className="p-0.5 hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete from history"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-900 truncate">{request.url}</p>
                    {request.response && (
                      <p className={`text-xs mt-0.5 ${
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
          <div className="p-2">
            <h3 className="text-xs font-medium text-gray-900 mb-1">Favorites</h3>
            {favorites.length === 0 ? (
              <p className="text-gray-500 text-xs">No favorites yet</p>
            ) : (
              <div className="space-y-0.5">
                {favorites.map((request) => (
                  <div
                    key={request.id}
                    className="p-1.5 border border-gray-200 hover:bg-gray-50 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-xs font-medium px-1 py-0.5 ${
                        request.method === 'GET' ? 'bg-green-100 text-green-700' :
                        request.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                        request.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                        request.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {request.method}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFavorite(request.id);
                        }}
                        className="p-0.5 hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove from favorites"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-900 truncate">{request.url}</p>
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
