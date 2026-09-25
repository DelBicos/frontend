import { create } from 'zustand';
import { AddressStore, Address } from './types';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { getApiErrorStatus } from '@api/errors';

// O backendHttpClient ja envia o JWT; todas as rotas de endereco usam a
// sessao do usuario autenticado (/api/address/session).
const SESSION_ENDPOINT = '/api/address/session';

type Operation = 'fetch' | 'add' | 'update' | 'delete' | 'primary';

const FALLBACK_MESSAGES: Record<Operation, string> = {
  fetch: 'Erro ao carregar endereços',
  add: 'Erro ao adicionar endereço',
  update: 'Erro ao atualizar endereço',
  delete: 'Erro ao deletar endereço',
  primary: 'Erro ao definir endereço principal',
};

/** Mensagem exibida ao usuario para cada falha de requisicao. */
export function addressErrorMessage(
  operation: Operation,
  error: unknown,
): string {
  const status = getApiErrorStatus(error);
  if (status === 401) return 'Não autorizado. Faça login novamente.';
  if (status === 403) {
    return operation === 'delete'
      ? 'Você não tem permissão para deletar este endereço.'
      : 'Você não tem permissão para editar este endereço.';
  }
  if (status === 404) {
    return operation === 'fetch'
      ? 'Endereços não encontrados'
      : 'Endereço não encontrado';
  }
  if (operation === 'add') {
    const serverMessage = (error as any)?.response?.data?.error;
    if (typeof serverMessage === 'string' && serverMessage)
      return serverMessage;
    if (status && status >= 400 && status < 500) {
      return 'Dados inválidos. Verifique as informações.';
    }
  }
  if (operation === 'fetch' && status && status >= 500) {
    return 'Erro no servidor. Tente novamente mais tarde.';
  }
  return FALLBACK_MESSAGES[operation];
}

export const useAddressStore = create<AddressStore>((set) => {
  /** Executa a operacao, controla loading e converte erros em mensagem. */
  const run = async (operation: Operation, action: () => Promise<void>) => {
    set({ isLoading: true, error: null });
    try {
      await action();
      set({ isLoading: false });
    } catch (error) {
      const message = addressErrorMessage(operation, error);
      set({ error: message, isLoading: false });
      if (operation === 'fetch') {
        set({ addresses: [] });
        return;
      }
      throw new Error(message);
    }
  };

  return {
    addresses: [],
    isLoading: false,
    error: null,

    // userId mantido na assinatura por compatibilidade com as telas.
    fetchAddressesByUserId: (_userId: number) =>
      run('fetch', async () => {
        const { data } = await backendHttpClient.get(SESSION_ENDPOINT);
        set({ addresses: Array.isArray(data) ? data : [] });
      }),

    addAddress: (address: Omit<Address, 'id'>) =>
      run('add', async () => {
        const { data } = await backendHttpClient.post(
          SESSION_ENDPOINT,
          address,
        );
        set((state) => ({ addresses: [...state.addresses, data] }));
      }),

    updateAddress: (id: number, changes: Partial<Address>) =>
      run('update', async () => {
        await backendHttpClient.put(`${SESSION_ENDPOINT}/${id}`, changes);
        set((state) => ({
          addresses: state.addresses.map((addr) =>
            addr.id === id ? { ...addr, ...changes } : addr,
          ),
        }));
      }),

    deleteAddress: (id: number) =>
      run('delete', async () => {
        await backendHttpClient.delete(`${SESSION_ENDPOINT}/${id}`);
        set((state) => ({
          addresses: state.addresses.filter((addr) => addr.id !== id),
        }));
      }),

    setPrimaryAddress: (id: number) =>
      run('primary', async () => {
        await backendHttpClient.put(`${SESSION_ENDPOINT}/${id}`, {
          isPrimary: true,
        });
        set((state) => ({
          addresses: state.addresses.map((addr) => ({
            ...addr,
            isPrimary: addr.id === id,
          })),
        }));
      }),
  };
});
