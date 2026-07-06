import axios from 'axios';
import { HTTP_DOMAIN } from '@config/varEnvs';

let getToken: (() => string | null) | null = null;

export const registerTokenProvider = (provider: () => string | null) => {
  getToken = provider;
};

export const backendHttpClient = axios.create({
  baseURL: `${HTTP_DOMAIN}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    accept: 'application/json',
  },
});

backendHttpClient.interceptors.request.use(
  (config) => {
    const token = getToken ? getToken() : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
