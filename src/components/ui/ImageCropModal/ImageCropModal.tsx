import type { ImageCropModalProps } from './types';

/**
 * No app nativo o recorte é feito pelo editor do sistema (`allowsEditing` do
 * expo-image-picker). O recorte próprio existe só na web, em
 * `ImageCropModal.web.tsx`, onde o seletor de arquivos não oferece edição.
 */
export default function ImageCropModal(_props: ImageCropModalProps) {
  return null;
}
