import { create } from 'zustand';
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

  // Request history
  history: RequestHistory[];
  addToHistory: (request: RequestHistory) => void;
  clearHistory: () => void;

  // Favorites
  favorites: RequestHistory[];
  addToFavorites: (request: RequestHistory) => void;
  removeFromFavorites: (id: string) => void;

  // UI state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  activePanel: 'history' | 'favorites' | 'environments';
  setActivePanel: (panel: 'history' | 'favorites' | 'environments') => void;

  // Backend connection
  testBackendConnection: () => Promise<boolean>;
}

export const useAppStore = create<AppState>((set) => ({
  // Authentication
  auth: {
    isAuthenticated: false,
    user: null,
    token: null
  },
  login: (user: User, token: string) => 
    set({ auth: { isAuthenticated: true, user, token } }),
  logout: () => 
    set({ auth: { isAuthenticated: false, user: null, token: null } }),

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

  // UI state
  sidebarCollapsed: false,
  setSidebarCollapsed: (sidebarCollapsed: boolean) => set({ sidebarCollapsed }),
  activePanel: 'history' as const,
  setActivePanel: (activePanel: 'history' | 'favorites' | 'environments') => set({ activePanel }),

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
