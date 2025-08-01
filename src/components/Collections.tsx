import React, { useState } from 'react';
import { 
  Plus, 
  Folder, 
  FolderOpen, 
  Search, 
  Trash2, 
  Edit3, 
  X,
  Check,
  FileText,
  Calendar
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { createTranslator, getDefaultLanguage } from '../lib/i18n';
import '../styles/collections.css';

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
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const t = createTranslator(getDefaultLanguage());

  // 过滤集合
  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      createCollection(newCollectionName.trim(), newCollectionDescription.trim());
      setNewCollectionName('');
      setNewCollectionDescription('');
      setShowNewCollectionDialog(false);
    }
  };

  const handleDeleteCollection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个集合吗？此操作不可恢复。')) {
      deleteCollection(id);
    }
  };

  const handleStartEdit = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditingName(name);
  };

  const handleSaveEdit = (_id: string) => {
    if (editingName.trim()) {
      // 这里需要添加更新集合名称的功能
      // updateCollection(id, { name: editingName.trim() });
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 美化的头部 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Folder className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t('collections')}</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {collections.length}
            </span>
          </div>
          <button
            onClick={() => setShowNewCollectionDialog(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm button-hover"
          >
            <Plus className="h-4 w-4" />
            <span>{t('newCollection')}</span>
          </button>
        </div>
        
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索集合..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* 美化的集合列表 */}
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {filteredCollections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Folder className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? '未找到匹配的集合' : '还没有集合'}
            </h4>
            <p className="text-gray-500 mb-4">
              {searchTerm ? '尝试调整搜索条件' : '创建您的第一个请求集合来开始'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowNewCollectionDialog(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 button-hover bounce-in"
              >
                <Plus className="h-4 w-4" />
                <span>创建集合</span>
              </button>
            )}
          </div>
        ) : (
          filteredCollections.map((collection, index) => (
            <div
              key={collection.id}
              className={`group relative bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 collection-item-hover collection-item-enter ${
                activeCollection === collection.id 
                  ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' 
                  : ''
              }`}
              style={{
                animationDelay: `${index * 100}ms`
              }}
              onClick={() => setActiveCollection(collection.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeCollection === collection.id 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {activeCollection === collection.id ? (
                      <FolderOpen className="h-5 w-5" />
                    ) : (
                      <Folder className="h-5 w-5" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {editingId === collection.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(collection.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="flex-1 text-lg font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(collection.id)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <h4 className="text-lg font-semibold text-gray-900 truncate">
                        {collection.name}
                      </h4>
                    )}
                    
                    {collection.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {collection.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <FileText className="h-3 w-3" />
                        <span>{collection.items?.filter(item => item.type === 'request').length || 0} 请求</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>创建于 {new Date(collection.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => handleStartEdit(collection.id, collection.name, e)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                    title="重命名"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteCollection(collection.id, e)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                    title="删除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* 活跃状态指示器 */}
              {activeCollection === collection.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r"></div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 美化的新建集合对话框 */}
      {showNewCollectionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md bounce-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900">{t('newCollection')}</h4>
                </div>
                <button
                  onClick={() => {
                    setShowNewCollectionDialog(false);
                    setNewCollectionName('');
                    setNewCollectionDescription('');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    集合名称 *
                  </label>
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="输入集合名称..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors duration-200"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    描述 (可选)
                  </label>
                  <textarea
                    value={newCollectionDescription}
                    onChange={(e) => setNewCollectionDescription(e.target.value)}
                    placeholder="描述这个集合的用途..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-colors duration-200"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowNewCollectionDialog(false);
                    setNewCollectionName('');
                    setNewCollectionDescription('');
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateCollection}
                  disabled={!newCollectionName.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium shadow-sm"
                >
                  创建集合
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;
