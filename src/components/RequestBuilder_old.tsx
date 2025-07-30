import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Save, Star, GripHorizontal } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { httpClient } from '../lib/httpClient';
import { ResponseViewer } from './ResponseViewer';

interface RequestBuilderProps {
  tabId: string;
}

export const RequestBuilder: React.FC<RequestBuilderProps> = ({ tabId }) => {
  const { tabs, updateTab, addToHistory, saveTab, addTabToFavorites } = useAppStore();
  const tab = tabs.find(t => t.id === tabId);
  
  const [activeSection, setActiveSection] = useState<'params' | 'headers' | 'body' | 'auth'>('params');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  
  // 可调整大小的分隔条
  const [upperHeight, setUpperHeight] = useState(45); // 百分比
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!tab) return null;

  // 鼠标拖拽处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    e.preventDefault();
    const containerRect = containerRef.current.getBoundingClientRect();
    const newHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100;
    
    // 限制在20%到80%之间
    const clampedHeight = Math.max(20, Math.min(80, newHeight));
    setUpperHeight(clampedHeight);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleUrlChange = (url: string) => {
    updateTab(tabId, { url });
  };

  const handleMethodChange = (method: any) => {
    updateTab(tabId, { method });
  };

  const handleSaveRequest = async () => {
    if (!tab.url.trim()) {
      alert('请输入请求URL才能保存');
      return;
    }
    
    try {
      const response = await httpClient.saveRequest({
        name: tab.name || 'Untitled Request',
        url: tab.url,
        method: tab.method,
        params: tab.params,
        headers: tab.headers,
        body: tab.body,
        auth: tab.auth
      });
      
      if (response.success) {
        saveTab(tabId);
        alert('请求已保存到后端！');
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('保存失败，请重试');
    }
  };

  const handleAddToFavorites = async () => {
    if (!tab.url.trim()) {
      alert('请输入请求URL才能收藏');
      return;
    }
    
    try {
      const response = await httpClient.addToFavorites({
        name: tab.name || 'Untitled Request',
        url: tab.url,
        method: tab.method,
        params: tab.params,
        headers: tab.headers,
        body: tab.body,
        auth: tab.auth
      });
      
      if (response.success) {
        addTabToFavorites(tabId);
        alert('已添加到收藏！');
      }
    } catch (error) {
      console.error('Add to favorites failed:', error);
      alert('添加收藏失败，请重试');
    }
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
      
      // 构建完整的URL（包含查询参数）
      let fullUrl = tab.url;
      if (tab.params && Object.keys(tab.params).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(tab.params).forEach(([key, value]) => {
          if (key && value) {
            searchParams.append(key, value);
          }
        });
        const paramString = searchParams.toString();
        if (paramString) {
          fullUrl += (tab.url.includes('?') ? '&' : '?') + paramString;
        }
      }
      
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
        url: fullUrl,
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
        url: fullUrl,
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
    <div ref={containerRef} className="flex flex-col h-full">
      {/* Request URL Bar */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <select
            value={tab.method}
            onChange={(e) => handleMethodChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 text-sm font-bold text-orange-600 bg-orange-50 focus:outline-none focus:border-orange-500 min-w-24"
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
            className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:border-orange-500 text-sm"
          />
          
          <button
            onClick={handleSendRequest}
            disabled={isLoading}
            className="bg-orange-500 text-white px-6 py-2 font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
          
          <button 
            onClick={handleSaveRequest}
            className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 transition-colors"
            title="Save Request"
          >
            <Save size={16} />
          </button>
          
          <button 
            onClick={handleAddToFavorites}
            className="p-2 text-gray-400 hover:text-yellow-500 border border-gray-300 transition-colors"
            title="Add to Favorites"
          >
            <Star size={16} />
          </button>
        </div>
      </div>

      {/* Upper Section - Request Configuration */}
      <div 
        className="flex flex-col bg-white"
        style={{ height: `${upperHeight}%` }}
      >
        {/* Request Configuration Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            {[
              { id: 'params', label: 'Params' },
              { id: 'headers', label: 'Headers' },
              { id: 'body', label: 'Body' },
              { id: 'auth', label: 'Authorization' }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'border-b-2 border-orange-500 text-orange-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
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
                  {Object.entries(tab.params || {}).map(([key, value], index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Key"
                        value={key}
                        onChange={(e) => {
                          const newParams = { ...tab.params };
                          delete newParams[key];
                          newParams[e.target.value] = value;
                          updateTab(tabId, { params: newParams });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={value}
                        onChange={(e) => {
                          updateTab(tabId, { 
                            params: { ...tab.params, [key]: e.target.value } 
                          });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                      />
                      <button 
                        onClick={() => {
                          const newParams = { ...tab.params };
                          delete newParams[key];
                          updateTab(tabId, { params: newParams });
                        }}
                        className="px-3 py-2 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Key"
                      className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          const valueInput = input.nextElementSibling as HTMLInputElement;
                          if (input.value && valueInput.value) {
                            updateTab(tabId, { 
                              params: { ...tab.params, [input.value]: valueInput.value } 
                            });
                            input.value = '';
                            valueInput.value = '';
                          }
                        }
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          const keyInput = input.previousElementSibling as HTMLInputElement;
                          if (input.value && keyInput.value) {
                            updateTab(tabId, { 
                              params: { ...tab.params, [keyInput.value]: input.value } 
                            });
                            input.value = '';
                            keyInput.value = '';
                          }
                        }
                      }}
                    />
                    <div className="w-8"></div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'headers' && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Headers</h3>
                <div className="space-y-2">
                  {Object.entries(tab.headers || {}).map(([key, value], index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Header name"
                        value={key}
                        onChange={(e) => {
                          const newHeaders = { ...tab.headers };
                          delete newHeaders[key];
                          newHeaders[e.target.value] = value;
                          updateTab(tabId, { headers: newHeaders });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Header value"
                        value={value}
                        onChange={(e) => {
                          updateTab(tabId, { 
                            headers: { ...tab.headers, [key]: e.target.value } 
                          });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                      />
                      <button 
                        onClick={() => {
                          const newHeaders = { ...tab.headers };
                          delete newHeaders[key];
                          updateTab(tabId, { headers: newHeaders });
                        }}
                        className="px-3 py-2 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Header name"
                      className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          const valueInput = input.nextElementSibling as HTMLInputElement;
                          if (input.value && valueInput.value) {
                            updateTab(tabId, { 
                              headers: { ...tab.headers, [input.value]: valueInput.value } 
                            });
                            input.value = '';
                            valueInput.value = '';
                          }
                        }
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Header value"
                      className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          const keyInput = input.previousElementSibling as HTMLInputElement;
                          if (input.value && keyInput.value) {
                            updateTab(tabId, { 
                              headers: { ...tab.headers, [keyInput.value]: input.value } 
                            });
                            input.value = '';
                            keyInput.value = '';
                          }
                        }
                      }}
                    />
                    <div className="w-8"></div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'body' && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Request Body</h3>
                <textarea
                  value={tab.body || ''}
                  onChange={(e) => updateTab(tabId, { body: e.target.value })}
                  placeholder="Enter request body (JSON, XML, etc.)"
                  className="w-full h-32 px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500 font-mono text-sm"
                />
              </div>
            )}

            {activeSection === 'auth' && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Authentication</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auth Type
                    </label>
                    <select
                      value={tab.auth?.type || 'none'}
                      onChange={(e) => updateTab(tabId, { 
                        auth: { ...tab.auth, type: e.target.value as any } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                    >
                      <option value="none">No Auth</option>
                      <option value="basic">Basic Auth</option>
                      <option value="bearer">Bearer Token</option>
                    </select>
                  </div>

                  {tab.auth?.type === 'basic' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          value={tab.auth?.username || ''}
                          onChange={(e) => updateTab(tabId, { 
                            auth: { ...tab.auth, username: e.target.value } 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          value={tab.auth?.password || ''}
                          onChange={(e) => updateTab(tabId, { 
                            auth: { ...tab.auth, password: e.target.value } 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {tab.auth?.type === 'bearer' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Token
                      </label>
                      <input
                        type="text"
                        value={tab.auth?.token || ''}
                        onChange={(e) => updateTab(tabId, { 
                          auth: { ...tab.auth, token: e.target.value } 
                        })}
                        placeholder="Enter bearer token"
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resizable Divider */}
      <div 
        className={`flex items-center justify-center h-2 bg-gray-200 border-t border-b border-gray-300 cursor-row-resize hover:bg-gray-300 transition-colors ${
          isDragging ? 'bg-blue-200' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        <GripHorizontal size={16} className="text-gray-500" />
      </div>

      {/* Lower Section - Response */}
      <div 
        className="flex flex-col bg-gray-50"
        style={{ height: `${100 - upperHeight}%` }}
      >
        <div className="flex-1 p-3 min-h-0">
          {isLoading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-blue-600 h-full flex flex-col items-center justify-center">
              <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mb-4"></div>
              <span className="text-lg">Sending request...</span>
              <span className="text-sm text-gray-500 mt-1">Please wait</span>
            </div>
          ) : response ? (
            <div className="bg-white border border-gray-200 rounded-lg h-full overflow-hidden shadow-sm">
              <ResponseViewer response={response} />
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500 h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-lg font-medium">Send a request to see the response</span>
              <span className="text-sm text-gray-400 mt-1">Response will appear here with Monaco Editor</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
