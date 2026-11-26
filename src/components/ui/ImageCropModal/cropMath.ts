export interface Size {
  width: number;
  height: number;
}

export interface Offset {
  x: number;
  y: number;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;

/** Escala em que a imagem cobre o quadrado de recorte com zoom 1. */
export function coverScale(image: Size, viewport: number): number {
  return viewport / Math.min(image.width, image.height);
}

export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

/**
 * Limita o deslocamento (em px de tela, a partir do centro) para a imagem
 * nunca deixar área vazia dentro do quadrado de recorte.
 */
export function clampOffset(
  offset: Offset,
  image: Size,
  viewport: number,
  zoom: number,
): Offset {
  const scale = coverScale(image, viewport) * zoom;
  const maxX = Math.max(0, (image.width * scale - viewport) / 2);
  const maxY = Math.max(0, (image.height * scale - viewport) / 2);
  // `+ 0` evita devolver -0 quando o limite é zero.
  return {
    x: Math.min(maxX, Math.max(-maxX, offset.x)) + 0,
    y: Math.min(maxY, Math.max(-maxY, offset.y)) + 0,
  };
}

/** Quadrado da imagem original (em px da imagem) que aparece no recorte. */
export function sourceRect(
  offset: Offset,
  image: Size,
  viewport: number,
  zoom: number,
): { x: number; y: number; size: number } {
  const scale = coverScale(image, viewport) * zoom;
  const size = viewport / scale;
  return {
    x: image.width / 2 - offset.x / scale - size / 2,
    y: image.height / 2 - offset.y / scale - size / 2,
    size,
  };
}
