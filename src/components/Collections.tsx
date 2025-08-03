import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, 
  Search, 
  FolderPlus, 
  Download, 
  Upload, 
  Settings, 
  Filter,
  MoreHorizontal,
  Play,
  Folder,
  FileText,
  Edit,
  Copy,
  Trash2,
  Move,
  Star,
  StarOff,
  ChevronRight,
  ChevronDown,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Clock,
  Hash,
  Tag,
  Users,
  Share2,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel
} from './ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { useCollectionStore } from '@/store/useCollectionStore';
import { Collection, ApiRequest, HttpMethod } from '../types/collection';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

// 视图模式
type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'created' | 'updated' | 'requests';
type SortOrder = 'asc' | 'desc';

// 批量操作类型
interface BatchAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: (ids: string[]) => void;
  variant?: 'default' | 'destructive';
}

// Collection卡片组件
interface CollectionCardProps {
  collection: Collection;
  viewMode: ViewMode;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (collection: Collection) => void;
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
  onFavorite: (collection: Collection) => void;
  onRun: (collection: Collection) => void;
  onExport: (collection: Collection) => void;
  onDuplicate: (collection: Collection) => void;
  onMove: (collection: Collection) => void;
  onShare: (collection: Collection) => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  viewMode,
  isSelected,
  isFavorite,
  onSelect,
  onEdit,
  onDelete,
  onFavorite,
  onRun,
  onExport,
  onDuplicate,
  onMove,
  onShare
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const requestCount = collection.requests?.length || 0;
  const folderCount = collection.children?.length || 0;
  
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(collection);
  };

  const handleRunClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRun(collection);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite(collection);
  };

  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'flex items-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors',
          isSelected && 'ring-2 ring-primary ring-offset-2'
        )}
        onClick={handleCardClick}
      >
        <div className="flex items-center gap-3 flex-1">
          <Folder className="h-5 w-5 text-blue-600" />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{collection.name}</h3>
            {collection.description && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                {collection.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Hash className="h-4 w-4" />
            <span>{requestCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Folder className="h-4 w-4" />
            <span>{folderCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{new Date(collection.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavoriteClick}
            className="h-8 w-8 p-0"
          >
            {isFavorite ? (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRunClick}
            className="h-8 w-8 p-0"
          >
            <Play className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(collection)}>
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(collection)}>
                <Copy className="h-4 w-4 mr-2" />
                复制
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMove(collection)}>
                <Move className="h-4 w-4 mr-2" />
                移动
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onExport(collection)}>
                <Download className="h-4 w-4 mr-2" />
                导出
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare(collection)}>
                <Share2 className="h-4 w-4 mr-2" />
                分享
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(collection)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <Card 
      className={cn(
        'group hover:shadow-lg transition-all duration-200 cursor-pointer',
        isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg truncate">{collection.name}</CardTitle>
            {isFavorite && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteClick}
              className="h-8 w-8 p-0"
            >
              {isFavorite ? (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              ) : (
                <StarOff className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRunClick}
              className="h-8 w-8 p-0"
            >
              <Play className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(collection)}>
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(collection)}>
                  <Copy className="h-4 w-4 mr-2" />
                  复制
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMove(collection)}>
                  <Move className="h-4 w-4 mr-2" />
                  移动
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onExport(collection)}>
                  <Download className="h-4 w-4 mr-2" />
                  导出
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare(collection)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  分享
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(collection)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {collection.description && (
          <CardDescription className="text-sm line-clamp-2">
            {collection.description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* 统计信息 */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Hash className="h-4 w-4" />
              <span>{requestCount} 个请求</span>
            </div>
            <div className="flex items-center gap-1">
              <Folder className="h-4 w-4" />
              <span>{folderCount} 个文件夹</span>
            </div>
          </div>

          {/* 时间信息 */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>创建于 {new Date(collection.createdAt).toLocaleDateString()}</span>
            <span>更新于 {new Date(collection.updatedAt).toLocaleDateString()}</span>
          </div>

          {/* 请求预览 */}
          {requestCount > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">最近请求</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              </div>
              
              {isExpanded && collection.requests && (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {collection.requests.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="text-xs">
                        {request.method}
                      </Badge>
                      <span className="truncate">{request.name}</span>
                    </div>
                  ))}
                  {collection.requests.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{collection.requests.length - 5} 更多...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Collection表单组件
interface CollectionFormProps {
  collection?: Collection;
  onSave: (data: Partial<Collection>) => void;
  onCancel: () => void;
}

const CollectionForm: React.FC<CollectionFormProps> = ({
  collection,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: collection?.name || '',
    description: collection?.description || '',
    parentId: collection?.parentId || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">集合名称 *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="输入集合名称"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">描述</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="输入集合描述（可选）"
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {collection ? '更新' : '创建'}
        </Button>
      </DialogFooter>
    </form>
  );
};

// 批量运行器组件
interface BatchRunnerProps {
  collections: Collection[];
  isOpen: boolean;
  onClose: () => void;
}

const BatchRunner: React.FC<BatchRunnerProps> = ({
  collections,
  isOpen,
  onClose
}) => {
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [delay, setDelay] = useState(100);
  const [iterations, setIterations] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleRun = async () => {
    setIsRunning(true);
    setResults([]);
    
    // 实现批量运行逻辑
    for (const collectionId of selectedCollections) {
      const collection = collections.find(c => c.id === collectionId);
      if (collection?.requests) {
        for (const request of collection.requests) {
          // 模拟请求执行
          await new Promise(resolve => setTimeout(resolve, delay));
          setResults(prev => [...prev, {
            id: request.id,
            name: request.name,
            status: Math.random() > 0.8 ? 'failed' : 'success',
            duration: Math.floor(Math.random() * 1000) + 100
          }]);
        }
      }
    }
    
    setIsRunning(false);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>批量运行器</DialogTitle>
          <DialogDescription>
            选择要运行的集合并配置执行参数
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 集合选择 */}
          <div>
            <Label>选择集合</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
              {collections.map((collection) => (
                <div key={collection.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={collection.id}
                    checked={selectedCollections.includes(collection.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCollections([...selectedCollections, collection.id]);
                      } else {
                        setSelectedCollections(selectedCollections.filter(id => id !== collection.id));
                      }
                    }}
                  />
                  <label htmlFor={collection.id} className="text-sm">
                    {collection.name} ({collection.requests?.length || 0} 个请求)
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 运行配置 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="delay">请求延迟 (ms)</Label>
              <Input
                id="delay"
                type="number"
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                min={0}
              />
            </div>
            <div>
              <Label htmlFor="iterations">迭代次数</Label>
              <Input
                id="iterations"
                type="number"
                value={iterations}
                onChange={(e) => setIterations(Number(e.target.value))}
                min={1}
              />
            </div>
          </div>

          {/* 运行结果 */}
          {results.length > 0 && (
            <div>
              <Label>运行结果</Label>
              <div className="space-y-1 max-h-40 overflow-y-auto border rounded p-2">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{result.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                        {result.status}
                      </Badge>
                      <span className="text-muted-foreground">{result.duration}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
          <Button 
            onClick={handleRun} 
            disabled={selectedCollections.length === 0 || isRunning}
          >
            {isRunning ? '运行中...' : '开始运行'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// 主要的Collections组件
export const Collections: React.FC = () => {
  const {
    collections,
    selectedCollectionId,
    loadCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    searchCollections,
    searchQuery,
    searchResults,
    clearSearch
  } = useCollectionStore();

  const { addTab } = useAppStore();

  // 本地状态
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [showBatchRunner, setShowBatchRunner] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [batchMode, setBatchMode] = useState(false);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 加载数据
  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setShowCreateDialog(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 过滤和排序collections
  const filteredAndSortedCollections = React.useMemo(() => {
    let result = [...collections];

    // 搜索过滤
    if (searchQuery && searchResults.length > 0) {
      const collectionIds = new Set(
        searchResults
          .filter(r => r.type === 'collection')
          .map(r => r.id)
      );
      result = result.filter(c => collectionIds.has(c.id));
    }

    // 标签过滤
    if (filterTags.length > 0) {
      // 假设collection有tags字段
      result = result.filter(c => 
        filterTags.some(tag => (c as any).tags?.includes(tag))
      );
    }

    // 排序
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'requests':
          comparison = (a.requests?.length || 0) - (b.requests?.length || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [collections, searchQuery, searchResults, filterTags, sortBy, sortOrder]);

  // 批量操作
  const batchActions: BatchAction[] = [
    {
      id: 'export',
      label: '批量导出',
      icon: Download,
      action: (ids) => handleBatchExport(ids)
    },
    {
      id: 'duplicate',
      label: '批量复制',
      icon: Copy,
      action: (ids) => handleBatchDuplicate(ids)
    },
    {
      id: 'delete',
      label: '批量删除',
      icon: Trash2,
      variant: 'destructive',
      action: (ids) => handleBatchDelete(ids)
    }
  ];

  // 事件处理函数
  const handleCreateCollection = async (data: Partial<Collection>) => {
    try {
      await createCollection(data.name!, data.parentId);
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  const handleEditCollection = async (data: Partial<Collection>) => {
    if (!editingCollection) return;
    
    try {
      await updateCollection(editingCollection.id, data);
      setEditingCollection(null);
    } catch (error) {
      console.error('Failed to update collection:', error);
    }
  };

  const handleDeleteCollection = async (collection: Collection) => {
    if (confirm(`确定要删除集合 "${collection.name}" 吗？`)) {
      try {
        await deleteCollection(collection.id);
      } catch (error) {
        console.error('Failed to delete collection:', error);
      }
    }
  };

  const handleRunCollection = (collection: Collection) => {
    // 实现单个集合运行逻辑
    console.log('Running collection:', collection.name);
  };

  const handleExportCollection = (collection: Collection) => {
    // 实现导出逻辑
    const exportData = {
      name: collection.name,
      description: collection.description,
      requests: collection.requests,
      folders: collection.children
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collection.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDuplicateCollection = async (collection: Collection) => {
    try {
      await createCollection(`${collection.name} (副本)`);
    } catch (error) {
      console.error('Failed to duplicate collection:', error);
    }
  };

  const handleMoveCollection = (collection: Collection) => {
    // 实现移动逻辑
    console.log('Moving collection:', collection.name);
  };

  const handleShareCollection = (collection: Collection) => {
    // 实现分享逻辑
    console.log('Sharing collection:', collection.name);
  };

  const handleFavoriteCollection = (collection: Collection) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(collection.id)) {
        newFavorites.delete(collection.id);
      } else {
        newFavorites.add(collection.id);
      }
      return newFavorites;
    });
  };

  const handleBatchExport = (ids: string[]) => {
    // 实现批量导出
    console.log('Batch export:', ids);
  };

  const handleBatchDuplicate = (ids: string[]) => {
    // 实现批量复制
    console.log('Batch duplicate:', ids);
  };

  const handleBatchDelete = (ids: string[]) => {
    if (confirm(`确定要删除选中的 ${ids.length} 个集合吗？`)) {
      // 实现批量删除
      console.log('Batch delete:', ids);
    }
  };

  const handleSelectAll = () => {
    setSelectedItems(new Set(filteredAndSortedCollections.map(c => c.id)));
  };

  const handleClearSelection = () => {
    setSelectedItems(new Set());
  };

  const handleItemSelect = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        try {
          const data = JSON.parse(text);
          // 实现导入逻辑
          console.log('Importing data:', data);
        } catch (error) {
          console.error('Failed to import:', error);
        }
      }
    };
    input.click();
  };

  const handleSearch = (query: string) => {
    searchCollections(query);
  };

  const stats = {
    total: collections.length,
    totalRequests: collections.reduce((sum, c) => sum + (c.requests?.length || 0), 0),
    totalFolders: collections.reduce((sum, c) => sum + (c.children?.length || 0), 0),
    favorites: favorites.size
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* 头部工具栏 */}
      <div className="flex-shrink-0 p-6 bg-white border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">请求集合</h1>
            <p className="text-muted-foreground">
              管理和组织你的 API 请求集合
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {batchMode && selectedItems.size > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm text-blue-700">
                  已选择 {selectedItems.size} 项
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="h-6 w-6 p-0 text-blue-700 hover:text-blue-900"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            <Button variant="outline" onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              导入
            </Button>
            
            <Button variant="outline" onClick={() => setShowBatchRunner(true)}>
              <Play className="h-4 w-4 mr-2" />
              批量运行
            </Button>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  新建集合
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新建集合</DialogTitle>
                  <DialogDescription>
                    创建一个新的请求集合来组织你的 API 请求
                  </DialogDescription>
                </DialogHeader>
                <CollectionForm
                  onSave={handleCreateCollection}
                  onCancel={() => setShowCreateDialog(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">集合总数</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalRequests}</div>
                <div className="text-sm text-muted-foreground">总请求数</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalFolders}</div>
                <div className="text-sm text-muted-foreground">文件夹数</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{stats.favorites}</div>
                <div className="text-sm text-muted-foreground">收藏数</div>
              </div>
            </div>
          </Card>
        </div>

        {/* 搜索和过滤工具栏 */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="搜索集合... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearSearch();
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* 视图模式切换 */}
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* 排序选择 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {sortOrder === 'asc' ? (
                    <SortAsc className="h-4 w-4 mr-2" />
                  ) : (
                    <SortDesc className="h-4 w-4 mr-2" />
                  )}
                  排序
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>排序方式</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                  <DropdownMenuRadioItem value="name">名称</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="created">创建时间</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="updated">更新时间</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="requests">请求数量</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>排序顺序</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
                  <DropdownMenuRadioItem value="asc">升序</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="desc">降序</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 过滤器 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              过滤器
            </Button>

            {/* 批量模式切换 */}
            <div className="flex items-center gap-2">
              <Switch
                checked={batchMode}
                onCheckedChange={setBatchMode}
                id="batch-mode"
              />
              <Label htmlFor="batch-mode" className="text-sm">
                批量选择
              </Label>
            </div>

            {/* 更多选项 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSelectAll}>
                  全选
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleClearSelection}>
                  取消选择
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {batchActions.map((action) => (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={() => action.action(Array.from(selectedItems))}
                    disabled={selectedItems.size === 0}
                    className={action.variant === 'destructive' ? 'text-destructive' : ''}
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 过滤器面板 */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>标签：</Label>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="选择标签" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="testing">测试</SelectItem>
                    <SelectItem value="development">开发</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterTags([])}
              >
                清除过滤器
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 集合网格/列表 */}
      <div className="flex-1 overflow-auto p-6">
        {filteredAndSortedCollections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Folder className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无集合</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? '没有找到匹配的集合' : '开始创建你的第一个请求集合'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建集合
              </Button>
            )}
          </div>
        ) : (
          <div className={cn(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-2'
          )}>
            {filteredAndSortedCollections.map((collection) => (
              <div key={collection.id} className="relative">
                {batchMode && (
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(collection.id)}
                      onChange={() => handleItemSelect(collection.id)}
                      className="rounded"
                    />
                  </div>
                )}
                <CollectionCard
                  collection={collection}
                  viewMode={viewMode}
                  isSelected={selectedCollectionId === collection.id}
                  isFavorite={favorites.has(collection.id)}
                  onSelect={() => {}}
                  onEdit={setEditingCollection}
                  onDelete={handleDeleteCollection}
                  onFavorite={handleFavoriteCollection}
                  onRun={handleRunCollection}
                  onExport={handleExportCollection}
                  onDuplicate={handleDuplicateCollection}
                  onMove={handleMoveCollection}
                  onShare={handleShareCollection}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 编辑对话框 */}
      <Dialog open={!!editingCollection} onOpenChange={() => setEditingCollection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑集合</DialogTitle>
            <DialogDescription>
              修改集合的基本信息
            </DialogDescription>
          </DialogHeader>
          {editingCollection && (
            <CollectionForm
              collection={editingCollection}
              onSave={handleEditCollection}
              onCancel={() => setEditingCollection(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 批量运行器 */}
      <BatchRunner
        collections={filteredAndSortedCollections}
        isOpen={showBatchRunner}
        onClose={() => setShowBatchRunner(false)}
      />
    </div>
  );
};

export default Collections;
