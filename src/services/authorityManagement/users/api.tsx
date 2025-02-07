import { request } from '@umijs/max';

import defaultUrl from '@/utils/config';


export async function deleteUser(id: any) {
    return request(`${defaultUrl}/delete`, {
        method: 'DELETE',
        params: { id },
    });
}
export async function findUserById(id: any) {
    return request(`${defaultUrl}/findUserById`, {
        method: 'GET',
        params: { id },
    });
}
export async function findUserByName(nickname: any) {
    return request(`${defaultUrl}/findUserByName`, {
        method: 'GET',
        params: { nickname },
    });
}
export async function getUsers() {
    return request(`${defaultUrl}/getUsers`, {
        method: 'GET',
    });
}

export async function findUser(params: any) {
    return request(`${defaultUrl}/findUser`, {
        method: 'GET',
        params,
    });
}

