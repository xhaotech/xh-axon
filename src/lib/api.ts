// API 配置
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3100',
  TIMEOUT: 30000,
  VERSION: 'v1'
};

export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/api/auth/login',
    PHONE_LOGIN: '/api/auth/phone-login',
    SEND_SMS: '/api/auth/send-sms',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    VERIFY_TOKEN: '/api/auth/verify'
  },
  
  // 用户相关
  USER: {
    PROFILE: '/api/users/profile',
    SESSIONS: '/api/users/sessions'
  },
  
  // 请求历史
  HISTORY: {
    LIST: '/api/history',
    DETAIL: '/api/history/:id',
    DELETE: '/api/history/:id',
    BATCH_DELETE: '/api/history'
  },
  
  // 收藏夹
  FAVORITES: {
    LIST: '/api/favorites',
    FOLDERS: '/api/favorites/folders',
    DETAIL: '/api/favorites/:id',
    CREATE: '/api/favorites',
    UPDATE: '/api/favorites/:id',
    DELETE: '/api/favorites/:id'
  },
  
  // 环境变量
  ENVIRONMENTS: {
    LIST: '/api/environments',
    DETAIL: '/api/environments/:id',
    CREATE: '/api/environments',
    UPDATE: '/api/environments/:id',
    DELETE: '/api/environments/:id',
    ACTIVATE: '/api/environments/:id/activate',
    DUPLICATE: '/api/environments/:id/duplicate'
  },

  // 集合管理
  COLLECTIONS: {
    LIST: '/api/collections',
    DETAIL: '/api/collections/:id',
    CREATE: '/api/collections',
    UPDATE: '/api/collections/:id',
    DELETE: '/api/collections/:id',
    MOVE: '/api/collections/:id/move'
  },

  // 请求管理
  REQUESTS: {
    LIST: '/api/requests',
    DETAIL: '/api/requests/:id',
    CREATE: '/api/requests',
    UPDATE: '/api/requests/:id',
    DELETE: '/api/requests/:id',
    MOVE: '/api/requests/:id/move',
    DUPLICATE: '/api/requests/:id/duplicate',
    BY_COLLECTION: '/api/collections/:collectionId/requests'
  },
  
  // HTTP 代理
  PROXY: {
    REQUEST: '/api/proxy'
  },
  
  // 系统
  SYSTEM: {
    HEALTH: '/health',
    TEST: '/api/test'
  }
};

// API 响应类型
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

// API 错误类型
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// 构建完整的 API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// 替换 URL 参数
export const replaceUrlParams = (url: string, params: Record<string, string | number>): string => {
  let result = url;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, String(value));
  });
  return result;
};

// API 函数
import { Collection, ApiRequest } from '@/types/collection';
import { mockApi } from './mockApi'; // 使用模拟API进行演示
// import { httpClient } from './httpClient'; // 生产环境使用真实API

export const api = {
  // 集合相关
  async getCollections(): Promise<Collection[]> {
    return mockApi.getCollections();
    // 生产环境代码：
    // const response = await httpClient.get(API_ENDPOINTS.COLLECTIONS.LIST);
    // return response.data;
  },

  async getCollection(id: string): Promise<Collection> {
    return mockApi.getCollection(id);
    // 生产环境代码：
    // const response = await httpClient.get(replaceUrlParams(API_ENDPOINTS.COLLECTIONS.DETAIL, { id }));
    // return response.data;
  },

  async createCollection(data: { name: string; description?: string; parentId?: string }): Promise<Collection> {
    return mockApi.createCollection(data);
    // 生产环境代码：
    // const response = await httpClient.post(API_ENDPOINTS.COLLECTIONS.CREATE, data);
    // return response.data;
  },

  async updateCollection(id: string, data: Partial<Collection>): Promise<Collection> {
    return mockApi.updateCollection(id, data);
    // 生产环境代码：
    // const response = await httpClient.put(replaceUrlParams(API_ENDPOINTS.COLLECTIONS.UPDATE, { id }), data);
    // return response.data;
  },

  async deleteCollection(id: string): Promise<void> {
    return mockApi.deleteCollection(id);
    // 生产环境代码：
    // await httpClient.delete(replaceUrlParams(API_ENDPOINTS.COLLECTIONS.DELETE, { id }));
  },

  async moveCollection(id: string, data: { parentId?: string; order?: number }): Promise<void> {
    return mockApi.moveCollection(id, data);
    // 生产环境代码：
    // await httpClient.post(replaceUrlParams(API_ENDPOINTS.COLLECTIONS.MOVE, { id }), data);
  },

  // 请求相关
  async getRequests(): Promise<ApiRequest[]> {
    // mockApi 中没有这个方法，返回空数组
    return [];
    // 生产环境代码：
    // const response = await httpClient.get(API_ENDPOINTS.REQUESTS.LIST);
    // return response.data;
  },

  async getRequest(id: string): Promise<ApiRequest> {
    const request = mockApi.findRequestById(await mockApi.getCollections(), id);
    if (!request) throw new Error('Request not found');
    return request;
    // 生产环境代码：
    // const response = await httpClient.get(replaceUrlParams(API_ENDPOINTS.REQUESTS.DETAIL, { id }));
    // return response.data;
  },

  async getRequestsByCollection(collectionId: string): Promise<ApiRequest[]> {
    const collection = await mockApi.getCollection(collectionId);
    return collection.requests || [];
    // 生产环境代码：
    // const response = await httpClient.get(replaceUrlParams(API_ENDPOINTS.REQUESTS.BY_COLLECTION, { collectionId }));
    // return response.data;
  },

  async createRequest(collectionId: string, data: Omit<ApiRequest, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiRequest> {
    return mockApi.createRequest(collectionId, data);
    // 生产环境代码：
    // const response = await httpClient.post(API_ENDPOINTS.REQUESTS.CREATE, { ...data, collectionId });
    // return response.data;
  },

  async updateRequest(id: string, data: Partial<ApiRequest>): Promise<ApiRequest> {
    return mockApi.updateRequest(id, data);
    // 生产环境代码：
    // const response = await httpClient.put(replaceUrlParams(API_ENDPOINTS.REQUESTS.UPDATE, { id }), data);
    // return response.data;
  },

  async deleteRequest(id: string): Promise<void> {
    return mockApi.deleteRequest(id);
    // 生产环境代码：
    // await httpClient.delete(replaceUrlParams(API_ENDPOINTS.REQUESTS.DELETE, { id }));
  },

  async moveRequest(id: string, data: { collectionId: string; order?: number }): Promise<void> {
    return mockApi.moveRequest(id, data);
    // 生产环境代码：
    // await httpClient.post(replaceUrlParams(API_ENDPOINTS.REQUESTS.MOVE, { id }), data);
  },

  async duplicateRequest(id: string, newCollectionId?: string): Promise<ApiRequest> {
    return mockApi.duplicateRequest(id, newCollectionId);
    // 生产环境代码：
    // const response = await httpClient.post(replaceUrlParams(API_ENDPOINTS.REQUESTS.DUPLICATE, { id }), { newCollectionId });
    // return response.data;
  }
};
