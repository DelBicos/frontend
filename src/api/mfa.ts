import { backendHttpClient } from '@lib/helpers/httpClient';
import { mapAuthResponse, type AuthSession } from './auth';

/** Segunda etapa do login: o codigo foi enviado ao e-mail da conta. */
export interface MfaChallenge {
  mfaToken: string;
  emailHint: string;
}

export async function verifyMfaLogin(
  mfaToken: string,
  code: string,
): Promise<AuthSession> {
  const { data } = await backendHttpClient.post('/auth/mfa/verify', {
    mfa_token: mfaToken,
    code,
  });
  return mapAuthResponse(data);
}

export async function resendMfaLogin(mfaToken: string): Promise<void> {
  await backendHttpClient.post('/auth/mfa/resend', { mfa_token: mfaToken });
}
