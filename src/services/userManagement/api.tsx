import { request } from '@umijs/max';

import defaultUrl from '@/utils/config';

export async function getUsersWeb() {
  return request(`${defaultUrl}/getUsersWeb`, {
    method: 'GET',
  });
}
export async function updateUserWeb(id: any, data: any) {
  return request(`${defaultUrl}/updateWeb`, {
    method: 'POST',
    params: { id },
    data,
  });
}
export async function deleteUserWeb(id: any) {
  return request(`${defaultUrl}/deleteWeb`, {
    method: 'DELETE',
    params: { id },
  });
}
export async function findUserWebByEmail(email: any) {
  return request(`${defaultUrl}/findUserWebByEmail`, {
    method: 'GET',
    params: { email },
  });
}
export async function findUserWebById(id: any) {
  return request(`${defaultUrl}/findUserWebById`, {
    method: 'GET',
    params: { id },
  });
}
export async function findUserWebByTime(startTime: any, endTime: any) {
  return request(`${defaultUrl}/getUsersWeb`, {
    method: 'GET',
    params: { startTime, endTime },
  });
}
export async function findUserWeb(data: any) {
  console.log('data', data);
  return request(`${defaultUrl}/findUserWeb`, {
    method: 'GET',
    params: { ...data },
  });
}
export async function getData(id: any) {
  return request(`${defaultUrl}/getUserWebRecords`, {
    method: 'GET',
    params: { id },
  });
}
