import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Collection, CollectionItem } from '../lib/collections';

export const Collections: React.FC = () => {
  const {
    collections,
    activeCollection,
    setActiveCollection,
    createCollection,
    deleteCollection
  } = useAppStore();

  const [showNewCollectionDialog, setShowNewCollectionDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      createCollection(newCollectionName.trim());
      setNewCollectionName('');
      setShowNewCollectionDialog(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
        <h2 className="text-lg font-semibold">集合管理</h2>
        <button
          onClick={() => setShowNewCollectionDialog(true)}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <span>➕</span>
          <span className="text-sm">新建集合</span>
        </button>
      </div>

      {/* 集合列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {collections.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="mb-4">还没有集合，创建一个开始管理你的API请求吧</p>
            <button
              onClick={() => setShowNewCollectionDialog(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              创建第一个集合
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {collections.map(collection => (
              <div key={collection.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{collection.name}</h3>
                    {collection.description && (
                      <p className="text-sm text-gray-500">{collection.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('确定要删除这个集合吗？')) {
                        deleteCollection(collection.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    删除
                  </button>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {collection.items.length} 个项目
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 新建集合对话框 */}
      {showNewCollectionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">新建集合</h3>
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="集合名称"
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700"
              autoFocus
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowNewCollectionDialog(false);
                  setNewCollectionName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button
                onClick={handleCreateCollection}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={!newCollectionName.trim()}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [showNewCollectionDialog, setShowNewCollectionDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showItemMenu, setShowItemMenu] = useState<string | null>(null);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const startRename = (itemId: string, currentName: string) => {
    setEditingItem(itemId);
    setNewName(currentName);
    setShowItemMenu(null);
  };

  const handleRename = (collectionId: string, itemId: string) => {
    if (newName.trim()) {
      renameCollectionItem(collectionId, itemId, newName.trim());
    }
    setEditingItem(null);
    setNewName('');
  };

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      createCollection(newCollectionName.trim());
      setNewCollectionName('');
      setShowNewCollectionDialog(false);
    }
  };

  const handleAddCurrentRequest = (collectionId: string, parentId?: string) => {
    if (activeTab) {
      const currentTab = tabs.find(tab => tab.id === activeTab);
      if (currentTab) {
        addRequestToCollection(collectionId, currentTab, parentId);
      }
    }
    setShowItemMenu(null);
  };

  const renderCollectionItem = (collection: Collection, item: CollectionItem, level = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const isEditing = editingItem === item.id;
    const paddingLeft = `${(level + 1) * 20}px`;

    return (
      <div key={item.id} className="select-none">
        <div 
          className="flex items-center py-1 hover:bg-gray-100 dark:hover:bg-gray-700 group relative"
          style={{ paddingLeft }}
        >
          {/* 展开/折叠按钮 */}
          {item.type === 'folder' && (
            <button
              onClick={() => toggleExpanded(item.id)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-3 h-3" />
              ) : (
                <ChevronRightIcon className="w-3 h-3" />
              )}
            </button>
          )}
          
          {/* 图标 */}
          <div className="mx-2">
            {item.type === 'folder' ? (
              <FolderIcon className="w-4 h-4 text-blue-500" />
            ) : (
              <DocumentIcon className="w-4 h-4 text-green-500" />
            )}
          </div>

          {/* 名称或编辑框 */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => handleRename(collection.id, item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRename(collection.id, item.id);
                  } else if (e.key === 'Escape') {
                    setEditingItem(null);
                    setNewName('');
                  }
                }}
                className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-600 dark:border-gray-500"
                autoFocus
              />
            ) : (
              <span 
                className="block text-sm truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => {
                  if (item.type === 'request' && item.request) {
                    // 打开请求到新标签页
                    // TODO: 实现打开请求功能
                  }
                }}
                title={item.name}
              >
                {item.name}
              </span>
            )}
          </div>

          {/* 菜单按钮 */}
          <button
            onClick={() => setShowItemMenu(showItemMenu === item.id ? null : item.id)}
            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          >
            <EllipsisVerticalIcon className="w-4 h-4" />
          </button>

          {/* 右键菜单 */}
          {showItemMenu === item.id && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md shadow-lg z-10 min-w-40">
              <div className="py-1">
                <button
                  onClick={() => startRename(item.id, item.name)}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('collections.rename')}
                </button>
                
                {item.type === 'folder' && (
                  <>
                    <button
                      onClick={() => {
                        createCollectionFolder(collection.id, t('collections.newFolder'), item.id);
                        setShowItemMenu(null);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t('collections.addFolder')}
                    </button>
                    <button
                      onClick={() => handleAddCurrentRequest(collection.id, item.id)}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      disabled={!activeTab}
                    >
                      {t('collections.addCurrentRequest')}
                    </button>
                  </>
                )}
                
                <div className="border-t dark:border-gray-600 my-1"></div>
                <button
                  onClick={() => {
                    deleteCollectionItem(collection.id, item.id);
                    setShowItemMenu(null);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('collections.delete')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 子项目 */}
        {item.type === 'folder' && isExpanded && item.children && (
          <div>
            {item.children.map(child => renderCollectionItem(collection, child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderCollection = (collection: Collection) => {
    const isActive = activeCollection === collection.id;
    
    return (
      <div key={collection.id} className="mb-4">
        {/* 集合头部 */}
        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center flex-1 min-w-0">
            <button
              onClick={() => setActiveCollection(isActive ? null : collection.id)}
              className="flex items-center flex-1 min-w-0 text-left"
            >
              <span className="font-medium text-sm truncate" title={collection.name}>
                {collection.name}
              </span>
              {collection.description && (
                <span className="ml-2 text-xs text-gray-500 truncate">
                  {collection.description}
                </span>
              )}
            </button>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => createCollectionFolder(collection.id, t('collections.newFolder'))}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              title={t('collections.addFolder')}
            >
              <FolderIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => handleAddCurrentRequest(collection.id)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              title={t('collections.addCurrentRequest')}
              disabled={!activeTab}
            >
              <PlusIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => {
                if (confirm(t('collections.confirmDelete'))) {
                  deleteCollection(collection.id);
                }
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-red-500"
              title={t('collections.delete')}
            >
              <EllipsisVerticalIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 集合内容 */}
        {isActive && (
          <div className="mt-2 border-l-2 border-gray-200 dark:border-gray-600 ml-2">
            {collection.items.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {t('collections.empty')}
              </div>
            ) : (
              <div>
                {collection.items
                  .filter(item => !item.parentId) // 只显示根级项目
                  .map(item => renderCollectionItem(collection, item))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
        <h2 className="text-lg font-semibold">{t('collections.title')}</h2>
        <button
          onClick={() => setShowNewCollectionDialog(true)}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="text-sm">{t('collections.newCollection')}</span>
        </button>
      </div>

      {/* 集合列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {collections.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="mb-4">{t('collections.emptyState')}</p>
            <button
              onClick={() => setShowNewCollectionDialog(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {t('collections.createFirst')}
            </button>
          </div>
        ) : (
          <div>
            {collections.map(collection => renderCollection(collection))}
          </div>
        )}
      </div>

      {/* 新建集合对话框 */}
      {showNewCollectionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">{t('collections.newCollection')}</h3>
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder={t('collections.collectionName')}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700"
              autoFocus
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowNewCollectionDialog(false);
                  setNewCollectionName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleCreateCollection}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={!newCollectionName.trim()}
              >
                {t('common.create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;
