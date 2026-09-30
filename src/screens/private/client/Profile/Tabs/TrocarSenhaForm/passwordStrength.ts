/** Mesmo minimo do servidor e do cadastro. */
export const MIN_PASSWORD_LENGTH = 6;

export interface PasswordStrength {
  /** 0 = vazia/curta, 1 = fraca, 2 = razoavel, 3 = forte. */
  level: 0 | 1 | 2 | 3;
  label: string;
  tip?: string;
}

/** Forca aproximada, so para orientar (nao bloqueia senhas validas). */
export function passwordStrength(password: string): PasswordStrength {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return {
      level: 0,
      label: 'curta demais',
      tip: `use pelo menos ${MIN_PASSWORD_LENGTH} caracteres`,
    };
  }
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) =>
    r.test(password),
  ).length;
  const score =
    variety + (password.length >= 10 ? 1 : 0) + (password.length >= 14 ? 1 : 0);
  if (score >= 4) return { level: 3, label: 'forte' };
  if (score >= 3) {
    return {
      level: 2,
      label: 'razoável',
      tip: 'um símbolo ou mais letras ajudam',
    };
  }
  return {
    level: 1,
    label: 'fraca',
    tip: 'misture letras, números e símbolos',
  };
}
