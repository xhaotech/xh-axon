import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Copy, 
  Move, 
  FolderPlus, 
  Plus,
  Download,
  Upload
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "./ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useCollectionStore } from '@/store/useCollectionStore';

interface CollectionContextMenuProps {
  children: React.ReactNode;
  collectionId: string;
  type: 'collection' | 'request';
}

export const CollectionContextMenu: React.FC<CollectionContextMenuProps> = ({
  children,
  collectionId,
  type
}) => {
  const { 
    getCollectionById, 
    getRequestById, 
    updateCollection, 
    updateRequest,
    deleteCollection,
    deleteRequest,
    duplicateRequest 
  } = useCollectionStore();

  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newName, setNewName] = useState('');

  const item = type === 'collection' 
    ? getCollectionById(collectionId)
    : getRequestById(collectionId);

  const handleRename = () => {
    setNewName(item?.name || '');
    setShowRenameDialog(true);
  };

  const handleConfirmRename = async () => {
    if (newName.trim() && item) {
      try {
        if (type === 'collection') {
          await updateCollection(collectionId, { name: newName.trim() });
        } else {
          await updateRequest(collectionId, { name: newName.trim() });
        }
        setShowRenameDialog(false);
      } catch (error) {
        console.error('Failed to rename:', error);
      }
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (type === 'collection') {
        await deleteCollection(collectionId);
      } else {
        await deleteRequest(collectionId);
      }
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleDuplicate = async () => {
    if (type === 'request') {
      try {
        await duplicateRequest(collectionId);
      } catch (error) {
        console.error('Failed to duplicate:', error);
      }
    }
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          {type === 'collection' && (
            <>
              <ContextMenuItem>
                <Plus className="w-4 h-4 mr-2" />
                新建请求
              </ContextMenuItem>
              <ContextMenuItem>
                <FolderPlus className="w-4 h-4 mr-2" />
                新建文件夹
              </ContextMenuItem>
              <ContextMenuSeparator />
            </>
          )}
          
          <ContextMenuItem onClick={handleRename}>
            <Edit className="w-4 h-4 mr-2" />
            重命名
          </ContextMenuItem>
          
          {type === 'request' && (
            <ContextMenuItem onClick={handleDuplicate}>
              <Copy className="w-4 h-4 mr-2" />
              复制
            </ContextMenuItem>
          )}
          
          <ContextMenuItem>
            <Move className="w-4 h-4 mr-2" />
            移动到...
          </ContextMenuItem>
          
          <ContextMenuSeparator />
          
          {type === 'collection' && (
            <>
              <ContextMenuItem>
                <Download className="w-4 h-4 mr-2" />
                导出
              </ContextMenuItem>
              <ContextMenuItem>
                <Upload className="w-4 h-4 mr-2" />
                导入
              </ContextMenuItem>
              <ContextMenuSeparator />
            </>
          )}
          
          <ContextMenuItem 
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            删除
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* 重命名对话框 */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              重命名{type === 'collection' ? '集合' : '请求'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-name">新名称</Label>
              <Input
                id="new-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={`输入新的${type === 'collection' ? '集合' : '请求'}名称`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirmRename();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRenameDialog(false)}
              >
                取消
              </Button>
              <Button onClick={handleConfirmRename}>
                确认
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除{type === 'collection' ? '集合' : '请求'} "{item?.name}" 吗？
              {type === 'collection' && '这将同时删除其中的所有请求和子集合。'}
              此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
