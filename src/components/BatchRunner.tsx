import React, { useState, useCallback, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Download,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Settings,
  Filter,
  Eye,
  EyeOff,
  Save,
  Copy,
  Share2,
  AlertTriangle,
  Zap,
  Timer,
  Target,
  TrendingUp,
  Activity,
  RefreshCw,
  PlayCircle,
  StopCircle
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
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from './ui/dropdown-menu';
import { useCollectionStore } from '@/store/useCollectionStore';
import { Collection, ApiRequest } from '@/types/collection';
import { cn } from '@/lib/utils';

// 运行配置接口
export interface RunnerConfig {
  id: string;
  name: string;
  description?: string;
  collections: string[];
  iterations: number;
  delay: number;
  timeout: number;
  stopOnError: boolean;
  parallel: boolean;
  maxParallel: number;
  environment?: string;
  prescript?: string;
  postscript?: string;
  variables: Record<string, string>;
  created: Date;
  updated: Date;
}

// 运行结果接口
export interface RunnerResult {
  id: string;
  configId: string;
  status: 'running' | 'completed' | 'failed' | 'stopped';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  results: RequestResult[];
  stats: RunnerStats;
  error?: string;
}

// 请求运行结果
export interface RequestResult {
  id: string;
  requestId: string;
  collectionId: string;
  name: string;
  method: string;
  url: string;
  status: 'success' | 'error' | 'timeout' | 'skipped';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  responseTime?: number;
  statusCode?: number;
  responseSize?: number;
  error?: string;
  iteration: number;
}

// 运行统计
export interface RunnerStats {
  totalTime: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  throughput: number;
  errorRate: number;
  statusCodes: Record<number, number>;
}

// 批量运行器主组件
interface BatchRunnerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCollections?: string[];
}

export const BatchRunner: React.FC<BatchRunnerProps> = ({
  isOpen,
  onClose,
  selectedCollections = []
}) => {
  const { collections } = useCollectionStore();
  const [activeTab, setActiveTab] = useState('config');
  const [configs, setConfigs] = useState<RunnerConfig[]>([]);
  const [currentConfig, setCurrentConfig] = useState<RunnerConfig | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentResult, setCurrentResult] = useState<RunnerResult | null>(null);
  const [runHistory, setRunHistory] = useState<RunnerResult[]>([]);
  
  // 配置表单状态
  const [configForm, setConfigForm] = useState({
    name: '',
    description: '',
    collections: selectedCollections,
    iterations: 1,
    delay: 100,
    timeout: 30000,
    stopOnError: false,
    parallel: false,
    maxParallel: 5,
    environment: '',
    prescript: '',
    postscript: '',
    variables: {} as Record<string, string>
  });

  // 创建新配置
  const createConfig = () => {
    const newConfig: RunnerConfig = {
      id: `config_${Date.now()}`,
      ...configForm,
      created: new Date(),
      updated: new Date()
    };
    setConfigs([...configs, newConfig]);
    setCurrentConfig(newConfig);
  };

  // 更新配置
  const updateConfig = (id: string, updates: Partial<RunnerConfig>) => {
    setConfigs(prev => prev.map(config => 
      config.id === id 
        ? { ...config, ...updates, updated: new Date() }
        : config
    ));
  };

  // 删除配置
  const deleteConfig = (id: string) => {
    setConfigs(prev => prev.filter(config => config.id !== id));
    if (currentConfig?.id === id) {
      setCurrentConfig(null);
    }
  };

  // 运行配置
  const runConfig = async (config: RunnerConfig) => {
    setIsRunning(true);
    setActiveTab('results');

    const result: RunnerResult = {
      id: `result_${Date.now()}`,
      configId: config.id,
      status: 'running',
      startTime: new Date(),
      totalRequests: 0,
      successRequests: 0,
      failedRequests: 0,
      results: [],
      stats: {
        totalTime: 0,
        avgResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0,
        throughput: 0,
        errorRate: 0,
        statusCodes: {}
      }
    };

    setCurrentResult(result);

    try {
      // 获取要运行的请求
      const requestsToRun: { collection: Collection; request: ApiRequest }[] = [];
      
      for (const collectionId of config.collections) {
        const collection = collections.find(c => c.id === collectionId);
        if (collection?.requests) {
          collection.requests.forEach(request => {
            requestsToRun.push({ collection, request });
          });
        }
      }

      result.totalRequests = requestsToRun.length * config.iterations;

      // 运行请求
      for (let iteration = 1; iteration <= config.iterations; iteration++) {
        if (config.parallel) {
          // 并行运行
          const chunks = chunkArray(requestsToRun, config.maxParallel);
          for (const chunk of chunks) {
            await Promise.all(
              chunk.map(({ collection, request }) =>
                runSingleRequest(request, collection, iteration, result, config)
              )
            );
          }
        } else {
          // 串行运行
          for (const { collection, request } of requestsToRun) {
            await runSingleRequest(request, collection, iteration, result, config);
            if (config.delay > 0) {
              await sleep(config.delay);
            }
          }
        }
      }

      // 计算最终统计
      calculateFinalStats(result);
      result.status = 'completed';
      result.endTime = new Date();
      result.duration = result.endTime.getTime() - result.startTime.getTime();

    } catch (error) {
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : String(error);
      result.endTime = new Date();
    }

    setIsRunning(false);
    setRunHistory(prev => [result, ...prev]);
  };

  // 运行单个请求
  const runSingleRequest = async (
    request: ApiRequest,
    collection: Collection,
    iteration: number,
    result: RunnerResult,
    config: RunnerConfig
  ) => {
    const requestResult: RequestResult = {
      id: `req_${Date.now()}_${Math.random()}`,
      requestId: request.id,
      collectionId: collection.id,
      name: request.name,
      method: request.method,
      url: request.url,
      status: 'success',
      startTime: new Date(),
      iteration
    };

    try {
      // 模拟请求执行
      const startTime = Date.now();
      
      // 这里应该调用实际的HTTP请求
      await simulateRequest(request, config);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      requestResult.endTime = new Date(endTime);
      requestResult.duration = duration;
      requestResult.responseTime = duration;
      requestResult.statusCode = 200; // 模拟状态码
      requestResult.responseSize = Math.floor(Math.random() * 10000); // 模拟响应大小

      result.successRequests++;

    } catch (error) {
      requestResult.status = 'error';
      requestResult.error = error instanceof Error ? error.message : String(error);
      requestResult.endTime = new Date();
      
      result.failedRequests++;

      if (config.stopOnError) {
        throw error;
      }
    }

    result.results.push(requestResult);
    
    // 更新实时统计
    updateRealTimeStats(result);
    setCurrentResult({ ...result });
  };

  // 模拟请求执行
  const simulateRequest = async (request: ApiRequest, config: RunnerConfig) => {
    // 模拟网络延迟
    const delay = Math.random() * 1000 + 100;
    await sleep(delay);
    
    // 模拟随机失败
    if (Math.random() < 0.1) {
      throw new Error('Request failed');
    }
  };

  // 更新实时统计
  const updateRealTimeStats = (result: RunnerResult) => {
    const successResults = result.results.filter(r => r.status === 'success' && r.responseTime);
    
    if (successResults.length > 0) {
      const responseTimes = successResults.map(r => r.responseTime!);
      result.stats.avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      result.stats.minResponseTime = Math.min(...responseTimes);
      result.stats.maxResponseTime = Math.max(...responseTimes);
    }
    
    result.stats.errorRate = result.failedRequests / (result.successRequests + result.failedRequests);
  };

  // 计算最终统计
  const calculateFinalStats = (result: RunnerResult) => {
    const duration = result.endTime!.getTime() - result.startTime.getTime();
    result.stats.totalTime = duration;
    result.stats.throughput = (result.successRequests / duration) * 1000; // 每秒请求数
    
    // 统计状态码
    result.results.forEach(r => {
      if (r.statusCode) {
        result.stats.statusCodes[r.statusCode] = (result.stats.statusCodes[r.statusCode] || 0) + 1;
      }
    });
  };

  // 停止运行
  const stopRun = () => {
    setIsRunning(false);
    if (currentResult) {
      const updatedResult = {
        ...currentResult,
        status: 'stopped' as const,
        endTime: new Date()
      };
      setCurrentResult(updatedResult);
      setRunHistory(prev => [updatedResult, ...prev]);
    }
  };

  // 导出结果
  const exportResults = (result: RunnerResult) => {
    const exportData = {
      config: configs.find(c => c.id === result.configId),
      result,
      exportTime: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `runner-result-${result.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 工具函数
  const chunkArray = <T,>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            批量运行器
          </DialogTitle>
          <DialogDescription>
            配置和运行多个集合的批量测试
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="config">配置</TabsTrigger>
            <TabsTrigger value="results">运行结果</TabsTrigger>
            <TabsTrigger value="history">历史记录</TabsTrigger>
            <TabsTrigger value="reports">报告</TabsTrigger>
          </TabsList>

          {/* 配置选项卡 */}
          <TabsContent value="config" className="space-y-4 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 左侧：配置列表 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">运行配置</h3>
                  <Button onClick={createConfig}>
                    <Play className="h-4 w-4 mr-2" />
                    新建配置
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {configs.map((config) => (
                    <Card 
                      key={config.id}
                      className={cn(
                        'cursor-pointer transition-colors',
                        currentConfig?.id === config.id && 'ring-2 ring-primary'
                      )}
                      onClick={() => setCurrentConfig(config)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{config.name}</CardTitle>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                runConfig(config);
                              }}
                              disabled={isRunning}
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Settings className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>
                                  <Copy className="h-3 w-3 mr-2" />
                                  复制
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-3 w-3 mr-2" />
                                  导出
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => deleteConfig(config.id)}
                                >
                                  删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        {config.description && (
                          <CardDescription>{config.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{config.collections.length} 个集合</span>
                          <span>{config.iterations} 次迭代</span>
                          <span>{config.delay}ms 延迟</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 右侧：配置详情 */}
              <div>
                <h3 className="text-lg font-medium mb-4">配置详情</h3>
                
                {currentConfig ? (
                  <Card>
                    <CardContent className="space-y-4 pt-6">
                      <div>
                        <Label>配置名称</Label>
                        <Input
                          value={currentConfig.name}
                          onChange={(e) => updateConfig(currentConfig.id, { name: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label>描述</Label>
                        <Textarea
                          value={currentConfig.description || ''}
                          onChange={(e) => updateConfig(currentConfig.id, { description: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>迭代次数</Label>
                          <Input
                            type="number"
                            value={currentConfig.iterations}
                            onChange={(e) => updateConfig(currentConfig.id, { iterations: Number(e.target.value) })}
                            min={1}
                          />
                        </div>
                        <div>
                          <Label>请求延迟 (ms)</Label>
                          <Input
                            type="number"
                            value={currentConfig.delay}
                            onChange={(e) => updateConfig(currentConfig.id, { delay: Number(e.target.value) })}
                            min={0}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>超时时间 (ms)</Label>
                          <Input
                            type="number"
                            value={currentConfig.timeout}
                            onChange={(e) => updateConfig(currentConfig.id, { timeout: Number(e.target.value) })}
                            min={1000}
                          />
                        </div>
                        <div>
                          <Label>最大并发数</Label>
                          <Input
                            type="number"
                            value={currentConfig.maxParallel}
                            onChange={(e) => updateConfig(currentConfig.id, { maxParallel: Number(e.target.value) })}
                            min={1}
                            max={20}
                            disabled={!currentConfig.parallel}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={currentConfig.stopOnError}
                            onCheckedChange={(checked) => updateConfig(currentConfig.id, { stopOnError: checked })}
                          />
                          <Label>遇到错误时停止</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={currentConfig.parallel}
                            onCheckedChange={(checked) => updateConfig(currentConfig.id, { parallel: checked })}
                          />
                          <Label>并行执行</Label>
                        </div>
                      </div>

                      <div>
                        <Label>选择集合</Label>
                        <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                          {collections.map((collection) => (
                            <div key={collection.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={currentConfig.collections.includes(collection.id)}
                                onChange={(e) => {
                                  const newCollections = e.target.checked
                                    ? [...currentConfig.collections, collection.id]
                                    : currentConfig.collections.filter(id => id !== collection.id);
                                  updateConfig(currentConfig.id, { collections: newCollections });
                                }}
                              />
                              <span className="text-sm">{collection.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {collection.requests?.length || 0} 个请求
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">选择配置</h3>
                      <p className="text-muted-foreground text-center mb-4">
                        选择一个配置来查看和编辑详情
                      </p>
                      <Button onClick={createConfig}>
                        创建新配置
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 运行结果选项卡 */}
          <TabsContent value="results" className="space-y-4 overflow-auto">
            {currentResult ? (
              <div className="space-y-6">
                {/* 运行状态和控制 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-3 h-3 rounded-full',
                          currentResult.status === 'running' && 'bg-blue-500 animate-pulse',
                          currentResult.status === 'completed' && 'bg-green-500',
                          currentResult.status === 'failed' && 'bg-red-500',
                          currentResult.status === 'stopped' && 'bg-yellow-500'
                        )} />
                        <CardTitle>
                          {currentResult.status === 'running' && '运行中...'}
                          {currentResult.status === 'completed' && '运行完成'}
                          {currentResult.status === 'failed' && '运行失败'}
                          {currentResult.status === 'stopped' && '已停止'}
                        </CardTitle>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isRunning && (
                          <Button variant="outline" onClick={stopRun}>
                            <StopCircle className="h-4 w-4 mr-2" />
                            停止
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => exportResults(currentResult)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          导出
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {currentResult.successRequests}
                        </div>
                        <div className="text-sm text-muted-foreground">成功</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {currentResult.failedRequests}
                        </div>
                        <div className="text-sm text-muted-foreground">失败</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {currentResult.totalRequests}
                        </div>
                        <div className="text-sm text-muted-foreground">总计</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {currentResult.stats.avgResponseTime.toFixed(0)}ms
                        </div>
                        <div className="text-sm text-muted-foreground">平均响应时间</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>进度</span>
                        <span>
                          {currentResult.successRequests + currentResult.failedRequests} / {currentResult.totalRequests}
                        </span>
                      </div>
                      <Progress 
                        value={(currentResult.successRequests + currentResult.failedRequests) / currentResult.totalRequests * 100} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 请求结果列表 */}
                <Card>
                  <CardHeader>
                    <CardTitle>请求结果</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-auto max-h-96">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>状态</TableHead>
                            <TableHead>请求</TableHead>
                            <TableHead>方法</TableHead>
                            <TableHead>响应时间</TableHead>
                            <TableHead>状态码</TableHead>
                            <TableHead>迭代</TableHead>
                            <TableHead>错误</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentResult.results.map((result) => (
                            <TableRow key={result.id}>
                              <TableCell>
                                {result.status === 'success' && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                                {result.status === 'error' && (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                {result.status === 'timeout' && (
                                  <Clock className="h-4 w-4 text-yellow-500" />
                                )}
                              </TableCell>
                              <TableCell className="font-medium">
                                {result.name}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{result.method}</Badge>
                              </TableCell>
                              <TableCell>
                                {result.responseTime ? `${result.responseTime}ms` : '-'}
                              </TableCell>
                              <TableCell>
                                {result.statusCode && (
                                  <Badge variant={
                                    result.statusCode >= 200 && result.statusCode < 300 
                                      ? 'default' 
                                      : 'destructive'
                                  }>
                                    {result.statusCode}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>{result.iteration}</TableCell>
                              <TableCell className="text-red-600 text-sm">
                                {result.error}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <PlayCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">暂无运行结果</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    选择一个配置并开始运行来查看结果
                  </p>
                  <Button onClick={() => setActiveTab('config')}>
                    去配置
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 历史记录选项卡 */}
          <TabsContent value="history" className="space-y-4 overflow-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">运行历史</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  过滤
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  导出全部
                </Button>
              </div>
            </div>

            {runHistory.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">暂无历史记录</h3>
                  <p className="text-muted-foreground text-center">
                    运行配置后这里将显示历史记录
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {runHistory.map((result) => (
                  <Card key={result.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-3 h-3 rounded-full',
                            result.status === 'completed' && 'bg-green-500',
                            result.status === 'failed' && 'bg-red-500',
                            result.status === 'stopped' && 'bg-yellow-500'
                          )} />
                          <div>
                            <div className="font-medium">
                              运行于 {result.startTime.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {result.duration && formatDuration(result.duration)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-medium text-green-600">
                              {result.successRequests}
                            </div>
                            <div className="text-muted-foreground">成功</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-red-600">
                              {result.failedRequests}
                            </div>
                            <div className="text-muted-foreground">失败</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">
                              {result.stats.avgResponseTime.toFixed(0)}ms
                            </div>
                            <div className="text-muted-foreground">平均响应</div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Settings className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => setCurrentResult(result)}>
                                <Eye className="h-3 w-3 mr-2" />
                                查看详情
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => exportResults(result)}>
                                <Download className="h-3 w-3 mr-2" />
                                导出
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-3 w-3 mr-2" />
                                复制配置
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 报告选项卡 */}
          <TabsContent value="reports" className="space-y-4 overflow-auto">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">报告功能</h3>
                <p className="text-muted-foreground text-center">
                  详细的性能报告和分析功能即将推出
                </p>
              </CardContent>
            </Card>
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

export default BatchRunner;
