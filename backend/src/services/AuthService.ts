import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { User } from '../models';
import { UserAttributes } from '../models';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginData {
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  verificationCode?: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  is_active: boolean;
  created_at: Date;
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'xh-axon-secret-key';
  private static readonly SALT_ROUNDS = 10;

  // 用户注册
  static async register(data: RegisterData): Promise<{ user: UserResponse; token: string }> {
    const { username, email, password, phone } = data;

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email },
          ...(phone ? [{ phone }] : [])
        ]
      }
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new Error('用户名已存在');
      }
      if (existingUser.email === email) {
        throw new Error('邮箱已被注册');
      }
      if (phone && existingUser.phone === phone) {
        throw new Error('手机号已被注册');
      }
    }

    // 密码加密
    const password_hash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // 创建用户
    const user = await User.create({
      username,
      email,
      phone,
      password_hash,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    });

    // 生成 JWT token
    const token = this.generateToken(user.id);

    return {
      user: this.transformUser(user),
      token,
    };
  }

  // 用户登录
  static async login(data: LoginData): Promise<{ user: UserResponse; token: string }> {
    const { username, email, phone, password, verificationCode } = data;

    // 如果提供了验证码，使用手机号登录
    if (phone && verificationCode) {
      return this.loginWithPhone(phone, verificationCode);
    }

    // 否则使用用户名/邮箱 + 密码登录
    if (!password) {
      throw new Error('密码不能为空');
    }

    const whereClause: any = {};
    if (username) {
      whereClause.username = username;
    } else if (email) {
      whereClause.email = email;
    } else {
      throw new Error('请提供用户名或邮箱');
    }

    const user = await User.findOne({ where: whereClause });
    if (!user) {
      throw new Error('用户不存在');
    }

    if (!user.is_active) {
      throw new Error('账户已被禁用');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('密码错误');
    }

    const token = this.generateToken(user.id);

    return {
      user: this.transformUser(user),
      token,
    };
  }

  // 手机号验证码登录
  static async loginWithPhone(phone: string, verificationCode: string): Promise<{ user: UserResponse; token: string }> {
    // 简单的验证码验证（生产环境应该有更复杂的验证逻辑）
    if (verificationCode !== '123456') {
      throw new Error('验证码错误');
    }

    let user = await User.findOne({ where: { phone } });
    
    if (!user) {
      // 如果用户不存在，自动注册
      const username = `用户${phone.slice(-4)}`;
      const email = `${phone}@temp.com`;
      const password_hash = await bcrypt.hash(Math.random().toString(36), this.SALT_ROUNDS);
      
      user = await User.create({
        username,
        email,
        phone,
        password_hash,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`,
      });
    }

    if (!user.is_active) {
      throw new Error('账户已被禁用');
    }

    const token = this.generateToken(user.id);

    return {
      user: this.transformUser(user),
      token,
    };
  }

  // 发送验证码（模拟）
  static async sendVerificationCode(phone: string): Promise<void> {
    // 这里应该调用短信服务 API
    console.log(`发送验证码到 ${phone}: 123456`);
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 验证 token
  static async verifyToken(token: string): Promise<UserResponse> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string };
      const user = await User.findByPk(decoded.userId);
      
      if (!user || !user.is_active) {
        throw new Error('用户不存在或已被禁用');
      }

      return this.transformUser(user);
    } catch (error) {
      throw new Error('无效的 token');
    }
  }

  // 生成 JWT token
  private static generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      this.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  // 转换用户数据
  private static transformUser(user: User): UserResponse {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      is_active: user.is_active,
      created_at: user.created_at,
    };
  }

  // 更新用户信息
  static async updateProfile(userId: string, updates: Partial<Pick<UserAttributes, 'username' | 'email' | 'phone' | 'avatar'>>): Promise<UserResponse> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 检查用户名、邮箱、手机号是否已被其他用户使用
    if (updates.username && updates.username !== user.username) {
      const existingUser = await User.findOne({ where: { username: updates.username } });
      if (existingUser) {
        throw new Error('用户名已存在');
      }
    }

    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: updates.email } });
      if (existingUser) {
        throw new Error('邮箱已被注册');
      }
    }

    if (updates.phone && updates.phone !== user.phone) {
      const existingUser = await User.findOne({ where: { phone: updates.phone } });
      if (existingUser) {
        throw new Error('手机号已被注册');
      }
    }

    await user.update(updates);
    return this.transformUser(user);
  }

  // 修改密码
  static async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isOldPasswordValid) {
      throw new Error('原密码错误');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    await user.update({ password_hash: newPasswordHash });
  }
}
