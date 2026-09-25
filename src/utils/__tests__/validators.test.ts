import {
  isValidCPF,
  isValidChatBotSessionId,
  isValidChatBotStoredMessage,
} from '../validators';

describe('isValidCPF', () => {
  it('aceita CPF valido com ou sem mascara', () => {
    expect(isValidCPF('529.982.247-25')).toBe(true);
    expect(isValidCPF('52998224725')).toBe(true);
  });

  it('rejeita digitos verificadores errados, repetidos e tamanho invalido', () => {
    expect(isValidCPF('529.982.247-24')).toBe(false);
    expect(isValidCPF('111.111.111-11')).toBe(false);
    expect(isValidCPF('1234567890')).toBe(false);
    expect(isValidCPF(null)).toBe(false);
    expect(isValidCPF('')).toBe(false);
  });
});

describe('chatbot validators', () => {
  it('session_id precisa ser inteiro positivo', () => {
    expect(isValidChatBotSessionId(5)).toBe(true);
    for (const invalid of [0, -1, 1.5, '5', null, undefined]) {
      expect(isValidChatBotSessionId(invalid)).toBe(false);
    }
  });

  it('valida o formato minimo da mensagem armazenada', () => {
    const valid = { id: 'a', role: 'bot', text: 'oi', createdAt: 'x' };
    expect(isValidChatBotStoredMessage(valid)).toBe(true);
    expect(isValidChatBotStoredMessage({ ...valid, role: 'admin' })).toBe(
      false,
    );
    expect(isValidChatBotStoredMessage({ ...valid, id: '' })).toBe(false);
    expect(isValidChatBotStoredMessage(null)).toBe(false);
  });
});
