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
    copyUrl: '复制 URL',
    rename: '重命名',
    newRequest: '新请求',
    enterTabName: '请输入标签页名称',
    tabOptions: '标签页选项',
    
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
    collections: '请求集合',
    environments: '环境变量',
    noHistory: '暂无历史记录',
    noFavorites: '暂无收藏请求',
    noCollections: '暂无请求集合',
    noEnvironments: '暂无环境配置',
    searchHistory: '搜索历史记录...',
    searchFavorites: '搜索收藏...',
    searchCollections: '搜索集合...',
    
    // Collection Management - 新增集合管理相关词汇
    newCollection: '新建集合',
    newFolder: '新建文件夹',
    editCollection: '编辑集合',
    deleteCollection: '删除集合',
    renameCollection: '重命名集合',
    copyCollection: '复制集合',
    moveCollection: '移动集合',
    collectionName: '集合名称',
    collectionDescription: '集合描述',
    folderName: '文件夹名称',
    requestName: '请求名称',
    enterCollectionName: '请输入集合名称',
    enterFolderName: '请输入文件夹名称',
    enterRequestName: '请输入请求名称',
    confirmDelete: '确认删除',
    deleteConfirmMessage: '确定要删除这个集合吗？此操作不可恢复。',
    openInNewTab: '在新标签页中打开',
    addToCollection: '添加到集合',
    untitledRequest: '未命名请求',
    
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
    create: '创建',
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
    
    // Error messages
    urlRequired: '请输入请求URL',
    urlRequiredToSave: '请输入请求URL才能保存', 
    urlRequiredToFavorite: '请输入请求URL才能收藏',
    requestSaved: '请求已保存到后端！',
    saveFailed: '保存失败，请重试',
    addedToFavorites: '已添加到收藏！',
    addToFavoritesFailed: '添加收藏失败，请重试',
    // LoginPage
    phoneRequired: '请输入手机号',
    verificationCodeSent: '验证码已发送',
    sendCodeFailed: '发送验证码失败，请重试',
    backendConnectSuccess: '后端连接成功！',
    backendConnectFailed: '后端连接失败！状态码: ',
    backendTestFailed: '后端连接测试失败！错误: ',
    // Storage & Data Management
    exportData: '导出数据',
    importData: '导入数据',
    clearAllData: '清除所有数据',
    dataExported: '数据已导出到剪贴板',
    dataImported: '数据导入成功',
    dataCleared: '所有数据已清除',
    importFailed: '数据导入失败',
    confirmClearData: '确定要清除所有本地数据吗？此操作不可撤销。',
    storageUsage: '存储使用情况',
    itemMoved: '项目移动成功',    // Main Panel
    welcome: '欢迎使用 XH Axon',
    welcomeDescription: '强大的 HTTP API 测试工具，让API测试更简单',
    createNewRequest: '创建新请求',
    
    // Header & Settings
    switchLanguage: '切换语言',
    userManagement: '用户管理',
    signOut: '退出',
    
    // Login
    loginTitle: 'XH Axon',
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
    
    // Settings
    settingsTitle: '设置',
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
    copyUrl: 'Copy URL',
    rename: 'Rename',
    newRequest: 'New Request',
    enterTabName: 'Enter tab name',
    tabOptions: 'Tab Options',
    
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
    collections: 'Collections',
    environments: 'Environments',
    noHistory: 'No history records',
    noFavorites: 'No favorite requests',
    noCollections: 'No collections',
    noEnvironments: 'No environment configurations',
    searchHistory: 'Search history...',
    searchFavorites: 'Search favorites...',
    searchCollections: 'Search collections...',
    
    // Collection Management - 添加对应的英文字符串
    editCollection: 'Edit Collection',
    copyCollection: 'Copy Collection', 
    moveCollection: 'Move Collection',
    collectionDescription: 'Collection Description',
    requestName: 'Request Name',
    enterCollectionName: 'Enter collection name',
    enterFolderName: 'Enter folder name', 
    enterRequestName: 'Enter request name',
    confirmDelete: 'Confirm Delete',
    deleteConfirmMessage: 'Are you sure you want to delete this collection? This action cannot be undone.',
    openInNewTab: 'Open in New Tab',
    untitledRequest: 'Untitled Request',
    
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
    create: 'Create',
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
    
    // Error messages
    urlRequired: 'Please enter request URL',
    urlRequiredToSave: 'Please enter request URL to save',
    urlRequiredToFavorite: 'Please enter request URL to favorite',
    requestSaved: 'Request saved to backend!',
    saveFailed: 'Save failed, please try again',
    addedToFavorites: 'Added to favorites!',
    addToFavoritesFailed: 'Failed to add to favorites, please try again',
    // LoginPage
    phoneRequired: 'Please enter phone number',
    verificationCodeSent: 'Verification code sent',
    sendCodeFailed: 'Failed to send verification code, please try again',
    backendConnectSuccess: 'Backend connection successful!',
    backendConnectFailed: 'Backend connection failed! Status code: ',
    backendTestFailed: 'Backend connection test failed! Error: ',
    // Storage & Data Management
    exportData: 'Export Data',
    importData: 'Import Data',
    clearAllData: 'Clear All Data',
    dataExported: 'Data exported to clipboard',
    dataImported: 'Data imported successfully',
    dataCleared: 'All data cleared',
    importFailed: 'Data import failed',
    confirmClearData: 'Are you sure you want to clear all local data? This action cannot be undone.',
    storageUsage: 'Storage Usage',
    // Collections Management
    newCollection: 'New Collection',
    newFolder: 'New Folder',
    collectionName: 'Collection Name',
    folderName: 'Folder Name',
    addToCollection: 'Add to Collection',
    moveToFolder: 'Move to Folder',
    createFolder: 'Create Folder',
    deleteCollection: 'Delete Collection',
    deleteFolder: 'Delete Folder',
    renameCollection: 'Rename Collection',
    renameFolder: 'Rename Folder',
    expandAll: 'Expand All',
    collapseAll: 'Collapse All',
    collectionCreated: 'Collection created successfully',
    folderCreated: 'Folder created successfully',
    itemMoved: 'Item moved successfully',
    
    // Main Panel
    welcome: 'Welcome to XH Axon',
    welcomeDescription: 'Powerful HTTP API testing tool that makes API testing easier',
    createNewRequest: 'Create New Request',
    
    // Header & Settings
    switchLanguage: 'Switch Language',
    userManagement: 'User Management',
    signOut: 'Sign Out',
    
    // Login
    loginTitle: 'XH Axon',
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
    
    // Settings
    settingsTitle: 'Settings',
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

// React Hook for translation
import { create } from 'zustand';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: getDefaultLanguage(),
  setLanguage: (language: Language) => {
    localStorage.setItem('language', language);
    set({ language });
  },
}));

export const useTranslation = () => {
  const { language, setLanguage } = useLanguageStore();
  return {
    t: createTranslator(language),
    language,
    setLanguage,
  };
};
