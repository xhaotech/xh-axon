import React, { useState } from 'react';
import { Languages } from 'lucide-react';
import { RequestTabs } from './RequestTabs';
import RequestBuilder from './RequestBuilder';
import { useAppStore } from '../store/useAppStore';
import { createTranslator, getDefaultLanguage, Language } from '../lib/i18n';

export const MainPanel: React.FC = () => {
  const { tabs, activeTab, addTab } = useAppStore();
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

  // 测试函数：快速创建多个标签页
  const createMultipleTabs = () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
    const baseNames = ['Users API', 'Products API', 'Orders API', 'Auth API', 'Files API', 'Reports API', 'Settings API', 'Dashboard API'];
    
    for (let i = 0; i < 12; i++) {
      const method = methods[i % methods.length];
      const baseName = baseNames[i % baseNames.length];
      const newTab = {
        id: `test-${Date.now()}-${i}`,
        name: `${baseName} ${i + 1}`,
        url: `https://api.example.com/${baseName.toLowerCase().replace(' api', '')}/${i + 1}`,
        method,
        params: {},
        headers: {},
        auth: { 
          type: 'basic' as const,
          username: 'wecise.admin',
          password: 'admin'
        },
        isSaved: false,
        isModified: i % 3 === 0
      };
      setTimeout(() => addTab(newTab), i * 100); // 延迟添加以便观察滚动效果
    }
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
                  <div>
                    <button 
                      onClick={createMultipleTabs}
                      className="bg-green-500 text-white px-6 py-2 text-sm font-medium hover:bg-green-600 transition-colors rounded-lg"
                    >
                      测试多标签页 (创建12个标签)
                    </button>
                  </div>
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
