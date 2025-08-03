const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3100;

// 中间件
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 内存存储
let collections = [
  {
    id: 'collection-1',
    name: '用户管理 API',
    description: '用户相关的API接口集合',
    userId: 'user-1',
    children: [],
    requests: [
      {
        id: 'req-1',
        name: '用户登录',
        method: 'POST',
        url: '/api/auth/login',
        headers: { 'Content-Type': 'application/json' },
        body: { email: 'user@example.com', password: 'password' },
        collectionId: 'collection-1',
        userId: 'user-1',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'req-2',
        name: '获取用户信息',
        method: 'GET',
        url: '/api/user/profile',
        headers: { 'Authorization': 'Bearer {{token}}' },
        collectionId: 'collection-1',
        userId: 'user-1',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    order: 0
  }
];

let environments = [
  {
    id: 'env-1',
    name: '开发环境',
    variables: {
      baseUrl: 'http://localhost:3100',
      token: 'dev-token-123'
    },
    isActive: true
  },
  {
    id: 'env-2',
    name: '生产环境',
    variables: {
      baseUrl: 'https://api.production.com',
      token: 'prod-token-xyz'
    },
    isActive: false
  }
];

// API 路由

// 集合相关
app.get('/api/collections', (req, res) => {
  res.json(collections);
});

app.post('/api/collections', (req, res) => {
  const { name, description, parentId } = req.body;
  const newCollection = {
    id: `collection-${Date.now()}`,
    name,
    description,
    userId: 'user-1',
    parentId,
    children: [],
    requests: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    order: collections.length
  };
  collections.push(newCollection);
  res.json(newCollection);
});

app.put('/api/collections/:id', (req, res) => {
  const { id } = req.params;
  const collectionIndex = collections.findIndex(c => c.id === id);
  if (collectionIndex === -1) {
    return res.status(404).json({ error: 'Collection not found' });
  }
  
  collections[collectionIndex] = {
    ...collections[collectionIndex],
    ...req.body,
    updatedAt: new Date()
  };
  
  res.json(collections[collectionIndex]);
});

app.delete('/api/collections/:id', (req, res) => {
  const { id } = req.params;
  collections = collections.filter(c => c.id !== id);
  res.json({ message: 'Collection deleted' });
});

// 环境相关
app.get('/api/environments', (req, res) => {
  res.json(environments);
});

app.post('/api/environments', (req, res) => {
  const newEnvironment = {
    id: `env-${Date.now()}`,
    ...req.body,
    createdAt: new Date()
  };
  environments.push(newEnvironment);
  res.json(newEnvironment);
});

app.put('/api/environments/:id', (req, res) => {
  const { id } = req.params;
  const envIndex = environments.findIndex(e => e.id === id);
  if (envIndex === -1) {
    return res.status(404).json({ error: 'Environment not found' });
  }
  
  environments[envIndex] = {
    ...environments[envIndex],
    ...req.body,
    updatedAt: new Date()
  };
  
  res.json(environments[envIndex]);
});

// 请求执行
app.post('/api/execute', (req, res) => {
  const { method, url, headers, body } = req.body;
  
  // 模拟请求执行
  setTimeout(() => {
    res.json({
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
        'x-response-time': '45ms'
      },
      data: {
        message: 'Request executed successfully',
        timestamp: new Date().toISOString(),
        request: { method, url, headers, body }
      },
      duration: Math.floor(Math.random() * 500) + 50
    });
  }, Math.floor(Math.random() * 200) + 50);
});

// 批量执行
app.post('/api/batch-execute', (req, res) => {
  const { requests, options } = req.body;
  
  // 模拟批量执行
  const results = requests.map((request, index) => ({
    id: request.id,
    name: request.name,
    status: Math.random() > 0.1 ? 'success' : 'failed',
    statusCode: Math.random() > 0.1 ? 200 : 500,
    duration: Math.floor(Math.random() * 1000) + 100,
    timestamp: new Date().toISOString()
  }));
  
  setTimeout(() => {
    res.json({
      results,
      summary: {
        total: results.length,
        success: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length,
        totalDuration: results.reduce((sum, r) => sum + r.duration, 0)
      }
    });
  }, 1000);
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 XH-Axon 后端服务已启动`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`📋 API文档: http://localhost:${PORT}/health`);
  console.log(`✅ 服务状态: 正常运行`);
});
