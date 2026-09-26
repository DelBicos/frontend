import { passwordStrength } from '../passwordStrength';

describe('passwordStrength', () => {
  it('senha curta nao conta', () => {
    expect(passwordStrength('abc').level).toBe(0);
  });

  it('classifica pela variedade e tamanho', () => {
    expect(passwordStrength('abcdef').level).toBe(1);
    expect(passwordStrength('abc123XY').level).toBe(2);
    expect(passwordStrength('Abc123!xyzW').level).toBe(3);
  });

  it('aceita qualquer caractere (ex.: ponto e hifen)', () => {
    expect(passwordStrength('meu.nome-2024').level).toBeGreaterThan(0);
  });
});
