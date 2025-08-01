import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MainPanel } from './components/MainPanel';
import { LoginPageRedesigned as LoginPage } from './components/LoginPageRedesigned';
import { StatusBar } from './components/StatusBar';
import { useAppStore } from './store/useAppStore';

function App() {
  const { sidebarCollapsed, auth, testBackendConnection, initializeAuth, loadRequestHistory, loadFavoriteRequests, initializeData } = useAppStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // 初始化应用状态
  useEffect(() => {
    const initApp = async () => {
      // 恢复认证状态
      initializeAuth();
      // 初始化本地数据
      initializeData();
      // 测试后端连接
      const isBackendHealthy = await testBackendConnection();
      // 如果后端可用且用户已登录，加载保存的数据
      if (isBackendHealthy && auth.isAuthenticated) {
        await Promise.all([
          loadRequestHistory(),
          loadFavoriteRequests()
        ]);
      }
      // 初始化完成
      setIsInitializing(false);
    };
    
    initApp();
  }, [initializeAuth, initializeData, testBackendConnection, loadRequestHistory, loadFavoriteRequests, auth.isAuthenticated]);

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
    <div className="h-screen flex flex-col bg-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className={`flex-1 transition-all duration-200 ${
          sidebarCollapsed ? 'ml-0' : 'ml-72'
        }`}>
          <MainPanel />
        </div>
      </div>
      <StatusBar />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            textAlign: 'center',
            minWidth: '300px',
          },
          success: {
            style: {
              background: '#059669',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#dc2626',
              color: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
