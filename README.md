
# XH Axon - HTTP API Client

一个现代化的 HTTP API 客户端工具，类似于 Postman，基于 React + TypeScript + Tailwind CSS 构建。

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

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 启动前端
pnpm dev

# 启动后端（新终端）
cd backend
node simple-server.js
```

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
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

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 许可证

MIT License

