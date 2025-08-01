export interface Collection {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  userId: string;
  children?: Collection[];
  requests?: ApiRequest[];
  isExpanded?: boolean;
  createdAt: Date;
  updatedAt: Date;
  order: number;
}

export interface ApiRequest {
  id: string;
  name: string;
  description?: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  body?: RequestBody;
  collectionId: string;
  userId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestBody {
  type: 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary';
  content: string;
  formData?: FormDataItem[];
}

export interface FormDataItem {
  key: string;
  value: string;
  type: 'text' | 'file';
  enabled: boolean;
}

export type HttpMethod = 
  | 'GET' 
  | 'POST' 
  | 'PUT' 
  | 'DELETE' 
  | 'PATCH' 
  | 'HEAD' 
  | 'OPTIONS';

export interface CollectionTreeNode extends Collection {
  level: number;
  isRoot?: boolean;
}

export interface DragDropData {
  type: 'collection' | 'request';
  id: string;
  sourceCollectionId?: string;
}

export interface CollectionContextMenuData {
  type: 'collection' | 'request';
  id: string;
  x: number;
  y: number;
}

export interface SearchResult {
  type: 'collection' | 'request';
  id: string;
  name: string;
  path: string[];
  url?: string;
}
