import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { getQuery, runQuery } from '../database/init';
import { AuthRequest } from '../types';
import crypto from 'crypto';

const router = express.Router();

// 生成 JWT token
const generateToken = (userId: number): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// 创建用户会话
const createSession = async (userId: number, token: string, req: express.Request): Promise<void> => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7天后过期

  await runQuery(
    `INSERT INTO user_sessions (user_id, token_hash, expires_at, device_info, ip_address) 
     VALUES (?, ?, ?, ?, ?)`,
    [
      userId,
      tokenHash,
      expiresAt.toISOString(),
      req.get('User-Agent') || 'Unknown',
      req.ip || req.connection.remoteAddress
    ]
  );
};

// 用户名密码登录
router.post('/login', [
  body('username').notEmpty().trim().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { username, password } = req.body;

    // 查找用户
    const user = await getQuery(
      'SELECT * FROM users WHERE username = ? AND is_active = 1',
      [username]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // 生成 token
    const token = generateToken(user.id);
    
    // 创建会话
    await createSession(user.id, token, req);

    // 返回用户信息和 token
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar_url
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

// 手机验证码登录
router.post('/login/phone', [
  body('phone').isMobilePhone('zh-CN').withMessage('Invalid phone number'),
  body('verificationCode').isLength({ min: 4, max: 10 }).withMessage('Invalid verification code')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { phone, verificationCode } = req.body;

    // 验证验证码
    const validCode = await getQuery(
      `SELECT * FROM verification_codes 
       WHERE phone = ? AND code = ? AND expires_at > datetime('now') AND is_used = 0
       ORDER BY created_at DESC LIMIT 1`,
      [phone, verificationCode]
    );

    if (!validCode) {
      return res.status(401).json({ error: 'Invalid or expired verification code' });
    }

    // 标记验证码为已使用
    await runQuery(
      'UPDATE verification_codes SET is_used = 1 WHERE id = ?',
      [validCode.id]
    );

    // 查找或创建用户
    let user = await getQuery(
      'SELECT * FROM users WHERE phone = ? AND is_active = 1',
      [phone]
    );

    if (!user) {
      // 创建新用户
      const result = await runQuery(
        'INSERT INTO users (username, phone, password_hash, avatar_url) VALUES (?, ?, ?, ?)',
        [
          `用户${phone.slice(-4)}`,
          phone,
          await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10), // 随机密码
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`
        ]
      );

      user = await getQuery('SELECT * FROM users WHERE id = ?', [result.id]);
    }

    // 生成 token
    const token = generateToken(user.id);
    
    // 创建会话
    await createSession(user.id, token, req);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar_url
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

// 发送验证码
router.post('/send-code', [
  body('phone').isMobilePhone('zh-CN').withMessage('Invalid phone number')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { phone } = req.body;

    // 检查是否在短时间内重复发送
    const recentCode = await getQuery(
      `SELECT * FROM verification_codes 
       WHERE phone = ? AND created_at > datetime('now', '-1 minute')
       ORDER BY created_at DESC LIMIT 1`,
      [phone]
    );

    if (recentCode) {
      return res.status(429).json({ 
        error: 'Please wait before requesting another code',
        remainingTime: 60
      });
    }

    // 生成验证码（开发环境使用固定验证码）
    const code = process.env.NODE_ENV === 'development' ? '123456' : 
                 Math.floor(100000 + Math.random() * 900000).toString();

    // 过期时间（5分钟）
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // 保存验证码
    await runQuery(
      'INSERT INTO verification_codes (phone, code, expires_at) VALUES (?, ?, ?)',
      [phone, code, expiresAt.toISOString()]
    );

    // 在生产环境中，这里应该调用短信服务发送验证码
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 Verification code for ${phone}: ${code}`);
    }

    res.json({
      message: 'Verification code sent successfully',
      ...(process.env.NODE_ENV === 'development' && { code }) // 开发环境返回验证码
    });
  } catch (error) {
    next(error);
  }
});

// 用户注册
router.post('/register', [
  body('username').isLength({ min: 3, max: 50 }).trim().withMessage('Username must be 3-50 characters'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { username, email, password } = req.body;

    // 检查用户名是否已存在
    const existingUser = await getQuery(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // 密码加密
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const result = await runQuery(
      'INSERT INTO users (username, email, password_hash, avatar_url) VALUES (?, ?, ?, ?)',
      [
        username,
        email,
        passwordHash,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
      ]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.id,
        username,
        email
      }
    });
  } catch (error) {
    next(error);
  }
});

// 登出
router.post('/logout', async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      // 删除会话
      await runQuery(
        'DELETE FROM user_sessions WHERE token_hash = ?',
        [tokenHash]
      );
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
});

export default router;
