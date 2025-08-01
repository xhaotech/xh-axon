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
  FolderPlus
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
import { Collection, ApiRequest } from '@/types/collection';

const HTTP_METHOD_COLORS = {
  GET: 'bg-green-100 text-green-800',
  POST: 'bg-blue-100 text-blue-800',
  PUT: 'bg-orange-100 text-orange-800',
  DELETE: 'bg-red-100 text-red-800',
  PATCH: 'bg-yellow-100 text-yellow-800',
  HEAD: 'bg-gray-100 text-gray-800',
  OPTIONS: 'bg-purple-100 text-purple-800'
};

interface CollectionTreeItemProps {
  collection: Collection;
  level: number;
  onSelect: (collection: Collection) => void;
  onRequestSelect: (request: ApiRequest) => void;
}

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

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1 text-sm cursor-pointer hover:bg-accent rounded-sm",
          isSelected && "bg-accent",
          level > 0 && "ml-4"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(collection)}
        onContextMenu={handleContextMenu}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 hover:bg-transparent"
          onClick={handleToggleExpansion}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )
          ) : (
            <div className="h-3 w-3" />
          )}
        </Button>
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-blue-600 flex-shrink-0" />
          ) : (
            <Folder className="h-4 w-4 text-blue-600 flex-shrink-0" />
          )}
          <span className="truncate">{collection.name}</span>
          {(collection.requests?.length || 0) > 0 && (
            <Badge variant="secondary" className="text-xs px-1 py-0">
              {collection.requests?.length}
            </Badge>
          )}
        </div>

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
              <Plus className="h-4 w-4 mr-2" />
              新建请求
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FolderPlus className="h-4 w-4 mr-2" />
              新建文件夹
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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

      {isExpanded && (
        <div>
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
            <RequestTreeItem
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
