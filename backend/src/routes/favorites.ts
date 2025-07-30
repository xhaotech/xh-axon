import express from 'express';
import { AuthRequest } from '../middleware/auth';
import { getQuery, runQuery } from '../database/init';

const router = express.Router();

// 添加到收藏夹
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { name, url, method, headers, body, params, folder } = req.body;

    if (!name || !url || !method) {
      return res.status(400).json({ error: 'Name, URL, and method are required' });
    }

    const result = await runQuery(
      `INSERT INTO favorites (user_id, name, url, method, headers, body, params, folder)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        name,
        url,
        method,
        JSON.stringify(headers || {}),
        body || '',
        JSON.stringify(params || {}),
        folder || 'Default'
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Request added to favorites'
    });
  } catch (error) {
    next(error);
  }
});

// 获取收藏夹列表
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { folder } = req.query;

    let whereClause = 'WHERE user_id = ?';
    const params = [req.user.id];

    if (folder) {
      whereClause += ' AND folder = ?';
      params.push(folder as string);
    }

    const favorites = await runQuery(
      `SELECT id, name, url, method, headers, body, params, folder, created_at
       FROM favorites
       ${whereClause}
       ORDER BY folder, name`,
      params
    );

    res.json({
      favorites: favorites.map((item: any) => ({
        ...item,
        headers: JSON.parse(item.headers),
        params: JSON.parse(item.params)
      }))
    });
  } catch (error) {
    next(error);
  }
});

// 获取收藏夹文件夹列表
router.get('/folders', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const folders = await runQuery(
      `SELECT DISTINCT folder, COUNT(*) as count
       FROM favorites 
       WHERE user_id = ?
       GROUP BY folder
       ORDER BY folder`,
      [req.user.id]
    );

    res.json({ folders });
  } catch (error) {
    next(error);
  }
});

// 获取单个收藏详情
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;

    const favorite = await getQuery(
      'SELECT * FROM favorites WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({
      ...favorite,
      headers: JSON.parse(favorite.headers),
      params: JSON.parse(favorite.params)
    });
  } catch (error) {
    next(error);
  }
});

// 更新收藏
router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    const { name, url, method, headers, body, params, folder } = req.body;

    const updates: string[] = [];
    const updateParams: any[] = [];

    if (name) {
      updates.push('name = ?');
      updateParams.push(name);
    }
    if (url) {
      updates.push('url = ?');
      updateParams.push(url);
    }
    if (method) {
      updates.push('method = ?');
      updateParams.push(method);
    }
    if (headers) {
      updates.push('headers = ?');
      updateParams.push(JSON.stringify(headers));
    }
    if (body !== undefined) {
      updates.push('body = ?');
      updateParams.push(body);
    }
    if (params) {
      updates.push('params = ?');
      updateParams.push(JSON.stringify(params));
    }
    if (folder) {
      updates.push('folder = ?');
      updateParams.push(folder);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    updateParams.push(id, req.user.id);

    const result = await runQuery(
      `UPDATE favorites SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      updateParams
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Favorite updated successfully' });
  } catch (error) {
    next(error);
  }
});

// 删除收藏
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;

    const result = await runQuery(
      'DELETE FROM favorites WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Favorite deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// 创建文件夹
router.post('/folders', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    // 检查文件夹是否已存在
    const existingFolder = await getQuery(
      'SELECT id FROM favorites WHERE user_id = ? AND folder = ? LIMIT 1',
      [req.user.id, name]
    );

    if (existingFolder) {
      return res.status(409).json({ error: 'Folder already exists' });
    }

    res.status(201).json({ message: 'Folder will be created when first request is saved to it' });
  } catch (error) {
    next(error);
  }
});

export default router;
