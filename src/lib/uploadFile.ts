import { backendHttpClient } from '@lib/helpers/httpClient';

/** Destino de upload devolvido pelo backend (`/api/uploads`, `/api/avatar/upload-url`). */
export interface UploadTarget {
  uploadUrl: string;
  /** URL publica final; pode vir so na resposta do proxy (ImgBB). */
  fileUrl?: string | null;
  /** Cabecalhos exigidos pelo provedor (ex.: `x-ms-blob-type` no Azure Blob). */
  uploadHeaders?: Record<string, string>;
}

/**
 * Envia o arquivo para o destino e devolve a URL publica final.
 * - Caminho relativo (`/api/...`): passa pelo backend (proxy ImgBB).
 * - URL absoluta: PUT direto no armazenamento (Azure Blob), com os cabecalhos
 *   que o backend pediu.
 */
export async function uploadToStorage(
  target: UploadTarget,
  file: Blob,
  contentType: string,
): Promise<string> {
  const { uploadUrl, fileUrl, uploadHeaders } = target;

  if (uploadUrl.startsWith('/api/')) {
    const response = await backendHttpClient.put<{ fileUrl?: string }>(
      uploadUrl,
      file,
      { headers: { 'Content-Type': contentType } },
    );
    const finalUrl = response.data?.fileUrl ?? fileUrl;
    if (!finalUrl) throw new Error('O servidor não devolveu a URL da imagem.');
    return finalUrl;
  }

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': contentType, ...uploadHeaders },
  });
  if (!response.ok) {
    throw new Error(`Falha no envio da imagem (HTTP ${response.status}).`);
  }
  if (!fileUrl) throw new Error('O servidor não devolveu a URL da imagem.');
  return fileUrl;
}
