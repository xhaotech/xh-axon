import React, { useState } from 'react';
import {
  History,
  GitBranch,
  FileText,
  Clock,
  User,
  Tag,
  Download,
  Upload,
  Compare,
  Restore,
  Save,
  Plus,
  Search,
  Filter,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Eye,
  Edit,
  Trash2,
  Copy,
  Share,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  GitCommit,
  Target,
  Bookmark
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
import { Collection, ApiRequest } from '@/types/collection';
import { cn } from '@/lib/utils';

// 版本信息
export interface Version {
  id: string;
  collectionId: string;
  version: string;
  name: string;
  description?: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: Date;
  changes: VersionChange[];
  tags: string[];
  isPublished: boolean;
  publishedAt?: Date;
  downloadCount: number;
  size: number; // 版本大小（字节）
  checksum: string;
  parentVersion?: string;
  metadata: VersionMetadata;
}

// 版本变更
export interface VersionChange {
  id: string;
  type: 'added' | 'modified' | 'deleted' | 'moved' | 'renamed';
  resource: 'collection' | 'request' | 'folder' | 'environment';
  resourceId: string;
  resourceName: string;
  description: string;
  diff?: VersionDiff;
}

// 版本差异
export interface VersionDiff {
  old?: any;
  new?: any;
  changes: DiffChange[];
}

// 差异变更
export interface DiffChange {
  path: string;
  type: 'added' | 'removed' | 'modified';
  oldValue?: any;
  newValue?: any;
}

// 版本元数据
export interface VersionMetadata {
  collections: number;
  requests: number;
  environments: number;
  schemas: number;
  totalSize: number;
  lastModified: Date;
  compatibility: string[];
}

// 历史记录
export interface HistoryRecord {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  resourceName: string;
  description: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  details?: any;
  version?: string;
  sessionId: string;
}

// 版本对比结果
export interface VersionComparison {
  fromVersion: Version;
  toVersion: Version;
  changes: VersionChange[];
  summary: {
    added: number;
    modified: number;
    deleted: number;
    moved: number;
    renamed: number;
  };
}

// 历史与版本管理组件Props
interface HistoryVersionProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId?: string;
}

export const HistoryVersion: React.FC<HistoryVersionProps> = ({
  isOpen,
  onClose,
  collectionId
}) => {
  const { collections } = useCollectionStore();
  
  // 状态管理
  const [activeTab, setActiveTab] = useState('history');
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [compareVersions, setCompareVersions] = useState<{from: string; to: string}>({from: '', to: ''});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('week');
  
  // 版本管理状态
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [newVersionForm, setNewVersionForm] = useState({
    name: '',
    description: '',
    tags: [] as string[],
    isPublished: false
  });

  // 模拟数据
  const [versions] = useState<Version[]>([
    {
      id: 'v1.2.0',
      collectionId: 'collection-1',
      version: '1.2.0',
      name: '添加用户认证API',
      description: '新增用户登录、注册、密码重置等认证相关API',
      author: {
        id: 'user-1',
        name: '王志东',
        email: 'wangzd@xhtech.com'
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      changes: [
        {
          id: 'change-1',
          type: 'added',
          resource: 'request',
          resourceId: 'req-auth-login',
          resourceName: '用户登录',
          description: '新增用户登录API'
        },
        {
          id: 'change-2',
          type: 'added',
          resource: 'request',
          resourceId: 'req-auth-register',
          resourceName: '用户注册',
          description: '新增用户注册API'
        },
        {
          id: 'change-3',
          type: 'modified',
          resource: 'collection',
          resourceId: 'collection-1',
          resourceName: '用户管理',
          description: '更新集合描述和文档'
        }
      ],
      tags: ['major', 'auth', 'api'],
      isPublished: true,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      downloadCount: 45,
      size: 1024000,
      checksum: 'sha256:abc123...',
      parentVersion: 'v1.1.0',
      metadata: {
        collections: 3,
        requests: 15,
        environments: 2,
        schemas: 5,
        totalSize: 1024000,
        lastModified: new Date(),
        compatibility: ['postman-v2.1', 'openapi-3.0']
      }
    },
    {
      id: 'v1.1.0',
      collectionId: 'collection-1',
      version: '1.1.0',
      name: '优化数据结构',
      description: '优化请求参数结构，修复已知问题',
      author: {
        id: 'user-2',
        name: '李开发',
        email: 'likai@xhtech.com'
      },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      changes: [
        {
          id: 'change-4',
          type: 'modified',
          resource: 'request',
          resourceId: 'req-user-list',
          resourceName: '用户列表',
          description: '优化分页参数结构'
        }
      ],
      tags: ['minor', 'optimization'],
      isPublished: true,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      downloadCount: 32,
      size: 890000,
      checksum: 'sha256:def456...',
      parentVersion: 'v1.0.0',
      metadata: {
        collections: 3,
        requests: 13,
        environments: 2,
        schemas: 4,
        totalSize: 890000,
        lastModified: new Date(),
        compatibility: ['postman-v2.1', 'openapi-3.0']
      }
    }
  ]);

  const [historyRecords] = useState<HistoryRecord[]>([
    {
      id: 'history-1',
      action: '创建请求',
      resource: 'request',
      resourceId: 'req-1',
      resourceName: '获取用户信息',
      description: '创建了新的API请求：获取用户信息',
      user: {
        id: 'user-1',
        name: '王志东'
      },
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      version: 'v1.2.0',
      sessionId: 'session-1'
    },
    {
      id: 'history-2',
      action: '修改集合',
      resource: 'collection',
      resourceId: 'collection-1',
      resourceName: '用户管理',
      description: '更新了集合描述信息',
      user: {
        id: 'user-1',
        name: '王志东'
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      version: 'v1.2.0',
      sessionId: 'session-1'
    },
    {
      id: 'history-3',
      action: '删除请求',
      resource: 'request',
      resourceId: 'req-old',
      resourceName: '废弃的API',
      description: '删除了已废弃的API请求',
      user: {
        id: 'user-2',
        name: '李开发'
      },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      version: 'v1.1.0',
      sessionId: 'session-2'
    }
  ]);

  // 创建新版本
  const handleCreateVersion = async () => {
    setIsCreatingVersion(true);
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newVersion: Version = {
        id: `v${Date.now()}`,
        collectionId: collectionId || 'default',
        version: newVersionForm.name,
        name: newVersionForm.name,
        description: newVersionForm.description,
        author: {
          id: 'current-user',
          name: '当前用户',
          email: 'user@example.com'
        },
        createdAt: new Date(),
        changes: [], // 这里应该计算实际的变更
        tags: newVersionForm.tags,
        isPublished: newVersionForm.isPublished,
        publishedAt: newVersionForm.isPublished ? new Date() : undefined,
        downloadCount: 0,
        size: 1000000,
        checksum: 'sha256:new...',
        metadata: {
          collections: 3,
          requests: 15,
          environments: 2,
          schemas: 5,
          totalSize: 1000000,
          lastModified: new Date(),
          compatibility: ['postman-v2.1', 'openapi-3.0']
        }
      };
      
      console.log('新版本已创建:', newVersion);
      
      // 重置表单
      setNewVersionForm({
        name: '',
        description: '',
        tags: [],
        isPublished: false
      });
      
    } catch (error) {
      console.error('创建版本失败:', error);
    }
    
    setIsCreatingVersion(false);
  };

  // 版本对比
  const handleCompareVersions = () => {
    if (!compareVersions.from || !compareVersions.to) return;
    
    const fromVersion = versions.find(v => v.id === compareVersions.from);
    const toVersion = versions.find(v => v.id === compareVersions.to);
    
    if (fromVersion && toVersion) {
      console.log('对比版本:', fromVersion, toVersion);
      // 这里应该打开版本对比视图
    }
  };

  // 恢复到指定版本
  const handleRestoreVersion = (version: Version) => {
    if (confirm(`确定要恢复到版本 ${version.version} 吗？`)) {
      console.log('恢复版本:', version);
      // 这里应该实现版本恢复逻辑
    }
  };

  // 筛选历史记录
  const filteredHistory = historyRecords.filter(record => {
    const matchesSearch = record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.resourceName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || record.action.includes(filterType);
    
    // 时间范围筛选
    const now = new Date();
    const recordDate = record.timestamp;
    let inTimeRange = true;
    
    switch (timeRange) {
      case 'day':
        inTimeRange = now.getTime() - recordDate.getTime() <= 24 * 60 * 60 * 1000;
        break;
      case 'week':
        inTimeRange = now.getTime() - recordDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        inTimeRange = now.getTime() - recordDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
        break;
    }
    
    return matchesSearch && matchesFilter && inTimeRange;
  });

  // 获取操作类型的图标和颜色
  const getActionConfig = (action: string) => {
    if (action.includes('创建')) {
      return { icon: Plus, color: 'text-green-600', bg: 'bg-green-100' };
    } else if (action.includes('修改')) {
      return { icon: Edit, color: 'text-blue-600', bg: 'bg-blue-100' };
    } else if (action.includes('删除')) {
      return { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100' };
    } else {
      return { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            历史与版本管理
          </DialogTitle>
          <DialogDescription>
            查看操作历史、管理版本和进行版本对比
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history">操作历史</TabsTrigger>
            <TabsTrigger value="versions">版本管理</TabsTrigger>
            <TabsTrigger value="compare">版本对比</TabsTrigger>
          </TabsList>

          {/* 操作历史 */}
          <TabsContent value="history" className="space-y-4 overflow-auto">
            {/* 筛选工具栏 */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索操作历史..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有操作</SelectItem>
                  <SelectItem value="创建">创建</SelectItem>
                  <SelectItem value="修改">修改</SelectItem>
                  <SelectItem value="删除">删除</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">今天</SelectItem>
                  <SelectItem value="week">本周</SelectItem>
                  <SelectItem value="month">本月</SelectItem>
                  <SelectItem value="all">全部</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex-1" />
              
              <Badge variant="outline">
                {filteredHistory.length} 条记录
              </Badge>
            </div>

            {/* 历史记录列表 */}
            <div className="space-y-3">
              {filteredHistory.map((record) => {
                const actionConfig = getActionConfig(record.action);
                const ActionIcon = actionConfig.icon;
                
                return (
                  <Card key={record.id} className="transition-all hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          actionConfig.bg
                        )}>
                          <ActionIcon className={cn("h-5 w-5", actionConfig.color)} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{record.action}</span>
                            <Badge variant="outline" className="text-xs">
                              {record.resource}
                            </Badge>
                            {record.version && (
                              <Badge variant="secondary" className="text-xs">
                                {record.version}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-muted-foreground mb-2">
                            {record.description}
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {record.user.name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {record.timestamp.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {record.resourceName}
                            </div>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              查看详情
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              复制信息
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Restore className="h-4 w-4 mr-2" />
                              恢复此状态
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {filteredHistory.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <History className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="font-medium mb-2">没有找到操作记录</h3>
                    <p className="text-muted-foreground">
                      尝试调整筛选条件或时间范围
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* 版本管理 */}
          <TabsContent value="versions" className="space-y-4 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧：版本列表 */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">版本历史</h3>
                    <p className="text-muted-foreground">管理和查看所有版本</p>
                  </div>
                  
                  <Button 
                    onClick={() => setIsCreatingVersion(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    创建版本
                  </Button>
                </div>

                <div className="space-y-4">
                  {versions.map((version) => (
                    <Card key={version.id} className="transition-all hover:shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <GitBranch className="h-6 w-6 text-blue-600" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-lg">{version.version}</h4>
                                {version.isPublished && (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    已发布
                                  </Badge>
                                )}
                                {version.tags.map(tag => (
                                  <Badge key={tag} variant="outline">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              
                              <p className="text-muted-foreground mb-3">
                                {version.description}
                              </p>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-blue-600">
                                    {version.metadata.collections}
                                  </div>
                                  <div className="text-xs text-muted-foreground">集合</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-green-600">
                                    {version.metadata.requests}
                                  </div>
                                  <div className="text-xs text-muted-foreground">请求</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-purple-600">
                                    {version.downloadCount}
                                  </div>
                                  <div className="text-xs text-muted-foreground">下载</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-orange-600">
                                    {formatFileSize(version.size)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">大小</div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {version.author.name}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {version.createdAt.toLocaleDateString()}
                                </div>
                                {version.parentVersion && (
                                  <div className="flex items-center gap-1">
                                    <GitCommit className="h-4 w-4" />
                                    基于 {version.parentVersion}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onSelect={() => setSelectedVersion(version)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                查看详情
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                下载版本
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share className="h-4 w-4 mr-2" />
                                分享版本
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                编辑标签
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onSelect={() => handleRestoreVersion(version)}
                              >
                                <Restore className="h-4 w-4 mr-2" />
                                恢复此版本
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                删除版本
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {/* 变更摘要 */}
                        {version.changes.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="text-sm font-medium mb-2">主要变更:</div>
                            <div className="space-y-1">
                              {version.changes.slice(0, 3).map((change) => {
                                const changeConfig = getActionConfig(change.type);
                                const ChangeIcon = changeConfig.icon;
                                
                                return (
                                  <div key={change.id} className="flex items-center gap-2 text-sm">
                                    <ChangeIcon className={cn("h-3 w-3", changeConfig.color)} />
                                    <span className="text-muted-foreground">
                                      {change.description}
                                    </span>
                                  </div>
                                );
                              })}
                              {version.changes.length > 3 && (
                                <div className="text-sm text-muted-foreground">
                                  还有 {version.changes.length - 3} 项变更...
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 右侧：创建版本面板 */}
              <div className="space-y-4">
                {isCreatingVersion ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>创建新版本</CardTitle>
                      <CardDescription>
                        为当前状态创建一个新的版本快照
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>版本号</Label>
                        <Input
                          placeholder="例如: v1.3.0"
                          value={newVersionForm.name}
                          onChange={(e) => setNewVersionForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label>版本描述</Label>
                        <Textarea
                          placeholder="描述此版本的主要变更..."
                          value={newVersionForm.description}
                          onChange={(e) => setNewVersionForm(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>标签 (用逗号分隔)</Label>
                        <Input
                          placeholder="例如: major, api, auth"
                          onChange={(e) => setNewVersionForm(prev => ({ 
                            ...prev, 
                            tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                          }))}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isPublished"
                          checked={newVersionForm.isPublished}
                          onChange={(e) => setNewVersionForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                        />
                        <Label htmlFor="isPublished">立即发布</Label>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          onClick={handleCreateVersion}
                          disabled={!newVersionForm.name || isCreatingVersion}
                          className="flex-1"
                        >
                          {isCreatingVersion ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              创建中...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              创建版本
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsCreatingVersion(false)}
                        >
                          取消
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>版本统计</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {versions.length}
                          </div>
                          <div className="text-sm text-muted-foreground">总版本数</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {versions.filter(v => v.isPublished).length}
                          </div>
                          <div className="text-sm text-muted-foreground">已发布</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {versions.reduce((sum, v) => sum + v.downloadCount, 0)}
                          </div>
                          <div className="text-sm text-muted-foreground">总下载</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {formatFileSize(versions.reduce((sum, v) => sum + v.size, 0))}
                          </div>
                          <div className="text-sm text-muted-foreground">总大小</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 版本对比 */}
          <TabsContent value="compare" className="space-y-4 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 版本选择 */}
              <Card>
                <CardHeader>
                  <CardTitle>选择对比版本</CardTitle>
                  <CardDescription>
                    选择两个版本进行详细对比
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>源版本</Label>
                    <Select 
                      value={compareVersions.from} 
                      onValueChange={(value) => setCompareVersions(prev => ({ ...prev, from: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择源版本" />
                      </SelectTrigger>
                      <SelectContent>
                        {versions.map((version) => (
                          <SelectItem key={version.id} value={version.id}>
                            {version.version} - {version.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>目标版本</Label>
                    <Select 
                      value={compareVersions.to} 
                      onValueChange={(value) => setCompareVersions(prev => ({ ...prev, to: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择目标版本" />
                      </SelectTrigger>
                      <SelectContent>
                        {versions.map((version) => (
                          <SelectItem key={version.id} value={version.id}>
                            {version.version} - {version.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleCompareVersions}
                    disabled={!compareVersions.from || !compareVersions.to}
                    className="w-full"
                  >
                    <Compare className="h-4 w-4 mr-2" />
                    开始对比
                  </Button>
                </CardContent>
              </Card>

              {/* 对比结果 */}
              <Card>
                <CardHeader>
                  <CardTitle>对比结果</CardTitle>
                </CardHeader>
                <CardContent>
                  {compareVersions.from && compareVersions.to ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-4 mb-4">
                          <Badge variant="outline" className="bg-blue-50">
                            {versions.find(v => v.id === compareVersions.from)?.version}
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <Badge variant="outline" className="bg-green-50">
                            {versions.find(v => v.id === compareVersions.to)?.version}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">5</div>
                          <div className="text-sm text-muted-foreground">新增</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">3</div>
                          <div className="text-sm text-muted-foreground">修改</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-red-600">1</div>
                          <div className="text-sm text-muted-foreground">删除</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-orange-600">2</div>
                          <div className="text-sm text-muted-foreground">移动</div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="text-sm font-medium">主要变更:</div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Plus className="h-3 w-3 text-green-600" />
                            <span>新增用户认证API</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Edit className="h-3 w-3 text-blue-600" />
                            <span>优化响应数据结构</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Trash2 className="h-3 w-3 text-red-600" />
                            <span>移除废弃接口</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Compare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-muted-foreground">
                        选择两个版本开始对比
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
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

export default HistoryVersion;
