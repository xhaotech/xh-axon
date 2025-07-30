import { Request, Response, NextFunction } from 'express';

export interface User {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  created_at: string;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface DatabaseResult {
  insertId?: number;
  affectedRows?: number;
  changes?: number;
  lastID?: number;
}

export interface RequestHistoryItem {
  id: number;
  user_id: number;
  name: string;
  url: string;
  method: string;
  headers: string;
  body: string;
  params: string;
  response_status?: number;
  response_headers?: string;
  response_body?: string;
  response_time?: number;
  error_message?: string;
  created_at: string;
}

export interface FavoriteItem {
  id: number;
  user_id: number;
  name: string;
  url: string;
  method: string;
  headers: string;
  body: string;
  params: string;
  folder: string;
  created_at: string;
  updated_at: string;
}

export interface Environment {
  id: number;
  user_id: number;
  name: string;
  description: string;
  variables: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: number;
  user_id: number;
  token_hash: string;
  device_info?: string;
  ip_address?: string;
  created_at: string;
  expires_at: string;
}

export type RouteHandler = (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export type ExpressHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;
