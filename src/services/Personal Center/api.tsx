import { request } from '@umijs/max';

import defaultUrl from '@/utils/config';


export async function getUser(id: any) {
    return request(`${defaultUrl}/findUserById`, {
        method: 'GET',
        params: { id }
    });
}
export async function updateUser(id: any, data: any) {
    return request(`${defaultUrl}/update`, {
        method: 'POST',
        params: { id },
        data
    });
}
export async function addFile(data: any) {
    return request(`${defaultUrl}/addFile`, {
        method: 'POST',
        data
    });
}
export async function getFilesByOwner(owner: any) {
    return request(`${defaultUrl}/getFiles`, {
        method: 'GET',
        params: { owner }
    });
}
export async function deleteFile(id: any) {
    return request(`${defaultUrl}/deleteFile`, {
        method: 'DELETE',
        params: { id }
    });
}

