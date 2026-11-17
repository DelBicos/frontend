import { clampOffset, clampZoom, coverScale, sourceRect } from './cropMath';

const landscape = { width: 2000, height: 1000 };
const VIEWPORT = 200;

describe('cropMath', () => {
  it('cobre o quadrado pelo menor lado da imagem', () => {
    expect(coverScale(landscape, VIEWPORT)).toBe(0.2);
    expect(coverScale({ width: 500, height: 1000 }, VIEWPORT)).toBe(0.4);
  });

  it('limita o zoom entre 1 e 3', () => {
    expect(clampZoom(0.5)).toBe(1);
    expect(clampZoom(2)).toBe(2);
    expect(clampZoom(9)).toBe(3);
  });

  it('não deixa a imagem sair do quadrado', () => {
    // Zoom 1: 400x200 na tela, sobra 100px para cada lado só na horizontal.
    expect(clampOffset({ x: 500, y: 50 }, landscape, VIEWPORT, 1)).toEqual({
      x: 100,
      y: 0,
    });
    expect(clampOffset({ x: -500, y: -50 }, landscape, VIEWPORT, 1)).toEqual({
      x: -100,
      y: 0,
    });
    // Zoom 2: 800x400 na tela, sobra 300px e 100px.
    expect(clampOffset({ x: 500, y: 500 }, landscape, VIEWPORT, 2)).toEqual({
      x: 300,
      y: 100,
    });
  });

  it('centralizado, recorta o quadrado central da imagem', () => {
    expect(sourceRect({ x: 0, y: 0 }, landscape, VIEWPORT, 1)).toEqual({
      x: 500,
      y: 0,
      size: 1000,
    });
  });

  it('arrastar para a direita mostra a parte esquerda da imagem', () => {
    expect(sourceRect({ x: 100, y: 0 }, landscape, VIEWPORT, 1)).toEqual({
      x: 0,
      y: 0,
      size: 1000,
    });
  });

  it('o zoom reduz a área recortada', () => {
    expect(sourceRect({ x: 0, y: 0 }, landscape, VIEWPORT, 2)).toEqual({
      x: 750,
      y: 250,
      size: 500,
    });
  });
});
