import React, { useState } from 'react';
import { Send, Save, Star } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { httpClient } from '../lib/httpClient';

interface RequestBuilderProps {
  tabId: string;
}

export const RequestBuilder: React.FC<RequestBuilderProps> = ({ tabId }) => {
  const { tabs, updateTab, addToHistory } = useAppStore();
  const tab = tabs.find(t => t.id === tabId);
  
  const [activeSection, setActiveSection] = useState<'params' | 'headers' | 'body' | 'auth'>('params');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  if (!tab) return null;

  const handleUrlChange = (url: string) => {
    updateTab(tabId, { url });
  };

  const handleMethodChange = (method: any) => {
    updateTab(tabId, { method });
  };

  const handleSendRequest = async () => {
    if (!tab.url.trim()) {
      alert('请输入请求URL');
      return;
    }

    setIsLoading(true);
    setResponse(null);
    
    try {
      console.log('Sending request...', tab);
      
      // 检查认证设置
      let auth: any = undefined;
      if (tab.auth?.type === 'basic' && tab.auth.username && tab.auth.password) {
        auth = {
          type: 'basic',
          username: tab.auth.username,
          password: tab.auth.password
        };
      } else if (tab.auth?.type === 'bearer' && tab.auth.token) {
        auth = {
          type: 'bearer',
          token: tab.auth.token
        };
      }

      const startTime = Date.now();
      
      // 发送代理请求
      const proxyResponse = await httpClient.proxyRequest({
        url: tab.url,
        method: tab.method,
        headers: tab.headers,
        body: tab.body,
        auth: auth
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log('Request completed:', proxyResponse);
      
      // 设置响应数据
      setResponse({
        ...proxyResponse.data,
        duration: duration
      });

      // 保存到历史记录
      const historyItem = {
        id: Date.now().toString(),
        url: tab.url,
        method: tab.method,
        headers: tab.headers,
        body: tab.body,
        timestamp: Date.now(),
        response: {
          status: proxyResponse.data?.status || 200,
          statusText: proxyResponse.data?.statusText || 'OK',
          headers: proxyResponse.data?.headers || {},
          data: proxyResponse.data?.data,
          duration: duration
        }
      };

      addToHistory(historyItem);
      
    } catch (error: any) {
      console.error('Request failed:', error);
      setResponse({
        error: true,
        message: error.message || 'Request failed',
        status: error.status || 500
      });
      
      // 也保存失败的请求到历史
      const historyItem = {
        id: Date.now().toString(),
        url: tab.url,
        method: tab.method,
        headers: tab.headers,
        body: tab.body,
        timestamp: Date.now(),
        response: {
          status: error.status || 500,
          statusText: error.message || 'Error',
          headers: {},
          data: { error: error.message },
          duration: Date.now() - Date.now()
        }
      };
      
      addToHistory(historyItem);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Request URL Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-2">
          <select
            value={tab.method}
            onChange={(e) => handleMethodChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>
          
          <input
            type="text"
            value={tab.url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="Enter request URL"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            onClick={handleSendRequest}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Send size={16} />
            <span>Send</span>
          </button>
          
          <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg">
            <Save size={16} />
          </button>
          
          <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg">
            <Star size={16} />
          </button>
        </div>
      </div>

      {/* Request Configuration Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {[
            { id: 'params', label: 'Params' },
            { id: 'headers', label: 'Headers' },
            { id: 'body', label: 'Body' },
            { id: 'auth', label: 'Auth' }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeSection === section.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Request Configuration Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {activeSection === 'params' && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Query Parameters</h3>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Key"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-3 py-2 text-gray-400 hover:text-gray-600">
                    ×
                  </button>
                </div>
                <button className="text-blue-600 text-sm hover:text-blue-700">
                  + Add Parameter
                </button>
              </div>
            </div>
          )}

          {activeSection === 'headers' && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Headers</h3>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Header"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-3 py-2 text-gray-400 hover:text-gray-600">
                    ×
                  </button>
                </div>
                <button className="text-blue-600 text-sm hover:text-blue-700">
                  + Add Header
                </button>
              </div>
            </div>
          )}

          {activeSection === 'body' && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Request Body</h3>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input type="radio" name="bodyType" defaultChecked className="mr-2" />
                    <span className="text-sm">JSON</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="bodyType" className="mr-2" />
                    <span className="text-sm">Form Data</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="bodyType" className="mr-2" />
                    <span className="text-sm">Raw</span>
                  </label>
                </div>
                <textarea
                  placeholder="Enter request body"
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  defaultValue='{\n  \n}'
                />
              </div>
            </div>
          )}

          {activeSection === 'auth' && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Authorization</h3>
              <div className="space-y-4">
                <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="none">No Auth</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="basic">Basic Auth</option>
                  <option value="oauth">OAuth 2.0</option>
                </select>
                
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Token"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Response Section Placeholder */}
      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Response</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center text-gray-500">
          Send a request to see the response
        </div>
      </div>
    </div>
  );
};
