import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import VerificacaoConta from '../VerificacaoConta';
import { useVerificationStore } from '@stores/Verification';
import { useUserStore } from '@stores/User';
import type { VerificationStatus } from '@stores/Verification/types';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

// Os cartoes tem testes proprios; aqui so interessa o aviso de mudanca.
jest.mock('../MfaCard', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ onChanged }: { onChanged: () => void }) => (
      <Text onPress={onChanged}>Cartão MFA</Text>
    ),
  };
});

jest.mock('../IdentityCard', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: () => <Text>Cartão identidade</Text>,
  };
});

const makeStatus = (
  overrides: Partial<VerificationStatus> = {},
): VerificationStatus => ({
  email_verified: true,
  mfa_enabled: false,
  is_professional: false,
  identity: null,
  verified: false,
  verified_at: null,
  ...overrides,
});

describe('VerificacaoConta', () => {
  const mockFetchStatus = jest.fn();
  const mockFetchUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useVerificationStore.setState({
      status: null,
      error: null,
      fetchStatus: mockFetchStatus,
    });
    useUserStore.setState({ fetchCurrentUser: mockFetchUser });
  });

  it('deve carregar a situação ao abrir', () => {
    const { UNSAFE_queryByType } = render(<VerificacaoConta />);

    expect(mockFetchStatus).toHaveBeenCalledTimes(1);
    expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
  });

  it('deve mostrar o erro sem o carregamento', () => {
    useVerificationStore.setState({ error: 'Sem conexão' });
    const { getByText, UNSAFE_queryByType } = render(<VerificacaoConta />);

    expect(getByText('Sem conexão')).toBeTruthy();
    expect(UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  });

  it('deve mostrar o resumo do cliente sem identidade', () => {
    useVerificationStore.setState({ status: makeStatus() });
    const { getByText, queryByText } = render(<VerificacaoConta />);

    expect(getByText('E-mail confirmado')).toBeTruthy();
    expect(getByText('Ainda não ativada.')).toBeTruthy();
    expect(queryByText('Identidade verificada')).toBeNull();
    expect(queryByText('Cartão identidade')).toBeNull();
  });

  it('deve mostrar a identidade para o profissional', () => {
    useVerificationStore.setState({
      status: makeStatus({ is_professional: true, mfa_enabled: true }),
    });
    const { getByText } = render(<VerificacaoConta />);

    expect(getByText('Ativa.')).toBeTruthy();
    expect(
      getByText('Envie seus documentos para receber o selo.'),
    ).toBeTruthy();
    expect(getByText('Cartão identidade')).toBeTruthy();
  });

  it('deve mostrar a aprovação do profissional verificado', () => {
    useVerificationStore.setState({
      status: makeStatus({ is_professional: true, verified: true }),
    });
    const { getByText } = render(<VerificacaoConta />);

    expect(getByText('Aprovada. Seu perfil exibe o selo.')).toBeTruthy();
  });

  it('deve recarregar a situação e o usuário quando algo muda', () => {
    useVerificationStore.setState({ status: makeStatus() });
    const { getByText } = render(<VerificacaoConta />);

    fireEvent.press(getByText('Cartão MFA'));
    expect(mockFetchStatus).toHaveBeenCalledTimes(2);
    expect(mockFetchUser).toHaveBeenCalledTimes(1);
  });
});
