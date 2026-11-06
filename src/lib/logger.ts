/**
 * Registro do app. Em desenvolvimento escreve no console; em producao so
 * avisos e erros (sem ruido de debug e sem dados na tela do usuario).
 * E o unico lugar que fala com `console` — o resto do app usa este modulo.
 */
/* eslint-disable no-console */

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },
  warn: (...args: unknown[]) => console.warn(...args),
  error: (...args: unknown[]) => console.error(...args),
};

export default logger;
