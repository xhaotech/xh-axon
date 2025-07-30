import React, { useState, useMemo } from 'react';
import Editor from '@monaco-editor/react';
// @ts-ignore - react-json-view doesn't have TypeScript definitions
import ReactJson from 'react-json-view';
import * as beautify from 'js-beautify';
import copy from 'copy-to-clipboard';
import { 
  Eye, 
  Code, 
  Download, 
  Copy, 
  Check, 
  Clock, 
  FileText,
  Search,
  Maximize2,
  Minimize2,
  Hash
} from 'lucide-react';

interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  duration?: number;
}

interface ResponseViewerProps {
  response: ResponseData;
}

type ViewMode = 'formatted' | 'raw' | 'json' | 'headers';

export const ResponseViewer: React.FC<ResponseViewerProps> = ({ response }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('formatted');
  const [copied, setCopied] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 处理响应数据
  const processedData = useMemo(() => {
    if (!response?.data) return { dataType: 'text', content: '' };

    try {
      let content = response.data;
      let dataType = 'text';

      if (typeof content === 'object') {
        content = JSON.stringify(content, null, 2);
        dataType = 'json';
      } else if (typeof content === 'string') {
        try {
          JSON.parse(content);
          dataType = 'json';
          content = JSON.stringify(JSON.parse(content), null, 2);
        } catch {
          if (content.toLowerCase().includes('<html') || content.toLowerCase().includes('<!doctype')) {
            dataType = 'html';
            content = beautify.html(content);
          } else if (content.toLowerCase().includes('<?xml') || content.toLowerCase().includes('<xml')) {
            dataType = 'xml';
            content = beautify.html(content);
          }
        }
      }

      return { dataType, content };
    } catch (e) {
      return { dataType: 'text', content: String(response.data) };
    }
  }, [response?.data]);

  // 获取Monaco Editor语言
  const getLanguage = (dataType: string) => {
    switch (dataType) {
      case 'json': return 'json';
      case 'html': return 'html';
      case 'xml': return 'xml';
      default: return 'text';
    }
  };

  // 检查是否为有效JSON
  const isValidJson = useMemo(() => {
    try {
      return typeof response?.data === 'object' || (typeof response?.data === 'string' && JSON.parse(response.data));
    } catch {
      return false;
    }
  }, [response?.data]);

  // 搜索功能
  const filteredData = useMemo(() => {
    if (!searchTerm || !processedData.content) return processedData.content;
    
    const lines = processedData.content.split('\n');
    const filteredLines = lines.filter((line: string) => 
      line.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filteredLines.length > 0 ? filteredLines.join('\n') : processedData.content;
  }, [processedData.content, searchTerm]);

  // 复制到剪贴板
  const handleCopy = (content: string, type?: string) => {
    copy(content);
    setCopied(type || 'response');
    setTimeout(() => setCopied(null), 2000);
  };

  // 下载响应数据
  const handleDownload = () => {
    if (!processedData.content) return;

    const { dataType } = processedData;
    const extension = dataType === 'json' ? 'json' : 
                     dataType === 'html' ? 'html' : 
                     dataType === 'xml' ? 'xml' : 'txt';
    
    const blob = new Blob([processedData.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response_${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!response) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <FileText size={48} className="mx-auto mb-2 text-gray-300" />
          <p>No response data</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Response Header - Compact */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center space-x-3">
          {/* Status Badge */}
          <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${
            response.status >= 200 && response.status < 300 
              ? 'bg-green-100 text-green-800' 
              : response.status >= 400 
                ? 'bg-red-100 text-red-800' 
                : 'bg-yellow-100 text-yellow-800'
          }`}>
            <span>{response.status}</span>
            <span>{response.statusText}</span>
          </div>
          
          {/* Timing */}
          {response.duration && (
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Clock size={12} />
              <span>{response.duration}ms</span>
            </div>
          )}
          
          {/* Size */}
          {processedData.content && (
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <FileText size={12} />
              <span>{new Blob([processedData.content]).size} bytes</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 pr-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-24 focus:w-32 transition-all"
            />
          </div>
          
          {/* Action Buttons */}
          <button
            onClick={() => handleCopy(processedData.content)}
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Copy Response"
          >
            {copied === 'response' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
          </button>
          
          <button
            onClick={handleDownload}
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Download Response"
          >
            <Download size={14} />
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* View Mode Tabs - Compact */}
      <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
        {[
          { id: 'formatted', label: 'Pretty', icon: Eye },
          { id: 'raw', label: 'Raw', icon: FileText },
          { id: 'json', label: 'Tree', icon: Code },
          { id: 'headers', label: 'Headers', icon: Hash }
        ].map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as ViewMode)}
              className={`flex items-center space-x-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                viewMode === mode.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={14} />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area - Takes remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {viewMode === 'formatted' ? (
          <Editor
            height="100%"
            language={getLanguage(processedData.dataType)}
            value={filteredData || ''}
            theme="vs-light"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              fontSize: 13,
              lineNumbers: 'on',
              wordWrap: 'on',
              folding: true,
              lineNumbersMinChars: 3,
              glyphMargin: false,
              overviewRulerBorder: false,
              hideCursorInOverviewRuler: true,
              renderLineHighlight: 'none',
              contextmenu: false,
              find: {
                autoFindInSelection: 'always',
                seedSearchStringFromSelection: 'always'
              }
            }}
            loading={
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <span className="text-sm text-gray-500">Loading editor...</span>
                </div>
              </div>
            }
          />
        ) : viewMode === 'raw' ? (
          <div className="h-full overflow-auto bg-gray-50">
            <pre className="p-3 text-xs font-mono whitespace-pre-wrap leading-relaxed">
              {filteredData}
            </pre>
          </div>
        ) : viewMode === 'json' && isValidJson ? (
          <div className="h-full overflow-auto p-3">
            <ReactJson
              src={typeof response.data === 'object' ? response.data : JSON.parse(response.data)}
              theme="bright:inverted"
              displayDataTypes={false}
              displayObjectSize={true}
              enableClipboard={true}
              collapsed={1}
              collapseStringsAfterLength={50}
              style={{ backgroundColor: 'transparent', fontSize: '12px' }}
            />
          </div>
        ) : viewMode === 'headers' ? (
          <div className="h-full overflow-auto p-3 bg-gray-50">
            <div className="space-y-2">
              {Object.entries(response.headers || {}).map(([key, value]) => (
                <div key={key} className="bg-white p-2 rounded border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-gray-900 text-xs">{key}</div>
                    <button
                      onClick={() => handleCopy(value, `header-${key}`)}
                      className="text-gray-400 hover:text-blue-600 ml-2 flex-shrink-0"
                      title="Copy Value"
                    >
                      {copied === `header-${key}` ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <div className="text-gray-600 text-xs mt-1 break-all">{value}</div>
                </div>
              ))}
              {Object.keys(response.headers || {}).length === 0 && (
                <div className="text-gray-500 text-center py-8">
                  <Hash size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No headers to display</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FileText size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Cannot display content in this view</p>
              <p className="text-xs text-gray-400">Try switching to Raw view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
