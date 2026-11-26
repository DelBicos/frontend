export interface ImageCropModalProps {
  visible: boolean;
  /** Imagem escolhida pelo usuário (data: ou blob: URL). */
  imageUri: string | null;
  onCancel: () => void;
  /** Recebe a URL (blob:) da imagem já recortada em quadrado. */
  onConfirm: (croppedUri: string) => void;
}
