import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Settings,
  Globe,
  Eye,
  EyeOff,
  MoreHorizontal,
  Download,
  Upload,
  Play
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { useAppStore } from '../store/useAppStore';

// 环境接口
export interface Environment {
  id: string;
  name: string;
  description?: string;
  variables: EnvironmentVariable[];
  isActive: boolean;
  isGlobal?: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// 环境变量接口
export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'secret';
  enabled: boolean;
  scope: 'global' | 'environment' | 'collection';
}

// 集合级变量接口
export interface CollectionVariable extends EnvironmentVariable {
  collectionId: string;
}

// 变量编辑器组件
interface VariableEditorProps {
  variables: EnvironmentVariable[];
  onVariablesChange: (variables: EnvironmentVariable[]) => void;
  scope: 'global' | 'environment' | 'collection';
  readOnly?: boolean;
}

const VariableEditor: React.FC<VariableEditorProps> = ({
  variables,
  onVariablesChange,
  scope,
  readOnly = false
}) => {
  const [editingVariable, setEditingVariable] = useState<EnvironmentVariable | null>(null);
  const [showValues, setShowValues] = useState(false);

  const addVariable = () => {
    const newVariable: EnvironmentVariable = {
      id: `var_${Date.now()}`,
      key: '',
      value: '',
      type: 'string',
      enabled: true,
      scope
    };
    onVariablesChange([...variables, newVariable]);
    setEditingVariable(newVariable);
  };

  const updateVariable = (id: string, updates: Partial<EnvironmentVariable>) => {
    const updatedVariables = variables.map(v => 
      v.id === id ? { ...v, ...updates } : v
    );
    onVariablesChange(updatedVariables);
  };

  const deleteVariable = (id: string) => {
    onVariablesChange(variables.filter(v => v.id !== id));
  };

  const duplicateVariable = (variable: EnvironmentVariable) => {
    const newVariable = {
      ...variable,
      id: `var_${Date.now()}`,
      key: `${variable.key}_copy`
    };
    onVariablesChange([...variables, newVariable]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">变量</h3>
          <Badge variant="outline">{variables.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowValues(!showValues)}
          >
            {showValues ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                隐藏值
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                显示值
              </>
            )}
          </Button>
          {!readOnly && (
            <Button size="sm" onClick={addVariable}>
              <Plus className="h-4 w-4 mr-2" />
              添加变量
            </Button>
          )}
        </div>
      </div>

      {variables.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>暂无变量</p>
          {!readOnly && (
            <Button variant="outline" onClick={addVariable} className="mt-2">
              添加第一个变量
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"> </TableHead>
              <TableHead>键名</TableHead>
              <TableHead>值</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>描述</TableHead>
              <TableHead className="w-20">启用</TableHead>
              {!readOnly && <TableHead className="w-20">操作</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {variables.map((variable) => (
              <TableRow key={variable.id}>
                <TableCell>
                  <div className={`w-2 h-2 rounded-full ${
                    variable.enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                </TableCell>
                <TableCell>
                  {editingVariable?.id === variable.id ? (
                    <Input
                      value={variable.key}
                      onChange={(e) => updateVariable(variable.id, { key: e.target.value })}
                      onBlur={() => setEditingVariable(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingVariable(null);
                        if (e.key === 'Escape') setEditingVariable(null);
                      }}
                      autoFocus
                      className="h-8"
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-accent px-2 py-1 rounded"
                      onClick={() => !readOnly && setEditingVariable(variable)}
                    >
                      {variable.key || <span className="text-muted-foreground">未命名</span>}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      {variable.type === 'secret' && !showValues
                        ? '••••••••'
                        : variable.value || (
                          <span className="text-muted-foreground">未设置</span>
                        )}
                    </span>
                    {variable.type === 'secret' && (
                      <Badge variant="secondary" className="text-xs">
                        密钥
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {variable.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {variable.description || '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={variable.enabled}
                    onCheckedChange={(enabled) => updateVariable(variable.id, { enabled })}
                    disabled={readOnly}
                  />
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setEditingVariable(variable)}>
                          <Edit className="h-3 w-3 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateVariable(variable)}>
                          <Copy className="h-3 w-3 mr-2" />
                          复制
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => deleteVariable(variable.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* 变量编辑对话框 */}
      <Dialog open={!!editingVariable} onOpenChange={() => setEditingVariable(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑变量</DialogTitle>
          </DialogHeader>
          {editingVariable && (
            <div className="space-y-4">
              <div>
                <Label>键名</Label>
                <Input
                  value={editingVariable.key}
                  onChange={(e) => setEditingVariable({
                    ...editingVariable,
                    key: e.target.value
                  })}
                  placeholder="变量名，如：baseUrl"
                />
              </div>
              
              <div>
                <Label>类型</Label>
                <Select
                  value={editingVariable.type}
                  onValueChange={(type: any) => setEditingVariable({
                    ...editingVariable,
                    type
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">字符串</SelectItem>
                    <SelectItem value="number">数字</SelectItem>
                    <SelectItem value="boolean">布尔值</SelectItem>
                    <SelectItem value="secret">密钥</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>值</Label>
                <Textarea
                  value={editingVariable.value}
                  onChange={(e) => setEditingVariable({
                    ...editingVariable,
                    value: e.target.value
                  })}
                  placeholder="变量值"
                  rows={3}
                />
              </div>
              
              <div>
                <Label>描述</Label>
                <Input
                  value={editingVariable.description || ''}
                  onChange={(e) => setEditingVariable({
                    ...editingVariable,
                    description: e.target.value
                  })}
                  placeholder="变量描述（可选）"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVariable(null)}>
              取消
            </Button>
            <Button onClick={() => {
              updateVariable(editingVariable!.id, editingVariable!);
              setEditingVariable(null);
            }}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// 环境管理组件
export const EnvironmentManager: React.FC = () => {
  const { environments, activeEnvironment, setActiveEnvironment } = useAppStore();
  const [localEnvironments, setLocalEnvironments] = useState<Environment[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEnvironment, setEditingEnvironment] = useState<Environment | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);

  useEffect(() => {
    // 从store加载环境数据
    if (environments) {
      setLocalEnvironments(environments.map(env => ({
        id: env.id,
        name: env.name,
        description: '',
        variables: Object.entries(env.variables).map(([key, value]) => ({
          id: `${env.id}_${key}`,
          key,
          value,
          type: 'string' as const,
          enabled: true,
          scope: 'environment' as const
        })),
        isActive: env.id === (activeEnvironment as any)?.id || env.id === activeEnvironment,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'current-user'
      })));
    }
  }, [environments, activeEnvironment]);

  const createEnvironment = (data: Partial<Environment>) => {
    const newEnvironment: Environment = {
      id: `env_${Date.now()}`,
      name: data.name!,
      description: data.description,
      variables: [],
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'current-user'
    };
    setLocalEnvironments([...localEnvironments, newEnvironment]);
    setShowCreateDialog(false);
  };

  const updateEnvironment = (id: string, updates: Partial<Environment>) => {
    setLocalEnvironments(prev => 
      prev.map(env => env.id === id ? { ...env, ...updates, updatedAt: new Date() } : env)
    );
  };

  const deleteEnvironment = (id: string) => {
    if (confirm('确定要删除这个环境吗？')) {
      setLocalEnvironments(prev => prev.filter(env => env.id !== id));
    }
  };

  const duplicateEnvironment = (environment: Environment) => {
    const newEnvironment: Environment = {
      ...environment,
      id: `env_${Date.now()}`,
      name: `${environment.name} (副本)`,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setLocalEnvironments([...localEnvironments, newEnvironment]);
  };

  const activateEnvironment = (environment: Environment) => {
    setLocalEnvironments(prev => 
      prev.map(env => ({ ...env, isActive: env.id === environment.id }))
    );
    setActiveEnvironment(environment as any);
  };

  const exportEnvironment = (environment: Environment) => {
    const exportData = {
      name: environment.name,
      description: environment.description,
      variables: environment.variables.reduce((acc, variable) => {
        acc[variable.key] = variable.value;
        return acc;
      }, {} as Record<string, string>)
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${environment.name}-environment.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importEnvironment = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        try {
          const data = JSON.parse(text);
          const variables = Object.entries(data.variables || {}).map(([key, value]) => ({
            id: `imported_${Date.now()}_${key}`,
            key,
            value: value as string,
            type: 'string' as const,
            enabled: true,
            scope: 'environment' as const
          }));
          
          createEnvironment({
            name: data.name || '导入的环境',
            description: data.description,
            variables
          });
        } catch (error) {
          console.error('Failed to import environment:', error);
          alert('导入失败：文件格式不正确');
        }
      }
    };
    input.click();
  };

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="flex-shrink-0 p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">环境管理</h1>
            <p className="text-muted-foreground">
              管理不同环境的变量配置
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={importEnvironment}>
              <Upload className="h-4 w-4 mr-2" />
              导入
            </Button>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  新建环境
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新建环境</DialogTitle>
                  <DialogDescription>
                    创建一个新的环境配置
                  </DialogDescription>
                </DialogHeader>
                <EnvironmentForm
                  onSave={createEnvironment}
                  onCancel={() => setShowCreateDialog(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 当前激活环境 */}
        {localEnvironments.find(env => env.isActive) && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-600" />
              <span className="font-medium">当前环境：</span>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {localEnvironments.find(env => env.isActive)?.name}
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* 环境列表 */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* 环境卡片列表 */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium">环境列表</h2>
            
            {localEnvironments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">暂无环境</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    创建你的第一个环境配置
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    新建环境
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {localEnvironments.map((environment) => (
                  <Card 
                    key={environment.id}
                    className={`cursor-pointer transition-all ${
                      environment.isActive 
                        ? 'ring-2 ring-green-500 ring-offset-2' 
                        : 'hover:shadow-md'
                    } ${
                      selectedEnvironment?.id === environment.id 
                        ? 'ring-2 ring-primary ring-offset-2' 
                        : ''
                    }`}
                    onClick={() => setSelectedEnvironment(environment)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-lg">{environment.name}</CardTitle>
                          {environment.isActive && (
                            <Badge variant="default" className="bg-green-500">
                              激活中
                            </Badge>
                          )}
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!environment.isActive && (
                              <>
                                <DropdownMenuItem onClick={() => activateEnvironment(environment)}>
                                  <Play className="h-4 w-4 mr-2" />
                                  激活
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem onClick={() => setEditingEnvironment(environment)}>
                              <Edit className="h-4 w-4 mr-2" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicateEnvironment(environment)}>
                              <Copy className="h-4 w-4 mr-2" />
                              复制
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportEnvironment(environment)}>
                              <Download className="h-4 w-4 mr-2" />
                              导出
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => deleteEnvironment(environment.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      {environment.description && (
                        <CardDescription>{environment.description}</CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{environment.variables.length} 个变量</span>
                        <span>更新于 {environment.updatedAt.toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* 环境详情 */}
          <div>
            <h2 className="text-lg font-medium mb-4">环境详情</h2>
            
            {selectedEnvironment ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedEnvironment.name}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingEnvironment(selectedEnvironment)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      设置
                    </Button>
                  </div>
                  {selectedEnvironment.description && (
                    <CardDescription>{selectedEnvironment.description}</CardDescription>
                  )}
                </CardHeader>
                
                <CardContent>
                  <VariableEditor
                    variables={selectedEnvironment.variables}
                    onVariablesChange={(variables) => 
                      updateEnvironment(selectedEnvironment.id, { variables })
                    }
                    scope="environment"
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">选择一个环境</h3>
                  <p className="text-muted-foreground text-center">
                    从左侧选择一个环境来查看和编辑其变量
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* 编辑对话框 */}
      <Dialog open={!!editingEnvironment} onOpenChange={() => setEditingEnvironment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑环境</DialogTitle>
          </DialogHeader>
          {editingEnvironment && (
            <EnvironmentForm
              environment={editingEnvironment}
              onSave={(data) => {
                updateEnvironment(editingEnvironment.id, data);
                setEditingEnvironment(null);
              }}
              onCancel={() => setEditingEnvironment(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// 环境表单组件
interface EnvironmentFormProps {
  environment?: Environment;
  onSave: (data: Partial<Environment>) => void;
  onCancel: () => void;
}

const EnvironmentForm: React.FC<EnvironmentFormProps> = ({
  environment,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: environment?.name || '',
    description: environment?.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">环境名称 *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="如：开发环境、测试环境、生产环境"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">描述</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="环境描述（可选）"
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {environment ? '更新' : '创建'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default EnvironmentManager;
