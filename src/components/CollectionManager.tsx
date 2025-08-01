import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  Globe, 
  Calendar, 
  User, 
  Hash,
  Edit,
  Save,
  X
} from 'lucide-react';
import { useCollectionStore } from '@/store/useCollectionStore';
import { Collection, ApiRequest, HttpMethod } from '@/types/collection';
import RequestBuilder from './RequestBuilder';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

const CollectionOverview: React.FC<{ collection: Collection }> = ({ collection }) => {
  const { updateCollection } = useCollectionStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(collection.name);
  const [editDescription, setEditDescription] = React.useState(collection.description || '');

  const handleSave = async () => {
    try {
      await updateCollection(collection.id, {
        name: editName,
        description: editDescription
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update collection:', error);
    }
  };

  const handleCancel = () => {
    setEditName(collection.name);
    setEditDescription(collection.description || '');
    setIsEditing(false);
  };

  const totalRequests = collection.requests?.length || 0;
  const subCollections = collection.children?.length || 0;

  return (
    <div className="space-y-6">
      {/* 集合信息 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            集合信息
          </CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              编辑
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                取消
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                保存
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <Label htmlFor="collection-name">集合名称</Label>
                <Input
                  id="collection-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="collection-description">描述</Label>
                <Textarea
                  id="collection-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="font-medium">{collection.name}</h3>
                {collection.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {collection.description}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {totalRequests} 个请求
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {subCollections} 个子集合
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    创建于 {new Date(collection.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    ID: {collection.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 请求列表 */}
      {collection.requests && collection.requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>请求列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {collection.requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {request.method}
                    </Badge>
                    <div>
                      <div className="font-medium">{request.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-md">
                        {request.url}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(request.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const RequestForm: React.FC<{ 
  request?: ApiRequest; 
  collectionId: string;
  onSave: () => void;
  onCancel: () => void;
}> = ({ request, collectionId, onSave, onCancel }) => {
  const { createRequest, updateRequest } = useCollectionStore();
  
  const [formData, setFormData] = React.useState({
    name: request?.name || '',
    method: request?.method || 'GET' as HttpMethod,
    url: request?.url || '',
    description: request?.description || ''
  });

  const handleSave = async () => {
    try {
      if (request) {
        await updateRequest(request.id, formData);
      } else {
        await createRequest(collectionId, {
          ...formData,
          headers: {},
          queryParams: {},
          collectionId,
          order: 0
        });
      }
      onSave();
    } catch (error) {
      console.error('Failed to save request:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {request ? '编辑请求' : '新建请求'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="request-name">请求名称</Label>
          <Input
            id="request-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="输入请求名称"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="request-method">请求方法</Label>
            <Select
              value={formData.method}
              onValueChange={(value: HttpMethod) => 
                setFormData(prev => ({ ...prev, method: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HTTP_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="request-url">请求URL</Label>
            <Input
              id="request-url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://api.example.com/endpoint"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="request-description">描述（可选）</Label>
          <Textarea
            id="request-description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="输入请求描述"
            rows={3}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button onClick={handleSave}>
            {request ? '更新' : '创建'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const CollectionManager: React.FC = () => {
  const { 
    selectedCollectionId, 
    activeRequest, 
    getCollectionById,
    loadCollections
  } = useCollectionStore();

  const [showRequestForm, setShowRequestForm] = React.useState(false);
  const [editingRequest, setEditingRequest] = React.useState<ApiRequest | undefined>();

  const selectedCollection = selectedCollectionId ? getCollectionById(selectedCollectionId) : null;

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const handleNewRequest = () => {
    setEditingRequest(undefined);
    setShowRequestForm(true);
  };

  const handleEditRequest = (request: ApiRequest) => {
    setEditingRequest(request);
    setShowRequestForm(true);
  };

  const handleFormSave = () => {
    setShowRequestForm(false);
    setEditingRequest(undefined);
  };

  const handleFormCancel = () => {
    setShowRequestForm(false);
    setEditingRequest(undefined);
  };

  if (activeRequest) {
    return <RequestBuilder tabId="collection-request" />;
  }

  if (showRequestForm && selectedCollection) {
    return (
      <div className="p-6">
        <RequestForm
          request={editingRequest}
          collectionId={selectedCollection.id}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  if (selectedCollection) {
    return (
      <div className="p-6">
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="requests">请求</TabsTrigger>
              <TabsTrigger value="settings">设置</TabsTrigger>
            </TabsList>
            <Button onClick={handleNewRequest}>
              新建请求
            </Button>
          </div>
          
          <TabsContent value="overview">
            <CollectionOverview collection={selectedCollection} />
          </TabsContent>
          
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>请求管理</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCollection.requests && selectedCollection.requests.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCollection.requests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{request.method}</Badge>
                          <div>
                            <div className="font-medium">{request.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {request.url}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRequest(request)}
                          >
                            编辑
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* Handle test */}}
                          >
                            测试
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>暂无请求</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={handleNewRequest}
                    >
                      创建第一个请求
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>集合设置</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">集合设置功能开发中...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">选择一个集合</h3>
        <p className="text-muted-foreground">
          从左侧选择一个集合来查看其详细信息和管理请求
        </p>
      </div>
    </div>
  );
};
