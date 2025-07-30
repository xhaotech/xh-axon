import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { httpClient } from '../lib/httpClient';

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

  // Request history
  history: RequestHistory[];
  addToHistory: (request: RequestHistory) => void;
  clearHistory: () => void;

  // Favorites
  favorites: RequestHistory[];
  addToFavorites: (request: RequestHistory) => void;
  removeFromFavorites: (id: string) => void;
  addTabToFavorites: (tabId: string) => void;
  loadFavoriteRequests: () => Promise<void>;

  // UI state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  activePanel: 'history' | 'favorites' | 'environments';
  setActivePanel: (panel: 'history' | 'favorites' | 'environments') => void;

  // Backend connection
  testBackendConnection: () => Promise<boolean>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Authentication
  auth: {
    isAuthenticated: false,
    user: null,
    token: null
  },
  login: (user: User, token: string) => {
    // 保存到 localStorage
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    // 更新状态
    set({ auth: { isAuthenticated: true, user, token } });
  },
  logout: () => {
    // 清除 localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    // 更新状态
    set({ auth: { isAuthenticated: false, user: null, token: null } });
  },
  initializeAuth: () => {
    // 从 localStorage 恢复认证状态
    try {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('auth_user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ auth: { isAuthenticated: true, user, token } });
      }
    } catch (error) {
      console.error('Failed to restore auth state:', error);
      // 如果恢复失败，清除可能损坏的数据
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
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
  setTabs: (tabs: RequestTab[]) => set({ tabs }),
  setActiveTab: (activeTab: string | null) => set({ activeTab }),
  addTab: (tab: RequestTab) => set((state) => ({ 
    tabs: [...state.tabs, tab],
    activeTab: tab.id
  })),
  updateTab: (id: string, updates: Partial<RequestTab>) =>
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id ? { ...tab, ...updates, isModified: true } : tab
      )
    })),
  closeTab: (id: string) =>
    set((state) => {
      const newTabs = state.tabs.filter((tab) => tab.id !== id);
      const activeTab = state.activeTab === id 
        ? (newTabs.length > 0 ? newTabs[0].id : null)
        : state.activeTab;
      return { tabs: newTabs, activeTab };
    }),
  saveTab: (id: string) =>
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id ? { ...tab, isSaved: true, isModified: false } : tab
      )
    })),

  // Request history
  history: [],
  addToHistory: (request: RequestHistory) =>
    set((state) => ({ 
      history: [request, ...state.history.slice(0, 99)] // Keep last 100 requests
    })),
  clearHistory: () => set({ history: [] }),

  // Favorites
  favorites: [],
  addToFavorites: (request: RequestHistory) =>
    set((state) => ({ favorites: [...state.favorites, request] })),
  removeFromFavorites: (id: string) =>
    set((state) => ({ 
      favorites: state.favorites.filter((fav) => fav.id !== id) 
    })),
  addTabToFavorites: (tabId: string) =>
    set((state) => {
      const tab = state.tabs.find(t => t.id === tabId);
      if (tab) {
        const favoriteItem: RequestHistory = {
          id: Date.now().toString(),
          url: tab.url,
          method: tab.method,
          headers: tab.headers,
          body: tab.body,
          timestamp: Date.now()
        };
        return { favorites: [...state.favorites, favoriteItem] };
      }
      return state;
    }),

  // UI state
  sidebarCollapsed: false,
  setSidebarCollapsed: (sidebarCollapsed: boolean) => set({ sidebarCollapsed }),
  activePanel: 'history' as const,
  setActivePanel: (activePanel: 'history' | 'favorites' | 'environments') => set({ activePanel }),

  // Load saved and favorite requests
  loadSavedRequests: async () => {
    try {
      const response = await httpClient.getSavedRequests();
      if (response.success && response.data?.requests) {
        // 将保存的请求转换为 tabs 格式并添加到 tabs 中
        const savedTabs = response.data.requests.map((req: any) => ({
          id: req.id,
          name: req.name,
          url: req.url,
          method: req.method,
          params: req.params || {},
          headers: req.headers || {},
          body: req.body || '',
          auth: req.auth || { type: 'none' },
          isSaved: true
        }));
        
        // 合并到现有 tabs 中（避免重复）
        const currentTabs = get().tabs;
        const newTabs = savedTabs.filter((savedTab: any) => 
          !currentTabs.some(tab => tab.id === savedTab.id)
        );
        
        if (newTabs.length > 0) {
          set({ tabs: [...currentTabs, ...newTabs] });
          console.log('Loaded saved requests:', newTabs.length);
        }
      }
    } catch (error) {
      console.error('Failed to load saved requests:', error);
    }
  },

  loadFavoriteRequests: async () => {
    try {
      const response = await httpClient.getFavoriteRequests();
      if (response.success && response.data?.favorites) {
        // 将收藏请求转换为 favorites 格式
        const favoriteItems = response.data.favorites.map((req: any) => ({
          id: req.id,
          url: req.url,
          method: req.method,
          headers: req.headers || {},
          body: req.body || '',
          timestamp: new Date(req.timestamp).getTime(),
          response: null // 收藏的请求没有响应数据
        }));
        
        set({ favorites: favoriteItems });
        console.log('Loaded favorite requests:', favoriteItems.length);
      }
    } catch (error) {
      console.error('Failed to load favorite requests:', error);
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
  }
}));
