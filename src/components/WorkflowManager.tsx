import React, { useState } from 'react';
import {
  Workflow,
  Play,
  Pause,
  Square,
  Settings,
  Code,
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  Copy,
  Save,
  RefreshCw,
  Zap,
  Timer,
  Target,
  Layers,
  GitBranch,
  BarChart3,
  FileText,
  Monitor,
  Calendar,
  Send,
  Database,
  Globe,
  Shield,
  Variable,
  FlaskConical
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { useCollectionStore } from '@/store/useCollectionStore';
import { cn } from '@/lib/utils';

// 工作流定义
export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  variables: WorkflowVariable[];
  settings: WorkflowSettings;
  tags: string[];
  category: string;
}

// 工作流步骤
export interface WorkflowStep {
  id: string;
  name: string;
  type: 'request' | 'script' | 'condition' | 'loop' | 'delay' | 'assertion';
  order: number;
  enabled: boolean;
  config: StepConfig;
  onSuccess?: string; // 下一步骤ID
  onFailure?: string; // 失败时跳转步骤ID
  timeout: number;
  retries: number;
}

// 步骤配置
export interface StepConfig {
  requestId?: string;
  script?: string;
  condition?: string;
  loopCount?: number;
  delayMs?: number;
  assertions?: Assertion[];
  variables?: Record<string, any>;
}

// 断言
export interface Assertion {
  id: string;
  name: string;
  type: 'status' | 'header' | 'body' | 'time' | 'size';
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'regex';
  expected: any;
  actual?: any;
  passed?: boolean;
  message?: string;
}

// 工作流触发器
export interface WorkflowTrigger {
  id: string;
  type: 'manual' | 'schedule' | 'webhook' | 'event';
  config: TriggerConfig;
  enabled: boolean;
}

// 触发器配置
export interface TriggerConfig {
  schedule?: string; // cron表达式
  webhook?: {
    url: string;
    secret: string;
  };
  event?: {
    type: string;
    source: string;
  };
}

// 工作流变量
export interface WorkflowVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  value: any;
  isSecret: boolean;
  description?: string;
}

// 工作流设置
export interface WorkflowSettings {
  maxRetries: number;
  timeout: number;
  continueOnError: boolean;
  saveResults: boolean;
  notifications: {
    email: boolean;
    webhook: boolean;
    slack: boolean;
  };
}

// 工作流执行
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  triggeredBy: string;
  triggerType: string;
  results: StepResult[];
  summary: ExecutionSummary;
  logs: ExecutionLog[];
}

// 步骤执行结果
export interface StepResult {
  stepId: string;
  stepName: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  output?: any;
  error?: string;
  assertions?: AssertionResult[];
}

// 断言结果
export interface AssertionResult extends Assertion {
  passed: boolean;
  message: string;
}

// 执行摘要
export interface ExecutionSummary {
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  skippedSteps: number;
  totalAssertions: number;
  passedAssertions: number;
  failedAssertions: number;
}

// 执行日志
export interface ExecutionLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  stepId?: string;
  data?: any;
}

// 工作流管理组件Props
interface WorkflowManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkflowManager: React.FC<WorkflowManagerProps> = ({
  isOpen,
  onClose
}) => {
  const { collections } = useCollectionStore();
  
  // 状态管理
  const [activeTab, setActiveTab] = useState('workflows');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // 工作流表单
  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    description: '',
    category: 'testing',
    tags: [] as string[]
  });

  // 模拟数据
  const [workflows] = useState<WorkflowDefinition[]>([
    {
      id: 'workflow-1',
      name: '用户API完整测试',
      description: '测试用户注册、登录、信息获取等完整流程',
      version: '1.0.0',
      author: '王志东',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isActive: true,
      steps: [
        {
          id: 'step-1',
          name: '用户注册',
          type: 'request',
          order: 1,
          enabled: true,
          config: {
            requestId: 'req-register'
          },
          timeout: 5000,
          retries: 3
        },
        {
          id: 'step-2',
          name: '验证注册响应',
          type: 'assertion',
          order: 2,
          enabled: true,
          config: {
            assertions: [
              {
                id: 'assert-1',
                name: '状态码检查',
                type: 'status',
                operator: 'equals',
                expected: 200
              },
              {
                id: 'assert-2',
                name: '响应包含用户ID',
                type: 'body',
                operator: 'contains',
                expected: 'userId'
              }
            ]
          },
          timeout: 1000,
          retries: 0
        }
      ],
      triggers: [
        {
          id: 'trigger-1',
          type: 'schedule',
          config: {
            schedule: '0 */6 * * *' // 每6小时执行一次
          },
          enabled: true
        }
      ],
      variables: [
        {
          id: 'var-1',
          name: 'baseUrl',
          type: 'string',
          value: 'https://api.example.com',
          isSecret: false,
          description: 'API基础URL'
        }
      ],
      settings: {
        maxRetries: 3,
        timeout: 30000,
        continueOnError: false,
        saveResults: true,
        notifications: {
          email: true,
          webhook: false,
          slack: false
        }
      },
      tags: ['api', 'user', 'e2e'],
      category: 'testing'
    }
  ]);

  const [executions] = useState<WorkflowExecution[]>([
    {
      id: 'exec-1',
      workflowId: 'workflow-1',
      status: 'completed',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 45000),
      duration: 45000,
      triggeredBy: '王志东',
      triggerType: 'manual',
      results: [
        {
          stepId: 'step-1',
          stepName: '用户注册',
          status: 'passed',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1500),
          duration: 1500
        },
        {
          stepId: 'step-2',
          stepName: '验证注册响应',
          status: 'passed',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1500),
          endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2000),
          duration: 500,
          assertions: [
            {
              id: 'assert-1',
              name: '状态码检查',
              type: 'status',
              operator: 'equals',
              expected: 200,
              actual: 200,
              passed: true,
              message: '状态码验证通过'
            }
          ]
        }
      ],
      summary: {
        totalSteps: 2,
        passedSteps: 2,
        failedSteps: 0,
        skippedSteps: 0,
        totalAssertions: 2,
        passedAssertions: 2,
        failedAssertions: 0
      },
      logs: []
    }
  ]);

  // 创建工作流
  const handleCreateWorkflow = () => {
    if (!workflowForm.name) return;
    
    const newWorkflow: WorkflowDefinition = {
      id: `workflow-${Date.now()}`,
      name: workflowForm.name,
      description: workflowForm.description,
      version: '1.0.0',
      author: '当前用户',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: false,
      steps: [],
      triggers: [],
      variables: [],
      settings: {
        maxRetries: 3,
        timeout: 30000,
        continueOnError: false,
        saveResults: true,
        notifications: {
          email: false,
          webhook: false,
          slack: false
        }
      },
      tags: workflowForm.tags,
      category: workflowForm.category
    };
    
    console.log('创建工作流:', newWorkflow);
    setIsCreating(false);
    setWorkflowForm({ name: '', description: '', category: 'testing', tags: [] });
  };

  // 运行工作流
  const handleRunWorkflow = (workflow: WorkflowDefinition) => {
    console.log('运行工作流:', workflow.id);
    // 这里应该实现工作流执行逻辑
  };

  // 停止工作流
  const handleStopWorkflow = (executionId: string) => {
    console.log('停止工作流执行:', executionId);
    // 这里应该实现停止工作流逻辑
  };

  // 获取状态配置
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'running':
        return { icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-100', label: '运行中' };
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: '已完成' };
      case 'failed':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: '失败' };
      case 'cancelled':
        return { icon: Square, color: 'text-gray-600', bg: 'bg-gray-100', label: '已取消' };
      case 'paused':
        return { icon: Pause, color: 'text-yellow-600', bg: 'bg-yellow-100', label: '已暂停' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', label: '等待中' };
    }
  };

  // 获取步骤类型配置
  const getStepTypeConfig = (type: string) => {
    switch (type) {
      case 'request':
        return { icon: Send, color: 'text-blue-600', label: 'HTTP请求' };
      case 'script':
        return { icon: Code, color: 'text-purple-600', label: '脚本执行' };
      case 'condition':
        return { icon: GitBranch, color: 'text-orange-600', label: '条件判断' };
      case 'loop':
        return { icon: RefreshCw, color: 'text-green-600', label: '循环' };
      case 'delay':
        return { icon: Timer, color: 'text-gray-600', label: '延迟' };
      case 'assertion':
        return { icon: TestTube, color: 'text-red-600', label: '断言' };
      default:
        return { icon: Settings, color: 'text-gray-600', label: '未知' };
    }
  };

  // 格式化持续时间
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            工作流管理
          </DialogTitle>
          <DialogDescription>
            创建和管理自动化测试工作流
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="workflows">工作流</TabsTrigger>
            <TabsTrigger value="executions">执行历史</TabsTrigger>
            <TabsTrigger value="templates">模板库</TabsTrigger>
            <TabsTrigger value="settings">设置</TabsTrigger>
          </TabsList>

          {/* 工作流列表 */}
          <TabsContent value="workflows" className="space-y-4 overflow-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">工作流列表</h3>
                <p className="text-muted-foreground">管理您的自动化测试工作流</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline">
                  <FlaskConical className="h-4 w-4 mr-2" />
                  从模板创建
                </Button>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  新建工作流
                </Button>
              </div>
            </div>

            {/* 工作流卡片 */}
            <div className="grid gap-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Workflow className="h-6 w-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg">{workflow.name}</h4>
                            <Badge variant={workflow.isActive ? "default" : "secondary"}>
                              {workflow.isActive ? '活跃' : '停用'}
                            </Badge>
                            {workflow.tags.map(tag => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <p className="text-muted-foreground mb-3">
                            {workflow.description}
                          </p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-blue-600">
                                {workflow.steps.length}
                              </div>
                              <div className="text-xs text-muted-foreground">步骤</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-green-600">
                                {workflow.triggers.length}
                              </div>
                              <div className="text-xs text-muted-foreground">触发器</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-purple-600">
                                {workflow.variables.length}
                              </div>
                              <div className="text-xs text-muted-foreground">变量</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-orange-600">
                                v{workflow.version}
                              </div>
                              <div className="text-xs text-muted-foreground">版本</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div>创建者: {workflow.author}</div>
                            <div>更新: {workflow.updatedAt.toLocaleDateString()}</div>
                            <div>类别: {workflow.category}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRunWorkflow(workflow)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          运行
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onSelect={() => setSelectedWorkflow(workflow)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              编辑工作流
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              复制工作流
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              导出工作流
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Monitor className="h-4 w-4 mr-2" />
                              查看监控
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              执行统计
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              删除工作流
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    {/* 步骤预览 */}
                    {workflow.steps.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-sm font-medium mb-2">工作流步骤:</div>
                        <div className="flex items-center gap-2 overflow-x-auto">
                          {workflow.steps.slice(0, 5).map((step, index) => {
                            const stepConfig = getStepTypeConfig(step.type);
                            const StepIcon = stepConfig.icon;
                            
                            return (
                              <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center",
                                  step.enabled ? "bg-blue-100" : "bg-gray-100"
                                )}>
                                  <StepIcon className={cn(
                                    "h-4 w-4",
                                    step.enabled ? stepConfig.color : "text-gray-400"
                                  )} />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {step.name}
                                </span>
                                {index < Math.min(workflow.steps.length - 1, 4) && (
                                  <ArrowRight className="h-3 w-3 text-gray-400" />
                                )}
                              </div>
                            );
                          })}
                          {workflow.steps.length > 5 && (
                            <div className="text-xs text-muted-foreground">
                              +{workflow.steps.length - 5} 更多步骤
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 创建工作流对话框 */}
            {isCreating && (
              <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>创建新工作流</DialogTitle>
                    <DialogDescription>
                      创建一个新的自动化测试工作流
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>工作流名称</Label>
                      <Input
                        placeholder="例如: 用户API测试"
                        value={workflowForm.name}
                        onChange={(e) => setWorkflowForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label>描述</Label>
                      <Textarea
                        placeholder="描述工作流的用途和功能..."
                        value={workflowForm.description}
                        onChange={(e) => setWorkflowForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>类别</Label>
                      <Select 
                        value={workflowForm.category} 
                        onValueChange={(value) => setWorkflowForm(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="testing">API测试</SelectItem>
                          <SelectItem value="monitoring">监控检查</SelectItem>
                          <SelectItem value="integration">集成测试</SelectItem>
                          <SelectItem value="performance">性能测试</SelectItem>
                          <SelectItem value="security">安全测试</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>标签 (用逗号分隔)</Label>
                      <Input
                        placeholder="例如: api, user, e2e"
                        onChange={(e) => setWorkflowForm(prev => ({ 
                          ...prev, 
                          tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                        }))}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreating(false)}>
                      取消
                    </Button>
                    <Button 
                      onClick={handleCreateWorkflow}
                      disabled={!workflowForm.name}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      创建工作流
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          {/* 执行历史 */}
          <TabsContent value="executions" className="space-y-4 overflow-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">执行历史</h3>
                <p className="text-muted-foreground">查看工作流执行记录和结果</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  时间范围
                </Button>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  统计报告
                </Button>
              </div>
            </div>

            {/* 执行记录表格 */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>工作流</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>触发方式</TableHead>
                      <TableHead>执行时间</TableHead>
                      <TableHead>持续时间</TableHead>
                      <TableHead>结果</TableHead>
                      <TableHead className="w-[100px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executions.map((execution) => {
                      const statusConfig = getStatusConfig(execution.status);
                      const StatusIcon = statusConfig.icon;
                      const workflow = workflows.find(w => w.id === execution.workflowId);
                      
                      return (
                        <TableRow key={execution.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{workflow?.name}</div>
                              <div className="text-sm text-muted-foreground">
                                v{workflow?.version}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusConfig.bg}>
                              <StatusIcon className={cn("h-3 w-3 mr-1", statusConfig.color)} />
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="capitalize">{execution.triggerType}</div>
                              <div className="text-sm text-muted-foreground">
                                {execution.triggeredBy}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {execution.startTime.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {execution.duration ? formatDuration(execution.duration) : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="text-sm text-green-600">
                                  ✓ {execution.summary.passedSteps}
                                </div>
                                <div className="text-sm text-red-600">
                                  ✗ {execution.summary.failedSteps}
                                </div>
                                <div className="text-sm text-gray-600">
                                  - {execution.summary.skippedSteps}
                                </div>
                              </div>
                              <Progress 
                                value={(execution.summary.passedSteps / execution.summary.totalSteps) * 100}
                                className="h-1"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onSelect={() => setSelectedExecution(execution)}
                                >
                                  <Monitor className="h-4 w-4 mr-2" />
                                  查看详情
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="h-4 w-4 mr-2" />
                                  导出报告
                                </DropdownMenuItem>
                                {execution.status === 'running' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onSelect={() => handleStopWorkflow(execution.id)}
                                    >
                                      <Square className="h-4 w-4 mr-2" />
                                      停止执行
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 模板库 */}
          <TabsContent value="templates" className="space-y-4 overflow-auto">
            <div className="text-center py-12">
              <FlaskConical className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">工作流模板库</h3>
              <p className="text-muted-foreground mb-6">
                使用预定义的模板快速创建常用的工作流
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                浏览模板
              </Button>
            </div>
          </TabsContent>

          {/* 设置 */}
          <TabsContent value="settings" className="space-y-4 overflow-auto">
            <div className="text-center py-12">
              <Settings className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">工作流设置</h3>
              <p className="text-muted-foreground mb-6">
                配置工作流的全局设置和默认参数
              </p>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                打开设置
              </Button>
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

export default WorkflowManager;
