import React, { useState, useRef } from 'react';
import { Save, Star, GripHorizontal } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { httpClient } from '../lib/httpClient';
import type { HttpMethod } from '../store/useAppStore';

interface RequestBuilderProps {
  tabId: string;
}

const RequestBuilder: React.FC<RequestBuilderProps> = ({ tabId }) => {
  const { tabs, updateTab, response, saveTab, addTabToFavorites, addToHistory } = useAppStore();
  const tab = tabs.find(t => t.id === tabId);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'params' | 'headers' | 'body' | 'auth'>('params');
  const [upperHeight, setUpperHeight] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!tab) return null;

  const handleMethodChange = (method: string) => {
    updateTab(tabId, { method: method as HttpMethod['value'] });
  };

  const handleUrlChange = (url: string) => {
    updateTab(tabId, { url });
  };

  const handleSendRequest = async () => {
    if (!tab.url.trim()) {
      alert('请输入请求URL');
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await httpClient.proxyRequest({
        url: tab.url,
        method: tab.method,
        headers: tab.headers || {},
        params: tab.params || {},
        body: tab.body || '',
        auth: tab.auth
      });
      
      const duration = Date.now() - startTime;
      
      // Note: Since response is managed in store, we'd need to add a setResponse method
      // For now, just log the response
      console.log('Response:', response);

      const historyItem = {
        id: Date.now().toString(),
        url: tab.url,
        method: tab.method,
        headers: tab.headers || {},
        body: tab.body,
        timestamp: Date.now(),
        response: {
          status: response.success ? 200 : 500,
          statusText: response.success ? 'OK' : 'Error',
          headers: {},
          data: response.data,
          duration
        }
      };

      addToHistory(historyItem);
      
    } catch (error: any) {
      console.error('Request failed:', error);
      
      const historyItem = {
        id: Date.now().toString(),
        url: tab.url,
        method: tab.method,
        headers: tab.headers || {},
        body: tab.body,
        timestamp: Date.now(),
        response: {
          status: error.status || 500,
          statusText: error.message || 'Error',
          headers: {},
          data: { error: error.message },
          duration: Date.now() - startTime
        }
      };
      
      addToHistory(historyItem);
    } finally {
      setIsLoading(false);
    }
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

  // Convert params object to array for display
  const paramsArray = Object.entries(tab.params || {}).map(([key, value]) => ({ key, value }));
  const headersArray = Object.entries(tab.headers || {}).map(([key, value]) => ({ key, value }));

  const updateParams = (newParams: Array<{key: string, value: string}>) => {
    const paramsObj = newParams.reduce((acc, param) => {
      if (param.key.trim()) {
        acc[param.key] = param.value;
      }
      return acc;
    }, {} as Record<string, string>);
    updateTab(tabId, { params: paramsObj });
  };

  const updateHeaders = (newHeaders: Array<{key: string, value: string}>) => {
    const headersObj = newHeaders.reduce((acc, header) => {
      if (header.key.trim()) {
        acc[header.key] = header.value;
      }
      return acc;
    }, {} as Record<string, string>);
    updateTab(tabId, { headers: headersObj });
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

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* Params Section */}
          {activeSection === 'params' && (
            <div className="p-4 h-full overflow-auto">
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-600 mb-3">
                  <div>KEY</div>
                  <div>VALUE</div>
                  <div className="w-8"></div>
                </div>
                {paramsArray.map((param, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 items-center group">
                    <input
                      type="text"
                      value={param.key}
                      onChange={(e) => {
                        const newParams = [...paramsArray];
                        newParams[index] = { ...param, key: e.target.value };
                        updateParams(newParams);
                      }}
                      placeholder="Key"
                      className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                    />
                    <input
                      type="text"
                      value={param.value}
                      onChange={(e) => {
                        const newParams = [...paramsArray];
                        newParams[index] = { ...param, value: e.target.value };
                        updateParams(newParams);
                      }}
                      placeholder="Value"
                      className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                    />
                    <button
                      onClick={() => {
                        const newParams = paramsArray.filter((_, i) => i !== index);
                        updateParams(newParams);
                      }}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity justify-self-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Key"
                    className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Tab' || e.key === 'Enter') {
                        e.preventDefault();
                        const keyInput = e.target as HTMLInputElement;
                        const valueInput = keyInput.parentElement?.children[1] as HTMLInputElement;
                        if (valueInput) valueInput.focus();
                      }
                    }}
                    onBlur={(e) => {
                      const keyInput = e.target as HTMLInputElement;
                      const valueInput = keyInput.parentElement?.children[1] as HTMLInputElement;
                      if (keyInput.value.trim() && valueInput.value.trim()) {
                        const newParams = [...paramsArray, { key: keyInput.value, value: valueInput.value }];
                        updateParams(newParams);
                        keyInput.value = '';
                        valueInput.value = '';
                      }
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const valueInput = e.target as HTMLInputElement;
                        const keyInput = valueInput.parentElement?.children[0] as HTMLInputElement;
                        if (keyInput.value.trim() && valueInput.value.trim()) {
                          const newParams = [...paramsArray, { key: keyInput.value, value: valueInput.value }];
                          updateParams(newParams);
                          keyInput.value = '';
                          valueInput.value = '';
                          keyInput.focus();
                        }
                      }
                    }}
                  />
                  <div className="w-8"></div>
                </div>
              </div>
            </div>
          )}

          {/* Headers Section */}
          {activeSection === 'headers' && (
            <div className="p-4 h-full overflow-auto">
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-600 mb-3">
                  <div>KEY</div>
                  <div>VALUE</div>
                  <div className="w-8"></div>
                </div>
                {headersArray.map((header, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 items-center group">
                    <input
                      type="text"
                      value={header.key}
                      onChange={(e) => {
                        const newHeaders = [...headersArray];
                        newHeaders[index] = { ...header, key: e.target.value };
                        updateHeaders(newHeaders);
                      }}
                      placeholder="Key"
                      className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                    />
                    <input
                      type="text"
                      value={header.value}
                      onChange={(e) => {
                        const newHeaders = [...headersArray];
                        newHeaders[index] = { ...header, value: e.target.value };
                        updateHeaders(newHeaders);
                      }}
                      placeholder="Value"
                      className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                    />
                    <button
                      onClick={() => {
                        const newHeaders = headersArray.filter((_, i) => i !== index);
                        updateHeaders(newHeaders);
                      }}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity justify-self-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Key"
                    className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Tab' || e.key === 'Enter') {
                        e.preventDefault();
                        const keyInput = e.target as HTMLInputElement;
                        const valueInput = keyInput.parentElement?.children[1] as HTMLInputElement;
                        if (valueInput) valueInput.focus();
                      }
                    }}
                    onBlur={(e) => {
                      const keyInput = e.target as HTMLInputElement;
                      const valueInput = keyInput.parentElement?.children[1] as HTMLInputElement;
                      if (keyInput.value.trim() && valueInput.value.trim()) {
                        const newHeaders = [...headersArray, { key: keyInput.value, value: valueInput.value }];
                        updateHeaders(newHeaders);
                        keyInput.value = '';
                        valueInput.value = '';
                      }
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const valueInput = e.target as HTMLInputElement;
                        const keyInput = valueInput.parentElement?.children[0] as HTMLInputElement;
                        if (keyInput.value.trim() && valueInput.value.trim()) {
                          const newHeaders = [...headersArray, { key: keyInput.value, value: valueInput.value }];
                          updateHeaders(newHeaders);
                          keyInput.value = '';
                          valueInput.value = '';
                          keyInput.focus();
                        }
                      }
                    }}
                  />
                  <div className="w-8"></div>
                </div>
              </div>
            </div>
          )}

          {/* Body Section */}
          {activeSection === 'body' && (
            <div className="p-4 h-full overflow-hidden flex flex-col">
              <div className="flex-1 min-h-0">
                <textarea
                  value={tab.body || ''}
                  onChange={(e) => updateTab(tabId, { body: e.target.value })}
                  placeholder="Enter request body (JSON, XML, etc.)"
                  className="w-full h-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-orange-500 font-mono text-sm resize-none"
                />
              </div>
            </div>
          )}

          {/* Auth Section */}
          {activeSection === 'auth' && (
            <div className="p-4 h-full overflow-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Auth Type</label>
                  <select
                    value={tab.auth?.type || 'none'}
                    onChange={(e) => updateTab(tabId, { 
                      auth: { ...tab.auth, type: e.target.value as any } 
                    })}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value="none">No Auth</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                  </select>
                </div>

                {tab.auth?.type === 'bearer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Token</label>
                    <input
                      type="text"
                      value={tab.auth?.token || ''}
                      onChange={(e) => updateTab(tabId, { 
                        auth: { ...tab.auth, token: e.target.value }
                      })}
                      placeholder="Enter token"
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}

                {tab.auth?.type === 'basic' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                      <input
                        type="text"
                        value={tab.auth?.username || ''}
                        onChange={(e) => updateTab(tabId, { 
                          auth: { ...tab.auth, username: e.target.value }
                        })}
                        placeholder="Enter username"
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                      <input
                        type="password"
                        value={tab.auth?.password || ''}
                        onChange={(e) => updateTab(tabId, { 
                          auth: { ...tab.auth, password: e.target.value }
                        })}
                        placeholder="Enter password"
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drag Handle */}
      <div 
        className="flex items-center justify-center h-2 bg-gray-200 border-y border-gray-300 cursor-row-resize hover:bg-gray-300 transition-colors group"
        onMouseDown={(e) => {
          const startY = e.clientY;
          const startHeight = upperHeight;
          
          const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            
            const containerHeight = containerRef.current.offsetHeight;
            const deltaY = e.clientY - startY;
            const deltaPercent = (deltaY / containerHeight) * 100;
            const newHeight = Math.max(20, Math.min(80, startHeight + deltaPercent));
            setUpperHeight(newHeight);
          };
          
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      >
        <GripHorizontal size={16} className="text-gray-400 group-hover:text-gray-600" />
      </div>

      {/* Lower Section - Response */}
      <div 
        className="flex flex-col bg-gray-50"
        style={{ height: `${100 - upperHeight}%` }}
      >
        <div className="p-4 border-b border-gray-200 bg-white">
          <h3 className="text-sm font-medium text-gray-900">Response</h3>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          {response ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Status: <span className={`font-medium ${response.success ? 'text-green-600' : 'text-red-600'}`}>
                  {response.success ? 'Success' : 'Error'}
                </span>
              </div>
              <pre className="bg-white p-3 border border-gray-300 text-sm overflow-auto max-h-96">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Response will appear here after sending a request
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestBuilder;
