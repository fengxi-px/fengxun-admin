import { Footer, Question, SelectLang, AvatarDropdown, AvatarName } from '@/components';
import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { ProBreadcrumb, SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history, Link, useLocation } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { currentUser as queryCurrentUser } from '@/services/ant-design-pro/api';
import React, { useEffect, useState } from 'react';
import { getLoginInfo } from './utils/userInfo';
import { getMenuList, initPermissions } from './utils/auth';
import { getUserInfoAgain } from './services/configAPI/api';
import { Dropdown, Menu, Tabs } from 'antd';
import TabPane from 'antd/es/tabs/TabPane';
const loginPath = '/user/login';


/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
/** 登录处理 */
async function loginHandle(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  menuList: any
}> {
  const loginInfo = getLoginInfo();
  const menuList = getMenuList();
  if (loginInfo.token) {
    return {
      fetchUserInfo: loginInfo,
      currentUser: loginInfo,
      settings: defaultSettings as Partial<LayoutSettings>,
      menuList,
    };
  }
  return {
    fetchUserInfo: undefined,
    currentUser: undefined,
    settings: defaultSettings as Partial<LayoutSettings>,
    menuList: []
  };

}

export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  menuList: any
}> {
  return loginHandle().then((loginInfo) => {
    return Object.assign({}, loginInfo);
  });
}


// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  // 轮询检查用户信息
  const currentPermission = getLoginInfo().permissions;
  useEffect(() => {
    // 启动轮询
    const intervalId = setInterval(async () => {
      // console.log('轮询检查系统状态');
      const { data } = await getUserInfoAgain(getLoginInfo().id)
      localStorage.setItem('UserInfo', JSON.stringify({ ...data, name: data.nickname }));
      initPermissions();
      if(currentPermission!==data.permissions){
        history.push('/home');
        window.location.reload();
      }
    }, 3000); // 每10秒检查一次系统状态

    // 清除定时器
    return () => clearInterval(intervalId);
  }, []);

  // 页签
  const location = useLocation();
  const [activeKey, setActiveKey] = useState(location.pathname);
  const [panes, setPanes] = useState(JSON.parse(localStorage.getItem('panes'))||[
    { title: 'Home', key: '/home', content: null, path: '/home' }
  ]);
  // 右键点击的 Tab
  const [contextMenuTabKey, setContextMenuTabKey] = useState<string | null>(null); 

  const getKey = () => {
    // let pathKey = location.pathname;
    // const params = new URLSearchParams(location.search);
    // const id = params.get('id');
    // if(id){
    //   pathKey = pathKey + '?id=' + id
    // }
    // return pathKey
    return (location.pathname+location.search)==='/'?'/home':(location.pathname+location.search);
  }

  useEffect(() => {
    // 在页面加载时检查会话存储
    if (sessionStorage.getItem('isRefreshed')) {
      console.log('页面刷新');
    } else {
      console.log('首次加载或登录');
      sessionStorage.setItem('isRefreshed', 'true');
      localStorage.setItem('panes',JSON.stringify([]))
      setPanes([
        { title: 'Home', key: '/home', content: null, path: '/home' }
      ])
    }
    const currentPath = location.pathname+location.search;
    let pathKey = location.pathname+location.search
    // let pathKey = getKey()

    // console.log(location.pathname,'name',location.search,'search')
    

    const capitalizeFirstLetter = (str: string): string => {
      if (!str) return ''; // 如果字符串为空，返回空字符串
      return str.charAt(0).toUpperCase() + str.slice(1);
    };
    
    const pathSegments = location.pathname.split('/').filter(Boolean);
    let title = capitalizeFirstLetter(pathSegments[pathSegments.length - 1]);
    
    if(title){
      if(title === 'Detail'){
        title = capitalizeFirstLetter(pathSegments[pathSegments.length - 2]) + title
      }

      const existingPane = panes.find((pane:any)=>pane.key === pathKey);
      if (!existingPane) {
        setPanes([...panes,{title,key:pathKey,content:null,path:currentPath}])
        // console.log(panes,'in')
      }
      localStorage.setItem('panes',JSON.stringify(panes))
      // console.log(panes,existingPane,getKey())
    }
    if(pathKey==='/'){
      setActiveKey('/home');
    }else{
      setActiveKey(pathKey);
    }
  }, [location.pathname,location.search]);

  const onChange = (key:any) => {
    setActiveKey(key);
    history.push(key);
  };

  const removeTab = (targetKey: string) => {
    let newActiveKey = activeKey; // 当前激活的 Tab
    let lastIndex = -1; // 用于记录被删除的 Tab 前一个的索引
  
    // 遍历所有 Tab，找到 targetKey 并记录前一个 Tab 的索引
    panes.forEach((pane:any, i:any) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
  
    // 过滤掉被删除的 Tab
    const newPanes = panes.filter((pane:any) => pane.key !== targetKey);
  
    // 如果还有剩余的 Tab，处理激活的 Tab key
    if (newPanes.length) {
      if (newActiveKey === targetKey) {
        // 如果删除的是当前激活的 Tab
        newActiveKey = lastIndex >= 0 ? newPanes[lastIndex].key : newPanes[0].key;
      }
    } else {
      // 如果删除后没有 Tab，则清空 activeKey
      newActiveKey = '';
    }
    
    setPanes(newPanes);
    setActiveKey(newActiveKey);
    // 导航到新的 activeKey，如果存在
    if (newActiveKey) {
      history.push(newActiveKey);
    } else {
      // 如果没有 Tab 剩余，可以导航到一个默认路径或留空
      history.push('/home');
    }
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'closeCurrent') {
      removeTab(contextMenuTabKey!);
    } else if (key === 'closeAll') {
      setPanes([]);
      setActiveKey('');
      localStorage.setItem('panes',JSON.stringify([]))
      history.push('/home');
    } else if (key === 'closeOthers') {
      localStorage.setItem('panes',JSON.stringify(panes.filter((pane:any) => pane.key === contextMenuTabKey)))
      setPanes(panes.filter((pane:any) => pane.key === contextMenuTabKey));
      setActiveKey(contextMenuTabKey!);
    }
    setContextMenuTabKey(null); // 隐藏菜单
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="closeCurrent">Close the current page</Menu.Item>
      <Menu.Item key="closeAll">Close all pages</Menu.Item>
      <Menu.Item key="closeOthers">Close all pages except the current page</Menu.Item>
    </Menu>
  );

  const onContextMenu = (e: React.MouseEvent, key: string) => {
    e.preventDefault(); // 禁止默认的右键菜单
    setContextMenuTabKey(key); // 设置右键点击的 Tab Key
  };

  return {
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    // 水印
    // waterMarkProps: {
    //   content: initialState?.currentUser?.name,
    // },
    // 面包屑
    headerContentRender: () => {
      return <><ProBreadcrumb /></>
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    menu: {
      locale: false,

      request: async () => {
        return getMenuList();
      }
    },
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    menuHeaderRender: undefined,
    ...initialState?.settings,
    childrenRender: (children) => (
      <Tabs
      hideAdd
      onChange={onChange}
      activeKey={activeKey}
      type="editable-card"
      onEdit={(targetKey, action) => {
        if (action === 'remove') removeTab(targetKey as string);
      }}
    >
      {panes.map((pane:any) => (
        <TabPane
          tab={
            <Dropdown overlay={menu} trigger={['contextMenu']}>
              <span onContextMenu={(e) => onContextMenu(e, pane.key)}>
                {pane.title}
              </span>
            </Dropdown>
          }
          key={pane.key}
        >
          {pane.key === (getKey()) ? children : pane.content}
        </TabPane>
      ))}
    </Tabs>
    ),
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
};
