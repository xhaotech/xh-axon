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
