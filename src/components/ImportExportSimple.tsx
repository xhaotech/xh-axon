import React, { useState } from 'react';
import { Upload, Download, FileText, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export const ImportExport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');

  return (
    <div className="h-full p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">导入/导出管理</h1>
          <p className="text-gray-600">管理请求集合的导入和导出功能</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'import' | 'export')} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import" className="flex items-center space-x-2">
              <Upload size={16} />
              <span>导入数据</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center space-x-2">
              <Download size={16} />
              <span>导出数据</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload size={20} />
                  <span>导入请求集合</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">选择要导入的文件</h3>
                  <p className="text-gray-600 mb-4">支持 Postman、OpenAPI、XH-Axon 等格式</p>
                  <Button>
                    <Upload size={16} className="mr-2" />
                    选择文件
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Postman Collection</h4>
                    <p className="text-sm text-gray-600">支持 v2.0 和 v2.1 格式</p>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">OpenAPI Spec</h4>
                    <p className="text-sm text-gray-600">支持 2.0 和 3.0 版本</p>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">XH-Axon 原生</h4>
                    <p className="text-sm text-gray-600">完整功能支持</p>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download size={20} />
                  <span>导出请求集合</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">选择导出格式</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="radio" name="format" value="xh-axon" defaultChecked />
                        <span>XH-Axon 原生格式</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="radio" name="format" value="postman" />
                        <span>Postman Collection v2.1</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="radio" name="format" value="openapi" />
                        <span>OpenAPI 3.0</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">导出选项</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span>包含环境变量</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span>包含请求历史</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" />
                        <span>敏感数据脱敏</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline">预览</Button>
                  <Button>
                    <Download size={16} className="mr-2" />
                    导出集合
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle size={20} />
              <span>注意事项</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 导入前建议备份现有数据</li>
              <li>• 大文件导入可能需要较长时间</li>
              <li>• 导出的敏感数据将被自动加密</li>
              <li>• 支持批量导入多个文件</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
