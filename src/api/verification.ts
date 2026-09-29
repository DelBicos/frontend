import { backendHttpClient } from '@lib/helpers/httpClient';
import { uploadToStorage, type UploadTarget } from '@lib/utils/uploadFile';

export type DocumentType = 'rg' | 'cnh';
export type IdentityFile = 'front' | 'back' | 'selfie';
export type IdentityStatus = 'pending' | 'approved' | 'rejected';

export interface IdentityRequest {
  id: number;
  status: IdentityStatus;
  document_type: DocumentType;
  reject_reason?: string | null;
  submitted_at: string;
  reviewed_at?: string | null;
}

export interface VerificationStatus {
  email_verified: boolean;
  mfa_enabled: boolean;
  is_professional: boolean;
  identity: IdentityRequest | null;
  verified: boolean;
  verified_at: string | null;
}

export async function getVerificationStatus(): Promise<VerificationStatus> {
  const { data } = await backendHttpClient.get('/api/verification/status');
  return data;
}

/** Envia o codigo de ativacao do MFA e devolve o e-mail (mascarado) de destino. */
export async function requestEnableMfa(): Promise<string> {
  const { data } = await backendHttpClient.post('/api/verification/mfa/enable');
  return data?.email_hint ?? '';
}

export async function confirmEnableMfa(code: string): Promise<void> {
  await backendHttpClient.post('/api/verification/mfa/confirm', { code });
}

export async function disableMfa(password: string): Promise<void> {
  await backendHttpClient.post('/api/verification/mfa/disable', { password });
}

/**
 * Envia UMA imagem do pedido de verificacao para o armazenamento privado e
 * devolve a chave que vai no envio final.
 */
export async function uploadIdentityFile(
  kind: IdentityFile,
  uri: string,
  contentType = 'image/jpeg',
): Promise<string> {
  const { data } = await backendHttpClient.post<UploadTarget & { key: string }>(
    '/api/verification/identity/upload-url',
    { kind, fileType: contentType },
  );

  const blob = await (await fetch(uri)).blob();
  await uploadToStorage({ ...data, fileUrl: data.key }, blob, contentType);
  return data.key;
}

export async function submitIdentity(input: {
  document_type: DocumentType;
  front_key: string;
  back_key?: string | null;
  selfie_key: string;
}): Promise<IdentityRequest> {
  const { data } = await backendHttpClient.post(
    '/api/verification/identity',
    input,
  );
  return data;
}

// --- Administrador ---------------------------------------------------------

export interface AdminVerification {
  id: number;
  status: IdentityStatus;
  document_type: DocumentType;
  submitted_at: string;
  reviewed_at?: string | null;
  reject_reason?: string | null;
  professional: { id: number; name: string; email: string; cpf: string };
  front_url: string | null;
  back_url: string | null;
  selfie_url: string | null;
}

export async function listAdminVerifications(
  status: IdentityStatus | 'all' = 'pending',
): Promise<AdminVerification[]> {
  const { data } = await backendHttpClient.get('/api/admin/verifications', {
    params: { status },
  });
  return data.verifications ?? [];
}

export async function reviewAdminVerification(
  id: number,
  decision: 'approve' | 'reject',
  reason?: string,
): Promise<void> {
  await backendHttpClient.post(`/api/admin/verifications/${id}/review`, {
    decision,
    reason,
  });
}
