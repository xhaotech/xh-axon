import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Phone, Lock, User, ArrowRight, Loader2, Wifi, WifiOff, CheckCircle, XCircle, AlertCircle, Smartphone } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { httpClient } from '../lib/httpClient';
import { VerificationCodeInput } from './VerificationCodeInput';
import toast from 'react-hot-toast';
import '../styles/login-animations.css';

type LoginMethod = 'phone' | 'email';
type FormMode = 'login' | 'register';

interface ConnectionStatus {
  status: 'checking' | 'connected' | 'disconnected' | 'error';
  message: string;
  details?: any;
}

export const LoginPageRevamped: React.FC = () => {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone');
  const [formMode, setFormMode] = useState<FormMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'checking',
    message: '正在检测后端连接...'
  });
  
  const { login } = useAppStore();
  
  // 登录表单状态
  const [loginForm, setLoginForm] = useState({
    phoneOrEmail: '',
    password: '',
    verificationCode: '',
    rememberMe: true
  });
  
  // 注册表单状态
  const [registerForm, setRegisterForm] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
    agreePolicies: false
  });

  // 表单验证状态
  const [validation, setValidation] = useState({
    phoneOrEmail: { isValid: true, message: '' },
    password: { isValid: true, message: '' },
    confirmPassword: { isValid: true, message: '' },
    verificationCode: { isValid: true, message: '' },
    username: { isValid: true, message: '' }
  });

  // 检测后端连接状态
  const checkBackendConnection = async () => {
    setConnectionStatus({ status: 'checking', message: '正在检测后端连接...' });
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://localhost:3100/health', {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus({
          status: 'connected',
          message: '后端连接正常',
          details: data
        });
      } else {
        setConnectionStatus({
          status: 'error',
          message: `后端响应异常 (${response.status})`,
          details: { status: response.status, statusText: response.statusText }
        });
      }
    } catch (error: any) {
      console.error('Backend connection check failed:', error);
      setConnectionStatus({
        status: 'disconnected',
        message: '无法连接到后端服务',
        details: { error: error.message }
      });
    }
  };

  // 页面加载时检测连接
  useEffect(() => {
    checkBackendConnection();
    
    // 每30秒自动检查一次连接状态
    const interval = setInterval(checkBackendConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  // 实时表单验证
  const validateField = (field: string, value: string) => {
    let isValid = true;
    let message = '';

    switch (field) {
      case 'phoneOrEmail':
        if (!value) {
          isValid = false;
          message = loginMethod === 'phone' ? '请输入手机号' : '请输入邮箱';
        } else if (loginMethod === 'phone') {
          const phoneRegex = /^1[3-9]\d{9}$/;
          if (!phoneRegex.test(value)) {
            isValid = false;
            message = '请输入正确的手机号格式';
          }
        } else if (loginMethod === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            isValid = false;
            message = '请输入正确的邮箱格式';
          }
        }
        break;
        
      case 'password':
        if (!value) {
          isValid = false;
          message = '请输入密码';
        } else if (formMode === 'register' && value.length < 6) {
          isValid = false;
          message = '密码长度至少6位';
        }
        break;
        
      case 'confirmPassword':
        if (formMode === 'register') {
          if (!value) {
            isValid = false;
            message = '请确认密码';
          } else if (value !== registerForm.password) {
            isValid = false;
            message = '两次输入的密码不一致';
          }
        }
        break;
        
      case 'username':
        if (formMode === 'register') {
          if (!value) {
            isValid = false;
            message = '请输入用户名';
          } else if (value.length < 2) {
            isValid = false;
            message = '用户名至少2个字符';
          }
        }
        break;
        
      case 'verificationCode':
        if (loginMethod === 'phone' && !value) {
          isValid = false;
          message = '请输入验证码';
        }
        break;
    }

    setValidation(prev => ({
      ...prev,
      [field]: { isValid, message }
    }));

    return isValid;
  };

  // 发送验证码
  const handleSendVerificationCode = async () => {
    const phoneNumber = formMode === 'login' ? loginForm.phoneOrEmail : registerForm.phone;
    
    if (!phoneNumber) {
      toast.error('请先输入手机号');
      return;
    }
    
    if (!validateField('phoneOrEmail', phoneNumber)) {
      return;
    }

    if (connectionStatus.status !== 'connected') {
      toast.error('后端服务未连接，无法发送验证码');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await httpClient.post('/api/auth/send-code', {
        phone: phoneNumber
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
        
        // 开发环境下显示验证码
        if (response.data.devCode) {
          toast.success(
            `验证码已发送！\n开发环境验证码：${response.data.devCode}`,
            { duration: 8000 }
          );
          console.log('🔑 开发环境验证码:', response.data.devCode);
          
          // 开发环境下自动填入验证码
          if (formMode === 'login') {
            setLoginForm(prev => ({ ...prev, verificationCode: response.data.devCode }));
          } else {
            setRegisterForm(prev => ({ ...prev, verificationCode: response.data.devCode }));
          }
        } else {
          toast.success('验证码已发送，请查收短信');
        }
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

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (connectionStatus.status !== 'connected') {
      toast.error('后端服务未连接，无法登录');
      return;
    }
    
    // 验证必填字段
    const phoneOrEmailValid = validateField('phoneOrEmail', loginForm.phoneOrEmail);
    
    let isFormValid = phoneOrEmailValid;
    
    if (loginMethod === 'phone') {
      const codeValid = validateField('verificationCode', loginForm.verificationCode);
      isFormValid = isFormValid && codeValid;
    } else {
      const passwordValid = validateField('password', loginForm.password);
      isFormValid = isFormValid && passwordValid;
    }
    
    if (!isFormValid) {
      toast.error('请检查输入信息');
      return;
    }
    
    setIsLoading(true);
    try {
      let requestData: any = {};
      
      if (loginMethod === 'phone') {
        requestData = {
          phone: loginForm.phoneOrEmail,
          verificationCode: loginForm.verificationCode
        };
      } else {
        requestData = {
          [loginForm.phoneOrEmail.includes('@') ? 'email' : 'username']: loginForm.phoneOrEmail,
          password: loginForm.password
        };
      }
      
      const response = await httpClient.post('/api/auth/login', requestData);
      
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
        toast.error(response.data.error || '登录失败');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || '登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理注册
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (connectionStatus.status !== 'connected') {
      toast.error('后端服务未连接，无法注册');
      return;
    }

    if (!registerForm.agreePolicies) {
      toast.error('请同意用户协议和隐私政策');
      return;
    }
    
    // 验证所有字段
    const usernameValid = validateField('username', registerForm.username);
    const phoneValid = validateField('phoneOrEmail', registerForm.phone);
    const emailValid = registerForm.email ? validateField('phoneOrEmail', registerForm.email) : true;
    const passwordValid = validateField('password', registerForm.password);
    const confirmPasswordValid = validateField('confirmPassword', registerForm.confirmPassword);
    
    const isFormValid = usernameValid && phoneValid && emailValid && passwordValid && confirmPasswordValid;
    
    if (!isFormValid) {
      toast.error('请检查输入信息');
      return;
    }

    setIsLoading(true);
    try {
      const response = await httpClient.post('/api/auth/register', {
        username: registerForm.username,
        phone: registerForm.phone,
        email: registerForm.email || undefined,
        password: registerForm.password
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

  // 渲染连接状态指示器
  const renderConnectionStatus = () => {
    const { status, message, details } = connectionStatus;
    
    let icon, bgColor, textColor, borderColor;
    
    switch (status) {
      case 'checking':
        icon = <Loader2 className="w-4 h-4 animate-spin" />;
        bgColor = 'bg-blue-50';
        textColor = 'text-blue-700';
        borderColor = 'border-blue-200';
        break;
      case 'connected':
        icon = <CheckCircle className="w-4 h-4" />;
        bgColor = 'bg-green-50';
        textColor = 'text-green-700';
        borderColor = 'border-green-200';
        break;
      case 'disconnected':
        icon = <WifiOff className="w-4 h-4" />;
        bgColor = 'bg-red-50';
        textColor = 'text-red-700';
        borderColor = 'border-red-200';
        break;
      case 'error':
        icon = <AlertCircle className="w-4 h-4" />;
        bgColor = 'bg-yellow-50';
        textColor = 'text-yellow-700';
        borderColor = 'border-yellow-200';
        break;
    }
    
    return (
      <div className={`flex items-center gap-2 p-3 rounded-lg border ${bgColor} ${borderColor} mb-6`}>
        {icon}
        <div className="flex-1">
          <span className={`text-sm font-medium ${textColor}`}>{message}</span>
          {details && (
            <div className={`text-xs ${textColor} opacity-75 mt-1`}>
              {status === 'connected' && details.version && `版本: ${details.version}`}
              {status === 'error' && `错误: ${details.status} ${details.statusText}`}
              {status === 'disconnected' && `错误: ${details.error}`}
            </div>
          )}
        </div>
        <button
          onClick={checkBackendConnection}
          className={`text-xs px-2 py-1 rounded ${textColor} hover:bg-opacity-20 hover:bg-current transition-colors`}
          disabled={status === 'checking'}
        >
          {status === 'checking' ? '检测中...' : '重新检测'}
        </button>
      </div>
    );
  };

  // 渲染输入框
  const renderInput = (
    type: string,
    value: string,
    onChange: (value: string) => void,
    placeholder: string,
    icon: React.ReactNode,
    validationKey: string,
    required = true
  ) => {
    const fieldValidation = validation[validationKey as keyof typeof validation];
    const hasError = !fieldValidation.isValid;
    
    return (
      <div>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
          <input
            type={type === 'password' && showPassword ? 'text' : type}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              validateField(validationKey, e.target.value);
            }}
            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder={placeholder}
            required={required}
          />
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
        {hasError && (
          <p className="text-red-500 text-sm mt-1">{fieldValidation.message}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
      </div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl mb-4 shadow-2xl border border-white/30">
            <span className="text-white font-bold text-3xl">XH</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">Axon</h1>
          <p className="text-white/80 text-lg drop-shadow">专业的 HTTP API 客户端工具</p>
        </div>

        {/* 主卡片 */}
        <div className="glass-morphism rounded-3xl shadow-2xl p-8 card-hover">{/* 连接状态 */}
          {renderConnectionStatus()}
          
          {/* 模式切换 */}
          <div className="flex bg-gray-50 rounded-2xl p-1 mb-8">
            <button
              type="button"
              onClick={() => setFormMode('login')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                formMode === 'login'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              登录账户
            </button>
            <button
              type="button"
              onClick={() => setFormMode('register')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                formMode === 'register'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              创建账户
            </button>
          </div>

          {/* 登录表单 */}
          {formMode === 'login' && (
            <>
              {/* 登录方式切换 */}
              <div className="flex bg-gray-50 rounded-xl p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    loginMethod === 'phone'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Phone className="w-4 h-4 inline-block mr-2" />
                  手机号
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    loginMethod === 'email'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Mail className="w-4 h-4 inline-block mr-2" />
                  邮箱
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {/* 账号输入 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {loginMethod === 'phone' ? '手机号' : '邮箱'}
                  </label>
                  {renderInput(
                    loginMethod === 'phone' ? 'tel' : 'email',
                    loginForm.phoneOrEmail,
                    (value) => setLoginForm(prev => ({ ...prev, phoneOrEmail: value })),
                    loginMethod === 'phone' ? '请输入手机号' : '请输入邮箱',
                    loginMethod === 'phone' ? <Phone className="w-5 h-5" /> : <Mail className="w-5 h-5" />,
                    'phoneOrEmail'
                  )}
                </div>

                {/* 密码或验证码 */}
                {loginMethod === 'phone' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      验证码
                    </label>
                    <div className="space-y-4">
                      <VerificationCodeInput
                        value={loginForm.verificationCode}
                        onChange={(code) => setLoginForm(prev => ({ ...prev, verificationCode: code }))}
                        disabled={isLoading}
                        autoFocus={true}
                      />
                      
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={handleSendVerificationCode}
                          disabled={countdown > 0 || isLoading || connectionStatus.status !== 'connected'}
                          className="px-6 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium text-sm flex items-center space-x-2"
                        >
                          <Phone className="w-4 h-4" />
                          <span>
                            {countdown > 0 ? `重新发送 (${countdown}s)` : '发送验证码'}
                          </span>
                        </button>
                      </div>
                      
                      {countdown > 0 && (
                        <p className="text-center text-sm text-green-600">
                          验证码已发送，请查收短信（开发环境下查看浏览器控制台）
                        </p>
                      )}
                    </div>
                    
                    {!validation.verificationCode.isValid && (
                      <p className="text-red-500 text-sm mt-2 text-center">
                        {validation.verificationCode.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      密码
                    </label>
                    {renderInput(
                      'password',
                      loginForm.password,
                      (value) => setLoginForm(prev => ({ ...prev, password: value })),
                      '请输入密码',
                      <Lock className="w-5 h-5" />,
                      'password'
                    )}
                  </div>
                )}

                {/* 记住我 */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={loginForm.rememberMe}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, rememberMe: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">记住我</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    忘记密码？
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || connectionStatus.status !== 'connected'}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5 mr-2" />
                      登录中...
                    </>
                  ) : (
                    <>
                      立即登录
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* 注册表单 */}
          {formMode === 'register' && (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">创建新账户</h2>
                <p className="text-gray-600 text-sm">加入 XH Axon，开始您的 API 测试之旅</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                {/* 用户名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    用户名 *
                  </label>
                  {renderInput(
                    'text',
                    registerForm.username,
                    (value) => setRegisterForm(prev => ({ ...prev, username: value })),
                    '请输入用户名',
                    <User className="w-5 h-5" />,
                    'username'
                  )}
                </div>

                {/* 手机号 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    手机号 *
                  </label>
                  {renderInput(
                    'tel',
                    registerForm.phone,
                    (value) => setRegisterForm(prev => ({ ...prev, phone: value })),
                    '请输入手机号',
                    <Phone className="w-5 h-5" />,
                    'phoneOrEmail'
                  )}
                </div>

                {/* 邮箱 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    邮箱（可选）
                  </label>
                  {renderInput(
                    'email',
                    registerForm.email,
                    (value) => setRegisterForm(prev => ({ ...prev, email: value })),
                    '请输入邮箱（可选）',
                    <Mail className="w-5 h-5" />,
                    'phoneOrEmail',
                    false
                  )}
                </div>

                {/* 密码 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    密码 *
                  </label>
                  {renderInput(
                    'password',
                    registerForm.password,
                    (value) => setRegisterForm(prev => ({ ...prev, password: value })),
                    '请输入密码（至少6位）',
                    <Lock className="w-5 h-5" />,
                    'password'
                  )}
                </div>

                {/* 确认密码 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    确认密码 *
                  </label>
                  {renderInput(
                    'password',
                    registerForm.confirmPassword,
                    (value) => setRegisterForm(prev => ({ ...prev, confirmPassword: value })),
                    '请再次输入密码',
                    <Lock className="w-5 h-5" />,
                    'confirmPassword'
                  )}
                </div>

                {/* 协议同意 */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={registerForm.agreePolicies}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, agreePolicies: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    required
                  />
                  <span className="ml-3 text-sm text-gray-600 leading-relaxed">
                    我已阅读并同意
                    <button type="button" className="text-blue-600 hover:text-blue-500 mx-1">用户协议</button>
                    和
                    <button type="button" className="text-blue-600 hover:text-blue-500 mx-1">隐私政策</button>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !registerForm.agreePolicies || connectionStatus.status !== 'connected'}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5 mr-2" />
                      注册中...
                    </>
                  ) : (
                    <>
                      创建账户
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* 底部信息 */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>© 2025 XH Technology. 保留所有权利。</p>
          <div className="flex justify-center space-x-4 mt-2">
            <button className="hover:text-gray-700">帮助中心</button>
            <button className="hover:text-gray-700">联系支持</button>
            <button className="hover:text-gray-700">关于我们</button>
          </div>
        </div>
      </div>
    </div>
  );
};
