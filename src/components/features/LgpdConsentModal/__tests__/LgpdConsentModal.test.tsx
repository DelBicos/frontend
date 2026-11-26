import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import { LgpdConsentModal } from '..';

jest.mock('@expo/vector-icons', () => {
  const Icon = () => null;
  return { FontAwesome: Icon, Ionicons: Icon };
});

type Props = React.ComponentProps<typeof LgpdConsentModal>;

const renderModal = (props: Partial<Props> = {}) => {
  const onClose = jest.fn();
  const onAccept = jest.fn().mockResolvedValue(undefined);
  const utils = render(
    <LgpdConsentModal
      visible
      onClose={onClose}
      onAccept={onAccept}
      {...props}
    />,
  );
  return { ...utils, onClose, onAccept };
};

describe('LgpdConsentModal', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve exibir o termo de consentimento', () => {
    const { getByText } = renderModal();

    expect(getByText('Termo de Consentimento LGPD')).toBeTruthy();
    expect(getByText('Aceitar e Continuar')).toBeTruthy();
    expect(getByText('Recusar / Agora Não')).toBeTruthy();
  });

  it('deve registrar o aceite e fechar o modal', async () => {
    const { getByText, onAccept, onClose } = renderModal();

    await act(async () => {
      fireEvent.press(getByText('Aceitar e Continuar'));
    });

    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar o carregamento enquanto o aceite é registrado', async () => {
    let resolveAccept: () => void = () => undefined;
    const onAccept = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveAccept = resolve;
        }),
    );
    const { getByText, queryByText, onClose } = renderModal({ onAccept });

    await act(async () => {
      fireEvent.press(getByText('Aceitar e Continuar'));
    });

    expect(queryByText('Aceitar e Continuar')).toBeNull();
    fireEvent.press(getByText('Recusar / Agora Não'));
    expect(onClose).not.toHaveBeenCalled();

    await act(async () => {
      resolveAccept();
    });

    expect(getByText('Aceitar e Continuar')).toBeTruthy();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve alertar com a mensagem do erro quando o aceite falha', async () => {
    const onAccept = jest.fn().mockRejectedValue(new Error('Falha na API'));
    const { getByText, onClose } = renderModal({ onAccept });

    await act(async () => {
      fireEvent.press(getByText('Aceitar e Continuar'));
    });

    expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Falha na API');
    expect(onClose).not.toHaveBeenCalled();
    expect(getByText('Aceitar e Continuar')).toBeTruthy();
  });

  it('deve alertar com a mensagem padrão quando o erro não tem texto', async () => {
    const onAccept = jest.fn().mockRejectedValue({});
    const { getByText } = renderModal({ onAccept });

    await act(async () => {
      fireEvent.press(getByText('Aceitar e Continuar'));
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Erro',
      'Não foi possível registrar o consentimento. Tente novamente.',
    );
  });

  it('deve chamar onDecline ao recusar quando informado', () => {
    const onDecline = jest.fn();
    const { getByText, onClose } = renderModal({ onDecline });

    fireEvent.press(getByText('Recusar / Agora Não'));

    expect(onDecline).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve fechar ao recusar sem onDecline', () => {
    const { getByText, onClose } = renderModal();

    fireEvent.press(getByText('Recusar / Agora Não'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
