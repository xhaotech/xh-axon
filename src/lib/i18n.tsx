import React, { createContext, useContext, useState, useEffect } from 'react';

// 国际化支持
export const i18n = {
  zh: {
    // RequestTabs
    scrollLeft: '向左滚动',
    scrollRight: '向右滚动',
    newTab: '新建标签页',
    closeTab: '关闭标签',
    close: '关闭',
    closeOthers: '关闭其他',
    closeRight: '关闭右侧',
    closeLeft: '关闭左侧',
    closeSaved: '关闭已保存',
    rename: '重命名',
    newRequest: '新请求',
    enterTabName: '请输入标签页名称',
    
    // Header
    httpApiClient: 'HTTP API 客户端',
    language: '语言',
    chinese: '中文',
    english: 'English',
    logout: '退出登录',
    settings: '设置',
    
    // Sidebar
    history: '历史记录',
    favorites: '收藏夹',
    environments: '环境变量',
    noHistory: '暂无历史记录',
    noFavorites: '暂无收藏请求',
    noEnvironments: '暂无环境配置',
    
    // RequestBuilder
    method: '请求方法',
    url: '请求地址',
    send: '发送请求',
    params: '查询参数',
    headers: '请求头',
    body: '请求体',
    auth: '身份认证',
    none: '无',
    bearerToken: 'Bearer Token',
    basicAuth: 'Basic Auth',
    token: 'Token',
    username: '用户名',
    password: '密码',
    
    // Common
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    copy: '复制',
    cut: '剪切',
    paste: '粘贴',
    undo: '撤销',
    redo: '重做',
    search: '搜索',
    filter: '筛选',
    sort: '排序',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    warning: '警告',
    info: '信息',
  },
  en: {
    // RequestTabs
    scrollLeft: 'Scroll Left',
    scrollRight: 'Scroll Right',
    newTab: 'New Tab',
    closeTab: 'Close Tab',
    close: 'Close',
    closeOthers: 'Close Others',
    closeRight: 'Close Right',
    closeLeft: 'Close Left',
    closeSaved: 'Close Saved',
    rename: 'Rename',
    newRequest: 'New Request',
    enterTabName: 'Enter tab name',
    
    // Header
    httpApiClient: 'HTTP API Client',
    language: 'Language',
    chinese: '中文',
    english: 'English',
    logout: 'Logout',
    settings: 'Settings',
    
    // Sidebar
    history: 'History',
    favorites: 'Favorites',
    environments: 'Environments',
    noHistory: 'No history records',
    noFavorites: 'No favorite requests',
    noEnvironments: 'No environment configurations',
    
    // RequestBuilder
    method: 'Method',
    url: 'URL',
    send: 'Send Request',
    params: 'Query Params',
    headers: 'Headers',
    body: 'Body',
    auth: 'Authorization',
    none: 'None',
    bearerToken: 'Bearer Token',
    basicAuth: 'Basic Auth',
    token: 'Token',
    username: 'Username',
    password: 'Password',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    copy: 'Copy',
    cut: 'Cut',
    paste: 'Paste',
    undo: 'Undo',
    redo: 'Redo',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
  }
};

export type Language = keyof typeof i18n;
export type I18nKeys = keyof typeof i18n.zh;

// 语言上下文
interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: I18nKeys) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // 从localStorage获取保存的语言设置，默认为中文
    const saved = localStorage.getItem('language') as Language;
    return saved && (saved === 'zh' || saved === 'en') ? saved : 'zh';
  });

  useEffect(() => {
    // 保存语言设置到localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: I18nKeys): string => {
    return i18n[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
