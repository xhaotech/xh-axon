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
