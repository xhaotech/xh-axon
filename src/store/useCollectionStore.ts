import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Collection, ApiRequest, SearchResult } from '@/types/collection';
import { api } from '@/lib/api';

interface CollectionState {
  collections: Collection[];
  activeRequest: ApiRequest | null;
  selectedCollectionId: string | null;
  expandedCollections: Set<string>;
  searchQuery: string;
  searchResults: SearchResult[];
  draggedItem: { type: 'collection' | 'request'; id: string } | null;
  contextMenu: { 
    show: boolean; 
    x: number; 
    y: number; 
    type: 'collection' | 'request'; 
    id: string 
  } | null;
  
  // Actions
  loadCollections: () => Promise<void>;
  createCollection: (name: string, parentId?: string) => Promise<Collection>;
  updateCollection: (id: string, updates: Partial<Collection>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  moveCollection: (id: string, newParentId?: string, newOrder?: number) => Promise<void>;
  
  createRequest: (collectionId: string, request: Omit<ApiRequest, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<ApiRequest>;
  updateRequest: (id: string, updates: Partial<ApiRequest>) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  moveRequest: (id: string, newCollectionId: string, newOrder?: number) => Promise<void>;
  duplicateRequest: (id: string, newCollectionId?: string) => Promise<ApiRequest>;
  
  setActiveRequest: (request: ApiRequest | null) => void;
  setSelectedCollection: (id: string | null) => void;
  toggleCollectionExpansion: (id: string) => void;
  expandCollection: (id: string) => void;
  collapseCollection: (id: string) => void;
  
  searchCollections: (query: string) => void;
  clearSearch: () => void;
  
  setDraggedItem: (item: { type: 'collection' | 'request'; id: string } | null) => void;
  showContextMenu: (type: 'collection' | 'request', id: string, x: number, y: number) => void;
  hideContextMenu: () => void;
  
  // Utility functions
  getCollectionById: (id: string) => Collection | undefined;
  getRequestById: (id: string) => ApiRequest | undefined;
  getCollectionPath: (id: string) => string[];
  getFlattenedCollections: () => Collection[];
  getCollectionTree: () => Collection[];
}

export const useCollectionStore = create<CollectionState>()(
  devtools(
    (set, get) => ({
      collections: [],
      activeRequest: null,
      selectedCollectionId: null,
      expandedCollections: new Set(),
      searchQuery: '',
      searchResults: [],
      draggedItem: null,
      contextMenu: null,

      loadCollections: async () => {
        try {
          const collections = await api.getCollections();
          set({ collections });
        } catch (error) {
          console.error('Failed to load collections:', error);
        }
      },

      createCollection: async (name: string, parentId?: string) => {
        try {
          const collection = await api.createCollection({ name, parentId });
          set(state => ({
            collections: [...state.collections, collection]
          }));
          return collection;
        } catch (error) {
          console.error('Failed to create collection:', error);
          throw error;
        }
      },

      updateCollection: async (id: string, updates: Partial<Collection>) => {
        try {
          await api.updateCollection(id, updates);
          set(state => ({
            collections: state.collections.map(c => 
              c.id === id ? { ...c, ...updates } : c
            )
          }));
        } catch (error) {
          console.error('Failed to update collection:', error);
          throw error;
        }
      },

      deleteCollection: async (id: string) => {
        try {
          await api.deleteCollection(id);
          set(state => ({
            collections: state.collections.filter(c => c.id !== id),
            selectedCollectionId: state.selectedCollectionId === id ? null : state.selectedCollectionId
          }));
        } catch (error) {
          console.error('Failed to delete collection:', error);
          throw error;
        }
      },

      moveCollection: async (id: string, newParentId?: string, newOrder?: number) => {
        try {
          await api.moveCollection(id, { parentId: newParentId, order: newOrder });
          await get().loadCollections();
        } catch (error) {
          console.error('Failed to move collection:', error);
          throw error;
        }
      },

      createRequest: async (collectionId: string, request) => {
        try {
          const newRequest = await api.createRequest(collectionId, request);
          set(state => ({
            collections: state.collections.map(c => 
              c.id === collectionId 
                ? { ...c, requests: [...(c.requests || []), newRequest] }
                : c
            )
          }));
          return newRequest;
        } catch (error) {
          console.error('Failed to create request:', error);
          throw error;
        }
      },

      updateRequest: async (id: string, updates: Partial<ApiRequest>) => {
        try {
          await api.updateRequest(id, updates);
          set(state => ({
            collections: state.collections.map(c => ({
              ...c,
              requests: c.requests?.map(r => 
                r.id === id ? { ...r, ...updates } : r
              )
            })),
            activeRequest: state.activeRequest?.id === id 
              ? { ...state.activeRequest, ...updates }
              : state.activeRequest
          }));
        } catch (error) {
          console.error('Failed to update request:', error);
          throw error;
        }
      },

      deleteRequest: async (id: string) => {
        try {
          await api.deleteRequest(id);
          set(state => ({
            collections: state.collections.map(c => ({
              ...c,
              requests: c.requests?.filter(r => r.id !== id)
            })),
            activeRequest: state.activeRequest?.id === id ? null : state.activeRequest
          }));
        } catch (error) {
          console.error('Failed to delete request:', error);
          throw error;
        }
      },

      moveRequest: async (id: string, newCollectionId: string, newOrder?: number) => {
        try {
          await api.moveRequest(id, { collectionId: newCollectionId, order: newOrder });
          await get().loadCollections();
        } catch (error) {
          console.error('Failed to move request:', error);
          throw error;
        }
      },

      duplicateRequest: async (id: string, newCollectionId?: string) => {
        try {
          const duplicated = await api.duplicateRequest(id, newCollectionId);
          await get().loadCollections();
          return duplicated;
        } catch (error) {
          console.error('Failed to duplicate request:', error);
          throw error;
        }
      },

      setActiveRequest: (request) => set({ activeRequest: request }),
      setSelectedCollection: (id) => set({ selectedCollectionId: id }),

      toggleCollectionExpansion: (id: string) => {
        set(state => {
          const newExpanded = new Set(state.expandedCollections);
          if (newExpanded.has(id)) {
            newExpanded.delete(id);
          } else {
            newExpanded.add(id);
          }
          return { expandedCollections: newExpanded };
        });
      },

      expandCollection: (id: string) => {
        set(state => ({
          expandedCollections: new Set([...state.expandedCollections, id])
        }));
      },

      collapseCollection: (id: string) => {
        set(state => {
          const newExpanded = new Set(state.expandedCollections);
          newExpanded.delete(id);
          return { expandedCollections: newExpanded };
        });
      },

      searchCollections: (query: string) => {
        set({ searchQuery: query });
        if (!query.trim()) {
          set({ searchResults: [] });
          return;
        }

        const { collections } = get();
        const results: SearchResult[] = [];
        
        const searchInCollection = (collection: Collection, path: string[] = []) => {
          const currentPath = [...path, collection.name];
          
          // Search collection name
          if (collection.name.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              type: 'collection',
              id: collection.id,
              name: collection.name,
              path: currentPath.slice(0, -1)
            });
          }
          
          // Search requests in this collection
          collection.requests?.forEach(request => {
            if (
              request.name.toLowerCase().includes(query.toLowerCase()) ||
              request.url.toLowerCase().includes(query.toLowerCase())
            ) {
              results.push({
                type: 'request',
                id: request.id,
                name: request.name,
                path: currentPath,
                url: request.url
              });
            }
          });
          
          // Search in child collections
          collection.children?.forEach(child => {
            searchInCollection(child, currentPath);
          });
        };
        
        collections.forEach(collection => searchInCollection(collection));
        set({ searchResults: results });
      },

      clearSearch: () => set({ searchQuery: '', searchResults: [] }),

      setDraggedItem: (item) => set({ draggedItem: item }),
      
      showContextMenu: (type, id, x, y) => set({ 
        contextMenu: { show: true, type, id, x, y } 
      }),
      
      hideContextMenu: () => set({ contextMenu: null }),

      getCollectionById: (id: string) => {
        const findCollection = (collections: Collection[]): Collection | undefined => {
          for (const collection of collections) {
            if (collection.id === id) return collection;
            if (collection.children) {
              const found = findCollection(collection.children);
              if (found) return found;
            }
          }
          return undefined;
        };
        return findCollection(get().collections);
      },

      getRequestById: (id: string) => {
        const { collections } = get();
        for (const collection of collections) {
          const request = collection.requests?.find(r => r.id === id);
          if (request) return request;
        }
        return undefined;
      },

      getCollectionPath: (id: string) => {
        const path: string[] = [];
        const findPath = (collections: Collection[], targetId: string, currentPath: string[] = []): boolean => {
          for (const collection of collections) {
            const newPath = [...currentPath, collection.name];
            if (collection.id === targetId) {
              path.push(...newPath);
              return true;
            }
            if (collection.children && findPath(collection.children, targetId, newPath)) {
              return true;
            }
          }
          return false;
        };
        findPath(get().collections, id);
        return path;
      },

      getFlattenedCollections: () => {
        const flatten = (collections: Collection[]): Collection[] => {
          const result: Collection[] = [];
          for (const collection of collections) {
            result.push(collection);
            if (collection.children) {
              result.push(...flatten(collection.children));
            }
          }
          return result;
        };
        return flatten(get().collections);
      },

      getCollectionTree: () => {
        return get().collections;
      }
    }),
    { name: 'collection-store' }
  )
);
