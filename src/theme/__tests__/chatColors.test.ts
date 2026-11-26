import lightScheme from '../light';
import darkScheme from '../dark';
import lightContrastScheme from '../light-contrast';
import { ColorsType } from '../types';

/** WCAG 2.x relative luminance of a #RRGGBB color. */
const luminance = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const AA_TEXT = 4.5;

const themes: [string, ColorsType][] = [
  ['claro', lightScheme],
  ['escuro', darkScheme],
  ['claro de alto contraste', lightContrastScheme],
];

describe.each(themes)('cores do chat - tema %s', (_, colors) => {
  const { chat } = colors;
  const backgrounds = [chat.backgroundTop, chat.backgroundMid];

  it('deve ter contraste AA no texto principal sobre o fundo e o balão do bot', () => {
    [...backgrounds, chat.surface].forEach((bg) => {
      expect(contrast(chat.textPrimary, bg)).toBeGreaterThanOrEqual(AA_TEXT);
    });
  });

  it('deve ter contraste AA no texto secundário (status e legenda)', () => {
    [...backgrounds, chat.surface].forEach((bg) => {
      expect(contrast(chat.textSecondary, bg)).toBeGreaterThanOrEqual(AA_TEXT);
    });
  });

  it('deve ter contraste AA no texto da mensagem do usuário', () => {
    expect(contrast(chat.textOnAccent, chat.accent)).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
  });

  it('deve ter contraste AA no laranja usado como texto ("Reiniciar")', () => {
    backgrounds.forEach((bg) => {
      expect(contrast(chat.accentText, bg)).toBeGreaterThanOrEqual(AA_TEXT);
    });
  });

  it('deve ter contraste AA no rodapé e no ícone do microfone', () => {
    expect(
      contrast(chat.textPrimary, chat.backgroundMid),
    ).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrast(chat.micIcon, chat.micSurface)).toBeGreaterThanOrEqual(3);
  });
});
