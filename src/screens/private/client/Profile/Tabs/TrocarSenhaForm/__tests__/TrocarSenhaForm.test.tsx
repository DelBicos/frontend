import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TrocarSenhaForm from '../TrocarSenhaForm';
import { useUserStore } from '@stores/User';
import type { User } from '@stores/User/types';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

describe('TrocarSenhaForm', () => {
  const mockChangePassword = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useUserStore.setState({
      user: { id: 31, email: 'maria@teste.com' } as unknown as User,
      changePassword: mockChangePassword,
    });
  });

  const fill = (
    getByLabelText: (label: string) => unknown,
    values: { current?: string; next?: string; confirm?: string },
  ) => {
    if (values.current !== undefined)
      fireEvent.changeText(getByLabelText('Senha atual'), values.current);
    if (values.next !== undefined)
      fireEvent.changeText(getByLabelText('Nova senha'), values.next);
    if (values.confirm !== undefined)
      fireEvent.changeText(
        getByLabelText('Repita a nova senha'),
        values.confirm,
      );
  };

  it('deve mostrar a dica de tamanho antes de digitar', () => {
    const { getByText } = render(<TrocarSenhaForm />);
    expect(getByText(/Mínimo de 6 caracteres/)).toBeTruthy();
  });

  it('deve mostrar a força da nova senha', () => {
    const { getByLabelText, getByText } = render(<TrocarSenhaForm />);

    fill(getByLabelText, { next: 'abc' });
    expect(getByText('curta demais')).toBeTruthy();

    fill(getByLabelText, { next: 'Abcdef1!xyz' });
    expect(getByText('forte')).toBeTruthy();
  });

  it('deve validar os campos obrigatórios', async () => {
    const { getByText, getByRole, findByText } = render(<TrocarSenhaForm />);

    fireEvent.press(getByRole('button', { name: 'Trocar senha' }));

    expect(await findByText('Informe sua senha atual.')).toBeTruthy();
    expect(getByText('Crie a nova senha.')).toBeTruthy();
    expect(getByText('Repita a nova senha.')).toBeTruthy();
    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it('deve exigir senha nova diferente, longa e confirmada', async () => {
    const { getByLabelText, getByText, getByRole, findByText } = render(
      <TrocarSenhaForm />,
    );

    fill(getByLabelText, {
      current: 'senha123',
      next: 'senha123',
      confirm: 'x',
    });
    fireEvent.press(getByRole('button', { name: 'Trocar senha' }));

    expect(
      await findByText('A nova senha deve ser diferente da atual.'),
    ).toBeTruthy();
    expect(getByText('As senhas não são iguais.')).toBeTruthy();

    fill(getByLabelText, { next: 'abc' });
    expect(await findByText('Use pelo menos 6 caracteres.')).toBeTruthy();
  });

  it('deve trocar a senha e limpar o formulário', async () => {
    mockChangePassword.mockResolvedValue(undefined);
    const { getByLabelText, getByRole, findByText } = render(
      <TrocarSenhaForm />,
    );

    fill(getByLabelText, {
      current: 'senhaAntiga1',
      next: 'NovaSenha#2026',
      confirm: 'NovaSenha#2026',
    });
    fireEvent.press(getByRole('button', { name: 'Trocar senha' }));

    expect(await findByText('Senha alterada.')).toBeTruthy();
    expect(mockChangePassword).toHaveBeenCalledWith(
      'senhaAntiga1',
      'NovaSenha#2026',
    );
    expect(getByLabelText('Senha atual').props.value).toBe('');
  });

  it('deve enviar pelo teclado no campo de confirmação', async () => {
    mockChangePassword.mockRejectedValue(new Error('Senha atual incorreta'));
    const { getByLabelText, findByText } = render(<TrocarSenhaForm />);

    fill(getByLabelText, {
      current: 'errada1',
      next: 'NovaSenha#2026',
      confirm: 'NovaSenha#2026',
    });
    fireEvent(getByLabelText('Repita a nova senha'), 'submitEditing');

    expect(await findByText('Senha atual incorreta')).toBeTruthy();
  });

  it('deve abrir "esqueci a senha" com o e-mail da conta', () => {
    const { getByText } = render(<TrocarSenhaForm />);

    fireEvent.press(getByText('Esqueci a senha atual'));
    expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword', {
      email: 'maria@teste.com',
    });
  });
});
