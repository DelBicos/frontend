import { errorMessage } from '../errors';

describe('errorMessage', () => {
  it('usa a mensagem de um Error', () => {
    expect(errorMessage(new Error('falhou'), 'padrao')).toBe('falhou');
  });

  it('usa o texto lancado', () => {
    expect(errorMessage('sem rede', 'padrao')).toBe('sem rede');
  });

  it('cai no fallback quando nao ha mensagem', () => {
    expect(errorMessage(new Error(''), 'padrao')).toBe('padrao');
    expect(errorMessage('', 'padrao')).toBe('padrao');
    expect(errorMessage(404, 'padrao')).toBe('padrao');
    expect(errorMessage(null, 'padrao')).toBe('padrao');
  });
});
