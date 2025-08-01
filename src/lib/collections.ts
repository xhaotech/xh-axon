// Collections 数据模型和类型定义

export interface CollectionItem {
  id: string;
  name: string;
  type: 'request' | 'folder';
  parentId?: string; // 父文件夹ID，根目录为undefined
  collectionId: string; // 所属集合ID
  userId: string; // 所属用户ID
  createdAt: number;
  updatedAt: number;
  
  // 如果是请求，包含请求详情
  request?: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    headers: Record<string, string>;
    params: Record<string, string>;
    body?: string;
    auth?: {
      type: 'none' | 'bearer' | 'basic' | 'oauth';
      token?: string;
      username?: string;
      password?: string;
    };
  };
  
  // 如果是文件夹，包含子项目
  children?: CollectionItem[];
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  userId: string; // 所属用户ID
  isShared: boolean; // 是否共享
  items: CollectionItem[];
  createdAt: number;
  updatedAt: number;
}

export interface UserData {
  userId: string;
  history: RequestHistory[];
  favorites: RequestHistory[];
  collections: Collection[];
}

export interface RequestHistory {
  id: string;
  userId: string; // 所属用户ID
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
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

// 集合操作的辅助函数
export class CollectionManager {
  // 创建新集合
  static createCollection(name: string, userId: string): Collection {
    return {
      id: `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: '',
      userId,
      isShared: false,
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  // 创建新文件夹
  static createFolder(name: string, collectionId: string, userId: string, parentId?: string): CollectionItem {
    return {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: 'folder',
      parentId,
      collectionId,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      children: []
    };
  }

  // 创建新请求
  static createRequest(
    name: string, 
    collectionId: string, 
    userId: string, 
    request: CollectionItem['request'], 
    parentId?: string
  ): CollectionItem {
    return {
      id: `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: 'request',
      parentId,
      collectionId,
      userId,
      request,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  // 递归查找项目
  static findItem(items: CollectionItem[], itemId: string): CollectionItem | null {
    for (const item of items) {
      if (item.id === itemId) {
        return item;
      }
      if (item.children) {
        const found = this.findItem(item.children, itemId);
        if (found) return found;
      }
    }
    return null;
  }

  // 递归查找父项目
  static findParent(items: CollectionItem[], itemId: string): CollectionItem | null {
    for (const item of items) {
      if (item.children) {
        if (item.children.some(child => child.id === itemId)) {
          return item;
        }
        const found = this.findParent(item.children, itemId);
        if (found) return found;
      }
    }
    return null;
  }

  // 移动项目到新位置
  static moveItem(
    items: CollectionItem[], 
    itemId: string, 
    newParentId?: string
  ): CollectionItem[] {
    // 找到要移动的项目
    const item = this.findItem(items, itemId);
    if (!item) return items;

    // 从原位置移除
    const newItems = this.removeItem(items, itemId);
    
    // 更新父ID
    item.parentId = newParentId;
    item.updatedAt = Date.now();

    // 添加到新位置
    if (newParentId) {
      // 找到新父文件夹并添加
      const addToParent = (items: CollectionItem[]): CollectionItem[] => {
        return items.map(currentItem => {
          if (currentItem.id === newParentId && currentItem.type === 'folder') {
            return {
              ...currentItem,
              children: [...(currentItem.children || []), item],
              updatedAt: Date.now()
            };
          }
          if (currentItem.children) {
            return {
              ...currentItem,
              children: addToParent(currentItem.children)
            };
          }
          return currentItem;
        });
      };
      return addToParent(newItems);
    } else {
      // 移动到根目录
      return [...newItems, item];
    }
  }

  // 删除项目
  static removeItem(items: CollectionItem[], itemId: string): CollectionItem[] {
    return items.filter(item => item.id !== itemId).map(item => ({
      ...item,
      children: item.children ? this.removeItem(item.children, itemId) : undefined
    }));
  }

  // 重命名项目
  static renameItem(items: CollectionItem[], itemId: string, newName: string): CollectionItem[] {
    return items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          name: newName,
          updatedAt: Date.now()
        };
      }
      if (item.children) {
        return {
          ...item,
          children: this.renameItem(item.children, itemId, newName)
        };
      }
      return item;
    });
  }

  // 获取扁平化的项目列表（用于搜索）
  static flattenItems(items: CollectionItem[]): CollectionItem[] {
    const result: CollectionItem[] = [];
    
    const flatten = (items: CollectionItem[]) => {
      for (const item of items) {
        result.push(item);
        if (item.children) {
          flatten(item.children);
        }
      }
    };
    
    flatten(items);
    return result;
  }

  // 搜索项目
  static searchItems(items: CollectionItem[], query: string): CollectionItem[] {
    const flatItems = this.flattenItems(items);
    return flatItems.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      (item.request?.url?.toLowerCase().includes(query.toLowerCase()))
    );
  }

  // 获取项目路径（面包屑导航用）
  static getItemPath(items: CollectionItem[], itemId: string): string[] {
    const path: string[] = [];
    
    const findPath = (items: CollectionItem[], targetId: string, currentPath: string[]): boolean => {
      for (const item of items) {
        const newPath = [...currentPath, item.name];
        
        if (item.id === targetId) {
          path.push(...newPath);
          return true;
        }
        
        if (item.children && findPath(item.children, targetId, newPath)) {
          return true;
        }
      }
      return false;
    };
    
    findPath(items, itemId, []);
    return path;
  }
}

// 用户数据管理器
export class UserDataManager {
  private static storageKey = 'xh_axon_user_data';

  // 获取用户数据
  static getUserData(userId: string): UserData {
    try {
      const allUserData = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      return allUserData[userId] || {
        userId,
        history: [],
        favorites: [],
        collections: []
      };
    } catch (error) {
      console.error('Failed to load user data:', error);
      return {
        userId,
        history: [],
        favorites: [],
        collections: []
      };
    }
  }

  // 保存用户数据
  static saveUserData(userData: UserData): void {
    try {
      const allUserData = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      allUserData[userData.userId] = userData;
      localStorage.setItem(this.storageKey, JSON.stringify(allUserData));
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  }

  // 添加历史记录
  static addToHistory(userId: string, record: Omit<RequestHistory, 'id' | 'userId'>): void {
    const userData = this.getUserData(userId);
    const historyItem: RequestHistory = {
      ...record,
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId
    };
    
    // 避免重复，检查相同URL和方法的请求
    const existing = userData.history.findIndex(h => 
      h.url === historyItem.url && h.method === historyItem.method
    );
    
    if (existing >= 0) {
      userData.history.splice(existing, 1);
    }
    
    userData.history.unshift(historyItem);
    
    // 限制历史记录数量
    if (userData.history.length > 1000) {
      userData.history = userData.history.slice(0, 1000);
    }
    
    this.saveUserData(userData);
  }

  // 添加到收藏
  static addToFavorites(userId: string, record: Omit<RequestHistory, 'id' | 'userId'>): void {
    const userData = this.getUserData(userId);
    const favoriteItem: RequestHistory = {
      ...record,
      id: `favorite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId
    };
    
    // 检查是否已存在
    const existing = userData.favorites.find(f => 
      f.url === favoriteItem.url && f.method === favoriteItem.method
    );
    
    if (!existing) {
      userData.favorites.unshift(favoriteItem);
      this.saveUserData(userData);
    }
  }

  // 从收藏中移除
  static removeFromFavorites(userId: string, itemId: string): void {
    const userData = this.getUserData(userId);
    userData.favorites = userData.favorites.filter(f => f.id !== itemId);
    this.saveUserData(userData);
  }

  // 清除历史记录
  static clearHistory(userId: string): void {
    const userData = this.getUserData(userId);
    userData.history = [];
    this.saveUserData(userData);
  }
}
