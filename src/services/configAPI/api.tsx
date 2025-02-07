import { request } from '@umijs/max';

import defaultUrl from '@/utils/config';

export async function getUserInfoAgain(id: any) {
    return request(`${defaultUrl}/getUserInfo`, {
        method: 'GET',
        params: { id },
    });
}