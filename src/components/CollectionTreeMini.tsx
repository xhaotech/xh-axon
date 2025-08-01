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
import { Badge } from '@/components/ui/badge';
import { useCollectionStore } from '@/store/useCollectionStore';
import { useAppStore } from '@/store/useAppStore';
import { Collection, ApiRequest } from '@/types/collection';
import { createTranslator, getDefaultLanguage } from '@/lib/i18n';

// Mini风格的HTTP方法颜色配置 - 更紧凑的设计
const HTTP_METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-50 text-green-700 border-green-200',
  POST: 'bg-blue-50 text-blue-700 border-blue-200', 
  PUT: 'bg-orange-50 text-orange-700 border-orange-200',
  DELETE: 'bg-red-50 text-red-700 border-red-200',
  PATCH: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  HEAD: 'bg-gray-50 text-gray-700 border-gray-200',
  OPTIONS: 'bg-purple-50 text-purple-700 border-purple-200'
};

interface CollectionTreeItemProps {
  collection: Collection;
  level: number;
  onSelect: (collection: Collection) => void;
  onRequestSelect: (request: ApiRequest) => void;
}

interface RequestItemProps {
  request: ApiRequest;
  level: number;
  onSelect: (request: ApiRequest) => void;
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
        className="h-4 text-[10px] px-1 py-0 border-blue-300 focus:border-blue-500"
        autoFocus
      />
      <Button
        size="sm"
        variant="ghost"
        className="h-4 w-4 p-0 hover:bg-green-100"
        onClick={() => onSave(editValue.trim())}
      >
        <Check className="h-2.5 w-2.5 text-green-600" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-4 w-4 p-0 hover:bg-red-100"
        onClick={onCancel}
      >
        <X className="h-2.5 w-2.5 text-red-600" />
      </Button>
    </div>
  );
};

// 请求项组件 - Mini风格
const RequestItem: React.FC<RequestItemProps> = ({ request, level, onSelect }) => {
  const { addTab } = useAppStore();
  const t = createTranslator(getDefaultLanguage());
  const [isEditing, setIsEditing] = useState(false);

  const handleRequestClick = () => {
    // 在新标签页中打开请求，支持Request Tab联动
    const newTab = {
      id: Date.now().toString(),
      name: request.name || `${request.method} ${request.url}`,
      url: request.url,
      method: request.method,
      params: request.queryParams || {},
      headers: request.headers || {},
      auth: { 
        type: 'basic' as const,
        username: 'wecise.admin',
        password: 'admin'
      },
      body: request.body?.content,
      isSaved: true,
      isModified: false,
      collectionId: request.collectionId,
      requestId: request.id
    };
    addTab(newTab);
    onSelect(request);
  };

  const handleRename = (newName: string) => {
    if (newName && newName !== request.name) {
      // TODO: 调用重命名API
      console.log('Rename request', request.id, 'to', newName);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-1 px-1 py-0.5 text-xs cursor-pointer hover:bg-blue-50 rounded-sm transition-colors",
        level > 0 && "ml-2"
      )}
      style={{ paddingLeft: `${level * 12 + 16}px` }}
      onClick={handleRequestClick}
    >
      {/* 请求图标 */}
      <FileText className="h-2.5 w-2.5 text-gray-500 flex-shrink-0" />
      
      {/* HTTP方法徽章 - Mini风格 */}
      <Badge 
        variant="outline"
        className={cn(
          "text-[8px] px-1 py-0 h-3 border font-mono font-bold",
          HTTP_METHOD_COLORS[request.method] || 'bg-gray-50 text-gray-700'
        )}
      >
        {request.method}
      </Badge>

      {/* 请求名称或编辑框 */}
      <div className="flex-1 min-w-0 mr-1">
        {isEditing ? (
          <InlineEditor
            value={request.name || ''}
            onSave={handleRename}
            onCancel={() => setIsEditing(false)}
            placeholder={t('enterRequestName')}
          />
        ) : (
          <div className="flex flex-col">
            <span className="text-[10px] font-medium truncate">
              {request.name || t('untitledRequest')}
            </span>
            {request.url && (
              <span className="text-[9px] text-gray-500 truncate">
                {request.url}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 右键菜单 - Mini风格 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-3 w-3 p-0 opacity-0 group-hover:opacity-100 hover:bg-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-2 w-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="text-xs">
          <DropdownMenuItem onSelect={() => handleRequestClick()}>
            <FileText className="h-3 w-3 mr-1" />
            {t('openInNewTab')}
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
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            <Trash2 className="h-3 w-3 mr-1" />
            {t('delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// 集合树项组件 - Mini风格
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
  
  const { addTab } = useAppStore();
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
      console.log('Drop', draggedData, 'into', collection.id);
    }
    setDraggedItem(null);
  };

  const handleRename = (newName: string) => {
    if (newName && newName !== collection.name) {
      console.log('Rename collection', collection.id, 'to', newName);
    }
    setIsEditing(false);
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          "group flex items-center gap-1 px-1 py-0.5 text-xs cursor-pointer hover:bg-blue-50 rounded-sm transition-colors",
          isSelected && "bg-blue-100 text-blue-900",
          level > 0 && "ml-2"
        )}
        style={{ paddingLeft: `${level * 12 + 4}px` }}
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
        
        {/* 文件夹图标和内容 */}
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
              <span className="truncate text-[10px] font-medium">{collection.name}</span>
              {/* 请求数量徽章 - Mini风格 */}
              {(collection.requests?.length || 0) > 0 && (
                <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3 ml-1">
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
              // 新建请求并在新标签页中打开，支持集合关联
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
                collectionId: collection.id
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
              {t('moveCollection')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="h-3 w-3 mr-1" />
              {t('delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 子项递归渲染 */}
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
          
          {/* 请求项 */}
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

// 主CollectionTree组件 - Mini风格
export const CollectionTreeMini: React.FC = () => {
  const {
    collections,
    searchQuery,
    searchCollections,
    setSelectedCollection,
    loadCollections
  } = useCollectionStore();
  
  const t = createTranslator(getDefaultLanguage());
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      // TODO: 调用创建集合API
      console.log('Create collection:', newCollectionName);
      setNewCollectionName('');
      setIsCreating(false);
    }
  };

  const handleCollectionSelect = useCallback((collection: Collection) => {
    setSelectedCollection(collection.id);
  }, [setSelectedCollection]);

  const handleRequestSelect = useCallback((request: ApiRequest) => {
    console.log('Request selected:', request);
  }, []);

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 - Mini风格 */}
      <div className="p-1 border-b border-gray-200 bg-gray-50">
        {/* 搜索框 - Mini尺寸 */}
        <div className="relative mb-1">
          <Search size={8} className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder={t('searchCollections')}
            value={searchQuery}
            onChange={(e) => searchCollections(e.target.value)}
            className="pl-5 h-5 text-[10px] border-gray-300"
          />
        </div>
        
        {/* 新建按钮 */}
        {isCreating ? (
          <InlineEditor
            value={newCollectionName}
            onSave={handleCreateCollection}
            onCancel={() => {
              setIsCreating(false);
              setNewCollectionName('');
            }}
            placeholder={t('enterCollectionName')}
          />
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreating(true)}
            className="w-full h-5 text-[10px] justify-start"
          >
            <Plus size={8} className="mr-1" />
            {t('newCollection')}
          </Button>
        )}
      </div>

      {/* 集合列表 - 紧凑布局 */}
      <div className="flex-1 overflow-auto">
        {filteredCollections.length === 0 ? (
          <div className="p-2 text-center">
            <div className="text-gray-400 text-[10px]">{t('noCollections')}</div>
          </div>
        ) : (
          <div className="space-y-0.5 p-1">
            {filteredCollections.map((collection) => (
              <CollectionTreeItem
                key={collection.id}
                collection={collection}
                level={0}
                onSelect={handleCollectionSelect}
                onRequestSelect={handleRequestSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
