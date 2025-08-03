import React from 'react';
import { History, Star, Plus, Search, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { createTranslator, getDefaultLanguage } from '../lib/i18n';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

export const Sidebar: React.FC = () => {
  const {
    sidebarCollapsed,
    activePanel,
    setActivePanel,
    history,
    favorites,
    addTab,
    deleteFromHistory,
    deleteFavorite,
  } = useAppStore();
  
  const t = createTranslator(getDefaultLanguage());

  const handleNewRequest = () => {
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
      isModified: false
    };
    addTab(newTab);
  };

  if (sidebarCollapsed) return null;

  const tabs = [
    { id: 'history', label: t('history'), icon: History },
    { id: 'favorites', label: t('favorites'), icon: Star },
  ];

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-10 bottom-6">
      {/* New Request Button */}
      <div className="p-2 border-b border-gray-200">
        <Button
          onClick={handleNewRequest}
          className="w-full justify-center h-8 text-xs font-medium"
          size="sm"
        >
          <Plus size={12} className="mr-1" />
          {t('createNewRequest')}
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activePanel === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActivePanel(tab.id as any)}
            className={`
              flex-1 justify-center h-8 text-xs font-medium rounded-none border-b-2 border-transparent
              ${activePanel === tab.id 
                ? 'bg-white text-blue-600 border-b-blue-600 hover:bg-white' 
                : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
          >
            <tab.icon size={10} className="mr-1" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {/* History Panel */}
        {activePanel === 'history' && (
          <div className="h-full flex flex-col">
            <div className="p-2">
              <div className="relative mb-2">
                <Search size={10} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <Input
                  type="text"
                  placeholder={t('searchHistory')}
                  className="pl-6 h-7 text-xs"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {history.length === 0 ? (
                <div className="p-2 text-center">
                  <div className="text-gray-400 text-xs">{t('noHistory')}</div>
                </div>
              ) : (
                <div className="space-y-1 px-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => {
                        const newTab = {
                          id: Date.now().toString(),
                          name: `${item.method} ${item.url}`,
                          url: item.url,
                          method: item.method,
                          params: {},
                          headers: item.headers || {},
                          auth: { 
                            type: 'basic' as const,
                            username: 'wecise.admin',
                            password: 'admin'
                          },
                          isSaved: false,
                          isModified: false
                        };
                        addTab(newTab);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={
                              item.method === 'GET' ? 'secondary' :
                              item.method === 'POST' ? 'default' :
                              item.method === 'PUT' ? 'outline' :
                              item.method === 'DELETE' ? 'destructive' :
                              'secondary'
                            }
                            className={`
                              text-xs font-medium
                              ${item.method === 'GET' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                item.method === 'POST' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                                item.method === 'PUT' ? 'bg-orange-100 text-orange-700 hover:bg-orange-100' :
                                item.method === 'DELETE' ? '' :
                                'bg-gray-100 text-gray-700 hover:bg-gray-100'
                              }
                            `}
                          >
                            {item.method}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 truncate mt-1">{item.url}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFromHistory(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 h-auto hover:bg-gray-200"
                      >
                        <Trash2 size={10} className="text-gray-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Favorites Panel */}
        {activePanel === 'favorites' && (
          <div className="h-full flex flex-col">
            <div className="p-2">
              <div className="relative mb-2">
                <Search size={10} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <Input
                  type="text"
                  placeholder={t('searchFavorites')}
                  className="pl-6 h-7 text-xs"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {favorites.length === 0 ? (
                <div className="p-2 text-center">
                  <div className="text-gray-400 text-xs">{t('noFavorites')}</div>
                </div>
              ) : (
                <div className="space-y-1 px-2">
                  {favorites.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => {
                        const newTab = {
                          id: Date.now().toString(),
                          name: `${item.method} ${item.url}`,
                          url: item.url,
                          method: item.method,
                          params: {},
                          headers: item.headers || {},
                          auth: { 
                            type: 'basic' as const,
                            username: 'wecise.admin',
                            password: 'admin'
                          },
                          isSaved: false,
                          isModified: false
                        };
                        addTab(newTab);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={
                              item.method === 'GET' ? 'secondary' :
                              item.method === 'POST' ? 'default' :
                              item.method === 'PUT' ? 'outline' :
                              item.method === 'DELETE' ? 'destructive' :
                              'secondary'
                            }
                            className={`
                              text-xs font-medium
                              ${item.method === 'GET' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                item.method === 'POST' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                                item.method === 'PUT' ? 'bg-orange-100 text-orange-700 hover:bg-orange-100' :
                                item.method === 'DELETE' ? '' :
                                'bg-gray-100 text-gray-700 hover:bg-gray-100'
                              }
                            `}
                          >
                            {item.method}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 truncate mt-1">{item.url}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFavorite(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 h-auto hover:bg-gray-200"
                      >
                        <Trash2 size={10} className="text-gray-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
