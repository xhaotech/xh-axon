import { create } from 'zustand';
import { storage } from '../lib/storage';
import { httpClient } from '../lib/httpClient';
import { Collection, UserDataManager, CollectionManager } from '../lib/collections';

export interface HttpMethod {
  value: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  label: string;
  color: string;
}

export interface AuthConfig {
  type: 'none' | 'bearer' | 'basic' | 'oauth';
  token?: string;
  username?: string;
  password?: string;
  oauthConfig?: {
    clientId: string;
    clientSecret: string;
    authUrl: string;
    tokenUrl: string;
  };
}

export interface Environment {
  id: string;
  name: string;
  variables: Record<string, string>;
}

export interface RequestHistory {
  id: string;
  userId: string; // 添加用户ID
  url: string;
  method: HttpMethod['value'];
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  response?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: any;
    duration: number;
  };
}

export interface RequestTab {
  id: string;
  name: string;
  url: string;
  method: HttpMethod['value'];
  params: Record<string, string>;
  headers: Record<string, string>;
  body?: string;
  auth: AuthConfig;
  isSaved: boolean;
  isModified: boolean;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

interface AppState {
  // Authentication
  auth: AuthState;
  login: (user: User, token: string) => void;
  logout: () => void;
  initializeAuth: () => void;
  
  // Environment management
  environments: Environment[];
  activeEnvironment: string | null;
  setEnvironments: (environments: Environment[]) => void;
  setActiveEnvironment: (id: string | null) => void;
  addEnvironment: (environment: Environment) => void;
  updateEnvironment: (id: string, environment: Partial<Environment>) => void;
  deleteEnvironment: (id: string) => void;

  // Request tabs
  tabs: RequestTab[];
  activeTab: string | null;
  setTabs: (tabs: RequestTab[]) => void;
  setActiveTab: (id: string | null) => void;
  addTab: (tab: RequestTab) => void;
  updateTab: (id: string, updates: Partial<RequestTab>) => void;
  closeTab: (id: string) => void;
  saveTab: (id: string) => void;
  loadSavedRequests: () => Promise<void>;

  // Request history (per-user)
  history: RequestHistory[];
  addToHistory: (request: RequestHistory) => void;
  clearHistory: () => void;
  loadRequestHistory: () => Promise<void>;
  deleteFromHistory: (id: string) => Promise<void>;

  // Favorites (per-user)
  favorites: RequestHistory[];
  addToFavorites: (request: RequestHistory) => void;
  removeFromFavorites: (id: string) => void;
  addTabToFavorites: (tabId: string) => void;
  loadFavoriteRequests: () => Promise<void>;
  deleteFavorite: (id: string) => Promise<void>;

  // Collections (per-user)
  collections: Collection[];
  activeCollection: string | null;
  setActiveCollection: (id: string | null) => void;
  createCollection: (name: string, description?: string) => void;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  duplicateCollection: (id: string) => void;
  
  // Collection items management
  createCollectionFolder: (collectionId: string, name: string, parentId?: string) => void;
  createCollectionRequest: (collectionId: string, name: string, requestData: any, parentId?: string) => void;
  updateCollectionItem: (collectionId: string, itemId: string, updates: any) => void;
  deleteCollectionItem: (collectionId: string, itemId: string) => void;
  moveCollectionItem: (collectionId: string, itemId: string, newParentId?: string) => void;
  renameCollectionItem: (collectionId: string, itemId: string, newName: string) => void;
  
  // Import/Export
  exportCollections: () => string;
  importCollections: (data: string) => void;
  addRequestToCollection: (collectionId: string, request: RequestTab, parentId?: string) => void;

  // UI state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  activePanel: 'history' | 'favorites' | 'collections' | 'environments';
  setActivePanel: (panel: 'history' | 'favorites' | 'collections' | 'environments') => void;

  // Backend connection
  testBackendConnection: () => Promise<boolean>;

  // 数据初始化
  initializeData: () => void;
  loadUserData: () => void;
  saveUserData: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Authentication
  auth: {
    isAuthenticated: false,
    user: null,
    token: null
  },
  login: (user: User, token: string) => {
    // 使用新的存储系统
    storage.saveAuth(user, token);
    // 更新状态
    set({ auth: { isAuthenticated: true, user, token } });
  },
  logout: () => {
    // 使用新的存储系统清除认证
    storage.clearAuth();
    // 更新状态
    set({ auth: { isAuthenticated: false, user: null, token: null } });
  },
  initializeAuth: () => {
    // 使用新的存储系统恢复认证状态
    try {
      const { user, token } = storage.loadAuth();
      
      if (token && user) {
        set({ auth: { isAuthenticated: true, user, token } });
      }
    } catch (error) {
      console.error('Failed to restore auth state:', error);
      // 如果恢复失败，清除可能损坏的数据
      storage.clearAuth();
    }
  },

  // Environment management
  environments: [
    {
      id: 'default',
      name: 'Default',
      variables: {
        baseUrl: 'https://api.example.com',
        apiKey: 'your-api-key'
      }
    }
  ],
  activeEnvironment: 'default',
  setEnvironments: (environments: Environment[]) => set({ environments }),
  setActiveEnvironment: (activeEnvironment: string | null) => set({ activeEnvironment }),
  addEnvironment: (environment: Environment) => 
    set((state) => ({ environments: [...state.environments, environment] })),
  updateEnvironment: (id: string, updates: Partial<Environment>) =>
    set((state) => ({
      environments: state.environments.map((env) =>
        env.id === id ? { ...env, ...updates } : env
      )
    })),
  deleteEnvironment: (id: string) =>
    set((state) => ({
      environments: state.environments.filter((env) => env.id !== id),
      activeEnvironment: state.activeEnvironment === id ? null : state.activeEnvironment
    })),

  // Request tabs
  tabs: [],
  activeTab: null,
  setTabs: (tabs: RequestTab[]) => {
    storage.saveTabs(tabs);
    set({ tabs });
  },
  setActiveTab: (activeTab: string | null) => {
    storage.saveActiveTab(activeTab);
    set({ activeTab });
  },
  addTab: (tab: RequestTab) => set((state) => {
    const newTabs = [...state.tabs, tab];
    storage.saveTabs(newTabs);
    storage.saveActiveTab(tab.id);
    return { tabs: newTabs, activeTab: tab.id };
  }),
  updateTab: (id: string, updates: Partial<RequestTab>) =>
    set((state) => {
      const newTabs = state.tabs.map((tab) =>
        tab.id === id ? { ...tab, ...updates, isModified: true } : tab
      );
      storage.saveTabs(newTabs);
      return { tabs: newTabs };
    }),
  closeTab: (id: string) =>
    set((state) => {
      const newTabs = state.tabs.filter((tab) => tab.id !== id);
      const activeTab = state.activeTab === id 
        ? (newTabs.length > 0 ? newTabs[0].id : null)
        : state.activeTab;
      storage.saveTabs(newTabs);
      storage.saveActiveTab(activeTab);
      return { tabs: newTabs, activeTab };
    }),
  saveTab: (id: string) =>
    set((state) => {
      const newTabs = state.tabs.map((tab) =>
        tab.id === id ? { ...tab, isSaved: true, isModified: false } : tab
      );
      storage.saveTabs(newTabs);
      return { tabs: newTabs };
    }),

    // Request history
  history: [],
  addToHistory: (request: RequestHistory) =>
    set((state) => {
      const newHistory = [request, ...state.history].slice(0, 1000); // 限制最多1000条记录
      storage.saveHistory(newHistory);
      return { history: newHistory };
    }),
  clearHistory: () => {
    storage.saveHistory([]);
    set({ history: [] });
  },

  // Favorites
  favorites: [],
  addToFavorites: (request: RequestHistory) =>
    set((state) => {
      const newFavorites = [...state.favorites, request];
      storage.saveFavorites(newFavorites);
      return { favorites: newFavorites };
    }),
  removeFromFavorites: (id: string) =>
    set((state) => {
      const newFavorites = state.favorites.filter((fav) => fav.id !== id);
      storage.saveFavorites(newFavorites);
      return { favorites: newFavorites };
    }),
  addTabToFavorites: (tabId: string) =>
    set((state) => {
      if (!state.auth.user) return state;
      
      const tab = state.tabs.find(t => t.id === tabId);
      if (tab) {
        const favoriteItem: RequestHistory = {
          id: Date.now().toString(),
          userId: state.auth.user.id,
          url: tab.url,
          method: tab.method,
          headers: tab.headers,
          body: tab.body,
          timestamp: Date.now()
        };
        const newFavorites = [...state.favorites, favoriteItem];
        storage.saveFavorites(newFavorites);
        return { favorites: newFavorites };
      }
      return state;
    }),

  // UI state
  sidebarCollapsed: storage.loadSidebarCollapsed(),
  setSidebarCollapsed: (sidebarCollapsed: boolean) => {
    storage.saveSidebarCollapsed(sidebarCollapsed);
    set({ sidebarCollapsed });
  },
  activePanel: storage.loadActivePanel(),
  setActivePanel: (activePanel: 'history' | 'favorites' | 'collections' | 'environments') => {
    storage.saveActivePanel(activePanel);
    set({ activePanel });
  },

  // Collections
  collections: [],
  activeCollection: null,
  setActiveCollection: (activeCollection: string | null) => {
    set({ activeCollection });
  },
  
  createCollection: (name: string, description?: string) => {
    set((state) => {
      if (!state.auth.user) return state;
      
      const newCollection = CollectionManager.createCollection(name, state.auth.user.id);
      if (description) {
        newCollection.description = description;
      }
      
      const newCollections = [...state.collections, newCollection];
      UserDataManager.saveUserData({
        userId: state.auth.user.id,
        collections: newCollections,
        history: state.history,
        favorites: state.favorites
      });
      
      return { collections: newCollections };
    });
  },
  
  updateCollection: (id: string, updates: Partial<Collection>) => {
    set((state) => {
      if (!state.auth.user) return state;
      
      const newCollections = state.collections.map(collection =>
        collection.id === id ? { ...collection, ...updates, updatedAt: Date.now() } : collection
      );
      
      UserDataManager.saveUserData({
        userId: state.auth.user.id,
        collections: newCollections,
        history: state.history,
        favorites: state.favorites
      });
      
      return { collections: newCollections };
    });
  },
  
  deleteCollection: (id: string) => {
    set((state) => {
      if (!state.auth.user) return state;
      
      const newCollections = state.collections.filter(collection => collection.id !== id);
      
      UserDataManager.saveUserData({
        userId: state.auth.user.id,
        collections: newCollections,
        history: state.history,
        favorites: state.favorites
      });
      
      return { 
        collections: newCollections,
        activeCollection: state.activeCollection === id ? null : state.activeCollection
      };
    });
  },
  
  duplicateCollection: (id: string) => {
    set((state) => {
      if (!state.auth.user) return state;
      
      const originalCollection = state.collections.find(c => c.id === id);
      if (!originalCollection) return state;
      
      const duplicatedCollection = {
        ...originalCollection,
        id: `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${originalCollection.name} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const newCollections = [...state.collections, duplicatedCollection];
      
      UserDataManager.saveUserData({
        userId: state.auth.user.id,
        collections: newCollections,
        history: state.history,
        favorites: state.favorites
      });
      
      return { collections: newCollections };
    });
  },
  
  createCollectionFolder: (collectionId: string, name: string, parentId?: string) => {
    set((state) => {
      if (!state.auth.user) return state;
      
      const newCollections = state.collections.map(collection => {
        if (collection.id === collectionId) {
          const newFolder = CollectionManager.createFolder(name, collectionId, state.auth.user!.id, parentId);
          return {
            ...collection,
            items: [...collection.items, newFolder],
            updatedAt: Date.now()
          };
        }
        return collection;
      });
      
      UserDataManager.saveUserData({
        userId: state.auth.user.id,
        collections: newCollections,
        history: state.history,
        favorites: state.favorites
      });
      
      return { collections: newCollections };
    });
  },
  
  createCollectionRequest: (collectionId: string, name: string, requestData: any, parentId?: string) => {
    set((state) => {
      if (!state.auth.user) return state;
      
      const newCollections = state.collections.map(collection => {
        if (collection.id === collectionId) {
          const newRequest = CollectionManager.createRequest(
            name, 
            collectionId, 
            state.auth.user!.id, 
            requestData, 
            parentId
          );
          return {
            ...collection,
            items: [...collection.items, newRequest],
            updatedAt: Date.now()
          };
        }
        return collection;
      });
      
      UserDataManager.saveUserData({
        userId: state.auth.user.id,
        collections: newCollections,
        history: state.history,
        favorites: state.favorites
      });
      
      return { collections: newCollections };
    });
  },
  
  updateCollectionItem: (collectionId: string, itemId: string, updates: any) => {
    set((state) => {
      if (!state.auth.user) return state;
      
      const updateItemRecursively = (items: any[]): any[] => {
        return items.map(item => {
          if (item.id === itemId) {
            return { ...item, ...updates, updatedAt: Date.now() };
          }
          if (item.children) {
            return { ...item, children: updateItemRecursively(item.children) };
          }
          return item;
        });
      };
      
      const newCollections = state.collections.map(collection => {
        if (collection.id === collectionId) {
          return {
            ...collection,
            items: updateItemRecursively(collection.items),
            updatedAt: Date.now()
          };
        }
        return collection;
      });
      
      UserDataManager.saveUserData({
        userId: state.auth.user.id,
        collections: newCollections,
        history: state.history,
        favorites: state.favorites
      });
      
      return { collections: newCollections };
    });
  },
  
  deleteCollectionItem: (collectionId: string, itemId: string) => {
    set((state) => {
      if (!state.auth.user) return state;
      
      const newCollections = state.collections.map(collection => {
        if (collection.id === collectionId) {
          return {
            ...collection,
            items: CollectionManager.removeItem(collection.items, itemId),
            updatedAt: Date.now()
          };
        }
        return collection;
      });
      
      UserDataManager.saveUserData({
        userId: state.auth.user.id,
        collections: newCollections,
        history: state.history,
        favorites: state.favorites
      });
      
      return { collections: newCollections };
    });
  },
  
  moveCollectionItem: (collectionId: string, itemId: string, newParentId?: string) => {
    set((state) => {
      if (!state.auth.user) return state;
      
      const newCollections = state.collections.map(collection => {
        if (collection.id === collectionId) {
          return {
            ...collection,
            items: CollectionManager.moveItem(collection.items, itemId, newParentId),
            updatedAt: Date.now()
          };
        }
        return collection;
      });
      
      UserDataManager.saveUserData({
        userId: state.auth.user.id,
        collections: newCollections,
        history: state.history,
        favorites: state.favorites
      });
      
      return { collections: newCollections };
    });
  },
  
  renameCollectionItem: (collectionId: string, itemId: string, newName: string) => {
    set((state) => {
      if (!state.auth.user) return state;
      
      const newCollections = state.collections.map(collection => {
        if (collection.id === collectionId) {
          return {
            ...collection,
            items: CollectionManager.renameItem(collection.items, itemId, newName),
            updatedAt: Date.now()
          };
        }
        return collection;
      });
      
      UserDataManager.saveUserData({
        userId: state.auth.user.id,
        collections: newCollections,
        history: state.history,
        favorites: state.favorites
      });
      
      return { collections: newCollections };
    });
  },
  
  exportCollections: (): string => {
    const state = useAppStore.getState() as AppState;
    return JSON.stringify({
      collections: state.collections,
      exportedAt: Date.now(),
      version: '1.0'
    }, null, 2);
  },
  
  importCollections: (data: string) => {
    try {
      const importedData = JSON.parse(data);
      if (importedData.collections && Array.isArray(importedData.collections)) {
        set((state) => {
          if (!state.auth.user) return state;
          
          // 更新用户ID为当前用户
          const updatedCollections = importedData.collections.map((collection: Collection) => ({
            ...collection,
            userId: state.auth.user!.id,
            id: `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            items: collection.items.map(item => ({
              ...item,
              userId: state.auth.user!.id,
              collectionId: `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }))
          }));
          
          const newCollections = [...state.collections, ...updatedCollections];
          
          UserDataManager.saveUserData({
            userId: state.auth.user.id,
            collections: newCollections,
            history: state.history,
            favorites: state.favorites
          });
          
          return { collections: newCollections };
        });
      }
    } catch (error) {
      console.error('Failed to import collections:', error);
    }
  },
  
  addRequestToCollection: (collectionId: string, request: RequestTab, parentId?: string) => {
    set((state) => {
      if (!state.auth.user) return state;
      
      const requestData = {
        url: request.url,
        method: request.method,
        headers: request.headers,
        params: {},
        body: request.body,
        auth: request.auth
      };
      
      const newCollections = state.collections.map(collection => {
        if (collection.id === collectionId) {
          const newRequest = CollectionManager.createRequest(
            request.name, 
            collectionId, 
            state.auth.user!.id, 
            requestData, 
            parentId
          );
          return {
            ...collection,
            items: [...collection.items, newRequest],
            updatedAt: Date.now()
          };
        }
        return collection;
      });
      
      UserDataManager.saveUserData({
        userId: state.auth.user.id,
        collections: newCollections,
        history: state.history,
        favorites: state.favorites
      });
      
      return { collections: newCollections };
    });
  },

  // Load saved and favorite requests
  loadSavedRequests: async () => {
    const state = useAppStore.getState() as AppState;
    if (!state.auth.user) return;
    
    try {
      const response = await httpClient.getRequestHistory();
      if (response.success && response.data?.history) {
        // 将历史请求转换为 history 格式
        const historyItems = response.data.history.map((req: any) => ({
          id: req.id,
          userId: state.auth.user!.id,
          url: req.url,
          method: req.method,
          headers: req.headers || {},
          body: req.body || '',
          timestamp: new Date(req.created_at).getTime(),
          response: null
        }));
        
        set({ history: historyItems });
        console.log('Loaded request history:', historyItems.length);
      }
    } catch (error) {
      console.error('Failed to load request history:', error);
    }
  },

  loadRequestHistory: async () => {
    const state = useAppStore.getState() as AppState;
    if (!state.auth.user) return;
    
    try {
      const response = await httpClient.getRequestHistory();
      if (response.success && response.data?.history) {
        const historyItems = response.data.history.map((req: any) => ({
          id: req.id,
          userId: state.auth.user!.id,
          url: req.url,
          method: req.method,
          headers: req.headers || {},
          body: req.body || '',
          timestamp: new Date(req.created_at).getTime(),
          response: null
        }));
        
        set({ history: historyItems });
        console.log('Loaded request history:', historyItems.length);
      }
    } catch (error) {
      console.error('Failed to load request history:', error);
    }
  },

  deleteFromHistory: async (id: string) => {
    try {
      const response = await httpClient.deleteHistory(id);
      if (response.success) {
        set((state) => ({
          history: state.history.filter(item => item.id !== id)
        }));
        console.log('Deleted from history:', id);
      }
    } catch (error) {
      console.error('Failed to delete from history:', error);
    }
  },

  loadFavoriteRequests: async () => {
    const state = useAppStore.getState() as AppState;
    if (!state.auth.user) return;
    
    try {
      const response = await httpClient.getFavoriteRequests();
      if (response.success && response.data?.favorites) {
        // 将收藏请求转换为 favorites 格式
        const favoriteItems = response.data.favorites.map((req: any) => ({
          id: req.id,
          userId: state.auth.user!.id,
          url: req.url,
          method: req.method,
          headers: req.headers || {},
          body: req.body || '',
          timestamp: new Date(req.created_at).getTime(),
          response: null // 收藏的请求没有响应数据
        }));
        
        set({ favorites: favoriteItems });
        console.log('Loaded favorite requests:', favoriteItems.length);
      }
    } catch (error) {
      console.error('Failed to load favorite requests:', error);
    }
  },

  deleteFavorite: async (id: string) => {
    try {
      const response = await httpClient.deleteFavorite(id);
      if (response.success) {
        set((state) => ({
          favorites: state.favorites.filter(item => item.id !== id)
        }));
        console.log('Deleted favorite:', id);
      }
    } catch (error) {
      console.error('Failed to delete favorite:', error);
    }
  },

  // Backend connection test
  testBackendConnection: async () => {
    try {
      const isHealthy = await httpClient.checkHealth();
      console.log('Backend connection test:', isHealthy ? 'SUCCESS' : 'FAILED');
      return isHealthy;
    } catch (error) {
      console.error('Backend connection error:', error);
      return false;
    }
  },

  // 数据初始化
  initializeData: () => {
    // 恢复标签页数据
    const savedTabs = storage.loadTabs();
    const savedActiveTab = storage.loadActiveTab();
    if (savedTabs.length > 0) {
      set({ 
        tabs: savedTabs,
        activeTab: savedActiveTab && savedTabs.find(t => t.id === savedActiveTab) ? savedActiveTab : savedTabs[0].id
      });
    }

    // 恢复环境数据
    const savedEnvironments = storage.loadEnvironments();
    const savedActiveEnvironment = storage.loadActiveEnvironment();
    set({ 
      environments: savedEnvironments,
      activeEnvironment: savedActiveEnvironment
    });

    // 恢复历史记录和收藏夹（从本地存储）
    const savedHistory = storage.loadHistory();
    const savedFavorites = storage.loadFavorites();
    set({ 
      history: savedHistory,
      favorites: savedFavorites
    });

    console.log('Data initialized from storage');
  },

  // 加载用户数据
  loadUserData: () => {
    const state = useAppStore.getState();
    if (!state.auth.user) return;

    const userData = UserDataManager.getUserData(state.auth.user.id);
    set({
      history: userData.history,
      favorites: userData.favorites,
      collections: userData.collections
    });
    console.log('User data loaded for user:', state.auth.user.id);
  },

  // 保存用户数据
  saveUserData: () => {
    const state = useAppStore.getState();
    if (!state.auth.user) return;

    UserDataManager.saveUserData({
      userId: state.auth.user.id,
      history: state.history,
      favorites: state.favorites,
      collections: state.collections
    });
    console.log('User data saved for user:', state.auth.user.id);
  }
}));
