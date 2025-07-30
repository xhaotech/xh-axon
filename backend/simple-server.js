const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

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

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
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
