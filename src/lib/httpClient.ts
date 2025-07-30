import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, ApiResponse, ApiError } from './api';

class HttpClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        console.log('Making request to:', (config.baseURL || '') + (config.url || ''));
        // 添加认证 token
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('Received response:', response.status, response.data);
        return response;
      },
      (error) => {
        console.error('Response interceptor error:', error);
        const apiError: ApiError = {
          message: error.response?.data?.error || error.message || 'Network Error',
          status: error.response?.status || 500,
          code: error.response?.data?.code || error.code,
        };

        // 如果是 401 错误，清除本地存储的 token
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          // 这里可以触发登出事件或重定向到登录页
        }

        return Promise.reject(apiError);
      }
    );
  }

  // GET 请求
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.get(url, config);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw error;
    }
  }

  // POST 请求
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.post(url, data, config);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw error;
    }
  }

  // PUT 请求
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.put(url, data, config);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw error;
    }
  }

  // DELETE 请求
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.delete(url, config);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw error;
    }
  }

  // PATCH 请求
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.patch(url, data, config);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw error;
    }
  }

  // 通用请求方法
  async request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.request(config);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw error;
    }
  }

  // 设置认证 token
  setAuthToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  // 清除认证 token
  clearAuthToken() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  // 检查健康状态
  async checkHealth(): Promise<boolean> {
    try {
      console.log('Testing backend connection to:', API_CONFIG.BASE_URL + '/health');
      const response = await this.get('/health');
      console.log('Backend response:', response);
      return !!(response.success && response.data?.status === 'ok');
    } catch (error) {
      console.error('Backend connection failed:', error);
      return false;
    }
  }

  // 发送代理请求（通过后端代理到外部API）
  async proxyRequest(config: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: any;
    auth?: {
      type: 'basic' | 'bearer';
      username?: string;
      password?: string;
      token?: string;
    };
  }): Promise<ApiResponse> {
    try {
      console.log('Sending proxy request:', config);
      
      const requestData = {
        url: config.url,
        method: config.method.toUpperCase(),
        headers: config.headers || {},
        body: config.body,
        timeout: 30000
      };

      // 处理Basic Auth
      if (config.auth?.type === 'basic' && config.auth.username && config.auth.password) {
        const credentials = btoa(`${config.auth.username}:${config.auth.password}`);
        requestData.headers['Authorization'] = `Basic ${credentials}`;
      }
      
      // 处理Bearer Token
      if (config.auth?.type === 'bearer' && config.auth.token) {
        requestData.headers['Authorization'] = `Bearer ${config.auth.token}`;
      }

      const response = await this.post('/api/proxy', requestData);
      console.log('Proxy response:', response);
      return response;
    } catch (error) {
      console.error('Proxy request failed:', error);
      throw error;
    }
  }
}

// 创建 HTTP 客户端实例
export const httpClient = new HttpClient();

// 导出默认实例
export default httpClient;
