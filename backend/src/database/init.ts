import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || './data/database.sqlite';

// 确保数据目录存在
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new sqlite3.Database(DB_PATH);

export const initDatabase = (): void => {
  console.log('🗄️  Initializing database...');

  // 用户表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE,
      phone VARCHAR(20) UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      avatar_url VARCHAR(255),
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 验证码表
  db.run(`
    CREATE TABLE IF NOT EXISTS verification_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone VARCHAR(20) NOT NULL,
      code VARCHAR(10) NOT NULL,
      expires_at DATETIME NOT NULL,
      is_used BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 环境配置表
  db.run(`
    CREATE TABLE IF NOT EXISTS environments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name VARCHAR(100) NOT NULL,
      variables TEXT, -- JSON 格式存储变量
      is_active BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // 请求历史表
  db.run(`
    CREATE TABLE IF NOT EXISTS request_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name VARCHAR(200),
      url TEXT NOT NULL,
      method VARCHAR(10) NOT NULL,
      headers TEXT, -- JSON 格式
      body TEXT,
      params TEXT, -- JSON 格式
      auth_config TEXT, -- JSON 格式
      response_status INTEGER,
      response_headers TEXT, -- JSON 格式
      response_body TEXT,
      response_time INTEGER, -- 响应时间（毫秒）
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // 收藏请求表 - 独立表结构
  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name VARCHAR(200) NOT NULL,
      url TEXT NOT NULL,
      method VARCHAR(10) NOT NULL,
      headers TEXT, -- JSON 格式
      body TEXT,
      params TEXT, -- JSON 格式
      auth_config TEXT, -- JSON 格式
      folder VARCHAR(100) DEFAULT 'Default',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // 收藏请求关联表（保留原有结构用于兼容）
  db.run(`
    CREATE TABLE IF NOT EXISTS favorite_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      request_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (request_id) REFERENCES request_history (id) ON DELETE CASCADE,
      UNIQUE(user_id, request_id)
    )
  `);

  // 收藏夹表（独立的收藏请求存储）
  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name VARCHAR(200) NOT NULL,
      url TEXT NOT NULL,
      method VARCHAR(10) NOT NULL,
      headers TEXT, -- JSON 格式
      body TEXT,
      params TEXT, -- JSON 格式
      folder VARCHAR(100) DEFAULT 'Default',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // 用户会话表
  db.run(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      device_info TEXT,
      ip_address VARCHAR(45),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // 插入默认用户（开发环境）
  if (process.env.NODE_ENV === 'development') {
    insertDefaultUsers();
  }

  console.log('✅ Database initialized successfully');
};

const insertDefaultUsers = (): void => {
  const bcrypt = require('bcryptjs');
  
  const defaultUsers = [
    {
      username: 'admin',
      email: 'admin@xhtech.com',
      password: 'admin123'
    },
    {
      username: 'developer',
      email: 'dev@xhtech.com',
      password: 'dev123'
    },
    {
      username: 'tester',
      email: 'test@xhtech.com',
      password: 'test123'
    }
  ];

  defaultUsers.forEach(user => {
    const passwordHash = bcrypt.hashSync(user.password, 10);
    
    db.run(
      `INSERT OR IGNORE INTO users (username, email, password_hash, avatar_url) 
       VALUES (?, ?, ?, ?)`,
      [
        user.username,
        user.email,
        passwordHash,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
      ],
      function(err) {
        if (err) {
          console.error(`Error inserting user ${user.username}:`, err);
        } else if (this.changes > 0) {
          console.log(`✅ Default user created: ${user.username}`);
        }
      }
    );
  });
};

// 数据库查询工具函数
export const runQuery = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

export const getQuery = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

export const allQuery = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};
