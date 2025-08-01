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
          localStorage.removeItem('auth_user');
          // 触发页面刷新，让 App 组件重新检查认证状态
          window.location.reload();
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
    localStorage.removeItem('auth_user');
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
        auth: config.auth, // 传递认证对象给后端
        timeout: 30000
      };

      const response = await this.post('/api/proxy', requestData);
      console.log('Proxy response:', response);
      return response;
    } catch (error) {
      console.error('Proxy request failed:', error);
      throw error;
    }
  }

  // 保存请求到历史记录
  async saveRequest(request: {
    name: string;
    url: string;
    method: string;
    params?: Record<string, string>;
    headers?: Record<string, string>;
    body?: string;
    auth?: any;
  }): Promise<ApiResponse> {
    try {
      const response = await this.post('/api/requests/save', request);
      return response;
    } catch (error) {
      console.error('Save request failed:', error);
      throw error;
    }
  }

  // 添加到收藏
  async addToFavorites(request: {
    name: string;
    url: string;
    method: string;
    params?: Record<string, string>;
    headers?: Record<string, string>;
    body?: string;
    auth?: any;
    folder?: string;
  }): Promise<ApiResponse> {
    try {
      const response = await this.post('/api/requests/favorite', request);
      return response;
    } catch (error) {
      console.error('Add to favorites failed:', error);
      throw error;
    }
  }

  // 获取请求历史
  async getRequestHistory(params?: {
    page?: number;
    limit?: number;
    method?: string;
    search?: string;
  }): Promise<ApiResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.method) queryParams.append('method', params.method);
      if (params?.search) queryParams.append('search', params.search);
      
      const url = `/api/history${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await this.get(url);
      return response;
    } catch (error) {
      console.error('Get request history failed:', error);
      throw error;
    }
  }

  // 获取收藏的请求
  async getFavoriteRequests(folder?: string): Promise<ApiResponse> {
    try {
      const url = folder ? `/api/favorites?folder=${encodeURIComponent(folder)}` : '/api/favorites';
      const response = await this.get(url);
      return response;
    } catch (error) {
      console.error('Get favorite requests failed:', error);
      throw error;
    }
  }

  // 删除历史记录
  async deleteHistory(id: string): Promise<ApiResponse> {
    try {
      const response = await this.delete(`/api/history/${id}`);
      return response;
    } catch (error) {
      console.error('Delete history failed:', error);
      throw error;
    }
  }

  // 批量删除历史记录
  async batchDeleteHistory(ids: string[]): Promise<ApiResponse> {
    try {
      const response = await this.delete('/api/history', { data: { ids } });
      return response;
    } catch (error) {
      console.error('Batch delete history failed:', error);
      throw error;
    }
  }

  // 删除收藏
  async deleteFavorite(id: string): Promise<ApiResponse> {
    try {
      const response = await this.delete(`/api/favorites/${id}`);
      return response;
    } catch (error) {
      console.error('Delete favorite failed:', error);
      throw error;
    }
  }

  // 更新收藏
  async updateFavorite(id: string, data: any): Promise<ApiResponse> {
    try {
      const response = await this.put(`/api/favorites/${id}`, data);
      return response;
    } catch (error) {
      console.error('Update favorite failed:', error);
      throw error;
    }
  }
}

// 创建 HTTP 客户端实例
export const httpClient = new HttpClient();

// 导出默认实例
export default httpClient;
