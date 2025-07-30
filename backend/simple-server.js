const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3100;

// 内存存储（生产环境应该使用数据库）
let savedRequests = [];
let favoriteRequests = [];
let users = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@xhtech.com',
    password: 'admin123', // 实际应用中应该加密
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    created_at: new Date().toISOString()
  }
];

// 中间件
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 基本路由
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Test endpoint with rich JSON response
app.get('/api/test', (req, res) => {
  console.log('GET /api/test - Test endpoint hit');
  res.json({
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    features: [
      "Basic Auth Support",
      "Request Proxy",
      "Save Requests",
      "Favorites",
      "History",
      "Monaco Editor Response Viewer"
    ],
    sampleData: {
      users: [
        { id: 1, name: "Alice", email: "alice@example.com", active: true },
        { id: 2, name: "Bob", email: "bob@example.com", active: false },
        { id: 3, name: "Charlie", email: "charlie@example.com", active: true }
      ],
      config: {
        debugMode: false,
        apiVersion: "v1",
        rateLimit: 1000,
        features: {
          authentication: true,
          caching: true,
          compression: true
        }
      }
    }
  });
});

// 测试 Basic Auth 的端点
app.all('/test-auth', (req, res) => {
  const auth = req.headers.authorization;
  
  if (!auth || !auth.startsWith('Basic ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Basic Authentication required'
    });
  }
  
  try {
    const credentials = Buffer.from(auth.slice(6), 'base64').toString();
    const [username, password] = credentials.split(':');
    
    if (username === 'wecise.admin' && password === 'admin') {
      res.json({
        message: 'Authentication successful',
        user: username,
        timestamp: new Date().toISOString(),
        method: req.method,
        headers: req.headers
      });
    } else {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password is incorrect',
        received: { username }
      });
    }
  } catch (error) {
    res.status(400).json({
      error: 'Invalid authorization header',
      message: 'Could not decode credentials'
    });
  }
});

// 用户注册
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, phone } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ 
      success: false,
      error: '用户名、邮箱和密码不能为空' 
    });
  }
  
  // 检查用户是否已存在
  const existingUser = users.find(user => 
    user.username === username || user.email === email || (phone && user.phone === phone)
  );
  
  if (existingUser) {
    return res.status(400).json({ 
      success: false,
      error: existingUser.username === username ? '用户名已存在' : 
             existingUser.email === email ? '邮箱已被注册' : '手机号已被注册'
    });
  }
  
  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    phone,
    password, // 实际应用中需要加密
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    created_at: new Date().toISOString()
  };
  
  users.push(newUser);
  
  const token = 'simple-jwt-' + newUser.id + '-' + Date.now();
  
  console.log('User registered:', username, '- Total users:', users.length);
  
  res.json({
    success: true,
    message: '注册成功',
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      avatar: newUser.avatar,
      created_at: newUser.created_at
    },
    token
  });
});

// 用户登录
app.post('/api/auth/login', (req, res) => {
  const { username, email, phone, password, verificationCode } = req.body;
  
  // 手机验证码登录
  if (phone && verificationCode) {
    if (verificationCode !== '123456') {
      return res.status(400).json({ 
        success: false,
        error: '验证码错误' 
      });
    }
    
    let user = users.find(u => u.phone === phone);
    
    if (!user) {
      // 自动注册
      user = {
        id: Date.now().toString(),
        username: `用户${phone.slice(-4)}`,
        email: `${phone}@temp.com`,
        phone,
        password: 'temp-password',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`,
        created_at: new Date().toISOString()
      };
      users.push(user);
    }
    
    const token = 'simple-jwt-' + user.id + '-' + Date.now();
    
    return res.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        created_at: user.created_at
      },
      token
    });
  }
  
  // 用户名/邮箱登录
  if (!password) {
    return res.status(400).json({ 
      success: false,
      error: '密码不能为空' 
    });
  }
  
  const user = users.find(u => 
    (username && u.username === username) || 
    (email && u.email === email)
  );
  
  if (!user || user.password !== password) {
    return res.status(400).json({ 
      success: false,
      error: '用户名/邮箱或密码错误' 
    });
  }
  
  const token = 'simple-jwt-' + user.id + '-' + Date.now();
  
  res.json({
    success: true,
    message: '登录成功',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      created_at: user.created_at
    },
    token
  });
});

// 发送验证码
app.post('/api/auth/send-code', (req, res) => {
  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({ 
      success: false,
      error: '手机号不能为空' 
    });
  }
  
  console.log(`模拟发送验证码到 ${phone}: 123456`);
  
  res.json({
    success: true,
    message: '验证码已发送'
  });
});

// 保存请求端点
app.post('/api/requests/save', (req, res) => {
  const { name, url, method, params, headers, body, auth } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  const savedRequest = {
    id: Date.now().toString(),
    name: name || 'Untitled Request',
    url,
    method: method || 'GET',
    params: params || {},
    headers: headers || {},
    body,
    auth,
    timestamp: new Date().toISOString()
  };
  
  // 保存到内存存储
  savedRequests.push(savedRequest);
  console.log('Request saved:', savedRequest.name, '- Total saved:', savedRequests.length);
  
  res.json({
    success: true,
    message: 'Request saved successfully',
    request: savedRequest
  });
});

// 收藏请求端点
app.post('/api/requests/favorite', (req, res) => {
  const { name, url, method, params, headers, body, auth } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  const favoriteRequest = {
    id: Date.now().toString(),
    name: name || 'Untitled Request',
    url,
    method: method || 'GET',
    params: params || {},
    headers: headers || {},
    body,
    auth,
    timestamp: new Date().toISOString()
  };
  
  // 保存到内存存储
  favoriteRequests.push(favoriteRequest);
  console.log('Request favorited:', favoriteRequest.name, '- Total favorites:', favoriteRequests.length);
  
  res.json({
    success: true,
    message: 'Request added to favorites',
    favorite: favoriteRequest
  });
});

// 获取保存的请求列表
app.get('/api/requests/saved', (req, res) => {
  console.log('Getting saved requests, count:', savedRequests.length);
  res.json({
    success: true,
    requests: savedRequests.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  });
});

// 获取收藏的请求列表
app.get('/api/requests/favorites', (req, res) => {
  console.log('Getting favorite requests, count:', favoriteRequests.length);
  res.json({
    success: true,
    favorites: favoriteRequests.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  });
});

// 代理请求端点
app.post('/api/proxy', async (req, res) => {
  const { url, method, headers, body, auth, timeout = 30000 } = req.body;
  
  console.log('Proxy request:', { url, method, headers, auth: auth ? 'present' : 'none' });
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const axios = require('axios');
    const startTime = Date.now();

    const config = {
      url,
      method: method.toLowerCase(),
      headers: {
        'User-Agent': 'XH-Axon HTTP Client/1.0',
        ...headers
      },
      timeout,
      validateStatus: () => true, // 不抛出错误，返回所有状态码
      maxRedirects: 5
    };

    // 处理认证
    if (auth) {
      if (auth.type === 'basic' && auth.username && auth.password) {
        config.auth = {
          username: auth.username,
          password: auth.password
        };
      } else if (auth.type === 'bearer' && auth.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
    }

    // 如果是 POST、PUT、PATCH 等方法，添加请求体
    if (['post', 'put', 'patch'].includes(method.toLowerCase()) && body) {
      config.data = body;
    }

    const response = await axios(config);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // 返回响应
    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      timing: {
        duration,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Proxy error:', error);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        error: 'Request timeout',
        message: `Request timed out after ${timeout}ms`
      });
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(502).json({
        error: 'Connection failed',
        message: error.message
      });
    }

    if (error.response) {
      // 服务器返回了错误响应
      return res.json({
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data,
        error: true
      });
    }

    // 其他网络错误
    res.status(500).json({
      error: 'Network error',
      message: error.message
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 XH Axon Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});

module.exports = app;
