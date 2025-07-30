import React from 'react';
import { RequestTabs } from './RequestTabs';
import { RequestBuilder } from './RequestBuilder';
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
    <div className="flex flex-col h-full bg-gray-50">
      {/* Request Tabs */}
      <div className="flex-shrink-0">
        <RequestTabs />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {tabs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <div className="w-8 h-8 bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">XH</span>
                </div>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Axon</h2>
              <p className="text-sm text-gray-600 mb-3">
                Create a new request to get started testing your APIs
              </p>
              <button 
                onClick={handleNewRequest}
                className="bg-blue-500 text-white px-3 py-2 hover:bg-blue-600 transition-colors text-sm font-medium focus:outline-none"
              >
                New Request
              </button>
            </div>
          </div>
        ) : (
          activeTab && <RequestBuilder tabId={activeTab} />
        )}
      </div>
    </div>
  );
};
