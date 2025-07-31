import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Phone, Lock, User, ArrowRight, Settings, CheckCircle, XCircle, Globe } from 'lucide-react';
import { getDefaultLanguage } from '../lib/i18n';
import { useAppStore } from '../store/useAppStore';
import { httpClient } from '../lib/httpClient';
import { VerificationCodeInput } from './VerificationCodeInput';
import toast from 'react-hot-toast';

type LoginMethod = 'username' | 'phone';
type AuthMode = 'login' | 'register' | 'forgot';

interface TestAccount {
  username: string;
  password: string;
  description: string;
}

const TEST_ACCOUNTS: TestAccount[] = [
  { username: 'admin', password: 'admin123', description: 'login.adminAccount' },
  { username: 'demo', password: 'demo123', description: 'login.demoAccount' },
  { username: 'test', password: 'test123', description: 'login.testAccount' }
];

export const LoginPageRedesigned: React.FC = () => {
  const [language, setLanguage] = useState(getDefaultLanguage());
  // 临时简化翻译函数，避免i18n键匹配问题
  const t = (key: string): string => {
    const translations: {[key: string]: {zh: string, en: string}} = {
      'login.title': { zh: 'XH Axon', en: 'XH Axon' },
      'login.subtitle': { zh: '专业的 HTTP API 测试工具', en: 'Professional HTTP API Testing Tool' },
      'login.loginTab': { zh: '登录', en: 'Login' },
      'login.registerTab': { zh: '注册', en: 'Register' },
      'login.forgotTab': { zh: '忘记密码', en: 'Forgot Password' },
      'login.usernameMethod': { zh: '用户名登录', en: 'Username Login' },
      'login.phoneMethod': { zh: '手机号登录', en: 'Phone Login' },
      'login.backendConnected': { zh: '后端连接正常', en: 'Backend Connected' },
      'login.backendDisconnected': { zh: '后端连接失败', en: 'Backend Disconnected' },
      'login.backendError': { zh: '后端连接错误', en: 'Backend Connection Error' },
      'login.phoneRequired': { zh: '请输入手机号', en: 'Phone number required' },
      'login.codeSent': { zh: '验证码已发送', en: 'Code sent' },
      'login.sendCodeFailed': { zh: '发送验证码失败', en: 'Failed to send code' },
      'common.loading': { zh: '加载中', en: 'Loading' }
    };
    return translations[key]?.[language] || key;
  };
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('username');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationCode, setVerificationCode] = useState('');
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  
  const { login } = useAppStore();
  
  // 登录表单状态
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    phone: ''
  });
  
  // 注册表单状态
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    verificationCode: ''
  });

  // 忘记密码表单状态
  const [forgotForm, setForgotForm] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 测试后端连接
  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:3100/health');
      
      if (response.ok) {
        setBackendStatus('connected');
        toast.success(t('login.backendConnected'));
      } else {
        setBackendStatus('disconnected');
        toast.error(t('login.backendDisconnected'));
      }
    } catch (error) {
      setBackendStatus('disconnected');
      toast.error(t('login.backendError'));
    }
  };

  // 发送验证码
  const handleSendVerificationCode = async (phone: string) => {
    if (!phone) {
      toast.error(t('login.phoneRequired'));
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await httpClient.post('/api/auth/send-code', { phone });
      
      if (response.success && response.data.success) {
        // 开始倒计时
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        toast.success(`${t('login.codeSent')} (${t('common.loading')}: ${response.data.code})`);
      } else {
        toast.error(response.data.error || t('login.sendCodeFailed'));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('login.sendCodeFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // 用户名密码登录
  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      toast.error('请输入用户名和密码');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await httpClient.post('/api/auth/login', {
        username: loginForm.username,
        password: loginForm.password
      });
      
      if (response.success && response.data.success) {
        const user = {
          id: response.data.user.id,
          username: response.data.user.username,
          email: response.data.user.email,
          avatar: response.data.user.avatar
        };
        
        login(user, response.data.token);
        toast.success('登录成功！');
      } else {
        toast.error(response.data.error || '登录失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || '登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 手机验证码登录
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.phone || !verificationCode) {
      toast.error('请输入手机号和验证码');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await httpClient.post('/api/auth/login', {
        phone: loginForm.phone,
        verificationCode: verificationCode
      });
      
      if (response.success && response.data.success) {
        const user = {
          id: response.data.user.id,
          username: response.data.user.username,
          email: response.data.user.email,
          phone: response.data.user.phone,
          avatar: response.data.user.avatar
        };
        
        login(user, response.data.token);
        toast.success('登录成功！');
      } else {
        toast.error(response.data.error || '手机号或验证码错误');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || '登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 用户注册
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      toast.error('请填写完整的注册信息');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }

    if (registerForm.password.length < 6) {
      toast.error('密码长度至少6位');
      return;
    }

    setIsLoading(true);
    try {
      const response = await httpClient.post('/api/auth/register', {
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        phone: registerForm.phone || undefined,
      });

      if (response.success && response.data.success) {
        toast.success('注册成功！');
        setAuthMode('login');
        setLoginForm({ username: registerForm.username, password: '', phone: '' });
      } else {
        toast.error(response.data.error || '注册失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || '注册失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 快速登录测试账号
  const handleQuickLogin = async (account: TestAccount) => {
    setIsLoading(true);
    try {
      const response = await httpClient.post('/api/auth/login', {
        username: account.username,
        password: account.password
      });
      
      if (response.success && response.data.success) {
        const user = {
          id: response.data.user.id,
          username: response.data.user.username,
          email: response.data.user.email,
          avatar: response.data.user.avatar
        };
        
        login(user, response.data.token);
        toast.success(`使用${account.description}登录成功！`);
      } else {
        toast.error('测试账号登录失败，请先注册该账号');
      }
    } catch (error: any) {
      toast.error('测试账号登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-md">
        {/* 标题 */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <h1 className="text-3xl font-bold text-gray-900">{t('login.title')}</h1>
            <div className="flex-1 flex justify-end">
              {/* 语言切换按钮 */}
              <button
                onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                title={language === 'zh' ? 'Switch to English' : '切换到中文'}
              >
                <Globe className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-gray-600">{t('login.subtitle')}</p>
        </div>

        {/* 主登录卡片 */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* 模式选择头部 */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex rounded-lg border border-gray-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  authMode === 'login'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('login.loginTab')}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  authMode === 'register'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('login.registerTab')}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('forgot')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  authMode === 'forgot'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('login.forgotTab')}
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="p-6">
            {/* 登录模式 */}
            {authMode === 'login' && (
              <>
                {/* 登录方式切换 */}
                <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('username')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      loginMethod === 'username'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <User className="w-4 h-4 inline-block mr-2" />
                    {t('login.usernameMethod')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('phone')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      loginMethod === 'phone'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Phone className="w-4 h-4 inline-block mr-2" />
                    {t('login.phoneMethod')}
                  </button>
                </div>

                {/* 用户名登录表单 */}
                {loginMethod === 'username' && (
                  <form onSubmit={handleUsernameLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        用户名
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={loginForm.username}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="请输入用户名"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        密码
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginForm.password}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="请输入密码"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <ArrowRight className="ml-2 w-4 h-4" />
                      )}
                      {isLoading ? '登录中...' : '登录'}
                    </button>
                  </form>
                )}

                {/* 手机号登录表单 */}
                {loginMethod === 'phone' && (
                  <form onSubmit={handlePhoneLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        手机号
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          value={loginForm.phone}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="请输入手机号"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        验证码
                      </label>
                      <div className="space-y-3">
                        <VerificationCodeInput
                          value={verificationCode}
                          onChange={setVerificationCode}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => handleSendVerificationCode(loginForm.phone)}
                          disabled={countdown > 0 || isLoading || !loginForm.phone}
                          className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          {countdown > 0 ? `${countdown}s 后重新发送` : '发送验证码'}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <ArrowRight className="ml-2 w-4 h-4" />
                      )}
                      {isLoading ? '登录中...' : '登录'}
                    </button>
                  </form>
                )}
              </>
            )}

            {/* 注册模式 */}
            {authMode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      用户名 *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="用户名"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      手机号
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="手机号"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    邮箱 *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="请输入邮箱"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      密码 *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="密码"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      确认密码 *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="确认密码"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <User className="ml-2 w-4 h-4" />
                  )}
                  {isLoading ? '注册中...' : '创建账户'}
                </button>
              </form>
            )}

            {/* 忘记密码模式 */}
            {authMode === 'forgot' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">重置密码</h3>
                  <p className="text-gray-600 text-sm">输入您的邮箱，我们将发送重置链接</p>
                </div>

                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      邮箱地址
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={forgotForm.email}
                        onChange={(e) => setForgotForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="请输入您的邮箱"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-lg hover:from-orange-700 hover:to-red-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Mail className="mr-2 w-4 h-4" />
                    )}
                    {isLoading ? '发送中...' : '发送重置链接'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* 后端连接状态 */}
        <div className="mt-4 flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2">
            <button
              onClick={testBackendConnection}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>后端状态</span>
            </button>
            {backendStatus === 'connected' && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="text-xs">已连接</span>
              </div>
            )}
            {backendStatus === 'disconnected' && (
              <div className="flex items-center text-red-600">
                <XCircle className="w-4 h-4 mr-1" />
                <span className="text-xs">未连接</span>
              </div>
            )}
          </div>
        </div>

        {/* 测试账号 */}
        <div className="mt-4">
          <button
            onClick={() => setShowTestAccounts(!showTestAccounts)}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showTestAccounts ? '隐藏测试账号' : '显示测试账号'}
          </button>
          
          {showTestAccounts && (
            <div className="mt-3 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3">测试账号快速登录</h4>
              <div className="space-y-2">
                {TEST_ACCOUNTS.map((account, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickLogin(account)}
                    disabled={isLoading}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{account.username}</div>
                        <div className="text-xs text-gray-500">{account.description}</div>
                      </div>
                      <div className="text-xs text-gray-400 font-mono">{account.password}</div>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                💡 如果测试账号登录失败，请先注册这些账号
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
