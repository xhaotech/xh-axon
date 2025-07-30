import React from 'react';
import { History, Star, Settings2, Plus, X } from 'lucide-react';
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
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-14 bottom-0">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={handleNewRequest}
          className="w-full bg-blue-500 text-white px-4 py-2 hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus size={16} />
          <span>New Request</span>
        </button>
      </div>

      {/* Sidebar Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'history', label: 'History', icon: History, count: history.length },
          { id: 'favorites', label: 'Favorites', icon: Star, count: favorites.length },
          { id: 'environments', label: 'Env', icon: Settings2 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePanel(tab.id as any)}
            className={`flex-1 p-3 text-sm font-medium border-b-2 transition-colors ${
              activePanel === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-1">
              <tab.icon size={16} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">
                  {tab.count}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto">
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

        {activePanel === 'environments' && (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Environments</h3>
            <p className="text-gray-500 text-sm">Environment management coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};
