import React, { useState, useEffect } from 'react';
import { Wifi, Server, Clock, Globe } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const StatusBar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [frontendStatus, setFrontendStatus] = useState(true);
  const [backendStatus, setBackendStatus] = useState(false);
  const { tabs, history, testBackendConnection } = useAppStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 检测后端连接状态
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const isHealthy = await testBackendConnection();
        setBackendStatus(isHealthy);
      } catch (error) {
        setBackendStatus(false);
      }
    };

    // 初始检查
    checkBackendStatus();

    // 每30秒检查一次后端状态
    const statusTimer = setInterval(checkBackendStatus, 30000);

    return () => clearInterval(statusTimer);
  }, [testBackendConnection]);

  const getCurrentPort = () => {
    return window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="h-7 bg-gray-900 text-gray-200 flex items-center justify-between px-4 text-xs border-t border-gray-700 shadow-inner">
      {/* Left section - Server Status */}
      <div className="flex items-center space-x-5">
        <div className="flex items-center space-x-1.5">
          <div className={`w-2 h-2 rounded-full ${frontendStatus ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
          <Globe size={12} className="text-gray-300" />
          <span className="text-gray-300">
            前端: <span className={frontendStatus ? 'text-green-400' : 'text-red-400'}>localhost:{getCurrentPort()}</span>
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className={`w-2 h-2 rounded-full ${backendStatus ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
          <Server size={12} className="text-gray-300" />
          <span className="text-gray-300">
            后端: <span className={backendStatus ? 'text-green-400' : 'text-red-400'}>localhost:3100</span>
          </span>
        </div>
        <div className="h-4 w-px bg-gray-600"></div>
        <div className="flex items-center space-x-1.5">
          <Wifi size={12} className={backendStatus ? 'text-green-400' : 'text-yellow-400'} />
          <span className={`font-medium ${backendStatus ? 'text-green-400' : 'text-yellow-400'}`}>
            {backendStatus ? '已连接' : '连接中断'}
          </span>
        </div>
      </div>

      {/* Center section - App Status */}
      <div className="flex items-center space-x-6 text-gray-400">
        <div className="flex items-center space-x-1">
          <span className="text-gray-500">标签页</span>
          <span className="bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">{tabs.length}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-gray-500">历史</span>
          <span className="bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">{history.length}</span>
        </div>
      </div>

      {/* Right section - Time */}
      <div className="flex items-center space-x-1.5">
        <Clock size={12} className="text-gray-400" />
        <span className="text-gray-300 font-mono">
          {formatDate(currentTime)} {formatTime(currentTime)}
        </span>
      </div>
    </div>
  );
};
