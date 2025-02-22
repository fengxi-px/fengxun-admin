import defaultUrl from '@/utils/config';
import { request } from '@umijs/max';

export async function uploadImg(data: any) {
  const Url = defaultUrl.split('/admin')[0];
  return request(`${Url}/proxy/api/upload/093310ae6d0a7c006cf5285016de7f03`, {
    method: 'POST',
    data,
  });
  // return request(`/api/upload/093310ae6d0a7c006cf5285016de7f03`, {
  //     method: 'POST',
  //     data
  // });
}
