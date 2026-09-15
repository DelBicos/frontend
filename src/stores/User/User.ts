import { create } from 'zustand';
import { createJSONStorage, persist } from 'expo-zustand-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserStore,
  Address,
  ErrorResponse,
  User,
  UpdateUserData,
} from './types';
import { AxiosError } from 'axios';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { useChatBotStore } from '@stores/ChatBot';

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      address: null,
      token: null,
      verificationEmail: null,
      lastCodeSentAt: null,
      avatarBase64: null,

      setVerificationEmail: (email) => set({ verificationEmail: email }),

      recordCodeSent: () => {
        set({ lastCodeSentAt: Date.now() });
      },

      resendCode: async (email: string) => {
        await backendHttpClient.post('/auth/resend', { email });
      },

      setLoggedInUser: (data: {
        token: string;
        user: User;
        address: Address | null;
      }) => {
        const tokenTrimmed = data.token ? data.token.trim() : data.token;
        set({
          token: tokenTrimmed,
          user: data.user,
          address: data.address,
        });
      },

      fetchCurrentUser: async () => {
        try {
          // debug logs removed

          const { user } = (await backendHttpClient.get('/api/user/me')).data;

          const userData: User = {
            id: user.id,
            client_id: user.Client.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            cpf: user.Client.cpf,
            avatar_uri: user.avatar_uri,
            banner_uri: user.banner_uri,
            professional_id:
              user.professional_id ||
              user.Professional?.id ||
              user.professional?.id ||
              undefined,
          };

          // fetchCurrentUser debug logs removed

          const prevUser = get().user;
          set({
            user: { ...prevUser, ...userData },
            avatarBase64: userData.avatar_uri || null,
          });
        } catch (error) {
          console.error('Erro ao buscar usuário atual:', error);
        }
      },

      signInPassword: async (email: string, password: string) => {
        try {
          const { data } = await backendHttpClient.post('/api/user/login', {
            email,
            password,
          });

          const { token, user } = data;

          if (!token) {
            console.error('No token received from the server');
            return;
          }

          const tokenTrimmed = typeof token === 'string' ? token.trim() : token;

          const userData = {
            id: user.id,
            client_id: user.client_id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            cpf: user.cpf,
            avatar_uri: user.avatar_uri || null,
            banner_uri: user.banner_uri || null,
            professional_id:
              user.professional_id ||
              user.Professional?.id ||
              user.professional?.id ||
              undefined,
          };

          // signInPassword debug logs removed

          const addressData: Address | null = user.address
            ? {
                id: user.address.id,
                lat: user.address.lat,
                lng: user.address.lng,
                street: user.address.street,
                number: user.address.number,
                complement: user.address.complement,
                neighborhood: user.address.neighborhood,
                city: user.address.city,
                state: user.address.state,
                country_iso: user.address.country_iso,
                postal_code: user.address.postal_code,
              }
            : null;

          get().setLoggedInUser({
            token: tokenTrimmed,
            user: {
              id: user.id,
              client_id: user.client_id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              cpf: user.cpf,
              avatar_uri: user.avatar_uri,
              professional_id:
                user.professional_id ||
                user.Professional?.id ||
                user.professional?.id ||
                undefined,
            },
            address: addressData,
          });

          set({
            user: userData,
            address: addressData,
            token: tokenTrimmed,
            avatarBase64: userData.avatar_uri || null,
          });

          get().setLoggedInUser({
            token: tokenTrimmed,
            user: userData,
            address: addressData,
          });

          return;
        } catch (error: any | AxiosError) {
          if (error instanceof AxiosError) {
            if (
              error.response?.status === 401 ||
              error.response?.status === 404
            ) {
              throw new Error(
                'Credenciais inválidas. Verifique seu e-mail e senha.',
              );
            }
            if (error.response?.status.toString().startsWith('5')) {
              throw new Error(
                'Erro interno do servidor. Tente novamente mais tarde.',
              );
            }
          }
          throw new Error('Erro ao fazer login. Por favor, tente novamente.');
        }
      },

      signInAdmin: async (email: string, password: string) => {
        try {
          const { data } = await backendHttpClient.post('/api/admin/login', {
            email,
            password,
          });
          const { token, user } = data;

          if (!token) {
            throw new Error('No token received from the server');
          }

          const tokenTrimmed = typeof token === 'string' ? token.trim() : token;

          const userData: User = {
            id: user.id,
            client_id: user.client_id || 0,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            cpf: user.cpf || '',
            avatar_uri: user.avatar_uri || null,
            admin: true,
          };

          get().setLoggedInUser({
            token: tokenTrimmed,
            user: userData,
            address: null,
          });
          set({ user: userData, address: null, token: tokenTrimmed });
          return;
        } catch (error: any | AxiosError) {
          if (error instanceof AxiosError) {
            if (
              error.response?.status === 401 ||
              error.response?.status === 404 ||
              error.response?.status === 403
            ) {
              throw new Error('Credenciais inválidas ou sem permissão.');
            }
            if (error.response?.status.toString().startsWith('5')) {
              throw new Error(
                'Erro interno do servidor. Tente novamente mais tarde.',
              );
            }
          }
          throw new Error(
            'Erro ao fazer login do admin. Por favor, tente novamente.',
          );
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        try {
          const response = await backendHttpClient.post(
            '/api/user/change-password',
            {
              current_password: currentPassword,
              new_password: newPassword,
            },
          );

          if (response.status < 200 || response.status >= 300) {
            throw new Error('Não foi possível alterar a senha.');
          }
          return;
        } catch (error: any | AxiosError) {
          if (error instanceof AxiosError) {
            if (error.response?.status === 401) {
              throw new Error('Senha atual incorreta.');
            }
            if (error.response?.status === 400) {
              throw new Error(
                'Dados inválidos. Verifique os requisitos da nova senha.',
              );
            }
            if (error.response?.status.toString().startsWith('5')) {
              throw new Error(
                'Erro interno do servidor. Tente novamente mais tarde.',
              );
            }
          }
          throw new Error('Erro ao alterar a senha. Tente novamente.');
        }
      },

      updateUserProfile: async (data: UpdateUserData) => {
        try {
          const response = await backendHttpClient.put('/api/user/me', data);

          if (response.status === 200) {
            const currentUser = get().user;
            if (currentUser) {
              set({
                user: {
                  ...currentUser,
                  name: data.name,
                  email: data.email,
                  phone: data.phone,
                },
              });
            }
          } else {
            throw new Error('Falha ao atualizar perfil.');
          }
        } catch (error: any) {
          console.error('Erro ao atualizar perfil:', error);
          throw new Error(
            error.response?.data?.error || 'Erro ao salvar alterações.',
          );
        }
      },

      uploadAvatar: async (imageUri: string) => {
        try {
          const fileName = `avatar_${Date.now()}.jpg`;
          const {
            data: { uploadUrl, fileUrl: initialFileUrl },
          } = await backendHttpClient.post('/api/avatar/upload-url', {
            fileName,
            fileType: 'image/jpeg',
          });

          const responseFetch = await fetch(imageUri);
          const blob = await responseFetch.blob();

          const isProxyUpload = uploadUrl.startsWith('/api/');

          let fileUrl = initialFileUrl;

          if (isProxyUpload) {
            // Proxy ImgBB — usa backendHttpClient que já tem a baseURL configurada
            const proxyRes = await backendHttpClient.put<{ fileUrl?: string }>(
              uploadUrl,
              blob,
              {
                headers: { 'Content-Type': 'image/jpeg' },
              },
            );
            if (proxyRes.data?.fileUrl) fileUrl = proxyRes.data.fileUrl;
          } else {
            // S3 — PUT direto na AWS
            const uploadResponse = await fetch(uploadUrl, {
              method: 'PUT',
              body: blob,
              headers: { 'Content-Type': 'image/jpeg' },
            });
            if (!uploadResponse.ok)
              throw new Error('Falha no upload para o bucket S3');
          }

          await backendHttpClient.patch('/api/avatar/update-path', {
            avatar_uri: fileUrl,
          });

          const currentUser = get().user;
          if (currentUser) {
            set({
              user: { ...currentUser, avatar_uri: fileUrl },
              avatarBase64: null,
            });
          }

          return {
            erro: false,
            mensagem: 'Avatar atualizado com sucesso!',
            avatar_uri: fileUrl,
          };
        } catch (error: any) {
          if (error.response) {
            console.log(
              'DADOS DO ERRO 500:',
              JSON.stringify(error.response.data, null, 2),
            );
          }

          return {
            erro: true,
            mensagem:
              error.response?.data?.message || 'Erro interno no servidor.',
          };
        }
      },

      removeAvatar: async () => {
        try {
          await backendHttpClient.delete(`/api/user/avatar`);

          const currentUser = get().user;
          if (currentUser) {
            set({
              user: { ...currentUser, avatar_uri: null },
              avatarBase64: null,
            });
          }

          return { erro: false, mensagem: 'Avatar removido com sucesso!' };
        } catch (error: any) {
          return {
            erro: true,
            mensagem: error.response?.data?.error || 'Erro ao remover avatar.',
          };
        }
      },

      registerUser: async (formData) => {
        const { data } = await backendHttpClient.post(
          '/auth/register',
          formData,
        );

        if (!data || data.error) {
          throw new Error(data.error || 'Ocorreu um problema.');
        }

        return data;
      },

      becomeProfessional: async (data) => {
        try {
          const response = await backendHttpClient.post(
            '/api/professionals',
            data,
          );
          if (response.status === 201 && response.data.professional) {
            const currentUser = get().user;
            if (currentUser) {
              set({
                user: {
                  ...currentUser,
                  professional_id: response.data.professional.id,
                },
              });
            }
          } else {
            throw new Error('Falha ao registrar profissional.');
          }
        } catch (error: any) {
          console.error('Erro ao registrar profissional:', error);
          if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
          }
          if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
          }
          if (error.response?.data?.msg) {
            throw new Error(error.response.data.msg);
          }

          const debugData = error.response?.data
            ? JSON.stringify(error.response.data)
            : error.message;
          throw new Error(`Erro inesperado: ${debugData}`);
        }
      },

      signOut: () => {
        // O chatbot não pode sobreviver à autenticação que o criou.
        useChatBotStore.getState().clearSession();
        set({
          user: null,
          address: null,
          token: null,
          avatarBase64: null,
          verificationEmail: null,
          lastCodeSentAt: null,
        });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      //@ts-ignore
      partialize: (state) => ({
        user: state.user,
        address: state.address,
        token: state.token,
        avatarBase64: state.avatarBase64,
        verificationEmail: state.verificationEmail,
        lastCodeSentAt: state.lastCodeSentAt,
      }),
    },
  ),
);
