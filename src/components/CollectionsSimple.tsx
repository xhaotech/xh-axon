import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from './ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Plus, Trash2, Folder } from 'lucide-react';

export const Collections: React.FC = () => {
  const {
    collections,
    createCollection,
    deleteCollection
  } = useAppStore();

  const [showNewCollectionDialog, setShowNewCollectionDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      createCollection(newCollectionName.trim());
      setNewCollectionName('');
      setShowNewCollectionDialog(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">集合管理</h2>
        
        <Dialog open={showNewCollectionDialog} onOpenChange={setShowNewCollectionDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              新建集合
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>新建集合</DialogTitle>
              <DialogDescription>
                创建一个新的请求集合来组织你的API请求。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  名称
                </Label>
                <Input
                  id="name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="请输入集合名称"
                  className="col-span-3"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim()}
              >
                创建
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 集合列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">还没有集合</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              创建一个集合来开始管理你的API请求吧
            </p>
            <Button onClick={() => setShowNewCollectionDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              创建第一个集合
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {collections.map(collection => (
              <Card key={collection.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex-1">
                    <CardTitle className="text-base">{collection.name}</CardTitle>
                    {collection.description && (
                      <CardDescription className="mt-1">
                        {collection.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {collection.items.length} 个项目
                    </Badge>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确定要删除这个集合吗？</AlertDialogTitle>
                          <AlertDialogDescription>
                            此操作无法撤销。这将永久删除集合 "{collection.name}" 及其所有内容。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteCollection(collection.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
