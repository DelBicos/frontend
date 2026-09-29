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

/** Formatos brutos (JSON da API) antes de virarem tipos do app. */
interface RawAuthResponse {
  token?: unknown;
  user?: {
    id: number;
    client_id: number;
    name: string;
    email: string;
    phone: string;
    cpf: string;
    avatar_uri?: string | null;
    banner_uri?: string | null;
    professional_id?: number | null;
    Professional?: { id?: number; verified?: boolean };
    professional?: { id?: number; verified?: boolean };
    mfa_enabled?: boolean;
    admin?: boolean;
    address?: Partial<Address> | null;
  };
}

/** Converte o endereco retornado pela API no formato usado pela store. */
export function mapAddress(
  raw: Partial<Address> | null | undefined,
): Address | null {
  if (!raw) return null;
  return {
    id: raw.id ?? 0,
    lat: raw.lat ?? '',
    lng: raw.lng ?? '',
    street: raw.street ?? '',
    number: raw.number ?? '',
    complement: raw.complement ?? null,
    neighborhood: raw.neighborhood ?? '',
    city: raw.city ?? '',
    state: raw.state ?? '',
    country_iso: raw.country_iso ?? 'BR',
    postal_code: raw.postal_code ?? '',
  };
}

/** Converte a resposta de login/verificacao ({ token, user }) em sessao. */
export function mapAuthResponse(data: RawAuthResponse): AuthSession {
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
      mfa_enabled: Boolean(user.mfa_enabled),
      admin: Boolean(user.admin),
      professional_verified: Boolean(
        user.professional?.verified ?? user.Professional?.verified,
      ),
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

/** Com o MFA ativo o login nao devolve sessao: pede o codigo do e-mail. */
export type LoginResult =
  | { mfaRequired: false; session: AuthSession }
  | { mfaRequired: true; mfaToken: string; emailHint: string };

export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  const { data } = await backendHttpClient.post('/api/user/login', {
    email,
    password,
  });
  if (data?.mfa_required) {
    return {
      mfaRequired: true,
      mfaToken: String(data.mfa_token),
      emailHint: String(data.email_hint ?? ''),
    };
  }
  return { mfaRequired: false, session: mapAuthResponse(data) };
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
