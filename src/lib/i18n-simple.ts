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
    clear: '清空',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    warning: '警告',
    info: '信息',
    
    // Main Panel
    welcome: '欢迎使用 XH Axon',
    welcomeDescription: '强大的 HTTP API 测试工具，让API测试更简单',
    createNewRequest: '创建新请求',
    
    // Header & Settings
    switchLanguage: '切换语言',
    userManagement: '用户管理',
    signOut: '退出',
    
    // Login
    title: 'XH Axon',
    subtitle: '专业的 HTTP API 测试工具',
    loginTab: '登录',
    registerTab: '注册',
    forgotTab: '忘记密码',
    usernameMethod: '用户名登录',
    phoneMethod: '手机号登录',
    email: '邮箱',
    phone: '手机号',
    backendConnected: '后端连接正常',
    backendDisconnected: '后端连接失败',
    backendError: '后端连接错误',
    phoneRequired: '请输入手机号',
    codeSent: '验证码已发送',
    sendCodeFailed: '发送验证码失败',
    
    // Settings
    profile: '个人资料',
    preferences: '偏好设置',
    security: '安全设置',
    notifications: '通知设置',
    profileInfo: '个人信息',
    location: '位置',
    bio: '个人简介',
    theme: '主题',
    lightTheme: '浅色主题',
    darkTheme: '深色主题',
    autoTheme: '自动主题',
    fontSize: '字体大小',
    smallFont: '小',
    mediumFont: '中',
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
    noHistory: 'No history yet',
    noFavorites: 'No favorites yet',
    noEnvironments: 'No environments yet',
    
    // RequestBuilder
    method: 'Method',
    url: 'URL',
    send: 'Send',
    params: 'Params',
    headers: 'Headers',
    body: 'Body',
    auth: 'Auth',
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
    clear: 'Clear',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    
    // Main Panel
    welcome: 'Welcome to XH Axon',
    welcomeDescription: 'Powerful HTTP API testing tool that makes API testing easier',
    createNewRequest: 'Create New Request',
    
    // Header & Settings
    switchLanguage: 'Switch Language',
    userManagement: 'User Management',
    signOut: 'Sign Out',
    
    // Login
    title: 'XH Axon',
    subtitle: 'Professional HTTP API Testing Tool',
    loginTab: 'Login',
    registerTab: 'Register',
    forgotTab: 'Forgot Password',
    usernameMethod: 'Username Login',
    phoneMethod: 'Phone Login',
    email: 'Email',
    phone: 'Phone',
    backendConnected: 'Backend Connected',
    backendDisconnected: 'Backend Disconnected',
    backendError: 'Backend Connection Error',
    phoneRequired: 'Phone number required',
    codeSent: 'Code sent',
    sendCodeFailed: 'Failed to send code',
    
    // Settings
    profile: 'Profile',
    preferences: 'Preferences',
    security: 'Security',
    notifications: 'Notifications',
    profileInfo: 'Profile Information',
    location: 'Location',
    bio: 'Bio',
    theme: 'Theme',
    lightTheme: 'Light Theme',
    darkTheme: 'Dark Theme',
    autoTheme: 'Auto Theme',
    fontSize: 'Font Size',
    smallFont: 'Small',
    mediumFont: 'Medium',
  }
};

export type Language = keyof typeof i18n;
export type I18nKeys = keyof typeof i18n.zh;

// 简单的翻译函数
export const createTranslator = (language: Language) => {
  return (key: I18nKeys): string => {
    return i18n[language][key] || key;
  };
};

// 默认语言获取函数
export const getDefaultLanguage = (): Language => {
  const saved = localStorage.getItem('language') as Language;
  return saved && (saved === 'zh' || saved === 'en') ? saved : 'zh';
};
