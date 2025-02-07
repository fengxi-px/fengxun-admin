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

