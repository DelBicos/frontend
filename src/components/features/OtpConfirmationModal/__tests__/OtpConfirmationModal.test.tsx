import React from 'react';
import { ActivityIndicator, TextInput } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { OtpConfirmationModal } from '..';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

type Props = React.ComponentProps<typeof OtpConfirmationModal>;

const makeRefs = () =>
  Array.from({ length: 4 }, () => React.createRef<TextInput>());

const renderModal = (props: Partial<Props> = {}) => {
  const handlers = {
    onClose: jest.fn(),
    onOtpChange: jest.fn(),
    onOtpKeyPress: jest.fn(),
    onConfirm: jest.fn(),
    onCallClient: jest.fn(),
  };
  const inputRefs = makeRefs();
  const utils = render(
    <OtpConfirmationModal
      visible
      otpMode="checkin"
      otp={['', '', '', '']}
      otpError={null}
      otpLoading={false}
      inputRefs={inputRefs}
      {...handlers}
      {...props}
    />,
  );
  return { ...utils, ...handlers, inputRefs };
};

describe('OtpConfirmationModal', () => {
  it('deve exibir os textos do check-in', () => {
    const { getByText, UNSAFE_getAllByType } = renderModal();

    expect(getByText('CHECK-IN DO SERVIÇO')).toBeTruthy();
    expect(getByText('Digite o código do cliente')).toBeTruthy();
    expect(getByText('Confirmar e Iniciar Serviço')).toBeTruthy();
    expect(getByText('-')).toBeTruthy();
    expect(UNSAFE_getAllByType(TextInput)).toHaveLength(4);
  });

  it('deve exibir os textos do check-out', () => {
    const { getByText } = renderModal({ otpMode: 'checkout' });

    expect(getByText('CHECK-OUT DO SERVIÇO')).toBeTruthy();
    expect(getByText('Finalizar Atendimento')).toBeTruthy();
    expect(getByText('Confirmar e Finalizar Serviço')).toBeTruthy();
  });

  it('deve ligar as refs aos campos', () => {
    const { inputRefs } = renderModal();

    inputRefs.forEach((ref) => expect(ref.current).not.toBeNull());
  });

  it('deve repassar digitação e teclas com o índice do campo', () => {
    const { UNSAFE_getAllByType, onOtpChange, onOtpKeyPress } = renderModal();
    const inputs = UNSAFE_getAllByType(TextInput);

    fireEvent.changeText(inputs[2], '7');
    const keyEvent = { nativeEvent: { key: 'Backspace' } };
    fireEvent(inputs[3], 'keyPress', keyEvent);

    expect(onOtpChange).toHaveBeenCalledWith('7', 2);
    expect(onOtpKeyPress).toHaveBeenCalledWith(keyEvent, 3);
  });

  it('não deve confirmar com o código incompleto', () => {
    const { getByText, onConfirm } = renderModal({ otp: ['A', 'B', '1', ''] });

    fireEvent.press(getByText('Confirmar e Iniciar Serviço'));

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('deve confirmar com o código completo', () => {
    const { getByText, onConfirm } = renderModal({
      otp: ['A', 'B', '1', '2'],
    });

    fireEvent.press(getByText('Confirmar e Iniciar Serviço'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar o carregamento no lugar do texto do botão', () => {
    const { queryByText, UNSAFE_getByType } = renderModal({
      otp: ['A', 'B', '1', '2'],
      otpLoading: true,
    });

    expect(queryByText('Confirmar e Iniciar Serviço')).toBeNull();
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('deve exibir o erro do código', () => {
    const { getByText } = renderModal({ otpError: 'Código inválido' });

    expect(getByText('Código inválido')).toBeTruthy();
  });

  it('deve ligar para o cliente pelo link de ajuda', () => {
    const { getByText, onCallClient } = renderModal();

    fireEvent.press(getByText('Não consegue o código? Ligar para o cliente'));

    expect(onCallClient).toHaveBeenCalledTimes(1);
  });
});
