# XH Axon 快速启动指南

## 项目概述
XH Axon 是一个专业的 HTTP API 客户端工具，类似于 Postman，支持用户注册、请求管理、历史记录和收藏功能。

## 主要特性
✅ 用户注册和认证系统  
✅ 多种数据库支持（SQLite、MySQL、PostgreSQL、MariaDB）  
✅ HTTP 请求构建和测试  
✅ 请求历史记录  
✅ 收藏请求管理  
✅ 环境变量配置  
✅ 响应式设计  
✅ 实时通知系统  

## 技术栈
- **前端**: React 18 + TypeScript + Vite + Tailwind CSS
- **后端**: Node.js + Express + Sequelize ORM
- **数据库**: SQLite（默认）/ MySQL / PostgreSQL / MariaDB
- **认证**: JWT + bcrypt
- **状态管理**: Zustand
- **通知系统**: react-hot-toast

## 快速启动

### 1. 环境要求
- Node.js >= 16
- npm 或 pnpm
- 数据库（可选，默认使用 SQLite）

### 2. 安装依赖

#### 前端依赖
```bash
# 在项目根目录
npm install
# 或使用 pnpm
pnpm install
```

#### 后端依赖
```bash
# 在 backend 目录
cd backend
npm install
# 或使用 pnpm
pnpm install
```

### 3. 数据库配置（可选）
如果使用 SQLite（默认），无需额外配置。  
如需使用其他数据库，请参考 [DATABASE_GUIDE.md](./DATABASE_GUIDE.md)

### 4. 启动开发环境

#### 方法一：快速启动（使用简单服务器）
```bash
# 启动后端（简单服务器版本）
cd backend
node simple-server.js

# 新终端窗口，启动前端
npm run dev
```

#### 方法二：完整启动（使用TypeScript服务器）
```bash
# 启动后端（完整版本）
cd backend
npm run build  # 构建 TypeScript
npm start       # 启动服务器

# 新终端窗口，启动前端
npm run dev
```

### 5. 访问应用
- 前端: http://localhost:3000
- 后端: http://localhost:3100
- 健康检查: http://localhost:3100/health

## 功能演示

### 用户注册与登录
1. 打开 http://localhost:3000
2. 点击"注册"标签
3. 填写用户名、邮箱、密码等信息
4. 点击"创建账户"完成注册
5. 或使用已有账户登录

### API 测试功能
1. 登录后进入主界面
2. 在URL输入框输入API地址
3. 选择HTTP方法（GET、POST等）
4. 设置请求头、参数、请求体
5. 点击"发送"按钮
6. 查看响应结果

### 保存和收藏
1. 发送请求后，点击"保存"按钮
2. 在左侧边栏"历史记录"中查看所有请求
3. 点击❤️图标将请求加入收藏
4. 在"收藏"面板中管理收藏的请求

## API 端点

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/send-code` - 发送验证码
- `GET /api/auth/verify` - 验证token

### 请求管理
- `GET /api/requests/history` - 获取请求历史
- `POST /api/requests/save` - 保存请求
- `DELETE /api/requests/history/:id` - 删除历史记录

### 收藏管理
- `GET /api/requests/favorites` - 获取收藏列表
- `POST /api/requests/favorite` - 添加收藏
- `DELETE /api/requests/favorites/:id` - 删除收藏

### 系统信息
- `GET /health` - 健康检查
- `GET /api/user/profile` - 用户信息

## 开发指南

### 项目结构
```
xh-axon/
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   ├── lib/               # 工具库
│   ├── store/             # 状态管理
│   └── main.tsx           # 入口文件
├── backend/               # 后端源码
│   ├── src/               # TypeScript 源码
│   ├── simple-server.js   # 简单服务器
│   └── package.json       # 后端依赖
└── README.md              # 项目说明
```

### 开发命令
```bash
# 前端开发
npm run dev         # 启动开发服务器
npm run build       # 构建生产版本
npm run preview     # 预览生产版本

# 后端开发
cd backend
npm run build       # 构建 TypeScript
npm run dev         # 开发模式启动
npm start           # 生产模式启动
node simple-server.js  # 简单服务器
```

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 使用 Prettier 格式化代码
- 提交前运行 `npm run lint`

## 部署指南

### 前端部署
```bash
npm run build
# 将 dist/ 目录部署到静态服务器
```

### 后端部署
```bash
cd backend
npm run build
npm start
# 配置 PM2 或其他进程管理器
```

### Docker 部署（待完善）
```dockerfile
# 可根据需要添加 Docker 配置
FROM node:18-alpine
# ... 构建步骤
```

## 故障排除

### 常见问题
1. **端口占用**: 使用 `lsof -ti:3000` 查找并终止占用进程
2. **数据库连接失败**: 检查数据库配置和服务状态
3. **CORS 错误**: 确认后端 CORS 配置正确
4. **认证失败**: 检查 JWT token 是否正确设置

### 日志查看
- 前端: 浏览器开发者工具 Console
- 后端: 终端输出或日志文件

### 开发调试
1. 在浏览器中按 F12 打开开发者工具
2. 查看 Network 标签了解 API 请求状态
3. 使用 "测试后端连接" 按钮验证后端状态

## 贡献指南
1. Fork 项目仓库
2. 创建功能分支 `git checkout -b feature/new-feature`
3. 提交更改 `git commit -m 'Add new feature'`
4. 推送分支 `git push origin feature/new-feature`
5. 创建 Pull Request

## 许可证
本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 支持
如有问题或建议，请提交 Issue 或联系开发团队。
