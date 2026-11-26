import { Alert, Platform } from 'react-native';
import { confirmAction } from '../confirmAction';

describe('confirmAction', () => {
  const previousOS = Platform.OS;

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => previousOS,
    });
  });

  it('resolve com o botao escolhido no app', async () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => 'ios',
    });
    jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _message, buttons) => {
        buttons?.[1]?.onPress?.();
      });

    await expect(
      confirmAction({
        title: 'Sair',
        message: 'Tem certeza?',
        confirmLabel: 'Sair',
        destructive: true,
      }),
    ).resolves.toBe(true);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Sair',
      'Tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel', onPress: expect.any(Function) },
        { text: 'Sair', style: 'destructive', onPress: expect.any(Function) },
      ],
      { cancelable: true, onDismiss: expect.any(Function) },
    );
  });

  it('resolve falso ao dispensar o alerta', async () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => 'android',
    });
    jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _message, _buttons, options) => {
        options?.onDismiss?.();
      });

    await expect(
      confirmAction({
        title: 'Sair',
        message: 'Tem certeza?',
        confirmLabel: 'Sair',
        cancelLabel: 'Voltar',
      }),
    ).resolves.toBe(false);
  });

  it('no web usa o dialogo do navegador', async () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => 'web',
    });
    const confirm = jest.fn().mockReturnValue(false);
    const previousWindow = global.window;
    Object.defineProperty(global, 'window', {
      configurable: true,
      value: { confirm },
    });

    await expect(
      confirmAction({
        title: 'Sair',
        message: 'Tem certeza?',
        confirmLabel: 'Sair',
      }),
    ).resolves.toBe(false);
    expect(confirm).toHaveBeenCalledWith('Sair\n\nTem certeza?');

    Object.defineProperty(global, 'window', {
      configurable: true,
      value: previousWindow,
    });
  });
});
