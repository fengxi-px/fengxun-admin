/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(initialState: { currentUser?: API.UserInfo } | undefined) {
  const permissions = initialState?.currentUser?.permissions || []; // 获取用户权限
  if (permissions) {
    const permission = JSON.parse(localStorage.getItem('permissions') || '[]');
    return {
      canViewPersonalCenter: permission[0]?.isShow || false,
      canViewUserManagement: permission[1]?.isShow || false,
      canViewAuthorityManagement: permission[2]?.isShow || false,
    };
  }
}
