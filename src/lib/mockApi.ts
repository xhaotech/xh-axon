import { Collection, ApiRequest } from '@/types/collection';

// 模拟数据
const mockCollections: Collection[] = [
  {
    id: 'coll-1',
    name: '用户管理 API',
    description: '用户注册、登录、认证相关接口',
    userId: 'user-1',
    children: [
      {
        id: 'coll-1-1',
        name: '认证',
        description: '用户认证相关接口',
        parentId: 'coll-1',
        userId: 'user-1',
        requests: [
          {
            id: 'req-1',
            name: '用户登录',
            method: 'POST',
            url: '/api/auth/login',
            headers: { 'Content-Type': 'application/json' },
            queryParams: {},
            body: {
              type: 'json',
              content: JSON.stringify({
                email: 'user@example.com',
                password: 'password123'
              }, null, 2)
            },
            collectionId: 'coll-1-1',
            userId: 'user-1',
            order: 0,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          },
          {
            id: 'req-2',
            name: '用户注册',
            method: 'POST',
            url: '/api/auth/register',
            headers: { 'Content-Type': 'application/json' },
            queryParams: {},
            body: {
              type: 'json',
              content: JSON.stringify({
                email: 'user@example.com',
                password: 'password123',
                name: 'Test User'
              }, null, 2)
            },
            collectionId: 'coll-1-1',
            userId: 'user-1',
            order: 1,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        order: 0
      }
    ],
    requests: [
      {
        id: 'req-3',
        name: '获取用户信息',
        method: 'GET',
        url: '/api/users/profile',
        headers: { 'Authorization': 'Bearer {{token}}' },
        queryParams: {},
        collectionId: 'coll-1',
        userId: 'user-1',
        order: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    order: 0
  },
  {
    id: 'coll-2',
    name: '电商 API',
    description: '电子商务相关接口',
    userId: 'user-1',
    requests: [
      {
        id: 'req-4',
        name: '获取商品列表',
        method: 'GET',
        url: '/api/products',
        headers: {},
        queryParams: { page: '1', limit: '20' },
        collectionId: 'coll-2',
        userId: 'user-1',
        order: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'req-5',
        name: '创建订单',
        method: 'POST',
        url: '/api/orders',
        headers: { 'Content-Type': 'application/json' },
        queryParams: {},
        body: {
          type: 'json',
          content: JSON.stringify({
            items: [
              { productId: 1, quantity: 2 },
              { productId: 3, quantity: 1 }
            ],
            shippingAddress: {
              street: '123 Main St',
              city: 'Beijing',
              zipCode: '100000'
            }
          }, null, 2)
        },
        collectionId: 'coll-2',
        userId: 'user-1',
        order: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    order: 1
  }
];

// 模拟API调用延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟后端API
export const mockApi = {
  async getCollections(): Promise<Collection[]> {
    await delay(200);
    return mockCollections;
  },

  async getCollection(id: string): Promise<Collection> {
    await delay(100);
    const collection = this.findCollectionById(mockCollections, id);
    if (!collection) {
      throw new Error('Collection not found');
    }
    return collection;
  },

  async createCollection(data: { name: string; description?: string; parentId?: string }): Promise<Collection> {
    await delay(300);
    const newCollection: Collection = {
      id: `coll-${Date.now()}`,
      name: data.name,
      description: data.description,
      parentId: data.parentId,
      userId: 'user-1',
      requests: [],
      children: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      order: mockCollections.length
    };
    mockCollections.push(newCollection);
    return newCollection;
  },

  async updateCollection(id: string, data: Partial<Collection>): Promise<Collection> {
    await delay(200);
    const collection = this.findCollectionById(mockCollections, id);
    if (!collection) {
      throw new Error('Collection not found');
    }
    Object.assign(collection, data, { updatedAt: new Date() });
    return collection;
  },

  async deleteCollection(id: string): Promise<void> {
    await delay(200);
    this.removeCollectionById(mockCollections, id);
  },

  async moveCollection(id: string, data: { parentId?: string; order?: number }): Promise<void> {
    await delay(200);
    // 实现移动逻辑
    console.log('Move collection', id, data);
  },

  async createRequest(collectionId: string, data: Omit<ApiRequest, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiRequest> {
    await delay(300);
    const newRequest: ApiRequest = {
      ...data,
      id: `req-${Date.now()}`,
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const collection = this.findCollectionById(mockCollections, collectionId);
    if (collection) {
      if (!collection.requests) collection.requests = [];
      collection.requests.push(newRequest);
    }
    
    return newRequest;
  },

  async updateRequest(id: string, data: Partial<ApiRequest>): Promise<ApiRequest> {
    await delay(200);
    const request = this.findRequestById(mockCollections, id);
    if (!request) {
      throw new Error('Request not found');
    }
    Object.assign(request, data, { updatedAt: new Date() });
    return request;
  },

  async deleteRequest(id: string): Promise<void> {
    await delay(200);
    this.removeRequestById(mockCollections, id);
  },

  async moveRequest(id: string, data: { collectionId: string; order?: number }): Promise<void> {
    await delay(200);
    console.log('Move request', id, data);
  },

  async duplicateRequest(id: string, newCollectionId?: string): Promise<ApiRequest> {
    await delay(300);
    const original = this.findRequestById(mockCollections, id);
    if (!original) {
      throw new Error('Request not found');
    }
    
    const duplicate: ApiRequest = {
      ...original,
      id: `req-${Date.now()}`,
      name: `${original.name} (副本)`,
      collectionId: newCollectionId || original.collectionId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const targetCollection = this.findCollectionById(mockCollections, duplicate.collectionId);
    if (targetCollection) {
      if (!targetCollection.requests) targetCollection.requests = [];
      targetCollection.requests.push(duplicate);
    }
    
    return duplicate;
  },

  // 辅助方法
  findCollectionById(collections: Collection[], id: string): Collection | undefined {
    for (const collection of collections) {
      if (collection.id === id) return collection;
      if (collection.children) {
        const found = this.findCollectionById(collection.children, id);
        if (found) return found;
      }
    }
    return undefined;
  },

  findRequestById(collections: Collection[], id: string): ApiRequest | undefined {
    for (const collection of collections) {
      if (collection.requests) {
        const request = collection.requests.find(r => r.id === id);
        if (request) return request;
      }
      if (collection.children) {
        const found = this.findRequestById(collection.children, id);
        if (found) return found;
      }
    }
    return undefined;
  },

  removeCollectionById(collections: Collection[], id: string): boolean {
    for (let i = 0; i < collections.length; i++) {
      if (collections[i].id === id) {
        collections.splice(i, 1);
        return true;
      }
      if (collections[i].children) {
        if (this.removeCollectionById(collections[i].children!, id)) {
          return true;
        }
      }
    }
    return false;
  },

  removeRequestById(collections: Collection[], id: string): boolean {
    for (const collection of collections) {
      if (collection.requests) {
        const index = collection.requests.findIndex(r => r.id === id);
        if (index !== -1) {
          collection.requests.splice(index, 1);
          return true;
        }
      }
      if (collection.children) {
        if (this.removeRequestById(collection.children, id)) {
          return true;
        }
      }
    }
    return false;
  }
};
