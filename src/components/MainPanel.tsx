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
      <RequestTabs />
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {tabs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">XH</span>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Axon</h2>
              <p className="text-gray-600 mb-4">
                Create a new request to get started testing your APIs
              </p>
              <button 
                onClick={handleNewRequest}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
