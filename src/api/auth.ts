import { backendHttpClient } from '@lib/helpers/httpClient';
import type { Address, User } from '@stores/User/types';

export interface RegisterPayload {
  name: string;
  surname?: string;
  email: string;
  password: string;
  phone?: string;
  cpf: string;
  birthDate?: string;
  address: {
    postal_code: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country_iso?: string;
  };
}

export interface AuthSession {
  token: string;
  user: User;
  address: Address | null;
}

/** Converte o endereco retornado pela API no formato usado pela store. */
export function mapAddress(raw: any): Address | null {
  if (!raw) return null;
  return {
    id: raw.id,
    lat: raw.lat,
    lng: raw.lng,
    street: raw.street,
    number: raw.number,
    complement: raw.complement ?? null,
    neighborhood: raw.neighborhood,
    city: raw.city,
    state: raw.state,
    country_iso: raw.country_iso,
    postal_code: raw.postal_code,
  };
}

/** Converte a resposta de login/verificacao ({ token, user }) em sessao. */
export function mapAuthResponse(data: any): AuthSession {
  const token = typeof data?.token === 'string' ? data.token.trim() : '';
  const user = data?.user;
  if (!token || !user) throw new Error('Resposta de autenticação inválida.');

  return {
    token,
    user: {
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
    },
    address: mapAddress(user.address),
  };
}

/** Inicia o cadastro: o servidor envia um codigo para o e-mail. */
export async function register(payload: RegisterPayload): Promise<void> {
  await backendHttpClient.post('/auth/register', payload);
}

/** Confirma o codigo e devolve a sessao do usuario recem-criado. */
export async function verifyCode(
  email: string,
  code: string,
): Promise<AuthSession> {
  const { data } = await backendHttpClient.post('/auth/verify', {
    email,
    code,
  });
  return mapAuthResponse(data);
}

export async function resendCode(email: string): Promise<void> {
  await backendHttpClient.post('/auth/resend', { email });
}

export async function login(
  email: string,
  password: string,
): Promise<AuthSession> {
  const { data } = await backendHttpClient.post('/api/user/login', {
    email,
    password,
  });
  return mapAuthResponse(data);
}

/** Pede um codigo para criar nova senha (resposta igual exista ou nao a conta). */
export async function requestPasswordReset(email: string): Promise<string> {
  const { data } = await backendHttpClient.post('/auth/forgot-password', {
    email,
  });
  return data?.message ?? '';
}

/** Confere o codigo e grava a nova senha. */
export async function resetPassword(
  email: string,
  code: string,
  password: string,
): Promise<void> {
  await backendHttpClient.post('/auth/reset-password', {
    email,
    code,
    password,
  });
}
