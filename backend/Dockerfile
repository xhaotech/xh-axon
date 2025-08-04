FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 lock 文件
COPY package*.json ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile --production

# 复制应用代码
COPY . .

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

# 更改文件所有权
RUN chown -R backend:nodejs /app
USER backend

# 暴露端口
EXPOSE 3100

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3100/health || exit 1

# 启动应用
CMD ["node", "simple-server.js"]
