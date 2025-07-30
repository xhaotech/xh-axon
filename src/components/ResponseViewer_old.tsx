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
  Globe, 
  Hash,
  FileText,
  Search,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  timing?: {
    duration: number;
    timestamp: string;
  };
}

interface ResponseViewerProps {
  response: ResponseData | null;
  isLoading?: boolean;
}

type ViewMode = 'formatted' | 'raw' | 'json' | 'headers';

export const ResponseViewer: React.FC<ResponseViewerProps> = ({ 
  response, 
  isLoading = false 
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('formatted');
  const [copied, setCopied] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 处理响应数据
  const processedData = useMemo(() => {
    if (!response?.data) return null;

    const contentType = response.headers['content-type'] || '';
    let processed = response.data;
    let dataType = 'text';

    try {
      if (typeof response.data === 'string') {
        // 尝试解析JSON
        if (contentType.includes('application/json') || 
            response.data.trim().startsWith('{') || 
            response.data.trim().startsWith('[')) {
          processed = JSON.parse(response.data);
          dataType = 'json';
        } else if (contentType.includes('text/html')) {
          dataType = 'html';
        } else if (contentType.includes('text/xml') || contentType.includes('application/xml')) {
          dataType = 'xml';
        }
      } else if (typeof response.data === 'object') {
        dataType = 'json';
      }
    } catch (e) {
      // 保持原始数据
    }

    return { processed, dataType };
  }, [response]);

  // 格式化数据用于显示
  const formattedData = useMemo(() => {
    if (!processedData) return '';

    const { processed, dataType } = processedData;

    try {
      switch (dataType) {
        case 'json':
          return JSON.stringify(processed, null, 2);
        case 'html':
          return beautify.html(processed as string, { indent_size: 2 });
        case 'xml':
          return beautify.html(processed as string, { 
            indent_size: 2,
            wrap_line_length: 120
          });
        default:
          return typeof processed === 'string' ? processed : JSON.stringify(processed, null, 2);
      }
    } catch (e) {
      return typeof processed === 'string' ? processed : JSON.stringify(processed, null, 2);
    }
  }, [processedData]);

  // 获取语言类型用于编辑器语法高亮
  const getLanguage = () => {
    if (!processedData) return 'text';
    const { dataType } = processedData;
    
    switch (dataType) {
      case 'json': return 'json';
      case 'html': return 'html';
      case 'xml': return 'xml';
      default: return 'text';
    }
  };

  // 复制到剪贴板
  const handleCopy = (content: string, type: string) => {
    copy(content);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  // 下载响应数据
  const handleDownload = () => {
    if (!response) return;

    const { dataType } = processedData || { dataType: 'text' };
    const extension = dataType === 'json' ? 'json' : 
                     dataType === 'html' ? 'html' : 
                     dataType === 'xml' ? 'xml' : 'txt';
    
    const blob = new Blob([formattedData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response_${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 搜索功能
  const filteredData = useMemo(() => {
    if (!searchTerm || !formattedData) return formattedData;
    
    const lines = formattedData.split('\n');
    const filteredLines = lines.filter((line: string) => 
      line.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filteredLines.length > 0 ? filteredLines.join('\n') : formattedData;
  }, [formattedData, searchTerm]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">正在发送请求...</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">等待响应</p>
          <p className="text-sm">发送请求后，响应结果将在这里显示</p>
        </div>
      </div>
    );
  }

  const statusColorClass = response.status >= 200 && response.status < 300 
    ? 'text-green-600' 
    : response.status >= 400 
      ? 'text-red-600' 
      : 'text-yellow-600';

  return (
    <div className={`flex flex-col h-full bg-white border rounded-lg ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      {/* 响应头部信息 */}
      <div className="border-b p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">状态:</span>
              <span className={`font-mono font-semibold ${statusColorClass}`}>
                {response.status} {response.statusText}
              </span>
            </div>
            
            {response.timing && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {response.timing.duration}ms
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                大小: {new Blob([formattedData]).size} bytes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
              title={isFullscreen ? "退出全屏" : "全屏显示"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 视图模式选择 */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setViewMode('formatted')}
            className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${
              viewMode === 'formatted' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Eye className="w-3 h-3" />
            格式化
          </button>
          
          <button
            onClick={() => setViewMode('raw')}
            className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${
              viewMode === 'raw' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Code className="w-3 h-3" />
            原始数据
          </button>

          {processedData?.dataType === 'json' && (
            <button
              onClick={() => setViewMode('json')}
              className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${
                viewMode === 'json' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FileText className="w-3 h-3" />
              JSON树
            </button>
          )}

          <button
            onClick={() => setViewMode('headers')}
            className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${
              viewMode === 'headers' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Globe className="w-3 h-3" />
            响应头
          </button>
        </div>

        {/* 工具栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {viewMode !== 'headers' && (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索内容..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(formattedData, 'content')}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center gap-1"
            >
              {copied === 'content' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied === 'content' ? '已复制' : '复制'}
            </button>
            
            <button
              onClick={handleDownload}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              下载
            </button>
          </div>
        </div>
      </div>

      {/* 响应内容 */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'headers' ? (
          <div className="p-4 h-full overflow-auto">
            <h3 className="font-semibold mb-3 text-gray-800">响应头</h3>
            <div className="space-y-2">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="font-mono text-sm text-gray-600 w-1/3 flex-shrink-0">
                    {key}:
                  </span>
                  <span className="font-mono text-sm text-gray-800 flex-1 break-all">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : viewMode === 'json' && processedData?.dataType === 'json' ? (
          <div className="p-4 h-full overflow-auto">
            <ReactJson
              src={processedData.processed}
              theme="rjv-default"
              name={false}
              collapsed={1}
              displayDataTypes={false}
              enableClipboard={(copy) => {
                handleCopy(JSON.stringify(copy.src, null, 2), 'json-part');
              }}
              onEdit={(edit) => {
                console.log('JSON edited:', edit);
              }}
            />
          </div>
        ) : (
          <div className="h-full">
            <Editor
              language={getLanguage()}
              value={filteredData}
              theme="vs-light"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                folding: true,
                fontSize: 13,
                lineHeight: 20,
                padding: { top: 16, bottom: 16 },
                find: {
                  addExtraSpaceOnTop: false,
                  autoFindInSelection: 'never',
                  seedSearchStringFromSelection: 'selection'
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseViewer;
