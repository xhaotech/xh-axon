import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface CustomToastProps {
  type: ToastType;
  title: string;
  message?: string;
  code?: string;
}

export const CustomToast: React.FC<CustomToastProps> = ({ type, title, message, code }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${getBgColor()} max-w-sm`}>
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {message && (
          <p className="text-sm text-gray-600 mt-1">{message}</p>
        )}
        {code && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono text-gray-800">
            验证码：{code}
          </div>
        )}
      </div>
    </div>
  );
};
