import { request } from '@umijs/max';

import defaultUrl from '@/utils/config';

export async function login(data: any) {
    return request(`${defaultUrl}/login`, {
        method: 'POST',
        data,
    });
}