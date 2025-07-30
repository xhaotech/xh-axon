import React from 'react';
import { X, Plus } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const RequestTabs: React.FC = () => {
  const { tabs, activeTab, setActiveTab, closeTab, addTab } = useAppStore();

  const handleNewTab = () => {
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
    <div className="bg-gray-50 border-b border-gray-200 flex items-center">
      <div className="flex flex-1 overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center space-x-1 px-2 py-1 border-r border-gray-200 cursor-pointer min-w-0 group relative ${
              activeTab === tab.id
                ? 'bg-white border-b-2 border-blue-500'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className={`text-xs font-bold px-1 py-0.5 ${getMethodColor(tab.method)}`}>
              {tab.method}
            </span>
            <span className="text-xs text-gray-700 truncate flex-1 max-w-24">
              {tab.name}
            </span>
            {tab.isModified && (
              <div className="w-1 h-1 bg-blue-400"></div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={8} />
            </button>
          </div>
        ))}
      </div>
      
      <button
        onClick={handleNewTab}
        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 border-l border-gray-200 flex-shrink-0"
      >
        <Plus size={12} />
      </button>
    </div>
  );
};
