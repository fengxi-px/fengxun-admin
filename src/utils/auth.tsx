import { getLoginInfo } from "./userInfo"
import { findUserById } from "@/services/authorityManagement/users/api";

export const initPermissions = async () => {
    const userInfo = getLoginInfo();
    if (userInfo) {
        let temp = [];
        for (let i = 0; i < userInfo.permissions.length; i++) {
            {
                if (userInfo.permissions[i] === '1') {
                    let str = '';
                    for (let j = 0; j < 3 - i; j++) {
                        str += '0'
                    }
                    temp.push('1' + str);
                }
            }
        }
        let permissions = [
            {
                path: '/personalCenter',
                isShow: false,
                canWrite: false,
            },
            {
                path: '/usersManagement',
                isShow: false,
                canWrite: false,
            },
            {
                path: '/authorityManagement',
                isShow: false,
                canWrite: false,
            },
        ];
        for (let i = 0; i < temp.length; i++) {
            switch (temp[i]) {
                case '1000':
                    permissions[0].isShow = true;
                    break;
                case '100':
                    permissions[1].isShow = true;
                    break;
                case '10':
                    permissions[1].canWrite = true;
                    break;
                case '1':
                    permissions[0].canWrite = true; // 表示是否能改role
                    permissions[2].isShow = true;
                    permissions[2].canWrite = true;
                    break;
            }
        }
        localStorage.setItem('permissions', JSON.stringify(permissions));
    }
}

export const getPermissions = (path: any) => {
    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    for (let i = 0; i < permissions.length; i++) {
        if (permissions[i].path === path) {
            return permissions[i].canWrite;
        }
    }
}

export const getMenuList = () => {
    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    let menuList = [];
    for (let i = 0; i < permissions.length; i++) {
        if (permissions[i].isShow) {
            switch (permissions[i].path) {
                case '/personalCenter':
                    menuList.push({
                        name: 'Personal Center',
                        path: '/personalCenter',
                    });
                    break;
                case '/usersManagement':
                    menuList.push({
                        name: 'Users Management',
                        path: '/usersManagement',
                    });
                    break;
                case '/authorityManagement':
                    menuList.push({
                        name: 'Authority Management',
                        path: '/authorityManagement',
                        children: [
                            {
                                name: 'Users',
                                path: '/authorityManagement/users',
                            },
                            {
                                name: 'Roles',
                                path: '/authorityManagement/roles',
                            },
                        ],
                    });
                    break;
            }
        }
    }
    return menuList;
}