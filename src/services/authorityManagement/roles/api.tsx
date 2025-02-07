import { request } from '@umijs/max';

import defaultUrl from '@/utils/config';


export async function addRole(data: any) {
    return request(`${defaultUrl}/addRole`, {
        method: 'POST',
        data,
    });
}
export async function getRoles() {
    return request(`${defaultUrl}/getRoles`, {
        method: 'GET',
    });
}
export async function updateRole(id: any, data: any) {
    return request(`${defaultUrl}/updateRole`, {
        method: 'POST',
        params: { id },
        data
    });
}
export async function deleteRole(id: any) {
    return request(`${defaultUrl}/deleteRole`, {
        method: 'DELETE',
        params: { id },
    });
}

export async function findRole(params: any) {
    return request(`${defaultUrl}/findRole`, {
        method: 'GET',
        params,
    });
}

