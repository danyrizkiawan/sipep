'use client'

import Cookies from 'js-cookie';
import { fetchAPI } from './fetch-api';
import { User } from './model';

export async function setToken(token: any) {
  if (typeof window === 'undefined') {
    return;
  }
  Cookies.set('jwt', token);
};

export async function setUser(user: User) {
  if (typeof window === 'undefined') {
    return;
  }
  Cookies.set('id', user.id.toString());
  Cookies.set('username', user.username);
  Cookies.set('unit', user.unit?.id.toString() ?? '0');
  Cookies.set('user', JSON.stringify(user));
};

export function unsetToken() {
  if (typeof window === 'undefined') {
    return;
  }
  Cookies.remove('jwt');
  Cookies.remove('id');
  Cookies.remove('username');
  Cookies.remove('unit');
  Cookies.remove('user');
};

export async function getUser() {
  const jwt = getLocalToken();
  if (jwt) {
    try {
      const urlParamsObject = {
        populate: {
          unit: {
            populate: {
              headOfUnit: {
                populate: '*'
              }
            }
          }
        }
      };
      const options = {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
      const response = await fetchAPI('/users/me', urlParamsObject, options)
      return response;
    } catch (error) {
      return;
    }
  } else {
    return;
  }
};

export const getLocalUnit = () => {
  return Cookies.get('unit');
};

export const getLocalToken = () => {
  return Cookies.get('jwt');
};
