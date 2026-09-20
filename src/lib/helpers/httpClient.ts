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

backendHttpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const msg = error?.response?.data?.msg || error?.response?.data?.error;
    if (
      status === 401 ||
      (status === 403 &&
        (msg === 'Token inválido' ||
          msg === 'Acesso negado. É obrgatório o envio de token JWT' ||
          msg?.includes('expired')))
    ) {
      try {
        const { useUserStore } = require('@stores/User');
        useUserStore.getState().signOut();
      } catch (e) {
        // Ignore circular dependency during bootstrap
      }
    }
    return Promise.reject(error);
  },
);

