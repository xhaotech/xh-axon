import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getQuery } from '../database/init';
import { AuthRequest, User } from '../types';

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    
    const user = await getQuery(
      'SELECT id, username, email, phone, created_at FROM users WHERE id = ?',
      [decoded.userId]
    ) as User;

    if (!user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};
