import React, { useState } from 'react';
import { Languages } from 'lucide-react';
import { RequestTabs } from './RequestTabs';
import RequestBuilder from './RequestBuilder';
import { EnvironmentManager } from './EnvironmentManager';
import { useAppStore } from '../store/useAppStore';
import { createTranslator, getDefaultLanguage, Language } from '../lib/i18n';

export const MainPanel: React.FC = () => {
  const { tabs, activeTab, activePanel, addTab } = useAppStore();
  const [language, setLanguage] = useState<Language>(getDefaultLanguage());
  const t = createTranslator(language);

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

  // 渲染管理界面
  const renderManagementView = () => {
    switch (activePanel) {
      case 'environments':
        return <EnvironmentManager />;
      default:
        return null;
    }
  };

  // 如果当前是管理面板视图，显示管理界面
  if (activePanel === 'environments') {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* 管理界面标题栏 */}
        <div className="border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">
              {activePanel === 'environments' && '环境变量管理'}
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title={language === 'zh' ? 'Switch to English' : '切换到中文'}
              >
                <Languages size={16} />
                <span>{language === 'zh' ? 'EN' : '中文'}</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* 管理界面内容 */}
        <div className="flex-1 overflow-hidden">
          {renderManagementView()}
        </div>
      </div>
    );
  }

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
            {/* Language Switch in top right */}
            <div className="flex justify-end p-4">
              <button
                onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title={language === 'zh' ? 'Switch to English' : '切换到中文'}
              >
                <Languages size={16} />
                <span>{language === 'zh' ? 'EN' : '中文'}</span>
              </button>
            </div>
            
            {/* Welcome Content */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">
                  {t('welcome')}
                </h2>
                <p className="text-gray-600 text-base leading-relaxed mb-8">
                  {t('welcomeDescription')}
                </p>
                <div className="space-y-4">
                  <button 
                    onClick={handleNewRequest}
                    className="bg-blue-500 text-white px-8 py-3 text-base font-medium hover:bg-blue-600 transition-colors rounded-lg"
                  >
                    {t('createNewRequest')}
                  </button>
                </div>
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
