import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Save, Star, GripHorizontal } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { httpClient } from '../lib/httpClient';
import monaco from '../lib/monacoInstance';

interface RequestBuilderProps {
  tabId: string;
}

const RequestBuilder: React.FC<RequestBuilderProps> = ({ tabId }) => {
  const { tabs, updateTab, setResponse, saveTab, addTabToFavorites, addToHistory } = useAppStore();
  const tab = tabs.find(t => t.id === tabId);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'params' | 'headers' | 'body' | 'auth'>('params');
  const [upperHeight, setUpperHeight] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bodyEditorRef = useRef<any>(null);

  // Monaco editor setup
  useEffect(() => {
    if (activeSection === 'body' && tab?.bodyType !== 'none') {
      const container = document.getElementById(`body-editor-${tabId}`);
      if (container && !bodyEditorRef.current) {
        bodyEditorRef.current = monaco.editor.create(container, {
          value: tab.body || '',
          language: tab.bodyType === 'json' ? 'json' : 'text',
          theme: 'vs',
          minimap: { enabled: false },
          lineNumbers: 'on',
          fontSize: 13,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        });

        bodyEditorRef.current.onDidChangeModelContent(() => {
          const value = bodyEditorRef.current.getValue();
          updateTab(tabId, { body: value });
        });
      }
    }

    return () => {
      if (bodyEditorRef.current) {
        bodyEditorRef.current.dispose();
        bodyEditorRef.current = null;
      }
    };
  }, [activeSection, tab?.bodyType, tabId]);

  if (!tab) return null;

  const handleMethodChange = (method: string) => {
    updateTab(tabId, { method });
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
      const response = await httpClient.sendRequest({
        url: tab.url,
        method: tab.method,
        headers: tab.headers || {},
        params: tab.params || {},
        body: tab.body,
        auth: tab.auth
      });
      
      const duration = Date.now() - startTime;
      
      setResponse({
        ...response,
        duration
      });

      const historyItem = {
        id: Date.now().toString(),
        url: tab.url,
        method: tab.method,
        headers: tab.headers || {},
        body: tab.body,
        timestamp: Date.now(),
        response: {
          ...response,
          duration
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

  // Parameter management
  const addParam = () => {
    const newParams = [...(tab.queryParams || []), { key: '', value: '', description: '' }];
    updateTab(tabId, { queryParams: newParams });
  };

  const updateParam = (index: number, field: string, value: string) => {
    const newParams = [...(tab.queryParams || [])];
    newParams[index] = { ...newParams[index], [field]: value };
    updateTab(tabId, { queryParams: newParams });
  };

  const removeParam = (index: number) => {
    const newParams = (tab.queryParams || []).filter((_, i) => i !== index);
    updateTab(tabId, { queryParams: newParams });
  };

  // Header management
  const addHeader = () => {
    const newHeaders = [...(tab.headers || []), { key: '', value: '', description: '' }];
    updateTab(tabId, { headers: newHeaders });
  };

  const updateHeader = (index: number, field: string, value: string) => {
    const newHeaders = [...(tab.headers || [])];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    updateTab(tabId, { headers: newHeaders });
  };

  const removeHeader = (index: number) => {
    const newHeaders = (tab.headers || []).filter((_, i) => i !== index);
    updateTab(tabId, { headers: newHeaders });
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
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600 mb-3">
                  <div className="col-span-5">KEY</div>
                  <div className="col-span-5">VALUE</div>
                  <div className="col-span-2">DESCRIPTION</div>
                </div>
                {(tab.queryParams || []).map((param, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center group">
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={param.key}
                        onChange={(e) => updateParam(index, 'key', e.target.value)}
                        placeholder="Key"
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => updateParam(index, 'value', e.target.value)}
                        placeholder="Value"
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="text"
                        value={param.description || ''}
                        onChange={(e) => updateParam(index, 'description', e.target.value)}
                        placeholder="Description"
                        className="w-full px-2 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() => removeParam(index)}
                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addParam}
                  className="text-orange-500 hover:text-orange-700 text-sm font-medium mt-2"
                >
                  + Add parameter
                </button>
              </div>
            </div>
          )}

          {/* Headers Section */}
          {activeSection === 'headers' && (
            <div className="p-4 h-full overflow-auto">
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600 mb-3">
                  <div className="col-span-5">KEY</div>
                  <div className="col-span-5">VALUE</div>
                  <div className="col-span-2">DESCRIPTION</div>
                </div>
                {(tab.headers || []).map((header, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center group">
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={header.key}
                        onChange={(e) => updateHeader(index, 'key', e.target.value)}
                        placeholder="Key"
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={header.value}
                        onChange={(e) => updateHeader(index, 'value', e.target.value)}
                        placeholder="Value"
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="text"
                        value={header.description || ''}
                        onChange={(e) => updateHeader(index, 'description', e.target.value)}
                        placeholder="Description"
                        className="w-full px-2 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() => removeHeader(index)}
                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addHeader}
                  className="text-orange-500 hover:text-orange-700 text-sm font-medium mt-2"
                >
                  + Add header
                </button>
              </div>
            </div>
          )}

          {/* Body Section */}
          {activeSection === 'body' && (
            <div className="p-4 h-full overflow-hidden flex flex-col">
              <div className="flex space-x-4 mb-4">
                {['none', 'json', 'form-data', 'raw'].map((type) => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value={type}
                      checked={tab.bodyType === type}
                      onChange={(e) => updateTab(tabId, { bodyType: e.target.value as any })}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm capitalize">{type === 'form-data' ? 'Form Data' : type}</span>
                  </label>
                ))}
              </div>

              {tab.bodyType !== 'none' && (
                <div className="flex-1 min-h-0">
                  <div className="h-full border border-gray-300">
                    <div id={`body-editor-${tabId}`} className="h-full" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Auth Section */}
          {activeSection === 'auth' && (
            <div className="p-4 h-full overflow-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Auth Type</label>
                  <select
                    value={tab.authType}
                    onChange={(e) => updateTab(tabId, { authType: e.target.value as any })}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value="none">No Auth</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                    <option value="api-key">API Key</option>
                  </select>
                </div>

                {tab.authType === 'bearer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Token</label>
                    <input
                      type="text"
                      value={tab.authConfig?.token || ''}
                      onChange={(e) => updateTab(tabId, { 
                        authConfig: { ...tab.authConfig, token: e.target.value }
                      })}
                      placeholder="Enter token"
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}

                {tab.authType === 'basic' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                      <input
                        type="text"
                        value={tab.authConfig?.username || ''}
                        onChange={(e) => updateTab(tabId, { 
                          authConfig: { ...tab.authConfig, username: e.target.value }
                        })}
                        placeholder="Enter username"
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                      <input
                        type="password"
                        value={tab.authConfig?.password || ''}
                        onChange={(e) => updateTab(tabId, { 
                          authConfig: { ...tab.authConfig, password: e.target.value }
                        })}
                        placeholder="Enter password"
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                )}

                {tab.authType === 'api-key' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Key</label>
                      <input
                        type="text"
                        value={tab.authConfig?.key || ''}
                        onChange={(e) => updateTab(tabId, { 
                          authConfig: { ...tab.authConfig, key: e.target.value }
                        })}
                        placeholder="API key name"
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                      <input
                        type="text"
                        value={tab.authConfig?.value || ''}
                        onChange={(e) => updateTab(tabId, { 
                          authConfig: { ...tab.authConfig, value: e.target.value }
                        })}
                        placeholder="API key value"
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Add to</label>
                      <select
                        value={tab.authConfig?.addTo || 'header'}
                        onChange={(e) => updateTab(tabId, { 
                          authConfig: { ...tab.authConfig, addTo: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                      >
                        <option value="header">Header</option>
                        <option value="query">Query Params</option>
                      </select>
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
          setIsDragging(true);
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
            setIsDragging(false);
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
          <div className="text-sm text-gray-500">
            Response will appear here after sending a request
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestBuilder;
