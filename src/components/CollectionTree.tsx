import React, { useState, useCallback, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  FileText, 
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Move,
  FolderPlus,
  X,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCollectionStore } from '@/store/useCollectionStore';
import { useAppStore } from '@/store/useAppStore';
import { Collection, ApiRequest } from '@/types/collection';
import { createTranslator, getDefaultLanguage } from '@/lib/i18n';

// Mini风格的HTTP方法颜色配置 - 更紧凑的设计
const HTTP_METHOD_COLORS = {
  GET: 'bg-green-50 text-green-700 border-green-200 text-[10px] px-1 py-0.5',
  POST: 'bg-blue-50 text-blue-700 border-blue-200 text-[10px] px-1 py-0.5',
  PUT: 'bg-orange-50 text-orange-700 border-orange-200 text-[10px] px-1 py-0.5',
  DELETE: 'bg-red-50 text-red-700 border-red-200 text-[10px] px-1 py-0.5',
  PATCH: 'bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px] px-1 py-0.5',
  HEAD: 'bg-gray-50 text-gray-700 border-gray-200 text-[10px] px-1 py-0.5',
  OPTIONS: 'bg-purple-50 text-purple-700 border-purple-200 text-[10px] px-1 py-0.5'
};

interface CollectionTreeItemProps {
  collection: Collection;
  level: number;
  onSelect: (collection: Collection) => void;
  onRequestSelect: (request: ApiRequest) => void;
}

// 内联编辑组件 - Mini风格
const InlineEditor: React.FC<{
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
}> = ({ value, onSave, onCancel, placeholder }) => {
  const [editValue, setEditValue] = useState(value);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave(editValue.trim());
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="flex items-center gap-1 w-full">
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onSave(editValue.trim())}
        placeholder={placeholder}
        className="h-5 text-xs px-1 py-0 border-blue-300 focus:border-blue-500"
        autoFocus
      />
      <Button
        size="sm"
        variant="ghost"
        className="h-5 w-5 p-0 hover:bg-green-100"
        onClick={() => onSave(editValue.trim())}
      >
        <Check className="h-3 w-3 text-green-600" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-5 w-5 p-0 hover:bg-red-100"
        onClick={onCancel}
      >
        <X className="h-3 w-3 text-red-600" />
      </Button>
    </div>
  );
};

const CollectionTreeItem: React.FC<CollectionTreeItemProps> = ({
  collection,
  level,
  onSelect,
  onRequestSelect
}) => {
  const {
    expandedCollections,
    toggleCollectionExpansion,
    selectedCollectionId,
    showContextMenu,
    setDraggedItem,
    draggedItem
  } = useCollectionStore();
  
  const { addTab } = useAppStore(); // 添加Request Tab联动
  const t = createTranslator(getDefaultLanguage());
  
  const [isEditing, setIsEditing] = useState(false);

  const isExpanded = expandedCollections.has(collection.id);
  const isSelected = selectedCollectionId === collection.id;
  const hasChildren = (collection.children && collection.children.length > 0) || 
                     (collection.requests && collection.requests.length > 0);

  const handleToggleExpansion = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      toggleCollectionExpansion(collection.id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    showContextMenu('collection', collection.id, e.clientX, e.clientY);
  };

  const handleDragStart = (e: React.DragEvent) => {
    setDraggedItem({ type: 'collection', id: collection.id });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedData = draggedItem;
    if (draggedData && draggedData.id !== collection.id) {
      // Handle drop logic here
      console.log('Drop', draggedData, 'into', collection.id);
    }
    setDraggedItem(null);
  };

  // 处理重命名
  const handleRename = (newName: string) => {
    if (newName && newName !== collection.name) {
      // TODO: 调用重命名API
      console.log('Rename collection', collection.id, 'to', newName);
    }
    setIsEditing(false);
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          // Mini风格 - 减小padding和字体大小
          "group flex items-center gap-1 px-1 py-0.5 text-xs cursor-pointer hover:bg-blue-50 rounded-sm transition-colors",
          isSelected && "bg-blue-100 text-blue-900",
          level > 0 && "ml-2"
        )}
        style={{ paddingLeft: `${level * 12 + 4}px` }} // 减小缩进
        onClick={() => onSelect(collection)}
        onContextMenu={handleContextMenu}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* 展开/收起按钮 - Mini尺寸 */}
        <Button
          variant="ghost"
          size="sm"
          className="h-3 w-3 p-0 hover:bg-transparent"
          onClick={handleToggleExpansion}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-2.5 w-2.5" />
            ) : (
              <ChevronRight className="h-2.5 w-2.5" />
            )
          ) : (
            <div className="h-2.5 w-2.5" />
          )}
        </Button>
        
        {/* 文件夹图标 - Mini尺寸 */}
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {isExpanded ? (
            <FolderOpen className="h-3 w-3 text-blue-600 flex-shrink-0" />
          ) : (
            <Folder className="h-3 w-3 text-blue-600 flex-shrink-0" />
          )}
          
          {/* 集合名称或编辑框 */}
          {isEditing ? (
            <InlineEditor
              value={collection.name}
              onSave={handleRename}
              onCancel={() => setIsEditing(false)}
              placeholder={t('enterCollectionName')}
            />
          ) : (
            <>
              <span className="truncate text-xs font-medium">{collection.name}</span>
              {/* 请求数量徽章 - Mini风格 */}
              {(collection.requests?.length || 0) > 0 && (
                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3 ml-1">
                  {collection.requests?.length}
                </Badge>
              )}
            </>
          )}
        </div>

        {/* 右键菜单按钮 - Mini尺寸 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-3 w-3 p-0 opacity-0 group-hover:opacity-100 hover:bg-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-2.5 w-2.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="text-xs">
            <DropdownMenuItem onSelect={() => {
              // 新建请求并在新标签页中打开
              const newTab = {
                id: Date.now().toString(),
                name: t('newRequest'),
                url: '',
                method: 'GET' as const,
                params: {},
                headers: {},
                auth: { 
                  type: 'basic' as const,
                  username: 'wecise.admin',
                  password: 'admin'
                },
                isSaved: false,
                isModified: false,
                collectionId: collection.id // 关联到当前集合
              };
              addTab(newTab);
            }}>
              <Plus className="h-3 w-3 mr-1" />
              {t('newRequest')}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FolderPlus className="h-3 w-3 mr-1" />
              {t('newFolder')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setIsEditing(true)}>
              <Edit className="h-3 w-3 mr-1" />
              {t('rename')}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="h-3 w-3 mr-1" />
              {t('copy')}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Move className="h-3 w-3 mr-1" />
              {t('move')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="h-3 w-3 mr-1" />
              {t('delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 子项 - 递归渲染 */}
      {isExpanded && (
        <div className="ml-1">
          {/* 子集合 */}
          {collection.children?.map((child) => (
            <CollectionTreeItem
              key={child.id}
              collection={child}
              level={level + 1}
              onSelect={onSelect}
              onRequestSelect={onRequestSelect}
            />
          ))}
          
          {/* 请求项 - Mini风格 */}
          {collection.requests?.map((request) => (
            <RequestItem
              key={request.id}
              request={request}
              level={level + 1}
              onSelect={onRequestSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 请求项组件 - Mini风格
interface RequestTreeItemProps {
  request: ApiRequest;
  level: number;
  onSelect: (request: ApiRequest) => void;
}

const RequestTreeItem: React.FC<RequestTreeItemProps> = ({
  request,
  level,
  onSelect
}) => {
  const { showContextMenu, setDraggedItem, activeRequest } = useCollectionStore();
  const isSelected = activeRequest?.id === request.id;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    showContextMenu('request', request.id, e.clientX, e.clientY);
  };

  const handleDragStart = (e: React.DragEvent) => {
    setDraggedItem({ type: 'request', id: request.id });
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-accent rounded-sm group",
        isSelected && "bg-accent",
        "ml-4"
      )}
      style={{ paddingLeft: `${level * 16 + 8}px` }}
      onClick={() => onSelect(request)}
      onContextMenu={handleContextMenu}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="h-4 w-4" /> {/* Space for chevron */}
      <FileText className="h-4 w-4 text-gray-600 flex-shrink-0" />
      <Badge 
        variant="outline" 
        className={cn("text-xs px-1 py-0", HTTP_METHOD_COLORS[request.method])}
      >
        {request.method}
      </Badge>
      <span className="truncate flex-1">{request.name}</span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>
            <Edit className="h-4 w-4 mr-2" />
            重命名
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Copy className="h-4 w-4 mr-2" />
            复制
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Move className="h-4 w-4 mr-2" />
            移动
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const CollectionTree: React.FC = () => {
  const {
    collections,
    searchQuery,
    searchResults,
    setSelectedCollection,
    setActiveRequest,
    searchCollections,
    clearSearch,
    loadCollections
  } = useCollectionStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const handleSearch = useCallback((value: string) => {
    searchCollections(value);
  }, [searchCollections]);

  const handleCreateCollection = async () => {
    if (newCollectionName.trim()) {
      try {
        const { createCollection } = useCollectionStore.getState();
        await createCollection(newCollectionName, newCollectionDescription);
        setNewCollectionName('');
        setNewCollectionDescription('');
        setIsCreateDialogOpen(false);
      } catch (error) {
        console.error('Failed to create collection:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 搜索栏 */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索集合和请求..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8 h-8"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={clearSearch}
            >
              ×
            </Button>
          )}
        </div>
      </div>

      {/* 工具栏 */}
      <div className="flex items-center justify-between p-3 border-b">
        <span className="text-sm font-medium">集合</span>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建集合</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">名称</Label>
                <Input
                  id="name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="输入集合名称"
                />
              </div>
              <div>
                <Label htmlFor="description">描述（可选）</Label>
                <Textarea
                  id="description"
                  value={newCollectionDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewCollectionDescription(e.target.value)}
                  placeholder="输入集合描述"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  取消
                </Button>
                <Button onClick={handleCreateCollection}>
                  创建
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 集合树 */}
      <div className="flex-1 overflow-auto">
        {searchQuery && searchResults.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            没有找到匹配的结果
          </div>
        ) : (
          <div className="p-2">
            {searchQuery ? (
              // 搜索结果显示
              <div className="space-y-1">
                {searchResults.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="flex items-center gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-accent rounded-sm"
                  >
                    {result.type === 'collection' ? (
                      <Folder className="h-4 w-4 text-blue-600" />
                    ) : (
                      <FileText className="h-4 w-4 text-gray-600" />
                    )}
                    <span className="truncate">{result.name}</span>
                    {result.url && (
                      <span className="text-xs text-muted-foreground truncate">
                        {result.url}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // 正常集合树显示
              <div>
                {collections.map((collection) => (
                  <CollectionTreeItem
                    key={collection.id}
                    collection={collection}
                    level={0}
                    onSelect={(collection) => setSelectedCollection(collection.id)}
                    onRequestSelect={setActiveRequest}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
