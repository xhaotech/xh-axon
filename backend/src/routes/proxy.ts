import express from 'express';
import axios, { AxiosRequestConfig } from 'axios';
import { AuthRequest } from '../middleware/auth';
import { runQuery } from '../database/init';

const router = express.Router();

// 代理 HTTP 请求
router.all('/*', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { url, method, headers, body, params, timeout = 30000 } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!method) {
      return res.status(400).json({ error: 'HTTP method is required' });
    }

    const startTime = Date.now();

    try {
      const config: AxiosRequestConfig = {
        url,
        method: method.toLowerCase(),
        headers: {
          'User-Agent': 'XH-Axon HTTP Client/1.0',
          ...headers
        },
        timeout,
        params,
        validateStatus: () => true, // 不抛出错误，返回所有状态码
        maxRedirects: 5,
        decompress: true
      };

      // 如果是 POST、PUT、PATCH 等方法，添加请求体
      if (['post', 'put', 'patch'].includes(method.toLowerCase()) && body) {
        config.data = body;
      }

      const response = await axios(config);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // 保存到请求历史
      try {
        await runQuery(
          `INSERT INTO request_history (user_id, name, url, method, headers, body, params, 
           response_status, response_headers, response_body, response_time)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user.id,
            `${method.toUpperCase()} ${url}`,
            url,
            method.toUpperCase(),
            JSON.stringify(headers || {}),
            body || '',
            JSON.stringify(params || {}),
            response.status,
            JSON.stringify(response.headers),
            JSON.stringify(response.data),
            duration
          ]
        );
      } catch (historyError) {
        console.error('Failed to save request history:', historyError);
      }

      // 返回响应
      res.status(200).json({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        config: {
          url: response.config.url,
          method: response.config.method?.toUpperCase(),
          headers: response.config.headers
        },
        timing: {
          duration,
          timestamp: new Date().toISOString()
        }
      });

    } catch (axiosError: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // 保存错误到请求历史
      try {
        await runQuery(
          `INSERT INTO request_history (user_id, name, url, method, headers, body, params, 
           response_status, response_body, response_time, error_message)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user.id,
            `${method.toUpperCase()} ${url}`,
            url,
            method.toUpperCase(),
            JSON.stringify(headers || {}),
            body || '',
            JSON.stringify(params || {}),
            axiosError.response?.status || 0,
            JSON.stringify(axiosError.response?.data || {}),
            duration,
            axiosError.message
          ]
        );
      } catch (historyError) {
        console.error('Failed to save error to request history:', historyError);
      }

      if (axiosError.code === 'ECONNABORTED') {
        return res.status(408).json({
          error: 'Request timeout',
          message: `Request timed out after ${timeout}ms`,
          timing: { duration }
        });
      }

      if (axiosError.code === 'ENOTFOUND' || axiosError.code === 'ECONNREFUSED') {
        return res.status(502).json({
          error: 'Connection failed',
          message: axiosError.message,
          timing: { duration }
        });
      }

      if (axiosError.response) {
        // 服务器返回了错误响应
        return res.status(200).json({
          status: axiosError.response.status,
          statusText: axiosError.response.statusText,
          headers: axiosError.response.headers,
          data: axiosError.response.data,
          timing: { duration },
          error: true
        });
      }

      // 其他网络错误
      res.status(500).json({
        error: 'Network error',
        message: axiosError.message,
        timing: { duration }
      });
    }

  } catch (error) {
    next(error);
  }
});

export default router;
