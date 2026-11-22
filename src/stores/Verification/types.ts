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

export interface VerificationStore {
  /** Situacao da conta (carregada por fetchStatus). */
  status: VerificationStatus | null;
  loading: boolean;
  error: string | null;

  fetchStatus: () => Promise<void>;
  /** Envia o codigo de ativacao do MFA e devolve o e-mail (mascarado) de destino. */
  requestEnableMfa: () => Promise<string>;
  confirmEnableMfa: (code: string) => Promise<void>;
  disableMfa: (password: string) => Promise<void>;
  /**
   * Envia UMA imagem do pedido de verificacao para o armazenamento privado e
   * devolve a chave que vai no envio final.
   */
  uploadIdentityFile: (
    kind: IdentityFile,
    uri: string,
    contentType?: string,
  ) => Promise<string>;
  submitIdentity: (input: {
    document_type: DocumentType;
    front_key: string;
    back_key?: string | null;
    selfie_key: string;
  }) => Promise<IdentityRequest>;
}
