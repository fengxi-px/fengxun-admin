/**
 * 获取localStorage中保存的登录信息
 * @returns logonInfo
 */
export const getLoginInfo: () => {
    id: any;
    name: any;
    admin_user_id: any;
    token: string | undefined;
    user: any;
    permissions: any;
    email: any;
    role: any
} = () => {
    try {
        // 获取localStorage中保存的登录信息
        const loginInfo = localStorage.getItem('UserInfo');
        const logonInfoJson = loginInfo && JSON.parse(loginInfo);
        return logonInfoJson || { user: {}, token: undefined };
    } catch (error) {
        console.log('异常场景: 获取token失败');
        return {};
    }
};