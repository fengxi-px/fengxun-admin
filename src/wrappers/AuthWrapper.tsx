import { Navigate, useLocation } from 'react-router-dom';
import { useAccess } from 'umi';

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const access = useAccess(); // 获取权限配置
  const location = useLocation();

  // 获取当前路由对应的权限
  const routeAccess = access[location.pathname]; // 直接用路径匹配

  // 如果没有权限，跳转到 403 页面
  if (routeAccess === false) {
    return <Navigate to="/403" replace />;
  }

  console.log(children, 'children'); // 调试 children，确保渲染

  //   return <>{children}</>; // 渲染子组件
};

export default AuthWrapper;
