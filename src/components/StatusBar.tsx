import React, { useState, useEffect } from 'react';
import { Wifi, Server, Clock, Globe } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getBackendPortDisplay } from '../lib/apiConfig';

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
    <div className="h-7 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-blue-100 flex items-center justify-between px-4 text-xs border-t border-blue-700 shadow-inner">
      {/* Left section - Server Status */}
      <div className="flex items-center space-x-5">
        <div className="flex items-center space-x-1.5">
          <div className={`w-2 h-2 rounded-full ${frontendStatus ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
          <Globe size={12} className="text-blue-200" />
          <span className="text-blue-100">
            前端: <span className={frontendStatus ? 'text-green-300' : 'text-red-300'}>localhost:{getCurrentPort()}</span>
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className={`w-2 h-2 rounded-full ${backendStatus ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
          <Server size={12} className="text-blue-200" />
          <span className="text-blue-100">
            后端: <span className={backendStatus ? 'text-green-300' : 'text-red-300'}>{getBackendPortDisplay()}</span>
          </span>
        </div>
        <div className="h-4 w-px bg-blue-600"></div>
        <div className="flex items-center space-x-1.5">
          <Wifi size={12} className={backendStatus ? 'text-green-300' : 'text-yellow-300'} />
          <span className={`font-medium ${backendStatus ? 'text-green-300' : 'text-yellow-300'}`}>
            {backendStatus ? '已连接' : '连接中断'}
          </span>
        </div>
      </div>

      {/* Center section - App Status */}
      <div className="flex items-center space-x-6 text-blue-200">
        <div className="flex items-center space-x-1">
          <span className="text-blue-300">标签页</span>
          <span className="bg-blue-700 bg-opacity-60 px-1.5 py-0.5 rounded text-xs font-mono text-blue-100">{tabs.length}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-blue-300">历史</span>
          <span className="bg-blue-700 bg-opacity-60 px-1.5 py-0.5 rounded text-xs font-mono text-blue-100">{history.length}</span>
        </div>
      </div>

      {/* Right section - Time */}
      <div className="flex items-center space-x-1.5">
        <Clock size={12} className="text-blue-200" />
        <span className="text-blue-100 font-mono">
          {formatDate(currentTime)} {formatTime(currentTime)}
        </span>
      </div>
    </div>
  );
};
