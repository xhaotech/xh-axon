import React, { useState } from 'react';
import { X, User, Settings, Lock, Bell, Palette, Globe } from 'lucide-react';
import { getDefaultLanguage } from '../lib/i18n';
import { useAppStore } from '../store/useAppStore';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose }) => {
  const [language, setLanguage] = useState(getDefaultLanguage());
  
  // 临时简化翻译函数，避免i18n键匹配问题
  const t = (key: string): string => {
    const translations: {[key: string]: {zh: string, en: string}} = {
      'settingsTitle': { zh: '设置', en: 'Settings' },
      'settings.profile': { zh: '个人资料', en: 'Profile' },
      'settings.preferences': { zh: '偏好设置', en: 'Preferences' },
      'settings.security': { zh: '安全设置', en: 'Security' },
      'settings.notifications': { zh: '通知设置', en: 'Notifications' },
      'settings.profileInfo': { zh: '个人信息', en: 'Profile Information' },
      'login.username': { zh: '用户名', en: 'Username' },
      'login.email': { zh: '邮箱', en: 'Email' },
      'login.phone': { zh: '手机号', en: 'Phone' },
      'settings.location': { zh: '位置', en: 'Location' },
      'settings.bio': { zh: '个人简介', en: 'Bio' },
      'common.save': { zh: '保存', en: 'Save' },
      'settings.language': { zh: '语言', en: 'Language' },
      'settings.theme': { zh: '主题', en: 'Theme' },
      'settings.lightTheme': { zh: '浅色主题', en: 'Light Theme' },
      'settings.darkTheme': { zh: '深色主题', en: 'Dark Theme' },
      'settings.autoTheme': { zh: '自动主题', en: 'Auto Theme' },
      'settings.fontSize': { zh: '字体大小', en: 'Font Size' },
      'settings.smallFont': { zh: '小', en: 'Small' },
      'settings.mediumFont': { zh: '中', en: 'Medium' },
      'settings.largeFont': { zh: '大', en: 'Large' },
      'settings.autoSave': { zh: '自动保存', en: 'Auto Save' },
      'settings.showLineNumbers': { zh: '显示行号', en: 'Show Line Numbers' },
      'settings.changePassword': { zh: '修改密码', en: 'Change Password' },
      'settings.currentPassword': { zh: '当前密码', en: 'Current Password' },
      'settings.newPassword': { zh: '新密码', en: 'New Password' },
      'settings.confirmNewPassword': { zh: '确认新密码', en: 'Confirm New Password' },
      'settings.updatePassword': { zh: '更新密码', en: 'Update Password' },
      'settings.emailNotifications': { zh: '邮件通知', en: 'Email Notifications' },
      'settings.pushNotifications': { zh: '推送通知', en: 'Push Notifications' },
      'settings.requestUpdates': { zh: '请求更新', en: 'Request Updates' },
      'settings.systemAlerts': { zh: '系统警告', en: 'System Alerts' }
    };
    return translations[key]?.[language] || key;
  };
  
  const { auth } = useAppStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security' | 'notifications'>('profile');
  
  const [profileForm, setProfileForm] = useState({
    username: auth.user?.username || '',
    email: auth.user?.email || '',
    phone: auth.user?.phone || '',
    bio: '',
    location: ''
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    fontSize: 'medium',
    language: language,
    autoSave: true,
    showLineNumbers: true
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    requestUpdates: true,
    systemAlerts: true
  });

  if (!isOpen) return null;

  const tabs = [
    { id: 'profile', label: t('settings.profile'), icon: User },
    { id: 'preferences', label: t('settings.preferences'), icon: Settings },
    { id: 'security', label: t('settings.security'), icon: Lock },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell }
  ];

  const handleSaveProfile = () => {
    // TODO: 实现保存用户资料
    console.log('Saving profile:', profileForm);
  };

  const handleSavePreferences = () => {
    // TODO: 实现保存偏好设置
    setLanguage(preferences.language as any);
    console.log('Saving preferences:', preferences);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{t('settingsTitle')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 bg-gray-50">
            <div className="p-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.profileInfo')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('login.username')}
                    </label>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('login.email')}
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('login.phone')}
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.location')}
                    </label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.bio')}
                    </label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.preferences')}</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe className="inline w-4 h-4 mr-2" />
                      {t('settings.language')}
                    </label>
                    <select
                      value={preferences.language}
                      onChange={(e) => setPreferences({ ...preferences, language: e.target.value as 'zh' | 'en' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="zh">中文</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Palette className="inline w-4 h-4 mr-2" />
                      {t('settings.theme')}
                    </label>
                    <select
                      value={preferences.theme}
                      onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="light">{t('settings.lightTheme')}</option>
                      <option value="dark">{t('settings.darkTheme')}</option>
                      <option value="auto">{t('settings.autoTheme')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.fontSize')}
                    </label>
                    <select
                      value={preferences.fontSize}
                      onChange={(e) => setPreferences({ ...preferences, fontSize: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="small">{t('settings.smallFont')}</option>
                      <option value="medium">{t('settings.mediumFont')}</option>
                      <option value="large">{t('settings.largeFont')}</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.autoSave}
                        onChange={(e) => setPreferences({ ...preferences, autoSave: e.target.checked })}
                        className="mr-3 rounded"
                      />
                      <span className="text-sm text-gray-700">{t('settings.autoSave')}</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.showLineNumbers}
                        onChange={(e) => setPreferences({ ...preferences, showLineNumbers: e.target.checked })}
                        className="mr-3 rounded"
                      />
                      <span className="text-sm text-gray-700">{t('settings.showLineNumbers')}</span>
                    </label>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={handleSavePreferences}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.security')}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{t('settings.changePassword')}</h4>
                    <div className="space-y-3">
                      <input
                        type="password"
                        placeholder={t('settings.currentPassword')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="password"
                        placeholder={t('settings.newPassword')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="password"
                        placeholder={t('settings.confirmNewPassword')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      {t('settings.updatePassword')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.notifications')}</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{t('settings.emailNotifications')}</span>
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                      className="rounded"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{t('settings.pushNotifications')}</span>
                    <input
                      type="checkbox"
                      checked={notifications.pushNotifications}
                      onChange={(e) => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
                      className="rounded"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{t('settings.requestUpdates')}</span>
                    <input
                      type="checkbox"
                      checked={notifications.requestUpdates}
                      onChange={(e) => setNotifications({ ...notifications, requestUpdates: e.target.checked })}
                      className="rounded"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{t('settings.systemAlerts')}</span>
                    <input
                      type="checkbox"
                      checked={notifications.systemAlerts}
                      onChange={(e) => setNotifications({ ...notifications, systemAlerts: e.target.checked })}
                      className="rounded"
                    />
                  </label>
                </div>
                <div className="mt-6">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    {t('common.save')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
