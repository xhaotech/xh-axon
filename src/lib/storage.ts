import { RequestTab, Environment, RequestHistory, User } from '../store/useAppStore';

// 存储键名常量
const STORAGE_KEYS = {
  AUTH_TOKEN: 'xh_axon_auth_token',
  AUTH_USER: 'xh_axon_auth_user',
  TABS: 'xh_axon_tabs',
  ACTIVE_TAB: 'xh_axon_active_tab',
  ENVIRONMENTS: 'xh_axon_environments',
  ACTIVE_ENVIRONMENT: 'xh_axon_active_environment',
  HISTORY: 'xh_axon_history',
  FAVORITES: 'xh_axon_favorites',
  SIDEBAR_COLLAPSED: 'xh_axon_sidebar_collapsed',
  ACTIVE_PANEL: 'xh_axon_active_panel',
  LANGUAGE: 'xh_axon_language',
} as const;

// 通用存储工具类
class StorageManager {
  // 基础存储操作
  setItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  }

  getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage:`, error);
    }
  }

  // 认证相关存储
  saveAuth(user: User, token: string): void {
    this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    this.setItem(STORAGE_KEYS.AUTH_USER, user);
  }

  loadAuth(): { user: User | null; token: string | null } {
    const token = this.getItem<string | null>(STORAGE_KEYS.AUTH_TOKEN, null);
    const user = this.getItem<User | null>(STORAGE_KEYS.AUTH_USER, null);
    return { user, token };
  }

  clearAuth(): void {
    this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    this.removeItem(STORAGE_KEYS.AUTH_USER);
  }

  // 标签页相关存储
  saveTabs(tabs: RequestTab[]): void {
    this.setItem(STORAGE_KEYS.TABS, tabs);
  }

  loadTabs(): RequestTab[] {
    return this.getItem<RequestTab[]>(STORAGE_KEYS.TABS, []);
  }

  saveActiveTab(tabId: string | null): void {
    this.setItem(STORAGE_KEYS.ACTIVE_TAB, tabId);
  }

  loadActiveTab(): string | null {
    return this.getItem<string | null>(STORAGE_KEYS.ACTIVE_TAB, null);
  }

  // 环境相关存储
  saveEnvironments(environments: Environment[]): void {
    this.setItem(STORAGE_KEYS.ENVIRONMENTS, environments);
  }

  loadEnvironments(): Environment[] {
    const defaultEnv: Environment = {
      id: 'default',
      name: 'Default',
      variables: {
        baseUrl: 'https://api.example.com',
        apiKey: 'your-api-key'
      }
    };
    return this.getItem<Environment[]>(STORAGE_KEYS.ENVIRONMENTS, [defaultEnv]);
  }

  saveActiveEnvironment(environmentId: string | null): void {
    this.setItem(STORAGE_KEYS.ACTIVE_ENVIRONMENT, environmentId);
  }

  loadActiveEnvironment(): string {
    return this.getItem<string>(STORAGE_KEYS.ACTIVE_ENVIRONMENT, 'default');
  }

  // 历史记录存储
  saveHistory(history: RequestHistory[]): void {
    // 限制历史记录数量，只保存最近的 1000 条
    const limitedHistory = history.slice(-1000);
    this.setItem(STORAGE_KEYS.HISTORY, limitedHistory);
  }

  loadHistory(): RequestHistory[] {
    return this.getItem<RequestHistory[]>(STORAGE_KEYS.HISTORY, []);
  }

  // 收藏夹存储
  saveFavorites(favorites: RequestHistory[]): void {
    this.setItem(STORAGE_KEYS.FAVORITES, favorites);
  }

  loadFavorites(): RequestHistory[] {
    return this.getItem<RequestHistory[]>(STORAGE_KEYS.FAVORITES, []);
  }

  // UI 状态存储
  saveSidebarCollapsed(collapsed: boolean): void {
    this.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed);
  }

  loadSidebarCollapsed(): boolean {
    return this.getItem<boolean>(STORAGE_KEYS.SIDEBAR_COLLAPSED, false);
  }

  // 活动面板状态
  saveActivePanel(panel: 'history' | 'favorites' | 'collections' | 'environments'): void {
    this.setItem(STORAGE_KEYS.ACTIVE_PANEL, panel);
  }

  loadActivePanel(): 'history' | 'favorites' | 'collections' | 'environments' {
    return this.getItem(STORAGE_KEYS.ACTIVE_PANEL, 'collections') as 'history' | 'favorites' | 'collections' | 'environments';
  }

  // 语言设置存储
  saveLanguage(language: string): void {
    this.setItem(STORAGE_KEYS.LANGUAGE, language);
  }

  loadLanguage(): string {
    return this.getItem<string>(STORAGE_KEYS.LANGUAGE, 'zh');
  }

  // 清除所有数据
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.removeItem(key);
    });
  }

  // 导出数据
  exportData(): string {
    const data: Record<string, any> = {};
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          data[key] = JSON.parse(item);
        } catch {
          data[key] = item;
        }
      }
    });
    return JSON.stringify(data, null, 2);
  }

  // 导入数据
  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      Object.entries(data).forEach(([key, value]) => {
        if (Object.values(STORAGE_KEYS).includes(key as any)) {
          this.setItem(key, value);
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // 获取存储使用情况
  getStorageUsage(): { used: number; total: number; percentage: number } {
    let used = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        used += new Blob([item]).size;
      }
    });
    
    const total = 5 * 1024 * 1024; // 5MB localStorage 限制
    const percentage = Math.round((used / total) * 100);
    
    return { used, total, percentage };
  }
}

// 导出单例实例
export const storage = new StorageManager();
