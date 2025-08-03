import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  Download,
  FileText,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Copy,
  Trash2,
  Settings,
  Filter,
  Search,
  FileJson,
  Globe,
  Layers,
  Zap,
  Clock,
  ArrowUpDown,
  ArrowRight,
  Check,
  X,
  Plus,
  Minus
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useCollectionStore } from '@/store/useCollectionStore';
import { Collection, ApiRequest } from '@/types/collection';
import { cn } from '@/lib/utils';

// 导入导出格式
export type ImportExportFormat = 
  | 'xhaxon' 
  | 'postman-v2' 
  | 'postman-v2.1' 
  | 'openapi-3.0' 
  | 'insomnia'
  | 'har'
  | 'curl';

// 导入结果
export interface ImportResult {
  success: boolean;
  collections: Collection[];
  errors: ImportError[];
  warnings: ImportWarning[];
  totalItems: number;
  importedItems: number;
  skippedItems: number;
  duplicateItems: number;
}

// 导入错误
export interface ImportError {
  level: 'error' | 'warning';
  message: string;
  details?: string;
  item?: string;
}

// 导入警告
export interface ImportWarning extends ImportError {
  level: 'warning';
}

// 导出选项
export interface ExportOptions {
  format: ImportExportFormat;
  includeEnvironments: boolean;
  includeTestScripts: boolean;
  includeAuth: boolean;
  includeFolders: boolean;
  includeMetadata: boolean;
  sanitizeData: boolean;
  minify: boolean;
  selectedCollections: string[];
  selectedRequests: string[];
}

// 冲突解决策略
export type ConflictStrategy = 'overwrite' | 'skip' | 'rename' | 'merge';

// 导入导出组件Props
interface ImportExportProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'import' | 'export';
  selectedItems?: string[];
}

export const ImportExport: React.FC<ImportExportProps> = ({
  isOpen,
  onClose,
  mode,
  selectedItems = []
}) => {
  const { collections, createCollection, updateCollection } = useCollectionStore();
  const [activeTab, setActiveTab] = useState(mode);
  
  // 导入状态
  const [importFiles, setImportFiles] = useState<File[]>([]);
  const [importFormat, setImportFormat] = useState<ImportExportFormat>('postman-v2.1');
  const [conflictStrategy, setConflictStrategy] = useState<ConflictStrategy>('rename');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<any>(null);
  
  // 导出状态
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'xhaxon',
    includeEnvironments: true,
    includeTestScripts: true,
    includeAuth: false,
    includeFolders: true,
    includeMetadata: true,
    sanitizeData: false,
    minify: false,
    selectedCollections: selectedItems,
    selectedRequests: []
  });
  const [isExporting, setIsExporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 格式配置
  const formatConfigs = {
    'xhaxon': {
      name: 'XH-Axon JSON',
      extension: '.json',
      description: 'XH-Axon 原生格式，包含完整功能支持',
      icon: Package,
      supports: {
        environments: true,
        scripts: true,
        auth: true,
        folders: true,
        metadata: true
      }
    },
    'postman-v2.1': {
      name: 'Postman Collection v2.1',
      extension: '.json',
      description: 'Postman 最新集合格式，兼容性最佳',
      icon: Globe,
      supports: {
        environments: true,
        scripts: true,
        auth: true,
        folders: true,
        metadata: false
      }
    },
    'postman-v2': {
      name: 'Postman Collection v2.0',
      extension: '.json',
      description: 'Postman 传统集合格式',
      icon: Globe,
      supports: {
        environments: true,
        scripts: false,
        auth: true,
        folders: true,
        metadata: false
      }
    },
    'openapi-3.0': {
      name: 'OpenAPI 3.0',
      extension: '.yaml',
      description: 'OpenAPI 规范，适合 API 文档',
      icon: FileText,
      supports: {
        environments: false,
        scripts: false,
        auth: true,
        folders: false,
        metadata: true
      }
    },
    'insomnia': {
      name: 'Insomnia',
      extension: '.json',
      description: 'Insomnia 工作空间格式',
      icon: Zap,
      supports: {
        environments: true,
        scripts: false,
        auth: true,
        folders: true,
        metadata: false
      }
    },
    'har': {
      name: 'HTTP Archive',
      extension: '.har',
      description: 'HTTP 归档格式，用于网络分析',
      icon: Clock,
      supports: {
        environments: false,
        scripts: false,
        auth: false,
        folders: false,
        metadata: true
      }
    },
    'curl': {
      name: 'cURL Commands',
      extension: '.sh',
      description: 'cURL 命令脚本',
      icon: FileText,
      supports: {
        environments: false,
        scripts: false,
        auth: true,
        folders: false,
        metadata: false
      }
    }
  };

  // 选择文件
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImportFiles(files);
    
    // 预览第一个文件
    if (files.length > 0) {
      previewFile(files[0]);
    }
  };

  // 预览文件
  const previewFile = async (file: File) => {
    try {
      const text = await file.text();
      let parsed;
      
      if (file.name.endsWith('.json')) {
        parsed = JSON.parse(text);
      } else if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
        // 简单的 YAML 解析器（实际项目中应使用专门的库）
        parsed = { type: 'yaml', content: text };
      } else {
        parsed = { type: 'text', content: text };
      }
      
      setImportPreview(parsed);
    } catch (error) {
      console.error('Failed to preview file:', error);
      setImportPreview(null);
    }
  };

  // 执行导入
  const executeImport = async () => {
    setIsImporting(true);
    
    try {
      const result: ImportResult = {
        success: true,
        collections: [],
        errors: [],
        warnings: [],
        totalItems: 0,
        importedItems: 0,
        skippedItems: 0,
        duplicateItems: 0
      };

      for (const file of importFiles) {
        const fileResult = await importFile(file);
        
        result.collections.push(...fileResult.collections);
        result.errors.push(...fileResult.errors);
        result.warnings.push(...fileResult.warnings);
        result.totalItems += fileResult.totalItems;
        result.importedItems += fileResult.importedItems;
        result.skippedItems += fileResult.skippedItems;
        result.duplicateItems += fileResult.duplicateItems;
      }

      result.success = result.errors.length === 0;
      setImportResult(result);
      
      // 创建导入的集合
      for (const collection of result.collections) {
        await createCollection(collection.name);
      }
      
    } catch (error) {
      setImportResult({
        success: false,
        collections: [],
        errors: [{
          level: 'error',
          message: '导入失败',
          details: error instanceof Error ? error.message : String(error)
        }],
        warnings: [],
        totalItems: 0,
        importedItems: 0,
        skippedItems: 0,
        duplicateItems: 0
      });
    }
    
    setIsImporting(false);
  };

  // 导入单个文件
  const importFile = async (file: File): Promise<ImportResult> => {
    const text = await file.text();
    
    switch (importFormat) {
      case 'postman-v2.1':
      case 'postman-v2':
        return importPostmanCollection(text);
      case 'xhaxon':
        return importXhAxonCollection(text);
      case 'insomnia':
        return importInsomniaWorkspace(text);
      case 'openapi-3.0':
        return importOpenAPISpec(text);
      case 'har':
        return importHARFile(text);
      case 'curl':
        return importCurlCommands(text);
      default:
        throw new Error(`不支持的格式: ${importFormat}`);
    }
  };

  // 导入 Postman 集合
  const importPostmanCollection = (content: string): ImportResult => {
    try {
      const data = JSON.parse(content);
      
      const result: ImportResult = {
        success: true,
        collections: [],
        errors: [],
        warnings: [],
        totalItems: 0,
        importedItems: 0,
        skippedItems: 0,
        duplicateItems: 0
      };

      if (data.info && data.item) {
        const collection: Collection = {
          id: `imported_${Date.now()}`,
          name: data.info.name || '导入的集合',
          description: data.info.description,
          userId: 'current-user',
          children: [],
          requests: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          order: 0
        };

        // 转换 Postman 项目
        const convertedItems = convertPostmanItems(data.item);
        collection.requests = convertedItems.requests;
        // collection.children = convertedItems.folders;

        result.collections.push(collection);
        result.totalItems = data.item.length;
        result.importedItems = convertedItems.requests.length;
      } else {
        result.errors.push({
          level: 'error',
          message: '无效的 Postman 集合格式'
        });
        result.success = false;
      }

      return result;
    } catch (error) {
      return {
        success: false,
        collections: [],
        errors: [{
          level: 'error',
          message: 'JSON 解析失败',
          details: error instanceof Error ? error.message : String(error)
        }],
        warnings: [],
        totalItems: 0,
        importedItems: 0,
        skippedItems: 0,
        duplicateItems: 0
      };
    }
  };

  // 转换 Postman 项目
  const convertPostmanItems = (items: any[]): { requests: ApiRequest[]; folders: Collection[] } => {
    const requests: ApiRequest[] = [];
    const folders: Collection[] = [];

    items.forEach((item, index) => {
      if (item.request) {
        // 这是一个请求
        const request: ApiRequest = {
          id: `imported_req_${Date.now()}_${index}`,
          name: item.name || '未命名请求',
          description: item.request.description,
          method: item.request.method || 'GET',
          url: typeof item.request.url === 'string' 
            ? item.request.url 
            : item.request.url?.raw || '',
          headers: convertPostmanHeaders(item.request.header || []),
          queryParams: convertPostmanQueryParams(item.request.url?.query || []),
          body: convertPostmanBody(item.request.body),
          collectionId: '',
          userId: 'current-user',
          order: index,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        requests.push(request);
      } else if (item.item) {
        // 这是一个文件夹
        const folder: Collection = {
          id: `imported_folder_${Date.now()}_${index}`,
          name: item.name || '未命名文件夹',
          description: item.description,
          userId: 'current-user',
          children: [],
          requests: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          order: index
        };
        
        const subItems = convertPostmanItems(item.item);
        folder.requests = subItems.requests;
        folder.children = subItems.folders;
        
        folders.push(folder);
      }
    });

    return { requests, folders };
  };

  // 转换 Postman 请求头
  const convertPostmanHeaders = (headers: any[]): Record<string, string> => {
    const result: Record<string, string> = {};
    headers.forEach(header => {
      if (header.key && header.value && !header.disabled) {
        result[header.key] = header.value;
      }
    });
    return result;
  };

  // 转换 Postman 查询参数
  const convertPostmanQueryParams = (query: any[]): Record<string, string> => {
    const result: Record<string, string> = {};
    query.forEach(param => {
      if (param.key && param.value && !param.disabled) {
        result[param.key] = param.value;
      }
    });
    return result;
  };

  // 转换 Postman 请求体
  const convertPostmanBody = (body: any): any => {
    if (!body) return undefined;
    
    switch (body.mode) {
      case 'raw':
        return {
          type: 'raw',
          content: body.raw || ''
        };
      case 'formdata':
        return {
          type: 'form-data',
          formData: body.formdata?.map((item: any) => ({
            key: item.key,
            value: item.value,
            type: item.type || 'text',
            enabled: !item.disabled
          })) || []
        };
      case 'urlencoded':
        return {
          type: 'x-www-form-urlencoded',
          content: body.urlencoded?.map((item: any) => 
            `${item.key}=${item.value}`
          ).join('&') || ''
        };
      default:
        return undefined;
    }
  };

  // 其他格式的导入函数（简化实现）
  const importXhAxonCollection = (content: string): ImportResult => {
    // XH-Axon 原生格式导入
    try {
      const data = JSON.parse(content);
      return {
        success: true,
        collections: Array.isArray(data) ? data : [data],
        errors: [],
        warnings: [],
        totalItems: 1,
        importedItems: 1,
        skippedItems: 0,
        duplicateItems: 0
      };
    } catch (error) {
      return {
        success: false,
        collections: [],
        errors: [{ level: 'error', message: '解析失败' }],
        warnings: [],
        totalItems: 0,
        importedItems: 0,
        skippedItems: 0,
        duplicateItems: 0
      };
    }
  };

  const importInsomniaWorkspace = (content: string): ImportResult => {
    // Insomnia 工作空间导入（简化）
    return {
      success: false,
      collections: [],
      errors: [{ level: 'error', message: 'Insomnia 导入功能开发中' }],
      warnings: [],
      totalItems: 0,
      importedItems: 0,
      skippedItems: 0,
      duplicateItems: 0
    };
  };

  const importOpenAPISpec = (content: string): ImportResult => {
    // OpenAPI 导入（简化）
    return {
      success: false,
      collections: [],
      errors: [{ level: 'error', message: 'OpenAPI 导入功能开发中' }],
      warnings: [],
      totalItems: 0,
      importedItems: 0,
      skippedItems: 0,
      duplicateItems: 0
    };
  };

  const importHARFile = (content: string): ImportResult => {
    // HAR 文件导入（简化）
    return {
      success: false,
      collections: [],
      errors: [{ level: 'error', message: 'HAR 导入功能开发中' }],
      warnings: [],
      totalItems: 0,
      importedItems: 0,
      skippedItems: 0,
      duplicateItems: 0
    };
  };

  const importCurlCommands = (content: string): ImportResult => {
    // cURL 命令导入（简化）
    return {
      success: false,
      collections: [],
      errors: [{ level: 'error', message: 'cURL 导入功能开发中' }],
      warnings: [],
      totalItems: 0,
      importedItems: 0,
      skippedItems: 0,
      duplicateItems: 0
    };
  };

  // 执行导出
  const executeExport = async () => {
    setIsExporting(true);
    
    try {
      const selectedCollections = collections.filter(c => 
        exportOptions.selectedCollections.includes(c.id)
      );

      let exportData: any;
      let filename: string;
      let mimeType: string;

      switch (exportOptions.format) {
        case 'xhaxon':
          exportData = exportXhAxonFormat(selectedCollections);
          filename = 'collections.json';
          mimeType = 'application/json';
          break;
        case 'postman-v2.1':
          exportData = exportPostmanV21Format(selectedCollections);
          filename = 'postman-collection.json';
          mimeType = 'application/json';
          break;
        case 'postman-v2':
          exportData = exportPostmanV2Format(selectedCollections);
          filename = 'postman-collection.json';
          mimeType = 'application/json';
          break;
        default:
          throw new Error(`不支持的导出格式: ${exportOptions.format}`);
      }

      // 下载文件
      const content = exportOptions.minify 
        ? JSON.stringify(exportData)
        : JSON.stringify(exportData, null, 2);
        
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
    }
    
    setIsExporting(false);
  };

  // XH-Axon 格式导出
  const exportXhAxonFormat = (collections: Collection[]) => {
    return collections.map(collection => ({
      ...collection,
      exported: new Date().toISOString(),
      version: '1.0.0'
    }));
  };

  // Postman v2.1 格式导出
  const exportPostmanV21Format = (collections: Collection[]) => {
    return collections.map(collection => ({
      info: {
        _postman_id: collection.id,
        name: collection.name,
        description: collection.description,
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item: collection.requests?.map(request => ({
        name: request.name,
        request: {
          method: request.method,
          header: Object.entries(request.headers).map(([key, value]) => ({
            key,
            value,
            type: 'text'
          })),
          url: {
            raw: request.url,
            query: Object.entries(request.queryParams || {}).map(([key, value]) => ({
              key,
              value
            }))
          },
          body: request.body ? {
            mode: request.body.type,
            raw: request.body.content
          } : undefined
        }
      })) || []
    }));
  };

  // Postman v2.0 格式导出
  const exportPostmanV2Format = (collections: Collection[]) => {
    // 简化的 v2.0 格式
    return exportPostmanV21Format(collections);
  };

  const formatConfig = formatConfigs[exportOptions.format];

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'import' ? (
              <>
                <Upload className="h-5 w-5" />
                导入集合
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                导出集合
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'import' 
              ? '从其他工具导入API集合和请求'
              : '导出集合到其他工具或备份'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">导入</TabsTrigger>
            <TabsTrigger value="export">导出</TabsTrigger>
          </TabsList>

          {/* 导入选项卡 */}
          <TabsContent value="import" className="space-y-4 overflow-auto">
            <Tabs defaultValue="select" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="select">选择文件</TabsTrigger>
                <TabsTrigger value="preview" disabled={!importPreview}>预览</TabsTrigger>
                <TabsTrigger value="result" disabled={!importResult}>结果</TabsTrigger>
              </TabsList>

              <TabsContent value="select" className="space-y-4">
                {/* 格式选择 */}
                <div>
                  <Label className="text-base font-medium">选择导入格式</Label>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {Object.entries(formatConfigs).map(([key, config]) => (
                      <Card 
                        key={key}
                        className={cn(
                          'cursor-pointer transition-colors',
                          importFormat === key && 'ring-2 ring-primary'
                        )}
                        onClick={() => setImportFormat(key as ImportExportFormat)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <config.icon className="h-6 w-6 text-primary" />
                            <div>
                              <div className="font-medium">{config.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {config.description}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* 文件选择 */}
                <div>
                  <Label className="text-base font-medium">选择文件</Label>
                  <div className="mt-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".json,.yaml,.yml,.har,.sh"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div 
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                      <div className="text-lg font-medium mb-2">
                        点击选择文件或拖拽到这里
                      </div>
                      <div className="text-sm text-muted-foreground">
                        支持 JSON、YAML、HAR 等格式
                      </div>
                    </div>
                  </div>

                  {/* 已选择的文件 */}
                  {importFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <Label>已选择的文件 ({importFiles.length})</Label>
                      <div className="space-y-2">
                        {importFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <div>
                                <div className="font-medium">{file.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {(file.size / 1024).toFixed(1)} KB
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setImportFiles(prev => prev.filter((_, i) => i !== index));
                                if (index === 0) {
                                  setImportPreview(null);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 导入选项 */}
                <div>
                  <Label className="text-base font-medium">导入选项</Label>
                  <div className="mt-3 space-y-4">
                    <div>
                      <Label>冲突处理策略</Label>
                      <RadioGroup value={conflictStrategy} onValueChange={(value: ConflictStrategy) => setConflictStrategy(value)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="rename" id="rename" />
                          <Label htmlFor="rename">重命名 - 为重复项添加后缀</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="overwrite" id="overwrite" />
                          <Label htmlFor="overwrite">覆盖 - 替换现有项目</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="skip" id="skip" />
                          <Label htmlFor="skip">跳过 - 忽略重复项目</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="merge" id="merge" />
                          <Label htmlFor="merge">合并 - 合并到现有集合</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                {/* 导入按钮 */}
                <div className="flex justify-end">
                  <Button 
                    onClick={executeImport}
                    disabled={importFiles.length === 0 || isImporting}
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        导入中...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        开始导入
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                {importPreview && (
                  <Card>
                    <CardHeader>
                      <CardTitle>文件预览</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-96 overflow-auto">
                        <pre className="text-sm bg-muted p-4 rounded">
                          {JSON.stringify(importPreview, null, 2)}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="result" className="space-y-4">
                {importResult && (
                  <div className="space-y-4">
                    {/* 导入摘要 */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          {importResult.success ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <CardTitle>
                            {importResult.success ? '导入成功' : '导入失败'}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {importResult.importedItems}
                            </div>
                            <div className="text-sm text-muted-foreground">已导入</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                              {importResult.skippedItems}
                            </div>
                            <div className="text-sm text-muted-foreground">已跳过</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {importResult.duplicateItems}
                            </div>
                            <div className="text-sm text-muted-foreground">重复项</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {importResult.totalItems}
                            </div>
                            <div className="text-sm text-muted-foreground">总计</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 错误和警告 */}
                    {(importResult.errors.length > 0 || importResult.warnings.length > 0) && (
                      <Card>
                        <CardHeader>
                          <CardTitle>问题报告</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {importResult.errors.map((error, index) => (
                              <div key={index} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded">
                                <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                                <div>
                                  <div className="font-medium text-red-800">{error.message}</div>
                                  {error.details && (
                                    <div className="text-sm text-red-600 mt-1">{error.details}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                            {importResult.warnings.map((warning, index) => (
                              <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                <div>
                                  <div className="font-medium text-yellow-800">{warning.message}</div>
                                  {warning.details && (
                                    <div className="text-sm text-yellow-600 mt-1">{warning.details}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* 导入的集合 */}
                    {importResult.collections.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>导入的集合</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {importResult.collections.map((collection, index) => (
                              <div key={index} className="flex items-center justify-between p-3 border rounded">
                                <div className="flex items-center gap-3">
                                  <Package className="h-5 w-5 text-blue-600" />
                                  <div>
                                    <div className="font-medium">{collection.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {collection.requests?.length || 0} 个请求
                                    </div>
                                  </div>
                                </div>
                                <Badge variant="outline">
                                  已导入
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* 导出选项卡 */}
          <TabsContent value="export" className="space-y-6 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 左侧：导出选项 */}
              <div className="space-y-6">
                {/* 格式选择 */}
                <div>
                  <Label className="text-base font-medium">导出格式</Label>
                  <div className="mt-3 space-y-2">
                    {Object.entries(formatConfigs).map(([key, config]) => (
                      <Card 
                        key={key}
                        className={cn(
                          'cursor-pointer transition-colors',
                          exportOptions.format === key && 'ring-2 ring-primary'
                        )}
                        onClick={() => setExportOptions(prev => ({ ...prev, format: key as ImportExportFormat }))}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <config.icon className="h-5 w-5 text-primary" />
                              <div>
                                <div className="font-medium">{config.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {config.description}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {Object.entries(config.supports).map(([feature, supported]) => (
                                <div
                                  key={feature}
                                  className={cn(
                                    'w-2 h-2 rounded-full',
                                    supported ? 'bg-green-500' : 'bg-gray-300'
                                  )}
                                  title={`${feature}: ${supported ? '支持' : '不支持'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* 导出选项 */}
                <div>
                  <Label className="text-base font-medium">导出选项</Label>
                  <div className="mt-3 space-y-3">
                    {formatConfig.supports.environments && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={exportOptions.includeEnvironments}
                          onCheckedChange={(checked) => 
                            setExportOptions(prev => ({ ...prev, includeEnvironments: !!checked }))
                          }
                        />
                        <Label>包含环境变量</Label>
                      </div>
                    )}
                    
                    {formatConfig.supports.scripts && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={exportOptions.includeTestScripts}
                          onCheckedChange={(checked) => 
                            setExportOptions(prev => ({ ...prev, includeTestScripts: !!checked }))
                          }
                        />
                        <Label>包含测试脚本</Label>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={exportOptions.includeAuth}
                        onCheckedChange={(checked) => 
                          setExportOptions(prev => ({ ...prev, includeAuth: !!checked }))
                        }
                      />
                      <Label>包含认证信息</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={exportOptions.sanitizeData}
                        onCheckedChange={(checked) => 
                          setExportOptions(prev => ({ ...prev, sanitizeData: !!checked }))
                        }
                      />
                      <Label>脱敏处理敏感数据</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={exportOptions.minify}
                        onCheckedChange={(checked) => 
                          setExportOptions(prev => ({ ...prev, minify: !!checked }))
                        }
                      />
                      <Label>压缩输出</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧：集合选择 */}
              <div>
                <Label className="text-base font-medium">选择集合</Label>
                <div className="mt-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            已选择 {exportOptions.selectedCollections.length} / {collections.length} 个集合
                          </span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setExportOptions(prev => ({
                                ...prev,
                                selectedCollections: collections.map(c => c.id)
                              }))}
                            >
                              全选
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setExportOptions(prev => ({
                                ...prev,
                                selectedCollections: []
                              }))}
                            >
                              清空
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {collections.map((collection) => (
                            <div key={collection.id} className="flex items-center space-x-2">
                              <Checkbox
                                checked={exportOptions.selectedCollections.includes(collection.id)}
                                onCheckedChange={(checked) => {
                                  setExportOptions(prev => ({
                                    ...prev,
                                    selectedCollections: checked
                                      ? [...prev.selectedCollections, collection.id]
                                      : prev.selectedCollections.filter(id => id !== collection.id)
                                  }));
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{collection.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {collection.requests?.length || 0} 个请求
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 导出按钮 */}
                <div className="mt-6">
                  <Button 
                    onClick={executeExport}
                    disabled={exportOptions.selectedCollections.length === 0 || isExporting}
                    className="w-full"
                  >
                    {isExporting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        导出中...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        导出为 {formatConfig.name}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportExport;
