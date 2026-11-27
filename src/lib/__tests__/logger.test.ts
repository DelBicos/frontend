type LoggerModule = typeof import('../logger');

const loadLogger = (dev: boolean | undefined): LoggerModule => {
  const g = global as unknown as { __DEV__?: boolean };
  const previous = g.__DEV__;
  if (dev === undefined) delete g.__DEV__;
  else g.__DEV__ = dev;
  let mod: LoggerModule | undefined;
  jest.isolateModules(() => {
    mod = require('../logger') as LoggerModule;
  });
  g.__DEV__ = previous;
  return mod as LoggerModule;
};

describe('logger', () => {
  let log: jest.SpyInstance;
  let info: jest.SpyInstance;
  let warn: jest.SpyInstance;
  let error: jest.SpyInstance;

  beforeEach(() => {
    log = jest.spyOn(console, 'log').mockImplementation(() => {});
    info = jest.spyOn(console, 'info').mockImplementation(() => {});
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    error = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it('em desenvolvimento escreve debug e info', () => {
    const { logger } = loadLogger(true);
    logger.debug('a', 1);
    logger.info('b');
    expect(log).toHaveBeenCalledWith('a', 1);
    expect(info).toHaveBeenCalledWith('b');
  });

  it('sem __DEV__ definido trata como desenvolvimento', () => {
    const { logger } = loadLogger(undefined);
    logger.debug('a');
    expect(log).toHaveBeenCalledWith('a');
  });

  it('em producao omite debug e info mas mantem avisos e erros', () => {
    const { logger, default: padrao } = loadLogger(false);
    logger.debug('a');
    logger.info('b');
    logger.warn('c');
    padrao.error('d');
    expect(log).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith('c');
    expect(error).toHaveBeenCalledWith('d');
  });
});
