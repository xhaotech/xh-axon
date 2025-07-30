import express from 'express';
import { body, query } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { getQuery, runQuery } from '../database/init';

const router = express.Router();

// 保存请求历史
router.post('/',
  [
    body('url').notEmpty().withMessage('URL is required'),
    body('method').isIn(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']).withMessage('Invalid HTTP method'),
    body('headers').optional().isObject(),
    body('body').optional().isString(),
    body('params').optional().isObject(),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { url, method, headers, body: requestBody, params, name } = req.body;

      const result = await runQuery(
        `INSERT INTO request_history (user_id, name, url, method, headers, body, params)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          name || `${method} ${url}`,
          url,
          method,
          JSON.stringify(headers || {}),
          requestBody || '',
          JSON.stringify(params || {})
        ]
      );

      res.status(201).json({
        id: result.insertId,
        message: 'Request saved to history'
      });
    } catch (error) {
      next(error);
    }
  }
);

// 获取请求历史列表
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('method').optional().isIn(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']),
    query('search').optional().isString(),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const method = req.query.method as string;
      const search = req.query.search as string;

      let whereClause = 'WHERE user_id = ?';
      const params = [req.user.id];

      if (method) {
        whereClause += ' AND method = ?';
        params.push(method);
      }

      if (search) {
        whereClause += ' AND (name LIKE ? OR url LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      const history = await runQuery(
        `SELECT id, name, url, method, headers, body, params, created_at
         FROM request_history
         ${whereClause}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      const totalCount = await getQuery(
        `SELECT COUNT(*) as count FROM request_history ${whereClause}`,
        params
      );

      res.json({
        history: history.map((item: any) => ({
          ...item,
          headers: JSON.parse(item.headers),
          params: JSON.parse(item.params)
        })),
        pagination: {
          page,
          limit,
          total: totalCount.count,
          pages: Math.ceil(totalCount.count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// 获取单个请求历史详情
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;

    const historyItem = await getQuery(
      'SELECT * FROM request_history WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!historyItem) {
      return res.status(404).json({ error: 'Request history not found' });
    }

    res.json({
      ...historyItem,
      headers: JSON.parse(historyItem.headers),
      params: JSON.parse(historyItem.params)
    });
  } catch (error) {
    next(error);
  }
});

// 删除请求历史
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;

    const result = await runQuery(
      'DELETE FROM request_history WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request history not found' });
    }

    res.json({ message: 'Request history deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// 批量删除请求历史
router.delete('/', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid request IDs' });
    }

    const placeholders = ids.map(() => '?').join(',');
    const result = await runQuery(
      `DELETE FROM request_history WHERE id IN (${placeholders}) AND user_id = ?`,
      [...ids, req.user.id]
    );

    res.json({
      message: `${result.affectedRows} request(s) deleted successfully`,
      deletedCount: result.affectedRows
    });
  } catch (error) {
    next(error);
  }
});

export default router;
