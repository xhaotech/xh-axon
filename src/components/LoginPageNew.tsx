import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Phone, Lock, User, ArrowRight, UserPlus } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { httpClient } from '../lib/httpClient';
import toast from 'react-hot-toast';

type LoginMethod = 'username' | 'phone';
type AuthMode = 'login' | 'register';

export const LoginPage: React.FC = () => {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('username');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
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
      const response = await fetch('http://localhost:3100/health');
      const data = await response.json();
      console.log('Direct fetch result:', { response, data });
      
      if (response.ok) {
        toast.success(`后端连接成功！\n状态: ${data.status}\n时间: ${data.timestamp}`);
      } else {
        toast.error('后端连接失败！状态码: ' + response.status);
      }
    } catch (error) {
      console.error('Backend test error:', error);
      toast.error('后端连接测试失败！错误: ' + (error as Error).message);
    }
  };

  // 发送验证码
  const handleSendVerificationCode = async () => {
    if (!phoneForm.phone) {
      toast.error('请输入手机号');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await httpClient.post('/api/auth/send-code', {
        phone: phoneForm.phone
      });
      
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
        
        toast.success('验证码已发送');
      } else {
        toast.error(response.data.error || '发送验证码失败');
      }
    } catch (error: any) {
      console.error('Send code error:', error);
      toast.error(error.response?.data?.error || '发送验证码失败，请重试');
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
      const response = await httpClient.post('/api/auth/login', {
        username: usernameForm.username,
        password: usernameForm.password
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
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || '登录失败，请重试');
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
      const response = await httpClient.post('/api/auth/login', {
        phone: phoneForm.phone,
        verificationCode: phoneForm.verificationCode
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
      console.error('Phone login error:', error);
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

        {/* 主卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* 登录/注册模式切换 */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                authMode === 'login'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4 inline-block mr-2" />
              登录
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                authMode === 'register'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserPlus className="w-4 h-4 inline-block mr-2" />
              注册
            </button>
          </div>

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
                  用户名
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
                  手机号
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
                        value={usernameForm.username}
                        onChange={(e) => setUsernameForm(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        value={usernameForm.password}
                        onChange={(e) => setUsernameForm(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="请输入密码"
                        required
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
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isLoading ? (
                      '登录中...'
                    ) : (
                      <>
                        登录
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
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
                        value={phoneForm.phone}
                        onChange={(e) => setPhoneForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="请输入手机号"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      验证码
                    </label>
                    <div className="flex space-x-3">
                      <div className="relative flex-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={phoneForm.verificationCode}
                          onChange={(e) => setPhoneForm(prev => ({ ...prev, verificationCode: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="请输入验证码"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendVerificationCode}
                        disabled={countdown > 0 || isLoading}
                        className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                      >
                        {countdown > 0 ? `${countdown}s` : '发送验证码'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isLoading ? (
                      '登录中...'
                    ) : (
                      <>
                        登录
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {/* 注册模式 */}
          {authMode === 'register' && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">创建新账户</h2>
                <p className="text-gray-600 text-sm">填写以下信息完成注册</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    用户名 *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入用户名"
                      required
                    />
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入邮箱"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    手机号
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入手机号（可选）"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    密码 *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入密码（至少6位）"
                      required
                      minLength={6}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    确认密码 *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请再次输入密码"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    '注册中...'
                  ) : (
                    <>
                      创建账户
                      <UserPlus className="ml-2 w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* 测试连接按钮 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleTestBackend}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              测试后端连接
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
