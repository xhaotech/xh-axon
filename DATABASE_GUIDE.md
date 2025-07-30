# XH Axon 数据库配置指南

## 概述
XH Axon 支持多种主流数据库，包括 SQLite、MySQL、PostgreSQL 和 MariaDB。

## 环境变量配置

在项目根目录创建 `.env` 文件（后端目录下）：

### SQLite（默认，无需额外配置）
```env
# 无需配置，默认使用 SQLite
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/xh-axon.db
```

### MySQL
```env
DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=xh_axon
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
```

### PostgreSQL
```env
DATABASE_TYPE=postgresql
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=xh_axon
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
```

### MariaDB
```env
DATABASE_TYPE=mariadb
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=xh_axon
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
```

## 数据库准备

### MySQL/MariaDB
```sql
CREATE DATABASE xh_axon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'xh_axon_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON xh_axon.* TO 'xh_axon_user'@'localhost';
FLUSH PRIVILEGES;
```

### PostgreSQL
```sql
CREATE DATABASE xh_axon;
CREATE USER xh_axon_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE xh_axon TO xh_axon_user;
```

## 依赖安装

根据使用的数据库类型，安装相应的驱动：

```bash
# MySQL
npm install mysql2

# PostgreSQL
npm install pg pg-hstore

# MariaDB
npm install mariadb

# SQLite（默认已安装）
npm install sqlite3
```

## 数据模型

系统包含以下数据表：

1. **users** - 用户信息
   - id, username, email, password, phone, avatar, created_at, updated_at

2. **environments** - 环境配置
   - id, user_id, name, variables, created_at, updated_at

3. **request_histories** - 请求历史
   - id, user_id, url, method, headers, body, response, created_at

4. **favorites** - 收藏请求
   - id, user_id, url, method, headers, body, name, created_at

## 数据库迁移

首次启动时，系统会自动创建表结构。支持以下同步选项：

- `force: false` - 不删除现有表
- `alter: true` - 自动调整表结构适应模型变化

## 连接池配置

为了提高性能，系统配置了连接池：

```javascript
pool: {
  max: 10,        // 最大连接数
  min: 0,         // 最小连接数
  acquire: 30000, // 获取连接超时时间
  idle: 10000     // 连接空闲时间
}
```

## 故障排除

### 连接问题
1. 检查数据库服务是否启动
2. 验证连接参数是否正确
3. 确认防火墙设置允许连接

### 权限问题
1. 确认用户具有数据库读写权限
2. 检查数据库文件路径权限（SQLite）

### 性能优化
1. 为常用查询字段添加索引
2. 调整连接池大小
3. 监控数据库性能指标

## 备份建议

### SQLite
```bash
cp ./data/xh-axon.db ./backup/xh-axon-$(date +%Y%m%d).db
```

### MySQL/MariaDB
```bash
mysqldump -u xh_axon_user -p xh_axon > backup-$(date +%Y%m%d).sql
```

### PostgreSQL
```bash
pg_dump -U xh_axon_user xh_axon > backup-$(date +%Y%m%d).sql
```
