import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MfaCard from '../MfaCard';
import { useVerificationStore } from '@stores/Verification';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

jest.mock('@components/ui/CodeEntry', () => {
  const { TextInput } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({
      value,
      onChange,
    }: {
      value: string;
      onChange: (v: string) => void;
    }) => (
      <TextInput
        accessibilityLabel="Código"
        value={value}
        onChangeText={onChange}
      />
    ),
  };
});

describe('MfaCard', () => {
  const mockRequest = jest.fn();
  const mockConfirm = jest.fn();
  const mockDisable = jest.fn();
  const onChanged = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useVerificationStore.setState({
      requestEnableMfa: mockRequest,
      confirmEnableMfa: mockConfirm,
      disableMfa: mockDisable,
    });
  });

  it('deve enviar o código e ativar com 6 números', async () => {
    mockRequest.mockResolvedValue('m***@teste.com');
    mockConfirm.mockResolvedValue(undefined);
    const { getByText, getByLabelText, findByText, queryByText } = render(
      <MfaCard enabled={false} onChanged={onChanged} />,
    );

    fireEvent.press(getByText('Ativar por e-mail'));
    expect(
      await findByText(
        'Enviamos um código para m***@teste.com. Digite abaixo.',
      ),
    ).toBeTruthy();

    fireEvent.changeText(getByLabelText('Código'), '123');
    fireEvent.press(getByText('Ativar'));
    expect(getByText('Digite os 6 números do código.')).toBeTruthy();
    expect(mockConfirm).not.toHaveBeenCalled();

    fireEvent.changeText(getByLabelText('Código'), '123456');
    fireEvent.press(getByText('Ativar'));

    expect(await findByText('Ativar por e-mail')).toBeTruthy();
    expect(mockConfirm).toHaveBeenCalledWith('123456');
    expect(onChanged).toHaveBeenCalled();
    expect(queryByText(/Enviamos um código/)).toBeNull();
  });

  it('deve mostrar o erro quando o código não é enviado', async () => {
    mockRequest.mockRejectedValue(new Error('falha'));
    const { getByText, findByText } = render(
      <MfaCard enabled={false} onChanged={onChanged} />,
    );

    fireEvent.press(getByText('Ativar por e-mail'));

    expect(await findByText('Não foi possível enviar o código.')).toBeTruthy();
  });

  it('deve mostrar o erro de código incorreto e permitir cancelar', async () => {
    mockRequest.mockResolvedValue('m***@teste.com');
    mockConfirm.mockRejectedValue(new Error('falha'));
    const { getByText, getByLabelText, findByText, queryByText } = render(
      <MfaCard enabled={false} onChanged={onChanged} />,
    );

    fireEvent.press(getByText('Ativar por e-mail'));
    await findByText(/Enviamos um código/);
    fireEvent.changeText(getByLabelText('Código'), '654321');
    fireEvent.press(getByText('Ativar'));

    expect(await findByText('Código incorreto ou expirado.')).toBeTruthy();
    expect(onChanged).not.toHaveBeenCalled();

    fireEvent.press(getByText('Cancelar'));
    expect(queryByText('Código incorreto ou expirado.')).toBeNull();
    expect(getByText('Ativar por e-mail')).toBeTruthy();
  });

  it('deve desativar depois de confirmar a senha', async () => {
    mockDisable.mockResolvedValue(undefined);
    const { getByText, getByLabelText, findByText, getAllByText } = render(
      <MfaCard enabled onChanged={onChanged} />,
    );

    expect(getByText(/^Ativa\./)).toBeTruthy();
    fireEvent.press(getByText('Desativar'));
    expect(getByText('Confirme sua senha para desativar.')).toBeTruthy();

    fireEvent.changeText(getByLabelText('Senha'), 'minhaSenha');
    fireEvent.press(getAllByText('Desativar')[0]);

    expect(await findByText('Desativar')).toBeTruthy();
    expect(mockDisable).toHaveBeenCalledWith('minhaSenha');
    expect(onChanged).toHaveBeenCalled();
  });

  it('deve mostrar o erro ao desativar e cancelar limpando a senha', async () => {
    mockDisable.mockRejectedValue(new Error('falha'));
    const { getByText, getByLabelText, findByText } = render(
      <MfaCard enabled onChanged={onChanged} />,
    );

    fireEvent.press(getByText('Desativar'));
    fireEvent.changeText(getByLabelText('Senha'), 'errada');
    fireEvent.press(getByText('Desativar'));

    expect(await findByText('Não foi possível desativar.')).toBeTruthy();
    fireEvent.press(getByText('Cancelar'));

    fireEvent.press(getByText('Desativar'));
    expect(getByLabelText('Senha').props.value).toBe('');
  });
});
