import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, syncDatabase } from './config/database';
import { User, RequestHistory, Favorite, Environment } from './models';
import { AuthService } from './services/AuthService';
import axios from 'axios';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3100;

// 中间件
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://localhost:3006',
    'http://localhost:3007',
    'http://localhost:3008',
    'http://localhost:5173',
    'http://localhost:8080'
  ],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// 身份验证中间件
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  try {
    const user = await AuthService.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    database: process.env.DB_TYPE || 'sqlite'
  });
});

// 用户注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: '用户名、邮箱和密码不能为空' });
    }

    const result = await AuthService.register({ username, email, password, phone });
    
    res.json({
      success: true,
      message: '注册成功',
      user: result.user,
      token: result.token
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || '注册失败' 
    });
  }
});

// 用户登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const loginData = req.body;
    const result = await AuthService.login(loginData);
    
    res.json({
      success: true,
      message: '登录成功',
      user: result.user,
      token: result.token
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || '登录失败' 
    });
  }
});

// 发送验证码
app.post('/api/auth/send-code', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: '手机号不能为空' });
    }

    await AuthService.sendVerificationCode(phone);
    
    res.json({
      success: true,
      message: '验证码已发送'
    });
  } catch (error: any) {
    console.error('Send code error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || '发送验证码失败' 
    });
  }
});

// 获取用户信息
app.get('/api/auth/profile', authenticateToken, async (req: any, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// 更新用户信息
app.put('/api/auth/profile', authenticateToken, async (req: any, res) => {
  try {
    const updates = req.body;
    const user = await AuthService.updateProfile(req.user.id, updates);
    
    res.json({
      success: true,
      user
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || '更新失败' 
    });
  }
});

// 保存请求
app.post('/api/requests/save', authenticateToken, async (req: any, res) => {
  try {
    const { name, url, method, params, headers, body, auth } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const savedRequest = await RequestHistory.create({
      user_id: req.user.id,
      name: name || 'Untitled Request',
      url,
      method: method || 'GET',
      params: params || {},
      headers: headers || {},
      body,
      auth
    });
    
    console.log('Request saved:', savedRequest.name, '- User:', req.user.username);
    
    res.json({
      success: true,
      message: 'Request saved successfully',
      request: {
        id: savedRequest.id,
        name: savedRequest.name,
        url: savedRequest.url,
        method: savedRequest.method,
        params: savedRequest.params,
        headers: savedRequest.headers,
        timestamp: savedRequest.created_at
      }
    });
  } catch (error: any) {
    console.error('Save request error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to save request' 
    });
  }
});

// 添加到收藏
app.post('/api/requests/favorite', authenticateToken, async (req: any, res) => {
  try {
    const { name, url, method, params, headers, body, auth, folder } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const favorite = await Favorite.create({
      user_id: req.user.id,
      name: name || 'Untitled Request',
      url,
      method: method || 'GET',
      params: params || {},
      headers: headers || {},
      body,
      auth,
      folder
    });
    
    console.log('Request favorited:', favorite.name, '- User:', req.user.username);
    
    res.json({
      success: true,
      message: 'Request added to favorites',
      favorite: {
        id: favorite.id,
        name: favorite.name,
        url: favorite.url,
        method: favorite.method,
        folder: favorite.folder,
        timestamp: favorite.created_at
      }
    });
  } catch (error: any) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to add to favorites' 
    });
  }
});

// 获取保存的请求列表
app.get('/api/requests/saved', authenticateToken, async (req: any, res) => {
  try {
    const requests = await RequestHistory.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    
    console.log('Getting saved requests for user:', req.user.username, 'count:', requests.length);
    
    res.json({
      success: true,
      requests
    });
  } catch (error: any) {
    console.error('Get saved requests error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to get saved requests' 
    });
  }
});

// 获取收藏的请求列表
app.get('/api/requests/favorites', authenticateToken, async (req: any, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    
    console.log('Getting favorite requests for user:', req.user.username, 'count:', favorites.length);
    
    res.json({
      success: true,
      favorites
    });
  } catch (error: any) {
    console.error('Get favorites error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to get favorites' 
    });
  }
});

// 代理请求
app.post('/api/proxy', authenticateToken, async (req: any, res) => {
  try {
    const { url, method, headers, body, auth } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const requestConfig: any = {
      method: method || 'GET',
      url,
      timeout: 30000,
      validateStatus: () => true,
      maxRedirects: 5
    };
    
    if (headers) {
      requestConfig.headers = headers;
    }
    
    if (body && ['POST', 'PUT', 'PATCH'].includes(method?.toUpperCase())) {
      requestConfig.data = body;
    }
    
    if (auth && auth.type === 'bearer' && auth.token) {
      requestConfig.headers = {
        ...requestConfig.headers,
        'Authorization': `Bearer ${auth.token}`
      };
    } else if (auth && auth.type === 'basic' && auth.username && auth.password) {
      requestConfig.auth = {
        username: auth.username,
        password: auth.password
      };
    }
    
    console.log('Proxying request to:', url, 'for user:', req.user.username);
    
    const startTime = Date.now();
    const response = await axios(requestConfig);
    const duration = Date.now() - startTime;
    
    res.json({
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      duration
    });
  } catch (error: any) {
    console.error('Proxy request error:', error);
    
    if (error.response) {
      res.json({
        success: false,
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Proxy request failed'
      });
    }
  }
});

// 环境变量管理
app.get('/api/environments', authenticateToken, async (req: any, res) => {
  try {
    const environments = await Environment.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      environments
    });
  } catch (error: any) {
    console.error('Get environments error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to get environments' 
    });
  }
});

app.post('/api/environments', authenticateToken, async (req: any, res) => {
  try {
    const { name, variables } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Environment name is required' });
    }
    
    const environment = await Environment.create({
      user_id: req.user.id,
      name,
      variables: variables || {}
    });
    
    res.json({
      success: true,
      environment
    });
  } catch (error: any) {
    console.error('Create environment error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create environment' 
    });
  }
});

// 错误处理中间件
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// 数据库初始化和服务器启动
const initializeServer = async () => {
  try {
    console.log('🚀 Initializing XH Axon Backend Server...');
    
    // 测试数据库连接
    await testConnection();
    
    // 同步数据库模型
    await syncDatabase();
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`🌟 XH Axon Backend Server running on port ${PORT}`);
      console.log(`📊 Database: ${process.env.DB_TYPE || 'sqlite'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log('✅ Server ready to accept requests');
    });
  } catch (error) {
    console.error('❌ Failed to initialize server:', error);
    process.exit(1);
  }
};

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// 启动服务器
initializeServer();
