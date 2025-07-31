
# XH Axon - HTTP API Client

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/xhtaotech/xh-axon)
[![Version](https://img.shields.io/badge/version-0.2.0-blue)](https://github.com/xhtaotech/xh-axon/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)

一个现代化的 HTTP API 客户端工具，类似于 Postman，基于 React + TypeScript + Tailwind CSS 构建。

## 🚀 在线演示 · Live Demo

- **生产环境**: [https://xh-axon.vercel.app](https://xh-axon.vercel.app)
- **开发预览**: [http://localhost:3000](http://localhost:3000) (本地开发)

## 📊 项目状态 · Project Status

- ✅ **核心功能完整**：HTTP 请求构建、响应查看、认证支持
- ✅ **界面优化完成**：32px 迷你标签页、智能滚动、重命名功能  
- ✅ **国际化就绪**：完整中英文支持
- ✅ **生产环境就绪**：构建优化、部署文档完善
- 🔄 **持续改进中**：性能优化、功能扩展

## 特色功能 · Key Features

🚦 **多种 HTTP 请求方法支持**  
支持 GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS 等 HTTP 请求方法

🔒 **多种认证方式**  
支持 Bearer Token, Basic Auth, OAuth 2.0 等多种身份认证方式

🌐 **环境变量配置**  
支持多环境切换和变量管理，便于在不同环境间快速切换

📜 **请求历史与收藏**  
自动保存请求历史，支持收藏常用请求

🛠 **代码生成**  
支持生成 cURL, Fetch 等多种语言的代码片段

📱 **现代化界面**  
基于 Tailwind CSS 的现代化、响应式用户界面

💎 **Monaco Editor 集成**  
集成强大的Monaco Editor，提供专业的代码编辑和JSON查看体验

🏷️ **智能标签页管理**  
- **32px 迷你模式**：紧凑的标签页设计，节省空间
- **双击重命名**：直接双击标签页名称进行重命名
- **隐藏滚动条**：优雅的滚动体验，保持界面整洁
- **智能滚动**：自动滚动到当前活跃标签页

🌍 **国际化支持**  
- 支持中文/英文界面切换
- 本地化所有用户界面文本
- 语言偏好自动保存

⚡ **性能优化**  
- Vite 构建工具，快速热更新
- 代码分割和懒加载
- gzip 压缩后总大小仅 ~98KB

## 技术栈 · Tech Stack

- **前端框架**: React 18 + TypeScript
- **样式框架**: Tailwind CSS
- **状态管理**: Zustand
- **HTTP 客户端**: Axios
- **图标库**: Lucide React
- **代码编辑器**: Monaco Editor
- **构建工具**: Vite
- **部署**: Vercel

## 快速开始 · Quick Start

### 环境要求 · Prerequisites

- Node.js 18+ 
- pnpm (推荐) 或 npm
- Git

### 本地开发 · Development

#### 1. 克隆项目

```bash
git clone https://github.com/xhtaotech/xh-axon.git
cd xh-axon
```

#### 2. 安装依赖

```bash
# 安装前端依赖
pnpm install

# 安装后端依赖
cd backend
pnpm install
cd ..
```

#### 3. 启动开发服务器

```bash
# 启动前端开发服务器 (端口: 3000)
pnpm dev

# 启动后端服务器（新终端）(端口: 3100)
cd backend
node simple-server.js
```

访问 `http://localhost:3000` 即可开始使用。

### 生产环境部署 · Production Deployment

#### 方式一：完整构建部署 (推荐)

```bash
# 1. 构建前端生产版本
pnpm run build

# 2. 预览构建结果（可选）
pnpm run preview  # 访问 http://localhost:4173

# 3. 部署到静态文件服务器
# 将 dist/ 目录下的所有文件部署到您的 Web 服务器
```

#### 方式二：仅 Vite 构建（跳过 TypeScript 检查）

```bash
# 如果遇到 TypeScript 编译错误，可以跳过类型检查直接构建
pnpm vite build
```

#### 构建输出文件分析

构建完成后，`dist/` 目录将包含以下文件：

```
dist/
├── index.html              # 主入口文件 (0.47 kB)
├── assets/
│   ├── index-[hash].css    # 样式文件 (36.81 kB, gzip: 6.83 kB)
│   └── index-[hash].js     # JavaScript 包 (300.79 kB, gzip: 91.08 kB)
└── logo_03.png             # 应用图标
```

#### 部署到不同平台

##### Nginx 部署

1. 将 `dist/` 目录内容复制到 Nginx 的 web 根目录
2. 配置 Nginx 服务器：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # 处理 SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 启用 gzip 压缩
    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

##### Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

或通过 GitHub 集成自动部署。

##### Netlify 部署

1. 将项目推送到 GitHub
2. 在 Netlify 中连接 GitHub 仓库
3. 设置构建命令: `pnpm run build`
4. 设置发布目录: `dist`

##### Apache 部署

1. 将 `dist/` 目录内容复制到 Apache 的 DocumentRoot
2. 创建 `.htaccess` 文件：

```apache
RewriteEngine On
RewriteBase /

# 处理 SPA 路由
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# 启用压缩
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

#### 后端部署

##### Node.js 服务器部署

```bash
# 1. 在服务器上克隆项目
git clone https://github.com/xhtaotech/xh-axon.git
cd xh-axon/backend

# 2. 安装依赖
pnpm install

# 3. 启动后端服务
node simple-server.js

# 4. 使用 PM2 管理进程（推荐）
npm install -g pm2
pm2 start simple-server.js --name "xh-axon-backend"
pm2 save
pm2 startup
```

##### Docker 部署

创建 `Dockerfile`:

```dockerfile
# 前端构建
FROM node:18-alpine as frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 后端
FROM node:18-alpine as backend
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .

# 最终镜像
FROM nginx:alpine
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY --from=backend /app /backend
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 3100
CMD ["sh", "-c", "cd /backend && node simple-server.js & nginx -g 'daemon off;'"]
```

#### 环境变量配置

创建 `.env.production` 文件：

```env
# API 基础 URL
VITE_API_BASE_URL=https://your-api-domain.com

# 应用版本
VITE_APP_VERSION=1.0.0

# 其他配置
VITE_ENABLE_ANALYTICS=true
```

#### 性能优化建议

1. **启用 gzip/brotli 压缩**：在服务器层面启用压缩可将文件大小减少 70%+
2. **设置缓存策略**：为静态资源设置长期缓存
3. **使用 CDN**：将静态资源托管到 CDN 以提高加载速度
4. **监控性能**：使用工具监控应用性能和错误

#### 故障排除

##### 常见问题

1. **构建失败**：
   ```bash
   # 清除缓存重新构建
   rm -rf node_modules/.vite
   pnpm install
   pnpm run build
   ```

2. **TypeScript 错误**：
   ```bash
   # 跳过类型检查构建
   pnpm vite build
   ```

3. **路由问题**：确保服务器配置了 SPA 路由重定向到 `index.html`

##### 健康检查

部署后，访问以下端点检查服务状态：

- 前端：`https://your-domain.com`
- 后端 API：`https://your-api-domain.com/api/health`

### 开发工具 · Development Tools

```bash
# 类型检查
pnpm run type-check

# 代码检查
pnpm run lint

# 格式化代码
pnpm run format
```

## 项目结构

```
src/
├── components/             # React 组件
│   ├── Header.tsx         # 顶部导航栏
│   ├── Sidebar.tsx        # 侧边栏（历史记录、收藏等）
│   ├── MainPanel.tsx      # 主面板容器
│   ├── RequestTabs.tsx    # 请求标签页
│   ├── RequestBuilder.tsx # 请求构建器
│   ├── ResponseViewer.tsx # 响应查看器（Monaco Editor）
│   └── LoginPage.tsx      # 登录页面
├── store/                 # 状态管理
│   └── useAppStore.ts     # Zustand 状态存储
├── lib/                   # 工具库
│   ├── api.ts            # API 接口
│   ├── auth.ts           # 认证相关
│   ├── httpClient.ts     # HTTP 客户端
│   └── utils.ts          # 工具函数
├── types/                 # TypeScript 类型声明
│   └── copy-to-clipboard.d.ts
├── App.tsx               # 主应用组件
├── main.tsx              # 应用入口
└── index.css             # 全局样式

backend/
├── simple-server.js      # 后端服务器
├── package.json          # 后端依赖
└── src/                  # 后端源码
    ├── routes/           # 路由
    ├── middleware/       # 中间件
    └── types/           # 类型定义
```

## 主要功能

### 1. 请求构建器
- HTTP 方法选择（GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS）
- URL 输入和验证
- 查询参数管理
- 请求头配置
- 请求体编辑（JSON、Form Data、Raw）
- 身份认证配置（Basic Auth, Bearer Token）

### 2. 响应查看器（新功能）
- **Monaco Editor 集成**: 专业的代码编辑器体验
- **多种视图模式**: 格式化、原始、JSON树状、Headers视图
- **搜索功能**: 在响应中快速搜索文本
- **复制下载**: 支持复制到剪贴板和下载响应数据
- **全屏模式**: 大数据量时的全屏查看模式
- **语法高亮**: 支持JSON、XML、HTML等多种格式

### 3. 环境管理
- 创建和管理多个环境
- 环境变量配置
- 环境间快速切换

### 4. 历史记录
- 自动保存所有请求
- 按时间排序显示
- 快速重新发送请求
- 持久化存储到后端

### 5. 收藏功能
- 收藏常用请求
- 快速访问收藏的请求
- 后端持久化存储

### 6. 身份认证
- Basic Auth 支持
- Bearer Token 支持
- 认证持久化，页面刷新不丢失登录状态

## 已实现功能 ✅

- [x] 完整的请求构建器
- [x] Monaco Editor 响应显示
- [x] 多种响应查看模式
- [x] 请求历史记录
- [x] 收藏功能
- [x] Basic Auth 认证
- [x] 认证持久化
- [x] 后端API支持
- [x] 请求保存和管理
- [x] 响应数据处理和美化
- [x] **RequestTabs 32px 迷你模式** (新增)
- [x] **双击标签页重命名功能** (新增)
- [x] **隐藏滚动条的优雅滚动** (新增)
- [x] **完整的国际化支持** (新增)
- [x] **中英文界面切换** (新增)
- [x] **生产环境构建优化** (新增)

## 最新更新 · Latest Updates

### v0.2.0 (2025-01-31)

#### 🎨 用户界面改进
- **迷你标签页模式**：将标签页高度优化至32px，节省界面空间
- **智能滚动控制**：标签页滚动时自动隐藏滚动条，保持界面美观
- **标签页重命名**：双击标签页名称即可快速重命名，提升用户体验

#### 🌍 国际化支持
- **完整中英文支持**：所有界面文本支持中英文切换
- **智能语言检测**：根据浏览器语言自动选择默认语言
- **持久化语言设置**：用户语言偏好自动保存到本地存储

#### ⚡ 性能与构建优化
- **构建体积优化**：生产环境总体积压缩至 ~98KB (gzipped)
- **Vite 构建优化**：支持跳过 TypeScript 检查的快速构建
- **部署文档完善**：提供多平台部署指南 (Nginx, Vercel, Netlify, Apache)

#### 🔧 开发体验改进
- **简化的 i18n 系统**：优化国际化架构，提升开发效率
- **组件化重构**：优化组件结构，提升代码可维护性
- **TypeScript 类型优化**：改进类型定义，减少编译错误

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 许可证

MIT License

