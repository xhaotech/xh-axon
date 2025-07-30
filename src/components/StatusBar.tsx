import React, { useState, useEffect } from 'react';
import { Wifi, Server, Clock } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const StatusBar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { tabs, history } = useAppStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
    <div className="h-6 bg-blue-600 text-white flex items-center justify-between px-3 text-xs">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <Server size={12} />
          <span>Backend: Online</span>
        </div>
        <div className="flex items-center space-x-1">
          <Wifi size={12} />
          <span>Connected</span>
        </div>
      </div>

      {/* Center section */}
      <div className="flex items-center space-x-4">
        <span>Tabs: {tabs.length}</span>
        <span>History: {history.length}</span>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          <Clock size={12} />
          <span>{formatDate(currentTime)} {formatTime(currentTime)}</span>
        </div>
      </div>
    </div>
  );
};
