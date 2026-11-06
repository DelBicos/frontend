import { create } from 'zustand';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { uploadToStorage, type UploadTarget } from '@lib/uploadFile';
import { getApiErrorMessage } from '@api/errors';
import type {
  IdentityRequest,
  VerificationStatus,
  VerificationStore,
} from './types';

export const useVerificationStore = create<VerificationStore>()((set) => ({
  status: null,
  loading: false,
  error: null,

  fetchStatus: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await backendHttpClient.get<VerificationStatus>(
        '/api/verification/status',
      );
      set({ status: data, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: getApiErrorMessage(error, 'Não foi possível carregar.'),
      });
    }
  },

  requestEnableMfa: async () => {
    const { data } = await backendHttpClient.post(
      '/api/verification/mfa/enable',
    );
    return data?.email_hint ?? '';
  },

  confirmEnableMfa: async (code) => {
    await backendHttpClient.post('/api/verification/mfa/confirm', { code });
  },

  disableMfa: async (password) => {
    await backendHttpClient.post('/api/verification/mfa/disable', { password });
  },

  uploadIdentityFile: async (kind, uri, contentType = 'image/jpeg') => {
    const { data } = await backendHttpClient.post<
      UploadTarget & { key: string }
    >('/api/verification/identity/upload-url', { kind, fileType: contentType });
    const blob = await (await fetch(uri)).blob();
    await uploadToStorage({ ...data, fileUrl: data.key }, blob, contentType);
    return data.key;
  },

  submitIdentity: async (input) => {
    const { data } = await backendHttpClient.post<IdentityRequest>(
      '/api/verification/identity',
      input,
    );
    return data;
  },
}));
