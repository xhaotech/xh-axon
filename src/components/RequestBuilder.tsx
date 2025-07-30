import React, { useState, useRef } from 'react';
import { Save, Star, GripHorizontal, Copy, Download, MoreHorizontal, Search, Filter, Settings } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useAppStore } from '../store/useAppStore';
import { httpClient } from '../lib/httpClient';
import type { HttpMethod } from '../store/useAppStore';

interface RequestBuilderProps {
  tabId: string;
}

const RequestBuilder: React.FC<RequestBuilderProps> = ({ tabId }) => {
  const { tabs, updateTab, saveTab, addTabToFavorites, addToHistory } = useAppStore();
  const tab = tabs.find(t => t.id === tabId);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'params' | 'headers' | 'body' | 'auth'>('params');
  const [upperHeight, setUpperHeight] = useState(50);
  const [response, setResponse] = useState<any>(null);
  const [responseView, setResponseView] = useState<'body' | 'cookies' | 'headers' | 'test-results' | 'json' | 'xml' | 'html' | 'javascript' | 'raw' | 'hex' | 'base64' | 'formatted' | 'preview'>('body');
  const [paramsEditMode, setParamsEditMode] = useState<'key-value' | 'bulk'>('key-value');
  const [headersEditMode, setHeadersEditMode] = useState<'key-value' | 'bulk'>('key-value');
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
      // Build URL with query parameters
      const urlWithParams = new URL(tab.url);
      Object.entries(tab.params || {}).forEach(([key, value]) => {
        urlWithParams.searchParams.set(key, value);
      });

      const apiResponse = await httpClient.proxyRequest({
        url: urlWithParams.toString(),
        method: tab.method,
        headers: tab.headers || {},
        body: tab.body || '',
        auth: tab.auth.type !== 'none' ? {
          type: tab.auth.type as 'basic' | 'bearer',
          username: tab.auth.username,
          password: tab.auth.password,
          token: tab.auth.token
        } : undefined
      });
      
      const duration = Date.now() - startTime;
      
      // Set local response state
      setResponse(apiResponse);
      console.log('Response:', apiResponse);

      const historyItem = {
        id: Date.now().toString(),
        url: tab.url,
        method: tab.method,
        headers: tab.headers || {},
        body: tab.body,
        timestamp: Date.now(),
        response: {
          status: apiResponse.success ? 200 : 500,
          statusText: apiResponse.success ? 'OK' : 'Error',
          headers: {},
          data: apiResponse.data,
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

  // Response utility functions
  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
      alert('Response copied to clipboard!');
    }
  };

  const downloadResponse = () => {
    if (response) {
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `response_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getResponseSize = () => {
    if (response) {
      const str = JSON.stringify(response.data);
      return `${(str.length / 1024).toFixed(2)} KB`;
    }
    return '0 KB';
  };

  const getResponseTime = () => {
    // This would need to be calculated during the request
    return '245ms'; // Placeholder
  };

  const formatJson = () => {
    if (response?.data && responseView === 'raw') {
      setResponseView('formatted');
    }
  };

  const searchInResponse = () => {
    // TODO: Implement search functionality
    console.log('Search in response');
  };

  const filterResponse = () => {
    // TODO: Implement filter functionality  
    console.log('Filter response');
  };

  // Response formatting functions
  const formatResponseContent = (data: any, format: string) => {
    if (!data) return '';
    
    const stringData = typeof data === 'string' ? data : JSON.stringify(data);
    
    switch (format) {
      case 'json':
        try {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data;
          return JSON.stringify(parsed, null, 2);
        } catch {
          return stringData;
        }
      
      case 'xml':
        // 基本的XML格式化
        if (stringData.includes('<') && stringData.includes('>')) {
          return stringData.replace(/></g, '>\n<').replace(/^\s+|\s+$/g, '');
        }
        return stringData;
      
      case 'html':
        // HTML格式化
        if (stringData.includes('<html') || stringData.includes('<!DOCTYPE')) {
          return stringData;
        }
        return stringData;
      
      case 'javascript':
        // JavaScript代码格式化
        return stringData;
      
      case 'raw':
        return stringData;
      
      case 'hex':
        // 转换为十六进制
        return Array.from(new TextEncoder().encode(stringData))
          .map(byte => byte.toString(16).padStart(2, '0'))
          .join(' ');
      
      case 'base64':
        // 转换为Base64
        try {
          return btoa(stringData);
        } catch {
          return stringData;
        }
      
      default:
        return stringData;
    }
  };

  const getLanguageFromFormat = (format: string) => {
    switch (format) {
      case 'json': return 'json';
      case 'xml': return 'xml';
      case 'html': return 'html';
      case 'javascript': return 'javascript';
      case 'raw': return 'text';
      case 'hex': return 'text';
      case 'base64': return 'text';
      default: return 'text';
    }
  };

  // Convert headers object to array for display
  const headersArray = Object.entries(tab.headers || {}).map(([key, value]) => ({ key, value }));

  const updateHeaders = (newHeaders: Array<{key: string, value: string}>) => {
    const headersObj = newHeaders.reduce((acc, header) => {
      if (header.key.trim()) {
        acc[header.key] = header.value;
      }
      return acc;
    }, {} as Record<string, string>);
    updateTab(tabId, { headers: headersObj });
  };

  // Convert params to bulk text format
  const paramsToBulkText = () => {
    return Object.entries(tab.params || {})
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
  };

  // Convert bulk text to params object
  const bulkTextToParams = (text: string) => {
    const params: Record<string, string> = {};
    text.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key.trim()) {
          params[key.trim()] = valueParts.join('=') || '';
        }
      }
    });
    return params;
  };

  // Convert headers to bulk text format
  const headersToBulkText = () => {
    return Object.entries(tab.headers || {})
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  };

  // Convert bulk text to headers object
  const bulkTextToHeaders = (text: string) => {
    const headers: Record<string, string> = {};
    text.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        const colonIndex = trimmedLine.indexOf(':');
        if (colonIndex > 0) {
          const key = trimmedLine.substring(0, colonIndex).trim();
          const value = trimmedLine.substring(colonIndex + 1).trim();
          if (key) {
            headers[key] = value;
          }
        }
      }
    });
    return headers;
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      {/* Request URL Bar */}
      <div className="bg-white p-2 border-b border-gray-200">
        {/* URL Input Row */}
        <div className="flex items-center space-x-1 mb-2">
          <select
            value={tab.method}
            onChange={(e) => handleMethodChange(e.target.value)}
            className="px-1 py-1 border border-gray-300 text-xs font-bold text-blue-600 bg-blue-50 focus:outline-none focus:border-blue-500 min-w-16"
          >
            {(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const).map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
          
          <input
            type="text"
            value={tab.url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="Enter URL"
            className="flex-1 px-2 py-1 border border-gray-300 focus:outline-none focus:border-blue-500 text-xs"
          />
          
          <button
            onClick={handleSendRequest}
            disabled={isLoading}
            className="bg-blue-500 text-white px-3 py-1 text-xs font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
          
          <button
            onClick={handleSaveRequest}
            className="p-1 text-gray-400 hover:text-gray-600 border border-gray-300 transition-colors"
          >
            <Save size={12} />
          </button>
          
          <button
            onClick={handleAddToFavorites}
            className="p-1 text-gray-400 hover:text-yellow-500 border border-gray-300 transition-colors"
          >
            <Star size={12} />
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
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  activeSection === section.id
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
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
            <div className="p-2 h-full overflow-auto">
              {/* Edit mode toggle */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-600">Query Params</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setParamsEditMode(paramsEditMode === 'key-value' ? 'bulk' : 'key-value')}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                  >
                    {paramsEditMode === 'key-value' ? 'Bulk Edit' : 'Key-Value Edit'}
                  </button>
                </div>
              </div>

              {paramsEditMode === 'key-value' ? (
                <div className="space-y-1">
                  <div className="grid grid-cols-3 gap-1 text-xs font-medium text-gray-600 mb-1">
                    <div>KEY</div>
                    <div>VALUE</div>
                    <div></div>
                  </div>
                  {(Object.entries(tab.params || {})).map(([key, value], index) => (
                    <div key={index} className="grid grid-cols-3 gap-1 items-center group">
                      <input
                        type="text"
                        value={key}
                        onChange={(e) => {
                          const newParams = { ...tab.params };
                          delete newParams[key];
                          if (e.target.value) {
                            newParams[e.target.value] = value;
                          }
                          updateTab(tabId, { params: newParams });
                        }}
                        className="px-1 py-1 border border-gray-300 text-xs focus:outline-none focus:border-blue-500"
                        placeholder="Key"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => {
                          const newParams = { ...tab.params };
                          newParams[key] = e.target.value;
                          updateTab(tabId, { params: newParams });
                        }}
                        className="px-1 py-1 border border-gray-300 text-xs focus:outline-none focus:border-blue-500"
                        placeholder="Value"
                      />
                      <button
                        onClick={() => {
                          const newParams = { ...tab.params };
                          delete newParams[key];
                          updateTab(tabId, { params: newParams });
                        }}
                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity justify-self-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div className="grid grid-cols-3 gap-1 items-center">
                    <input
                      type="text"
                      placeholder="New key"
                      className="px-2 py-1 border border-gray-300 text-xs focus:outline-none focus:border-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          const valueInput = input.parentElement?.children[1] as HTMLInputElement;
                          const key = input.value.trim();
                          const value = valueInput?.value || '';
                          if (key) {
                            const newParams = { ...tab.params, [key]: value };
                            updateTab(tabId, { params: newParams });
                            input.value = '';
                            if (valueInput) valueInput.value = '';
                          }
                        }
                      }}
                    />
                    <input
                      type="text"
                      placeholder="New value"
                      className="px-2 py-1 border border-gray-300 text-xs focus:outline-none focus:border-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const valueInput = e.target as HTMLInputElement;
                          const keyInput = valueInput.parentElement?.children[0] as HTMLInputElement;
                          const key = keyInput?.value.trim() || '';
                          const value = valueInput.value;
                          if (key) {
                            const newParams = { ...tab.params, [key]: value };
                            updateTab(tabId, { params: newParams });
                            keyInput.value = '';
                            valueInput.value = '';
                            keyInput.focus();
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const container = document.activeElement?.closest('.grid') as HTMLElement;
                        if (container) {
                          const keyInput = container.children[0] as HTMLInputElement;
                          const valueInput = container.children[1] as HTMLInputElement;
                          const key = keyInput.value.trim();
                          const value = valueInput.value;
                          if (key) {
                            const newParams = { ...tab.params, [key]: value };
                            updateTab(tabId, { params: newParams });
                            keyInput.value = '';
                            valueInput.value = '';
                            keyInput.focus();
                          }
                        }
                      }}
                      className="bg-blue-500 text-white w-6 h-6 text-xs hover:bg-blue-600 transition-colors rounded flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="text-xs text-gray-600 mb-1">
                    Bulk edit query parameters (format: key=value, one per line)
                  </div>
                  <div className="flex-1 border border-gray-200">
                    <Editor
                      height="100%"
                      defaultLanguage="text"
                      value={paramsToBulkText()}
                      onChange={(value) => {
                        if (value !== undefined) {
                          const newParams = bulkTextToParams(value);
                          updateTab(tabId, { params: newParams });
                        }
                      }}
                      theme="vs-light"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 12,
                        lineNumbers: 'on',
                        glyphMargin: false,
                        folding: false,
                        lineDecorationsWidth: 10,
                        lineNumbersMinChars: 3,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        wordWrap: 'on',
                        placeholder: 'key1=value1\nkey2=value2\nkey3=value3'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}          {/* Headers Section */}
          {activeSection === 'headers' && (
            <div className="p-2 h-full overflow-auto">
              {/* Edit mode toggle */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-600">Headers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setHeadersEditMode(headersEditMode === 'key-value' ? 'bulk' : 'key-value')}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                  >
                    {headersEditMode === 'key-value' ? 'Bulk Edit' : 'Key-Value Edit'}
                  </button>
                </div>
              </div>

              {headersEditMode === 'key-value' ? (
                <div className="space-y-1">
                  <div className="grid grid-cols-3 gap-1 text-xs font-medium text-gray-600 mb-1">
                    <div>KEY</div>
                    <div>VALUE</div>
                    <div className="w-4"></div>
                  </div>
                  {headersArray.map((header, index) => (
                    <div key={index} className="grid grid-cols-3 gap-1 items-center group">
                      <input
                        type="text"
                        value={header.key}
                        onChange={(e) => {
                          const newHeaders = [...headersArray];
                          newHeaders[index] = { ...header, key: e.target.value };
                          updateHeaders(newHeaders);
                        }}
                        placeholder="Key"
                        className="px-1 py-1 border border-gray-300 text-xs focus:outline-none focus:border-blue-500"
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
                        className="px-1 py-1 border border-gray-300 text-xs focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => {
                          const newHeaders = headersArray.filter((_, i) => i !== index);
                          updateHeaders(newHeaders);
                        }}
                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity justify-self-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div className="grid grid-cols-3 gap-1 items-center">
                    <input
                      type="text"
                      placeholder="Key"
                      className="px-2 py-1 border border-gray-300 text-xs focus:outline-none focus:border-blue-500"
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
                      className="px-2 py-1 border border-gray-300 text-xs focus:outline-none focus:border-blue-500"
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
                    <button
                      onClick={() => {
                        const container = document.activeElement?.closest('.grid') as HTMLElement;
                        if (container) {
                          const keyInput = container.children[0] as HTMLInputElement;
                          const valueInput = container.children[1] as HTMLInputElement;
                          const key = keyInput.value.trim();
                          const value = valueInput.value.trim();
                          if (key && value) {
                            const newHeaders = [...headersArray, { key, value }];
                            updateHeaders(newHeaders);
                            keyInput.value = '';
                            valueInput.value = '';
                            keyInput.focus();
                          }
                        }
                      }}
                      className="bg-blue-500 text-white w-6 h-6 text-xs hover:bg-blue-600 transition-colors rounded flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="text-xs text-gray-600 mb-1">
                    Bulk edit headers (format: key: value, one per line)
                  </div>
                  <div className="flex-1 border border-gray-200">
                    <Editor
                      height="100%"
                      defaultLanguage="text"
                      value={headersToBulkText()}
                      onChange={(value) => {
                        if (value !== undefined) {
                          const newHeaders = bulkTextToHeaders(value);
                          updateTab(tabId, { headers: newHeaders });
                        }
                      }}
                      theme="vs-light"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 12,
                        lineNumbers: 'on',
                        glyphMargin: false,
                        folding: false,
                        lineDecorationsWidth: 10,
                        lineNumbersMinChars: 3,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        wordWrap: 'on',
                        placeholder: 'Content-Type: application/json\nAuthorization: Bearer token\nX-Custom-Header: value'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Body Section */}
          {activeSection === 'body' && (
            <div className="p-2 h-full overflow-hidden flex flex-col">
              <div className="flex-1 min-h-0">
                <textarea
                  value={tab.body || ''}
                  onChange={(e) => updateTab(tabId, { body: e.target.value })}
                  placeholder="Enter request body (JSON, XML, etc.)"
                  className="w-full h-full px-1 py-1 border border-gray-300 focus:outline-none focus:border-blue-500 font-mono text-xs resize-none"
                />
              </div>
            </div>
          )}

          {/* Auth Section */}
          {activeSection === 'auth' && (
            <div className="p-2 h-full overflow-auto">
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Auth Type</label>
                  <select
                    value={tab.auth?.type || 'none'}
                    onChange={(e) => updateTab(tabId, { 
                      auth: { ...tab.auth, type: e.target.value as any } 
                    })}
                    className="w-full max-w-xs px-1 py-1 border border-gray-300 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="none">No Auth</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                  </select>
                </div>

                {tab.auth?.type === 'bearer' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Token</label>
                    <input
                      type="text"
                      value={tab.auth?.token || ''}
                      onChange={(e) => updateTab(tabId, { 
                        auth: { ...tab.auth, token: e.target.value }
                      })}
                      placeholder="Enter token"
                      className="w-full px-1 py-1 border border-gray-300 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {tab.auth?.type === 'basic' && (
                  <div className="space-y-1">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        value={tab.auth?.username || ''}
                        onChange={(e) => updateTab(tabId, { 
                          auth: { ...tab.auth, username: e.target.value }
                        })}
                        placeholder="Enter username"
                        className="w-full px-1 py-1 border border-gray-300 text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                      <input
                        type="password"
                        value={tab.auth?.password || ''}
                        onChange={(e) => updateTab(tabId, { 
                          auth: { ...tab.auth, password: e.target.value }
                        })}
                        placeholder="Enter password"
                        className="w-full px-1 py-1 border border-gray-300 text-xs focus:outline-none focus:border-blue-500"
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
        className="flex items-center justify-center h-1.5 bg-gray-200 border-y border-gray-300 cursor-row-resize hover:bg-gray-300 transition-colors group"
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
        <GripHorizontal size={12} className="text-gray-400 group-hover:text-gray-600" />
      </div>

      {/* Lower Section - Response */}
      <div 
        className="flex flex-col bg-white"
        style={{ height: `${100 - upperHeight}%` }}
      >
        {/* Response Header with tabs and status */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between px-2 py-1">
            {/* Left - Response tabs */}
            <div className="flex items-center">
              <div className="flex">
                <button
                  onClick={() => setResponseView('body')}
                  className={`px-2 py-1 text-xs font-medium transition-colors ${
                    responseView === 'body' || responseView === 'formatted'
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Body
                </button>
                <button
                  onClick={() => setResponseView('cookies')}
                  className={`px-2 py-1 text-xs font-medium transition-colors ${
                    responseView === 'cookies'
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Cookies {response?.cookies ? `(${response.cookies.length})` : '(0)'}
                </button>
                <button
                  onClick={() => setResponseView('headers')}
                  className={`px-2 py-1 text-xs font-medium transition-colors ${
                    responseView === 'headers'
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Headers {response?.headers ? `(${Object.keys(response.headers).length})` : '(0)'}
                </button>
                <button
                  onClick={() => setResponseView('test-results')}
                  className={`px-2 py-1 text-xs font-medium transition-colors ${
                    responseView === 'test-results'
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Test Results
                </button>
              </div>
            </div>
            
            {/* Right - Status and actions */}
            <div className="flex items-center space-x-2">
              {response && (
                <>
                  {/* Status badge */}
                  <div className={`px-2 py-1 text-xs font-medium ${
                    response.success 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {response.status || (response.success ? '200 OK' : 'Error')}
                  </div>
                  
                  {/* Time and size */}
                  <span className="text-xs text-gray-600">{getResponseTime()}</span>
                  <span className="text-xs text-gray-600">{getResponseSize()}</span>
                  
                  {/* Action buttons */}
                  <button
                    onClick={copyResponse}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy"
                  >
                    <Copy size={12} />
                  </button>
                  
                  <button
                    onClick={downloadResponse}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Save Response"
                  >
                    <Download size={12} />
                  </button>
                  
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreHorizontal size={12} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Response Content Toolbar */}
        {response && (responseView === 'body' || responseView === 'json' || responseView === 'xml' || responseView === 'html' || responseView === 'javascript' || responseView === 'raw' || responseView === 'hex' || responseView === 'base64' || responseView === 'formatted' || responseView === 'preview') && (
          <div className="border-b border-gray-200 bg-white px-2 py-1 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* View mode selector */}
              <div className="flex items-center space-x-1">
                <select
                  value={responseView === 'body' ? 'json' : responseView}
                  onChange={(e) => setResponseView(e.target.value as any)}
                  className="px-2 py-0.5 border border-gray-300 text-xs focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="json">✓ JSON</option>
                  <option value="xml">⌘ XML</option>
                  <option value="html">≡ HTML</option>
                  <option value="javascript">JS JavaScript</option>
                  <option value="raw">⬜ Raw</option>
                  <option value="hex">0x Hex</option>
                  <option value="base64">⚏ Base64</option>
                </select>
                
                <button
                  onClick={() => setResponseView('preview')}
                  className={`px-1.5 py-0.5 text-xs border border-gray-300 transition-colors ${
                    responseView === 'preview' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Preview
                </button>
                
                <button
                  onClick={formatJson}
                  className="px-1.5 py-0.5 text-xs border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Visualize
                </button>
              </div>
            </div>
            
            {/* Right side tools */}
            <div className="flex items-center space-x-1">
              <button 
                onClick={filterResponse}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Filter"
              >
                <Filter size={12} />
              </button>
              <button 
                onClick={searchInResponse}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Search"
              >
                <Search size={12} />
              </button>
              <button 
                onClick={copyResponse}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy"
              >
                <Copy size={12} />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings size={12} />
              </button>
            </div>
          </div>
        )}
        
        {/* Response Content */}
        <div className="flex-1 overflow-auto">
          {response ? (
            <div className="h-full">
              {/* Body view with various formats */}
              {(responseView === 'body' || responseView === 'json' || responseView === 'xml' || responseView === 'html' || responseView === 'javascript' || responseView === 'raw' || responseView === 'hex' || responseView === 'base64' || responseView === 'formatted' || responseView === 'preview') && (
                <div className="h-full p-2">
                  {(responseView === 'json' || responseView === 'formatted' || responseView === 'body') && (
                    <div className="h-full border border-gray-200">
                      <Editor
                        height="100%"
                        defaultLanguage="json"
                        value={formatResponseContent(response.data, 'json')}
                        theme="vs-light"
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 12,
                          lineNumbers: 'on',
                          glyphMargin: false,
                          folding: true,
                          lineDecorationsWidth: 10,
                          lineNumbersMinChars: 3,
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          wordWrap: 'on'
                        }}
                      />
                    </div>
                  )}
                  
                  {responseView === 'xml' && (
                    <div className="h-full border border-gray-200">
                      <Editor
                        height="100%"
                        defaultLanguage="xml"
                        value={formatResponseContent(response.data, 'xml')}
                        theme="vs-light"
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 12,
                          lineNumbers: 'on',
                          glyphMargin: false,
                          folding: true,
                          lineDecorationsWidth: 10,
                          lineNumbersMinChars: 3,
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          wordWrap: 'on'
                        }}
                      />
                    </div>
                  )}
                  
                  {responseView === 'html' && (
                    <div className="h-full border border-gray-200">
                      <Editor
                        height="100%"
                        defaultLanguage="html"
                        value={formatResponseContent(response.data, 'html')}
                        theme="vs-light"
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 12,
                          lineNumbers: 'on',
                          glyphMargin: false,
                          folding: true,
                          lineDecorationsWidth: 10,
                          lineNumbersMinChars: 3,
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          wordWrap: 'on'
                        }}
                      />
                    </div>
                  )}
                  
                  {responseView === 'javascript' && (
                    <div className="h-full border border-gray-200">
                      <Editor
                        height="100%"
                        defaultLanguage="javascript"
                        value={formatResponseContent(response.data, 'javascript')}
                        theme="vs-light"
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 12,
                          lineNumbers: 'on',
                          glyphMargin: false,
                          folding: true,
                          lineDecorationsWidth: 10,
                          lineNumbersMinChars: 3,
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          wordWrap: 'on'
                        }}
                      />
                    </div>
                  )}
                  
                  {responseView === 'raw' && (
                    <div className="h-full border border-gray-200">
                      <Editor
                        height="100%"
                        defaultLanguage="text"
                        value={formatResponseContent(response.data, 'raw')}
                        theme="vs-light"
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 12,
                          lineNumbers: 'on',
                          glyphMargin: false,
                          folding: false,
                          lineDecorationsWidth: 10,
                          lineNumbersMinChars: 3,
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          wordWrap: 'on'
                        }}
                      />
                    </div>
                  )}
                  
                  {responseView === 'hex' && (
                    <div className="h-full border border-gray-200">
                      <Editor
                        height="100%"
                        defaultLanguage="text"
                        value={formatResponseContent(response.data, 'hex')}
                        theme="vs-light"
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 11,
                          fontFamily: 'monospace',
                          lineNumbers: 'on',
                          glyphMargin: false,
                          folding: false,
                          lineDecorationsWidth: 10,
                          lineNumbersMinChars: 3,
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          wordWrap: 'on'
                        }}
                      />
                    </div>
                  )}
                  
                  {responseView === 'base64' && (
                    <div className="h-full border border-gray-200">
                      <Editor
                        height="100%"
                        defaultLanguage="text"
                        value={formatResponseContent(response.data, 'base64')}
                        theme="vs-light"
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 11,
                          fontFamily: 'monospace',
                          lineNumbers: 'on',
                          glyphMargin: false,
                          folding: false,
                          lineDecorationsWidth: 10,
                          lineNumbersMinChars: 3,
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          wordWrap: 'on'
                        }}
                      />
                    </div>
                  )}
                  
                  {responseView === 'preview' && (
                    <div className="bg-gray-50 p-2 text-xs h-full overflow-auto border border-gray-200">
                      {typeof response.data === 'object' ? (
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-1 bg-white">Key</th>
                              <th className="text-left p-1 bg-white">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(response.data).map(([key, value]) => (
                              <tr key={key} className="border-b hover:bg-white">
                                <td className="p-1 font-medium">{key}</td>
                                <td className="p-1">
                                  {typeof value === 'object' && value !== null 
                                    ? JSON.stringify(value, null, 2)
                                    : String(value)
                                  }
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div>{String(response.data)}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Cookies view */}
              {responseView === 'cookies' && (
                <div className="p-2 h-full">
                  <div className="text-xs text-gray-500">
                    {response.cookies && response.cookies.length > 0 ? (
                      <div className="space-y-1">
                        {response.cookies.map((cookie: any, index: number) => (
                          <div key={index} className="bg-gray-50 p-2 border border-gray-200">
                            <div className="font-medium">{cookie.name}</div>
                            <div className="text-gray-600">{cookie.value}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      'No cookies in this response'
                    )}
                  </div>
                </div>
              )}
              
              {/* Headers view */}
              {responseView === 'headers' && (
                <div className="p-2 h-full">
                  <div className="text-xs">
                    {response.headers && Object.keys(response.headers).length > 0 ? (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-1 bg-gray-50">Header</th>
                            <th className="text-left p-1 bg-gray-50">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(response.headers).map(([key, value]) => (
                            <tr key={key} className="border-b hover:bg-gray-50">
                              <td className="p-1 font-medium">{key}</td>
                              <td className="p-1">{String(value)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-gray-500">No headers in this response</div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Test Results view */}
              {responseView === 'test-results' && (
                <div className="p-2 h-full">
                  <div className="text-xs text-gray-500">
                    Test results will appear here
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-gray-500">
              Response will appear here after sending a request
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestBuilder;
