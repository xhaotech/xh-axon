# 多阶段构建 Dockerfile

# 阶段1: 前端构建
FROM node:18-alpine as frontend-builder

# 设置工作目录
WORKDIR /app

# 复制前端 package.json 和 lock 文件
COPY package*.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制前端源代码
COPY . .

# 构建前端
RUN pnpm run build

# 阶段2: 后端构建
FROM node:18-alpine as backend-builder

# 设置工作目录
WORKDIR /app

# 复制后端 package.json
COPY backend/package*.json ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装后端依赖
RUN pnpm install --frozen-lockfile --production

# 复制后端源代码
COPY backend/ .

# 阶段3: 生产环境
FROM nginx:alpine

# 安装 Node.js (用于运行后端)
RUN apk add --no-cache nodejs npm

# 安装 supervisor 用于管理多个进程
RUN apk add --no-cache supervisor

# 创建应用目录
RUN mkdir -p /app/backend /var/log/supervisor

# 复制前端构建产物到 nginx 目录
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# 复制后端应用
COPY --from=backend-builder /app /app/backend

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 创建 supervisor 配置
RUN cat > /etc/supervisor/conf.d/supervisord.conf << 'EOF'
[supervisord]
nodaemon=true
user=root
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid

[program:nginx]
command=nginx -g "daemon off;"
stdout_logfile=/var/log/supervisor/nginx.log
stderr_logfile=/var/log/supervisor/nginx_error.log
autorestart=true
user=root

[program:backend]
command=node simple-server.js
directory=/app/backend
stdout_logfile=/var/log/supervisor/backend.log
stderr_logfile=/var/log/supervisor/backend_error.log
autorestart=true
user=root
environment=NODE_ENV=production,PORT=3100
EOF

# 设置权限
RUN chown -R nginx:nginx /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html

# 暴露端口
EXPOSE 80 3100

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# 启动 supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
