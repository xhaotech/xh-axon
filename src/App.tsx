import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MainPanel } from './components/MainPanel';
import { LoginPage } from './components/LoginPage';
import { useAppStore } from './store/useAppStore';

function App() {
  const { sidebarCollapsed, auth, testBackendConnection, initializeAuth, loadSavedRequests, loadFavoriteRequests } = useAppStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // 初始化应用状态
  useEffect(() => {
    const initApp = async () => {
      // 恢复认证状态
      initializeAuth();
      // 测试后端连接
      const isBackendHealthy = await testBackendConnection();
      // 如果后端可用，加载保存的数据
      if (isBackendHealthy) {
        await Promise.all([
          loadSavedRequests(),
          loadFavoriteRequests()
        ]);
      }
      // 初始化完成
      setIsInitializing(false);
    };
    
    initApp();
  }, [initializeAuth, testBackendConnection, loadSavedRequests, loadFavoriteRequests]);

  // 显示加载状态
  if (isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">XH</span>
          </div>
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">正在初始化应用...</p>
        </div>
      </div>
    );
  }

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
