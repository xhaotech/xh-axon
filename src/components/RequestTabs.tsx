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

  return (
    <div className="bg-white border-b border-gray-200 flex items-center">
      <div className="flex flex-1 overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center space-x-2 px-3 py-2 border-r border-gray-200 cursor-pointer min-w-0 ${
              activeTab === tab.id
                ? 'bg-blue-50 border-b-2 border-blue-500'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className={`text-xs font-medium px-1.5 py-0.5 ${
              tab.method === 'GET' ? 'bg-green-100 text-green-700' :
              tab.method === 'POST' ? 'bg-blue-100 text-blue-700' :
              tab.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
              tab.method === 'DELETE' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {tab.method}
            </span>
            <span className="text-xs text-gray-700 truncate flex-1">
              {tab.name}
            </span>
            {tab.isModified && (
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      
      <button
        onClick={handleNewTab}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-l border-gray-200"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};
