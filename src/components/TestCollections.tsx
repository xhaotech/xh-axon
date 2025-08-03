import React from 'react';
import { Collections } from './Collections';

// 简单的测试组件，确保集合管理功能可见
export const TestCollections: React.FC = () => {
  return (
    <div className="h-screen w-full bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-semibold text-gray-900">
          🎯 集合管理系统已就绪
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          完整的API请求集合管理功能现在可用
        </p>
      </div>
      <div className="h-full">
        <Collections />
      </div>
    </div>
  );
};
