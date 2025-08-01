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
  Check,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useCollectionStore } from '@/store/useCollectionStore';
import { useAppStore } from '@/store/useAppStore';
import { Collection, ApiRequest } from '@/types/collection';
import { createTranslator, getDefaultLanguage } from '@/lib/i18n';

// Mini风格的HTTP方法颜色配置
const HTTP_METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-50 text-green-700 border-green-200',
  POST: 'bg-blue-50 text-blue-700 border-blue-200', 
  PUT: 'bg-orange-50 text-orange-700 border-orange-200',
  DELETE: 'bg-red-50 text-red-700 border-red-200',
  PATCH: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  HEAD: 'bg-gray-50 text-gray-700 border-gray-200',
  OPTIONS: 'bg-purple-50 text-purple-700 border-purple-200'
};

interface CollectionTreeEnhancedProps {
  showBatchOperations?: boolean;
  enableDragDrop?: boolean;
  miniMode?: boolean;
}

interface CollectionTreeItemProps {
  collection: Collection;
  level: number;
  onSelect: (collection: Collection) => void;
  onRequestSelect: (request: ApiRequest) => void;
  miniMode?: boolean;
  selectedItems?: Set<string>;
  onItemSelect?: (id: string, type: 'collection' | 'request') => void;
}

interface RequestItemProps {
  request: ApiRequest;
  level: number;
  onSelect: (request: ApiRequest) => void;
  miniMode?: boolean;
  selectedItems?: Set<string>;
  onItemSelect?: (id: string, type: 'collection' | 'request') => void;
}

// 内联编辑组件 - Mini风格
const InlineEditor: React.FC<{
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  miniMode?: boolean;
}> = ({ value, onSave, onCancel, placeholder, miniMode = false }) => {
  const [editValue, setEditValue] = useState(value);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave(editValue.trim());
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const size = miniMode ? 'h-4 text-[10px]' : 'h-6 text-xs';

  return (
    <div className="flex items-center gap-1 w-full">
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onSave(editValue.trim())}
        placeholder={placeholder}
        className={`${size} px-1 py-0 border-blue-300 focus:border-blue-500`}
        autoFocus
      />
      <Button
        size="sm"
        variant="ghost"
        className={`${miniMode ? 'h-4 w-4' : 'h-6 w-6'} p-0 hover:bg-green-100`}
        onClick={() => onSave(editValue.trim())}
      >
        <Check className={`${miniMode ? 'h-2.5 w-2.5' : 'h-3 w-3'} text-green-600`} />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className={`${miniMode ? 'h-4 w-4' : 'h-6 w-6'} p-0 hover:bg-red-100`}
        onClick={onCancel}
      >
        <X className={`${miniMode ? 'h-2.5 w-2.5' : 'h-3 w-3'} text-red-600`} />
      </Button>
    </div>
  );
};

// 请求项组件 - 增强版，支持一一对应联动
const RequestItemEnhanced: React.FC<RequestItemProps> = ({ 
  request, 
  level, 
  onSelect, 
  miniMode = false,
  selectedItems,
  onItemSelect
}) => {
  const { openRequestInTab, tabs, activeTab } = useAppStore();
  const t = createTranslator(getDefaultLanguage());
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isSelected = selectedItems?.has(request.id) || false;
  
  // 检查该请求是否已在Tab中打开
  const existingTab = tabs.find((tab: any) => tab.requestId === request.id);
  const isOpenInTab = !!existingTab;
  const isActiveInTab = existingTab?.id === activeTab;

  const handleRequestClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // 多选模式
      onItemSelect?.(request.id, 'request');
      return;
    }

    // 使用新的联动方法，实现一一对应
    openRequestInTab(request);
    onSelect(request);
  };

  const handleRename = (newName: string) => {
    if (newName && newName !== request.name) {
      console.log('Rename request', request.id, 'to', newName);
    }
    setIsEditing(false);
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'request',
      id: request.id,
      collectionId: request.collectionId
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const paddingLeft = miniMode ? level * 12 + 16 : level * 16 + 20;
  const itemHeight = miniMode ? 'py-0.5' : 'py-1';
  const textSize = miniMode ? 'text-[10px]' : 'text-xs';
  const iconSize = miniMode ? 'h-2.5 w-2.5' : 'h-3 w-3';

  return (
    <div
      className={cn(
        `group flex items-center gap-1 px-1 ${itemHeight} ${textSize} cursor-pointer rounded-sm transition-all`,
        isSelected ? 'bg-blue-100 border border-blue-300' : 'hover:bg-blue-50',
        isActiveInTab ? 'bg-green-50 border-l-2 border-green-500' : '', // 当前活动Tab高亮
        isOpenInTab && !isActiveInTab ? 'bg-yellow-50 border-l-2 border-yellow-400' : '', // 已打开但非活动
        isDragging && 'opacity-50',
        level > 0 && "ml-2"
      )}
      style={{ paddingLeft: `${paddingLeft}px` }}
      onClick={handleRequestClick}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* 选择框 - 批量操作 */}
      {selectedItems && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onItemSelect?.(request.id, 'request')}
          className={miniMode ? 'h-2.5 w-2.5' : 'h-3 w-3'}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* Tab状态指示器 */}
      {isOpenInTab && (
        <div className={cn(
          "w-1.5 h-1.5 rounded-full flex-shrink-0",
          isActiveInTab ? 'bg-green-500' : 'bg-yellow-500'
        )} />
      )}

      {/* 请求图标 */}
      <FileText className={`${iconSize} text-gray-500 flex-shrink-0`} />
      
      {/* HTTP方法徽章 - Mini风格 */}
      <Badge 
        variant="outline"
        className={cn(
          `${miniMode ? 'text-[8px] px-1 py-0 h-3' : 'text-[10px] px-1.5 py-0.5 h-4'} border font-mono font-bold`,
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
            miniMode={miniMode}
          />
        ) : (
          <div className="flex flex-col">
            <span className={`${miniMode ? 'text-[10px]' : 'text-xs'} font-medium truncate`}>
              {request.name || t('untitledRequest')}
            </span>
            {request.url && (
              <span className={`${miniMode ? 'text-[9px]' : 'text-[10px]'} text-gray-500 truncate`}>
                {request.url}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 右键菜单 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`${miniMode ? 'h-3 w-3' : 'h-4 w-4'} p-0 opacity-0 group-hover:opacity-100 hover:bg-gray-200`}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className={miniMode ? 'h-2 w-2' : 'h-2.5 w-2.5'} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="text-xs">
          <DropdownMenuItem onSelect={() => handleRequestClick({} as React.MouseEvent)}>
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
  );
};

// 集合树项组件 - 增强版
const CollectionTreeItemEnhanced: React.FC<CollectionTreeItemProps> = ({
  collection,
  level,
  onSelect,
  onRequestSelect,
  miniMode = false,
  selectedItems,
  onItemSelect
}) => {
  const {
    expandedCollections,
    toggleCollectionExpansion,
    showContextMenu,
    setDraggedItem
  } = useCollectionStore();
  
  const { addTab, setActiveTab } = useAppStore();
  const t = createTranslator(getDefaultLanguage());
  
  const [isEditing, setIsEditing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const isExpanded = expandedCollections.has(collection.id);
  const isSelected = selectedItems?.has(collection.id) || false;
  const hasChildren = (collection.children && collection.children.length > 0) || 
                     (collection.requests && collection.requests.length > 0);

  const handleToggleExpansion = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      toggleCollectionExpansion(collection.id);
    }
  };

  const handleCollectionClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // 多选模式
      onItemSelect?.(collection.id, 'collection');
      return;
    }
    onSelect(collection);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    showContextMenu('collection', collection.id, e.clientX, e.clientY);
  };

  const handleDragStart = (e: React.DragEvent) => {
    setDraggedItem({ type: 'collection', id: collection.id });
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'collection',
      id: collection.id
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (dragData && dragData.id !== collection.id) {
        console.log('Drop', dragData, 'into', collection.id);
        // TODO: 实现移动逻辑
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
    
    setDraggedItem(null);
  };

  const handleRename = (newName: string) => {
    if (newName && newName !== collection.name) {
      console.log('Rename collection', collection.id, 'to', newName);
    }
    setIsEditing(false);
  };

  const paddingLeft = miniMode ? level * 12 + 4 : level * 16 + 8;
  const itemHeight = miniMode ? 'py-0.5' : 'py-1';
  const textSize = miniMode ? 'text-[10px]' : 'text-xs';
  const iconSize = miniMode ? 'h-2.5 w-2.5' : 'h-3 w-3';

  return (
    <div className="select-none">
      <div
        className={cn(
          `group flex items-center gap-1 px-1 ${itemHeight} ${textSize} cursor-pointer rounded-sm transition-all`,
          isSelected ? 'bg-blue-100 border border-blue-300' : 'hover:bg-blue-50',
          isDragOver && 'bg-blue-200 border-2 border-blue-400',
          level > 0 && "ml-2"
        )}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={handleCollectionClick}
        onContextMenu={handleContextMenu}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* 选择框 - 批量操作 */}
        {selectedItems && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onItemSelect?.(collection.id, 'collection')}
            className={miniMode ? 'h-2.5 w-2.5' : 'h-3 w-3'}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* 展开/收起按钮 */}
        <Button
          variant="ghost"
          size="sm"
          className={`${miniMode ? 'h-3 w-3' : 'h-4 w-4'} p-0 hover:bg-transparent`}
          onClick={handleToggleExpansion}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className={iconSize} />
            ) : (
              <ChevronRight className={iconSize} />
            )
          ) : (
            <div className={iconSize} />
          )}
        </Button>
        
        {/* 文件夹图标和内容 */}
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {isExpanded ? (
            <FolderOpen className={`${iconSize} text-blue-600 flex-shrink-0`} />
          ) : (
            <Folder className={`${iconSize} text-blue-600 flex-shrink-0`} />
          )}
          
          {/* 集合名称或编辑框 */}
          {isEditing ? (
            <InlineEditor
              value={collection.name}
              onSave={handleRename}
              onCancel={() => setIsEditing(false)}
              placeholder={t('enterCollectionName')}
              miniMode={miniMode}
            />
          ) : (
            <>
              <span className={`truncate ${textSize} font-medium`}>{collection.name}</span>
              {/* 请求数量徽章 */}
              {(collection.requests?.length || 0) > 0 && (
                <Badge variant="secondary" className={`${miniMode ? 'text-[8px] px-1 py-0 h-3' : 'text-[9px] px-1 py-0 h-3.5'} ml-1`}>
                  {collection.requests?.length}
                </Badge>
              )}
            </>
          )}
        </div>

        {/* 右键菜单按钮 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`${miniMode ? 'h-3 w-3' : 'h-4 w-4'} p-0 opacity-0 group-hover:opacity-100 hover:bg-gray-200`}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className={iconSize} />
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
                collectionId: collection.id
              };
              addTab(newTab);
              setActiveTab(newTab.id);
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
            <CollectionTreeItemEnhanced
              key={child.id}
              collection={child}
              level={level + 1}
              onSelect={onSelect}
              onRequestSelect={onRequestSelect}
              miniMode={miniMode}
              selectedItems={selectedItems}
              onItemSelect={onItemSelect}
            />
          ))}
          
          {/* 请求项 */}
          {collection.requests?.map((request) => (
            <RequestItemEnhanced
              key={request.id}
              request={request}
              level={level + 1}
              onSelect={onRequestSelect}
              miniMode={miniMode}
              selectedItems={selectedItems}
              onItemSelect={onItemSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 主CollectionTree组件 - 增强版
export const CollectionTreeEnhanced: React.FC<CollectionTreeEnhancedProps> = ({
  showBatchOperations: _showBatchOperations = false,
  enableDragDrop: _enableDragDrop = true,
  miniMode = true
}) => {
  const {
    collections,
    searchQuery,
    searchCollections,
    setSelectedCollection,
    loadCollections,
    expandedCollections: _expandedCollections,
    expandCollection,
    collapseCollection
  } = useCollectionStore();
  
  const t = createTranslator(getDefaultLanguage());
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [batchMode, setBatchMode] = useState(false);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
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

  const handleItemSelect = useCallback((id: string, _type: 'collection' | 'request') => {
    if (!batchMode) return;
    
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, [batchMode]);

  const handleSelectAll = () => {
    const allIds = new Set<string>();
    collections.forEach(col => {
      allIds.add(col.id);
      col.requests?.forEach(req => allIds.add(req.id));
    });
    setSelectedItems(allIds);
  };

  const handleClearSelection = () => {
    setSelectedItems(new Set());
  };

  const handleExpandAll = () => {
    collections.forEach(col => expandCollection(col.id));
  };

  const handleCollapseAll = () => {
    collections.forEach(col => collapseCollection(col.id));
  };

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const searchBarHeight = miniMode ? 'h-5' : 'h-7';
  const buttonHeight = miniMode ? 'h-5' : 'h-7';
  const textSize = miniMode ? 'text-[10px]' : 'text-xs';

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="p-1 border-b border-gray-200 bg-gray-50">
        {/* 搜索框 */}
        <div className="relative mb-1">
          <Search size={miniMode ? 8 : 10} className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder={t('searchCollections')}
            value={searchQuery}
            onChange={(e) => searchCollections(e.target.value)}
            className={`pl-5 ${searchBarHeight} ${textSize} border-gray-300`}
          />
        </div>
        
        {/* 操作按钮 */}
        <div className="flex gap-1 mb-1">
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
              miniMode={miniMode}
            />
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCreating(true)}
              className={`flex-1 ${buttonHeight} ${textSize} justify-start`}
            >
              <Plus size={miniMode ? 8 : 10} className="mr-1" />
              {t('newCollection')}
            </Button>
          )}
          
          {/* 设置按钮 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={`${buttonHeight} px-2`}>
                <Settings size={miniMode ? 8 : 10} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuCheckboxItem
                checked={batchMode}
                onCheckedChange={setBatchMode}
              >
                批量选择模式
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleExpandAll}>
                展开全部
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleCollapseAll}>
                收起全部
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleSelectAll}>
                全选
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleClearSelection}>
                清除选择
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 批量操作栏 */}
        {batchMode && selectedItems.size > 0 && (
          <div className="flex items-center gap-1 p-1 bg-blue-50 rounded-sm border">
            <span className={`${textSize} text-blue-700 flex-1`}>
              已选择 {selectedItems.size} 项
            </span>
            <Button size="sm" variant="outline" className={`${buttonHeight} px-2`}>
              <Move size={miniMode ? 8 : 10} />
            </Button>
            <Button size="sm" variant="outline" className={`${buttonHeight} px-2`}>
              <Copy size={miniMode ? 8 : 10} />
            </Button>
            <Button size="sm" variant="destructive" className={`${buttonHeight} px-2`}>
              <Trash2 size={miniMode ? 8 : 10} />
            </Button>
          </div>
        )}
      </div>

      {/* 集合列表 */}
      <div className="flex-1 overflow-auto">
        {filteredCollections.length === 0 ? (
          <div className="p-2 text-center">
            <div className={`text-gray-400 ${textSize}`}>{t('noCollections')}</div>
          </div>
        ) : (
          <div className="space-y-0.5 p-1">
            {filteredCollections.map((collection) => (
              <CollectionTreeItemEnhanced
                key={collection.id}
                collection={collection}
                level={0}
                onSelect={handleCollectionSelect}
                onRequestSelect={handleRequestSelect}
                miniMode={miniMode}
                selectedItems={batchMode ? selectedItems : undefined}
                onItemSelect={handleItemSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
