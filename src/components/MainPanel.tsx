import React from 'react';
import { RequestTabs } from './RequestTabs';
import RequestBuilder from './RequestBuilder';
import { useAppStore } from '../store/useAppStore';

export const MainPanel: React.FC = () => {
  const { tabs, activeTab, addTab } = useAppStore();

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

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Workspace Header */}
      <div className="border-b border-gray-200 bg-white">
        {/* Request Tabs */}
        {tabs.length > 0 && (
          <div className="flex-shrink-0">
            <RequestTabs />
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {tabs.length === 0 ? (
          <div className="h-full flex flex-col">
            {/* Welcome Content */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Welcome to XH Axon</h2>
                <p className="text-gray-600 text-base leading-relaxed mb-8">
                  Start building and testing your APIs. Create a new request to get started.
                </p>
                <button 
                  onClick={handleNewRequest}
                  className="bg-blue-500 text-white px-8 py-3 text-base font-medium hover:bg-blue-600 transition-colors"
                >
                  Create New Request
                </button>
              </div>
            </div>
          </div>
        ) : (
          activeTab && <RequestBuilder tabId={activeTab} />
        )}
      </div>
    </div>
  );
};
