import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MainPanel } from './components/MainPanel';
import { LoginPage } from './components/LoginPage';
import { useAppStore } from './store/useAppStore';

function App() {
  const { sidebarCollapsed, auth, testBackendConnection } = useAppStore();

  // 测试后端连接
  useEffect(() => {
    testBackendConnection();
  }, [testBackendConnection]);

  // 如果用户未登录，显示登录页面
  if (!auth.isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-0' : 'ml-80'
        }`}>
          <MainPanel />
        </div>
      </div>
    </div>
  );
}

export default App;
