import express from 'express';
import { AuthRequest } from '../middleware/auth';
import { getQuery, runQuery } from '../database/init';

const router = express.Router();

// 创建环境
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { name, description, variables } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Environment name is required' });
    }

    // 检查环境名称是否已存在
    const existingEnv = await getQuery(
      'SELECT id FROM environments WHERE user_id = ? AND name = ?',
      [req.user.id, name]
    );

    if (existingEnv) {
      return res.status(409).json({ error: 'Environment name already exists' });
    }

    const result = await runQuery(
      'INSERT INTO environments (user_id, name, description, variables) VALUES (?, ?, ?, ?)',
      [req.user.id, name, description || '', JSON.stringify(variables || {})]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Environment created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// 获取环境列表
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const environments = await runQuery(
      `SELECT id, name, description, variables, is_active, created_at, updated_at
       FROM environments
       WHERE user_id = ?
       ORDER BY is_active DESC, name`,
      [req.user.id]
    );

    res.json({
      environments: environments.map((env: any) => ({
        ...env,
        variables: JSON.parse(env.variables),
        isActive: Boolean(env.is_active)
      }))
    });
  } catch (error) {
    next(error);
  }
});

// 获取单个环境详情
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;

    const environment = await getQuery(
      'SELECT * FROM environments WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!environment) {
      return res.status(404).json({ error: 'Environment not found' });
    }

    res.json({
      ...environment,
      variables: JSON.parse(environment.variables),
      isActive: Boolean(environment.is_active)
    });
  } catch (error) {
    next(error);
  }
});

// 更新环境
router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    const { name, description, variables } = req.body;

    const updates: string[] = [];
    const params: any[] = [];

    if (name) {
      // 检查新名称是否与其他环境冲突
      const existingEnv = await getQuery(
        'SELECT id FROM environments WHERE user_id = ? AND name = ? AND id != ?',
        [req.user.id, name, id]
      );

      if (existingEnv) {
        return res.status(409).json({ error: 'Environment name already exists' });
      }

      updates.push('name = ?');
      params.push(name);
    }

    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }

    if (variables) {
      updates.push('variables = ?');
      params.push(JSON.stringify(variables));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id, req.user.id);

    const result = await runQuery(
      `UPDATE environments SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Environment not found' });
    }

    res.json({ message: 'Environment updated successfully' });
  } catch (error) {
    next(error);
  }
});

// 激活环境
router.put('/:id/activate', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;

    // 首先取消激活所有环境
    await runQuery(
      'UPDATE environments SET is_active = 0 WHERE user_id = ?',
      [req.user.id]
    );

    // 然后激活指定环境
    const result = await runQuery(
      'UPDATE environments SET is_active = 1 WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Environment not found' });
    }

    res.json({ message: 'Environment activated successfully' });
  } catch (error) {
    next(error);
  }
});

// 删除环境
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;

    const result = await runQuery(
      'DELETE FROM environments WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Environment not found' });
    }

    res.json({ message: 'Environment deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// 复制环境
router.post('/:id/duplicate', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    const { name } = req.body;

    const sourceEnv = await getQuery(
      'SELECT * FROM environments WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!sourceEnv) {
      return res.status(404).json({ error: 'Source environment not found' });
    }

    const newName = name || `${sourceEnv.name} (Copy)`;

    // 检查新名称是否已存在
    const existingEnv = await getQuery(
      'SELECT id FROM environments WHERE user_id = ? AND name = ?',
      [req.user.id, newName]
    );

    if (existingEnv) {
      return res.status(409).json({ error: 'Environment name already exists' });
    }

    const result = await runQuery(
      'INSERT INTO environments (user_id, name, description, variables) VALUES (?, ?, ?, ?)',
      [req.user.id, newName, sourceEnv.description, sourceEnv.variables]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Environment duplicated successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
