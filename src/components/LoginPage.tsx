import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Phone, Lock, User, ArrowRight, UserPlus } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { validateUserLogin, validatePhoneLogin, demoUsers } from '../lib/auth';
import { httpClient } from '../lib/httpClient';
import { createTranslator, getDefaultLanguage } from '../lib/i18n';
import toast from 'react-hot-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader } from './ui/card';

type LoginMethod = 'username' | 'phone';
type AuthMode = 'login' | 'register';

export const LoginPage: React.FC = () => {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('username');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const t = createTranslator(getDefaultLanguage());
  
  const { login } = useAppStore();
  
  // 用户名密码登录表单状态
  const [usernameForm, setUsernameForm] = useState({
    username: '',
    password: ''
  });
  
  // 手机验证码登录表单状态
  const [phoneForm, setPhoneForm] = useState({
    phone: '',
    verificationCode: ''
  });

  // 注册表单状态
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  // 测试后端连接
  const handleTestBackend = async () => {
    console.log('Testing backend connection...');
    try {
      // 直接使用 fetch 测试
      const response = await fetch('http://localhost:3100/health');
      const data = await response.json();
      console.log('Direct fetch result:', { response, data });
      
      if (response.ok) {
        toast.success(`${t('backendConnectSuccess')}\n状态: ${data.status}\n时间: ${data.timestamp}`);
      } else {
        toast.error(t('backendConnectFailed') + response.status);
      }
    } catch (error) {
      console.error('Backend test error:', error);
      toast.error(t('backendTestFailed') + (error as Error).message);
    }
    
    // 同时测试 httpClient
    try {
      const isHealthy = await httpClient.checkHealth();
      console.log('HttpClient result:', isHealthy);
    } catch (error) {
      console.error('HttpClient error:', error);
    }
  };

  // 发送验证码
  const handleSendVerificationCode = async () => {
    if (!phoneForm.phone) {
      toast.error(t('phoneRequired'));
      return;
    }
    
    setIsLoading(true);
    try {
      // 模拟发送验证码API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      
      toast.success(t('verificationCodeSent'));
    } catch (error) {
      toast.error(t('sendCodeFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // 用户名密码登录
  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameForm.username || !usernameForm.password) {
      toast.error('请输入用户名和密码');
      return;
    }
    
    setIsLoading(true);
    try {
      // 模拟登录API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 验证用户登录
      const validUser = validateUserLogin(usernameForm.username, usernameForm.password);
      
      if (validUser) {
        const user = {
          id: Date.now().toString(),
          username: validUser.username,
          email: validUser.email,
          avatar: validUser.avatar
        };
        
        login(user, 'jwt-token-' + Date.now());
      } else {
        toast.error('用户名或密码错误');
      }
    } catch (error) {
      toast.error('登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 手机验证码登录
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneForm.phone || !phoneForm.verificationCode) {
      toast.error('请输入手机号和验证码');
      return;
    }
    
    setIsLoading(true);
    try {
      // 模拟登录API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 验证手机登录
      const validPhone = validatePhoneLogin(phoneForm.phone, phoneForm.verificationCode);
      
      if (validPhone) {
        const user = {
          id: Date.now().toString(),
          username: `用户${phoneForm.phone.slice(-4)}`,
          phone: phoneForm.phone,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phoneForm.phone}`
        };
        
        login(user, 'jwt-token-' + Date.now());
      } else {
        toast.error('手机号或验证码错误');
      }
    } catch (error) {
      toast.error('登录失败，请重试');
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
        const user = {
          id: response.data.user.id,
          username: response.data.user.username,
          email: response.data.user.email,
          avatar: response.data.user.avatar
        };

        login(user, response.data.token);
        toast.success('注册成功！');
      } else {
        toast.error(response.data.error || '注册失败');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast.error(error.response?.data?.error || '注册失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">XH</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Axon</h1>
          <p className="text-gray-600 mt-2">专业的 HTTP API 客户端工具</p>
        </div>

        {/* 登录卡片 */}
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-4">
            {/* 登录/注册模式切换 */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
              <Button
                type="button"
                variant={authMode === 'login' ? 'default' : 'ghost'}
                onClick={() => setAuthMode('login')}
                className={`flex-1 h-10 text-sm font-medium rounded-md ${
                  authMode === 'login' ? 'bg-white text-gray-900 shadow-sm hover:bg-white' : 'bg-transparent'
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                登录
              </Button>
              <Button
                type="button"
                variant={authMode === 'register' ? 'default' : 'ghost'}
                onClick={() => setAuthMode('register')}
                className={`flex-1 h-10 text-sm font-medium rounded-md ${
                  authMode === 'register' ? 'bg-white text-gray-900 shadow-sm hover:bg-white' : 'bg-transparent'
                }`}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                注册
              </Button>
            </div>
          </CardHeader>

          <CardContent>
          {authMode === 'login' ? (
            <>
              {/* 登录方式切换 */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <Button
                  type="button"
                  variant={loginMethod === 'username' ? 'default' : 'ghost'}
                  onClick={() => setLoginMethod('username')}
                  className={`flex-1 h-10 text-sm font-medium rounded-md ${
                    loginMethod === 'username' ? 'bg-white text-gray-900 shadow-sm hover:bg-white' : 'bg-transparent'
                  }`}
                >
                  <User className="w-4 h-4 mr-2" />
                  用户名
                </Button>
                <Button
                  type="button"
                  variant={loginMethod === 'phone' ? 'default' : 'ghost'}
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 h-10 text-sm font-medium rounded-md ${
                    loginMethod === 'phone' ? 'bg-white text-gray-900 shadow-sm hover:bg-white' : 'bg-transparent'
                  }`}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  手机号
                </Button>
              </div>
            </>
          ) : (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">创建新账户</h2>
              <p className="text-gray-600 text-sm">填写以下信息完成注册</p>
            </div>
          )}

          {/* 登录方式切换 */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setLoginMethod('username')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'username'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              <User className="inline w-4 h-4 mr-2" />
              用户名登录
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'phone'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              <Phone className="inline w-4 h-4 mr-2" />
              手机登录
            </button>
          </div>

          {/* 用户名密码登录表单 */}
          {loginMethod === 'username' && (
            <form onSubmit={handleUsernameLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={usernameForm.username}
                    onChange={(e) => setUsernameForm({ ...usernameForm, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:border-blue-500"
                    placeholder="请输入用户名"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={usernameForm.password}
                    onChange={(e) => setUsernameForm({ ...usernameForm, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 focus:outline-none focus:border-blue-500"
                    placeholder="请输入密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    登录
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 手机验证码登录表单 */}
          {loginMethod === 'phone' && (
            <form onSubmit={handlePhoneLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  手机号
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phoneForm.phone}
                    onChange={(e) => setPhoneForm({ ...phoneForm, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:border-blue-500"
                    placeholder="请输入手机号"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  验证码
                </label>
                <div className="flex space-x-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={phoneForm.verificationCode}
                      onChange={(e) => setPhoneForm({ ...phoneForm, verificationCode: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:border-blue-500"
                      placeholder="请输入验证码"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={countdown > 0 || isLoading}
                    className="px-4 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    {countdown > 0 ? `${countdown}s` : '发送验证码'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    登录
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 底部信息 */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>继续即表示您同意我们的</p>
            <div className="mt-1">
              <a href="#" className="text-blue-600 hover:text-blue-700">服务条款</a>
              <span className="mx-2">和</span>
              <a href="#" className="text-blue-600 hover:text-blue-700">隐私政策</a>
            </div>
          </div>
          </CardContent>
        </Card>

        {/* 演示账号提示 */}
        <div className="mt-6 bg-white/70 backdrop-blur-sm rounded-lg p-4 text-sm text-gray-600">
          <p className="font-medium mb-2">🎯 演示账号：</p>
          <div className="space-y-1">
            {demoUsers.map((user, index) => (
              <p key={index}>• 用户名：{user.username} 密码：{user.password}</p>
            ))}
            <p>• 手机号：13800138000 验证码：123456</p>
          </div>
        </div>

        {/* 测试按钮 */}
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={handleTestBackend}
            className="text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100"
          >
            🔧 测试后端连接
          </Button>
        </div>
      </div>
    </div>
  );
};
