import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Settings,
  Crown,
  Edit,
  Eye,
  Trash2,
  Share,
  Link,
  Globe,
  Lock,
  Clock,
  Mail,
  Check,
  X,
  Copy,
  AlertTriangle,
  Info,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  RefreshCw,
  Download,
  Upload,
  Key,
  Zap
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from './ui/dropdown-menu';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { useCollectionStore } from '@/store/useCollectionStore';
import { cn } from '@/lib/utils';

// 权限级别
export type PermissionLevel = 'owner' | 'admin' | 'editor' | 'viewer' | 'none';

// 用户信息
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: PermissionLevel;
  joinedAt: Date;
  lastActiveAt: Date;
  isOnline: boolean;
  invitedBy?: string;
  permissions: Permission[];
  collections: string[]; // 有权限的集合ID
}

// 权限定义
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'collection' | 'request' | 'environment' | 'collaboration' | 'admin';
  resourceId?: string; // 特定资源ID，如集合ID
}

// 邀请链接
export interface InviteLink {
  id: string;
  token: string;
  role: PermissionLevel;
  expiresAt: Date;
  usageLimit: number;
  usageCount: number;
  collections: string[];
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

// 分享设置
export interface ShareSettings {
  isPublic: boolean;
  publicUrl?: string;
  allowAnonymousView: boolean;
  requirePassword: boolean;
  password?: string;
  expiresAt?: Date;
  downloadEnabled: boolean;
  commentsEnabled: boolean;
}

// 权限配置
const PERMISSION_CONFIGS: Record<PermissionLevel, {
  name: string;
  description: string;
  color: string;
  icon: React.ComponentType<any>;
  permissions: string[];
}> = {
  owner: {
    name: '所有者',
    description: '完全控制权限，可以删除工作空间',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Crown,
    permissions: ['*']
  },
  admin: {
    name: '管理员',
    description: '管理成员和权限，无法删除工作空间',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: Shield,
    permissions: ['manage_members', 'manage_permissions', 'create_collections', 'edit_all', 'view_all']
  },
  editor: {
    name: '编辑者',
    description: '可以创建、编辑和删除集合和请求',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Edit,
    permissions: ['create_collections', 'edit_assigned', 'view_assigned']
  },
  viewer: {
    name: '查看者',
    description: '只能查看分配的集合和请求',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: Eye,
    permissions: ['view_assigned']
  },
  none: {
    name: '无权限',
    description: '无任何访问权限',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: X,
    permissions: []
  }
};

// 协作与权限管理组件Props
interface CollaborationProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId?: string;
}

export const Collaboration: React.FC<CollaborationProps> = ({
  isOpen,
  onClose,
  collectionId
}) => {
  const { collections } = useCollectionStore();
  
  // 状态管理
  const [activeTab, setActiveTab] = useState('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<PermissionLevel>('viewer');
  const [isInviting, setIsInviting] = useState(false);
  
  // 团队成员数据
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 'current-user',
      name: '王志东',
      email: 'wangzd@xhtech.com',
      avatar: '',
      role: 'owner',
      joinedAt: new Date('2024-01-01'),
      lastActiveAt: new Date(),
      isOnline: true,
      permissions: [],
      collections: []
    },
    {
      id: 'user-2',
      name: '李开发',
      email: 'likai@xhtech.com',
      role: 'admin',
      joinedAt: new Date('2024-01-15'),
      lastActiveAt: new Date(Date.now() - 30 * 60 * 1000),
      isOnline: false,
      invitedBy: 'current-user',
      permissions: [],
      collections: []
    },
    {
      id: 'user-3',
      name: '张测试',
      email: 'zhangtest@xhtech.com',
      role: 'editor',
      joinedAt: new Date('2024-02-01'),
      lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isOnline: false,
      invitedBy: 'current-user',
      permissions: [],
      collections: []
    }
  ]);

  // 邀请链接数据
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([
    {
      id: 'invite-1',
      token: 'abc123def456',
      role: 'editor',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      usageLimit: 10,
      usageCount: 3,
      collections: [],
      createdBy: 'current-user',
      createdAt: new Date(),
      isActive: true
    }
  ]);

  // 分享设置
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    isPublic: false,
    allowAnonymousView: false,
    requirePassword: false,
    downloadEnabled: true,
    commentsEnabled: true
  });

  // 邀请表单
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'viewer' as PermissionLevel,
    collections: [] as string[],
    message: '',
    expiresInDays: 7
  });

  // 筛选成员
  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 邀请成员
  const handleInviteMember = async () => {
    if (!inviteForm.email) return;
    
    setIsInviting(true);
    
    try {
      // 模拟邀请API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 添加新的邀请链接
      const newInvite: InviteLink = {
        id: `invite-${Date.now()}`,
        token: Math.random().toString(36).substring(2, 15),
        role: inviteForm.role,
        expiresAt: new Date(Date.now() + inviteForm.expiresInDays * 24 * 60 * 60 * 1000),
        usageLimit: 1,
        usageCount: 0,
        collections: inviteForm.collections,
        createdBy: 'current-user',
        createdAt: new Date(),
        isActive: true
      };
      
      setInviteLinks(prev => [...prev, newInvite]);
      
      // 重置表单
      setInviteForm({
        email: '',
        role: 'viewer',
        collections: [],
        message: '',
        expiresInDays: 7
      });
      
      // 这里应该发送邀请邮件
      console.log('邀请邮件已发送到:', inviteForm.email);
      
    } catch (error) {
      console.error('邀请失败:', error);
    }
    
    setIsInviting(false);
  };

  // 更新成员角色
  const handleUpdateMemberRole = (memberId: string, newRole: PermissionLevel) => {
    setTeamMembers(prev => prev.map(member =>
      member.id === memberId ? { ...member, role: newRole } : member
    ));
  };

  // 移除成员
  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
  };

  // 生成邀请链接
  const handleGenerateInviteLink = () => {
    const newLink: InviteLink = {
      id: `invite-${Date.now()}`,
      token: Math.random().toString(36).substring(2, 15),
      role: selectedRole,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      usageLimit: 10,
      usageCount: 0,
      collections: [],
      createdBy: 'current-user',
      createdAt: new Date(),
      isActive: true
    };
    
    setInviteLinks(prev => [...prev, newLink]);
  };

  // 复制邀请链接
  const handleCopyInviteLink = (token: string) => {
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    // 这里应该显示复制成功的提示
  };

  // 禁用邀请链接
  const handleDeactivateInviteLink = (linkId: string) => {
    setInviteLinks(prev => prev.map(link =>
      link.id === linkId ? { ...link, isActive: false } : link
    ));
  };

  // 获取角色配置
  const getRoleConfig = (role: PermissionLevel) => PERMISSION_CONFIGS[role];

  // 计算在线成员数
  const onlineCount = teamMembers.filter(m => m.isOnline).length;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            协作管理
          </DialogTitle>
          <DialogDescription>
            管理团队成员、权限和分享设置
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="members">成员管理</TabsTrigger>
            <TabsTrigger value="invites">邀请链接</TabsTrigger>
            <TabsTrigger value="permissions">权限设置</TabsTrigger>
            <TabsTrigger value="sharing">公开分享</TabsTrigger>
          </TabsList>

          {/* 成员管理 */}
          <TabsContent value="members" className="space-y-4 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧：成员列表 */}
              <div className="lg:col-span-2 space-y-4">
                {/* 搜索和统计 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="搜索成员..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {teamMembers.length} 名成员
                      </Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {onlineCount} 在线
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* 成员列表 */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>成员</TableHead>
                          <TableHead>角色</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead>加入时间</TableHead>
                          <TableHead className="w-[100px]">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMembers.map((member) => {
                          const roleConfig = getRoleConfig(member.role);
                          const RoleIcon = roleConfig.icon;
                          
                          return (
                            <TableRow key={member.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={member.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {member.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    {member.isOnline && (
                                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium">{member.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {member.email}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={roleConfig.color}>
                                  <RoleIcon className="h-3 w-3 mr-1" />
                                  {roleConfig.name}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    member.isOnline ? "bg-green-500" : "bg-gray-300"
                                  )} />
                                  <span className="text-sm">
                                    {member.isOnline ? '在线' : '离线'}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  最后活跃: {member.lastActiveAt.toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {member.joinedAt.toLocaleDateString()}
                                </div>
                                {member.invitedBy && (
                                  <div className="text-xs text-muted-foreground">
                                    由 {teamMembers.find(m => m.id === member.invitedBy)?.name} 邀请
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Edit className="h-4 w-4 mr-2" />
                                      编辑权限
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Mail className="h-4 w-4 mr-2" />
                                      发送消息
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {member.role !== 'owner' && (
                                      <DropdownMenuItem 
                                        className="text-destructive"
                                        onSelect={() => handleRemoveMember(member.id)}
                                      >
                                        <UserX className="h-4 w-4 mr-2" />
                                        移除成员
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* 右侧：邀请面板 */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">邀请新成员</CardTitle>
                    <CardDescription>
                      通过邮箱邀请新成员加入团队
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>邮箱地址</Label>
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label>角色权限</Label>
                      <Select 
                        value={inviteForm.role} 
                        onValueChange={(value: PermissionLevel) => 
                          setInviteForm(prev => ({ ...prev, role: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PERMISSION_CONFIGS).filter(([key]) => key !== 'owner' && key !== 'none').map(([key, config]) => {
                            const Icon = config.icon;
                            return (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <span>{config.name}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>集合权限</Label>
                      <div className="space-y-2 max-h-32 overflow-auto">
                        {collections.map((collection) => (
                          <div key={collection.id} className="flex items-center space-x-2">
                            <Checkbox
                              checked={inviteForm.collections.includes(collection.id)}
                              onCheckedChange={(checked) => {
                                setInviteForm(prev => ({
                                  ...prev,
                                  collections: checked
                                    ? [...prev.collections, collection.id]
                                    : prev.collections.filter(id => id !== collection.id)
                                }));
                              }}
                            />
                            <span className="text-sm">{collection.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>邀请消息 (可选)</Label>
                      <Textarea
                        placeholder="欢迎加入我们的团队..."
                        value={inviteForm.message}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>有效期</Label>
                      <Select 
                        value={inviteForm.expiresInDays.toString()} 
                        onValueChange={(value) => 
                          setInviteForm(prev => ({ ...prev, expiresInDays: parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1天</SelectItem>
                          <SelectItem value="3">3天</SelectItem>
                          <SelectItem value="7">7天</SelectItem>
                          <SelectItem value="14">14天</SelectItem>
                          <SelectItem value="30">30天</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={handleInviteMember}
                      disabled={!inviteForm.email || isInviting}
                      className="w-full"
                    >
                      {isInviting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          发送邀请中...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          发送邀请
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* 角色说明 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">角色权限说明</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(PERMISSION_CONFIGS).filter(([key]) => key !== 'none').map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <div key={key} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50">
                          <Icon className="h-4 w-4 mt-0.5 text-gray-600" />
                          <div>
                            <div className="font-medium text-sm">{config.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {config.description}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 邀请链接 */}
          <TabsContent value="invites" className="space-y-4 overflow-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">邀请链接管理</h3>
                <p className="text-muted-foreground">创建和管理邀请链接</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={selectedRole} onValueChange={(value: PermissionLevel) => setSelectedRole(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PERMISSION_CONFIGS).filter(([key]) => key !== 'owner' && key !== 'none').map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button onClick={handleGenerateInviteLink}>
                  <Link className="h-4 w-4 mr-2" />
                  生成链接
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {inviteLinks.map((link) => {
                const roleConfig = getRoleConfig(link.role);
                const RoleIcon = roleConfig.icon;
                const isExpired = link.expiresAt < new Date();
                const isExhausted = link.usageCount >= link.usageLimit;
                const isInvalid = isExpired || isExhausted || !link.isActive;
                
                return (
                  <Card key={link.id} className={cn(isInvalid && "opacity-60")}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            isInvalid ? "bg-gray-100" : roleConfig.color
                          )}>
                            <RoleIcon className="h-5 w-5" />
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{roleConfig.name} 邀请链接</span>
                              {isInvalid && (
                                <Badge variant="destructive" className="text-xs">
                                  {isExpired ? '已过期' : isExhausted ? '已用完' : '已禁用'}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              使用次数: {link.usageCount} / {link.usageLimit}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              过期时间: {link.expiresAt.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!isInvalid && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyInviteLink(link.token)}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              复制链接
                            </Button>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                查看详情
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                编辑设置
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onSelect={() => handleDeactivateInviteLink(link.id)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                禁用链接
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      {link.collections.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-sm font-medium mb-2">可访问的集合:</div>
                          <div className="flex flex-wrap gap-1">
                            {link.collections.map((collectionId) => {
                              const collection = collections.find(c => c.id === collectionId);
                              return (
                                <Badge key={collectionId} variant="outline" className="text-xs">
                                  {collection?.name || '未知集合'}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              
              {inviteLinks.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Link className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="font-medium mb-2">还没有邀请链接</h3>
                    <p className="text-muted-foreground mb-4">
                      创建邀请链接来快速邀请团队成员
                    </p>
                    <Button onClick={handleGenerateInviteLink}>
                      <Plus className="h-4 w-4 mr-2" />
                      创建第一个邀请链接
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* 权限设置 */}
          <TabsContent value="permissions" className="space-y-4 overflow-auto">
            <div>
              <h3 className="text-lg font-semibold mb-2">权限矩阵</h3>
              <p className="text-muted-foreground">查看和配置不同角色的权限</p>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>权限</TableHead>
                      <TableHead>查看者</TableHead>
                      <TableHead>编辑者</TableHead>
                      <TableHead>管理员</TableHead>
                      <TableHead>所有者</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: '查看集合', key: 'view_collections' },
                      { name: '创建集合', key: 'create_collections' },
                      { name: '编辑集合', key: 'edit_collections' },
                      { name: '删除集合', key: 'delete_collections' },
                      { name: '管理成员', key: 'manage_members' },
                      { name: '管理权限', key: 'manage_permissions' },
                      { name: '导出数据', key: 'export_data' },
                      { name: '工作空间设置', key: 'workspace_settings' }
                    ].map((permission) => (
                      <TableRow key={permission.key}>
                        <TableCell className="font-medium">{permission.name}</TableCell>
                        <TableCell className="text-center">
                          {['view_collections'].includes(permission.key) ? 
                            <Check className="h-4 w-4 text-green-600 mx-auto" /> :
                            <X className="h-4 w-4 text-gray-400 mx-auto" />
                          }
                        </TableCell>
                        <TableCell className="text-center">
                          {['view_collections', 'create_collections', 'edit_collections', 'export_data'].includes(permission.key) ? 
                            <Check className="h-4 w-4 text-green-600 mx-auto" /> :
                            <X className="h-4 w-4 text-gray-400 mx-auto" />
                          }
                        </TableCell>
                        <TableCell className="text-center">
                          {permission.key !== 'workspace_settings' ? 
                            <Check className="h-4 w-4 text-green-600 mx-auto" /> :
                            <X className="h-4 w-4 text-gray-400 mx-auto" />
                          }
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="h-4 w-4 text-green-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 公开分享 */}
          <TabsContent value="sharing" className="space-y-4 overflow-auto">
            <div>
              <h3 className="text-lg font-semibold mb-2">公开分享设置</h3>
              <p className="text-muted-foreground">配置集合的公开访问和分享选项</p>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>公开访问</CardTitle>
                  <CardDescription>
                    允许任何人通过链接访问您的集合
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>启用公开访问</Label>
                      <div className="text-sm text-muted-foreground">
                        生成公开链接，任何人都可以查看
                      </div>
                    </div>
                    <Switch
                      checked={shareSettings.isPublic}
                      onCheckedChange={(checked) => 
                        setShareSettings(prev => ({ ...prev, isPublic: checked }))
                      }
                    />
                  </div>

                  {shareSettings.isPublic && (
                    <>
                      <Separator />
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>允许匿名查看</Label>
                            <div className="text-sm text-muted-foreground">
                              无需登录即可查看集合
                            </div>
                          </div>
                          <Switch
                            checked={shareSettings.allowAnonymousView}
                            onCheckedChange={(checked) => 
                              setShareSettings(prev => ({ ...prev, allowAnonymousView: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>需要密码</Label>
                            <div className="text-sm text-muted-foreground">
                              设置访问密码保护内容
                            </div>
                          </div>
                          <Switch
                            checked={shareSettings.requirePassword}
                            onCheckedChange={(checked) => 
                              setShareSettings(prev => ({ ...prev, requirePassword: checked }))
                            }
                          />
                        </div>

                        {shareSettings.requirePassword && (
                          <div>
                            <Label>访问密码</Label>
                            <Input
                              type="password"
                              placeholder="设置访问密码"
                              value={shareSettings.password || ''}
                              onChange={(e) => 
                                setShareSettings(prev => ({ ...prev, password: e.target.value }))
                              }
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>允许下载</Label>
                            <div className="text-sm text-muted-foreground">
                              访问者可以下载集合数据
                            </div>
                          </div>
                          <Switch
                            checked={shareSettings.downloadEnabled}
                            onCheckedChange={(checked) => 
                              setShareSettings(prev => ({ ...prev, downloadEnabled: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>允许评论</Label>
                            <div className="text-sm text-muted-foreground">
                              访问者可以添加评论和反馈
                            </div>
                          </div>
                          <Switch
                            checked={shareSettings.commentsEnabled}
                            onCheckedChange={(checked) => 
                              setShareSettings(prev => ({ ...prev, commentsEnabled: checked }))
                            }
                          />
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-900">公开链接</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              readOnly
                              value={shareSettings.publicUrl || `${window.location.origin}/public/collections/123`}
                              className="bg-white"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(shareSettings.publicUrl || '');
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>分享统计</CardTitle>
                  <CardDescription>
                    查看公开链接的访问统计
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">1,234</div>
                      <div className="text-sm text-muted-foreground">总访问量</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">89</div>
                      <div className="text-sm text-muted-foreground">今日访问</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">56</div>
                      <div className="text-sm text-muted-foreground">独立访客</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">23</div>
                      <div className="text-sm text-muted-foreground">下载次数</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Collaboration;
