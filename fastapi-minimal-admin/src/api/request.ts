import type { ResponseModel } from './types';

import axios from 'axios';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: inject Bearer token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: unwrap ResponseModel, handle errors
request.interceptors.response.use(
  (response) => {
    const res = response.data as ResponseModel;
    if (res.code !== 200) {
      return Promise.reject(new Error(res.msg || 'Request failed'));
    }
    return res.data;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired — will be handled by auth context
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default request;
