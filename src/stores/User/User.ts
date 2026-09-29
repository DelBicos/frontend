import { create } from 'zustand';
import { createJSONStorage, persist } from 'expo-zustand-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserStore, Address, User, UpdateUserData } from './types';
import { AxiosError } from 'axios';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { uploadToStorage } from '@lib/utils/uploadFile';
import { login as loginRequest } from '@api/auth';
import { verifyMfaLogin } from '@api/mfa';
import { getApiErrorMessage, getApiErrorStatus } from '@api/errors';
import { useChatBotStore } from '@stores/ChatBot';

import { logger } from '@lib/logger';
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
            client_id: user.Client?.id ?? 0,
            name: user.name,
            email: user.email,
            phone: user.phone,
            cpf: user.Client?.cpf ?? '',
            avatar_uri: user.avatar_uri,
            banner_uri: user.banner_uri,
            professional_id:
              user.professional_id ||
              user.Professional?.id ||
              user.professional?.id ||
              undefined,
            mfa_enabled: Boolean(user.mfa_enabled),
            admin: Boolean(user.admin),
            professional_verified: Boolean(user.professional?.verified),
          };

          // fetchCurrentUser debug logs removed

          const prevUser = get().user;
          set({
            user: { ...prevUser, ...userData },
            avatarBase64: userData.avatar_uri || null,
          });
        } catch (error) {
          logger.error('Erro ao buscar usuário atual:', error);
        }
      },

      signInPassword: async (email: string, password: string) => {
        let result;
        try {
          result = await loginRequest(email, password);
        } catch (error) {
          const status = getApiErrorStatus(error);
          if (status === 401 || status === 404) {
            throw new Error(
              'Credenciais inválidas. Verifique seu e-mail e senha.',
            );
          }
          if (status && status >= 500) {
            throw new Error(
              'Erro interno do servidor. Tente novamente mais tarde.',
            );
          }
          // 403 (conta desativada) e 429 (muitas tentativas) trazem mensagem do servidor.
          throw new Error(
            getApiErrorMessage(
              error,
              'Erro ao fazer login. Por favor, tente novamente.',
            ),
          );
        }

        if (result.mfaRequired) {
          return { mfaToken: result.mfaToken, emailHint: result.emailHint };
        }
        get().setLoggedInUser(result.session);
        set({ avatarBase64: result.session.user.avatar_uri || null });
        return null;
      },

      completeMfaSignIn: async (mfaToken: string, code: string) => {
        let session;
        try {
          session = await verifyMfaLogin(mfaToken, code);
        } catch (error) {
          throw new Error(
            getApiErrorMessage(error, 'Código incorreto ou expirado.'),
          );
        }
        get().setLoggedInUser(session);
        set({ avatarBase64: session.user.avatar_uri || null });
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
        } catch (error) {
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
        } catch (error) {
          logger.error('Erro ao atualizar perfil:', error);
          throw new Error(
            getApiErrorMessage(error, 'Erro ao salvar alterações.'),
          );
        }
      },

      uploadAvatar: async (imageUri: string) => {
        try {
          const fileName = `avatar_${Date.now()}.jpg`;
          const { data: target } = await backendHttpClient.post(
            '/api/avatar/upload-url',
            { fileName, fileType: 'image/jpeg' },
          );

          const responseFetch = await fetch(imageUri);
          const blob = await responseFetch.blob();

          const fileUrl = await uploadToStorage(target, blob, 'image/jpeg');

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
        } catch (error) {
          logger.error('Erro ao enviar avatar:', error);
          return {
            erro: true,
            mensagem: getApiErrorMessage(error, 'Erro interno no servidor.'),
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
        } catch (error) {
          return {
            erro: true,
            mensagem: getApiErrorMessage(error, 'Erro ao remover avatar.'),
          };
        }
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
        } catch (error) {
          logger.error('Erro ao registrar profissional:', error);
          throw new Error(
            getApiErrorMessage(
              error,
              'Não foi possível concluir o cadastro. Tente novamente.',
            ),
          );
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
