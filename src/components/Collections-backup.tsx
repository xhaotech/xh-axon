import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Collection } from '../lib/collections';
import { createTranslator, getDefaultLanguage } from '../lib/i18n';

export const Collections: React.FC = () => {
  const {
    collections,
    activeCollection,
    setActiveCollection,
    createCollection,
    deleteCollection,
    updateCollection
  } = useAppStore();
  
  const [showNewCollectionDialog, setShowNewCollectionDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const t = createTranslator(getDefaultLanguage());

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      createCollection(newCollectionName.trim());
      setNewCollectionName('');
      setShowNewCollectionDialog(false);
    }
  };

  const handleDeleteCollection = (id: string) => {
    if (confirm(t('collections.confirmDelete'))) {
      deleteCollection(id);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between p-2 border-b">
        <h3 className="font-medium">{t('collections.title')}</h3>
        <button
          onClick={() => setShowNewCollectionDialog(true)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {t('collections.new')}
        </button>
      </div>

      {/* 集合列表 */}
      <div className="flex-1 overflow-auto">
        {collections.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {t('collections.empty')}
          </div>
        ) : (
          collections.map((collection) => (
            <div
              key={collection.id}
              className={`p-2 cursor-pointer border-b hover:bg-gray-50 ${
                activeCollection === collection.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => setActiveCollection(collection.id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{collection.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCollection(collection.id);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  {t('common.delete')}
                </button>
              </div>
              {collection.description && (
                <p className="text-sm text-gray-600 mt-1">{collection.description}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* 新建集合对话框 */}
      {showNewCollectionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h4 className="text-lg font-medium mb-4">{t('collections.new')}</h4>
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder={t('collections.namePlaceholder')}
              className="w-full p-2 border rounded mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
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
