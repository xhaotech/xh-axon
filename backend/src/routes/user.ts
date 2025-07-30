import express from 'express';
import { AuthRequest } from '../middleware/auth';
import { getQuery, runQuery } from '../database/init';

const router = express.Router();

// 获取用户信息
router.get('/profile', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await getQuery(
      'SELECT id, username, email, phone, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar_url,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// 更新用户信息
router.put('/profile', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { username, email, phone, avatar } = req.body;
    const updates: string[] = [];
    const params: any[] = [];

    if (username) {
      updates.push('username = ?');
      params.push(username);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (phone) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (avatar) {
      updates.push('avatar_url = ?');
      params.push(avatar);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.user.id);

    await runQuery(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const updatedUser = await getQuery(
      'SELECT id, username, email, phone, avatar_url FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar_url
      }
    });
  } catch (error) {
    next(error);
  }
});

// 获取用户会话列表
router.get('/sessions', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const sessions = await runQuery(
      `SELECT id, device_info, ip_address, created_at, expires_at 
       FROM user_sessions 
       WHERE user_id = ? AND expires_at > datetime('now')
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

// 删除指定会话
router.delete('/sessions/:sessionId', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { sessionId } = req.params;

    await runQuery(
      'DELETE FROM user_sessions WHERE id = ? AND user_id = ?',
      [sessionId, req.user.id]
    );

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
