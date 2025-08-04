// API URL 工具函数
export const getApiUrl = (path: string = ''): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100';
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

// 健康检查URL
export const getHealthUrl = (): string => getApiUrl('/health');

// 获取后端端口显示
export const getBackendPortDisplay = (): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100';
  if (baseUrl.startsWith('http://localhost:')) {
    return baseUrl.replace('http://', '');
  } else if (baseUrl.startsWith('https://localhost:')) {
    return baseUrl.replace('https://', '');
  } else if (baseUrl === '/api') {
    return 'localhost:3100'; // 生产环境显示
  }
  return baseUrl;
};
