import React from 'react';
import { ActivityIndicator, Linking } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AdminVerifications from '../AdminVerifications';
import { useAdminStore, AdminVerification } from '@stores/Admin';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useRoute: () => ({ name: 'AdminVerifications', params: {} }),
}));

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

const makeVerification = (
  overrides: Partial<AdminVerification> = {},
): AdminVerification => ({
  id: 9,
  status: 'pending',
  document_type: 'cnh',
  submitted_at: '2026-09-10T12:00:00.000Z',
  professional: {
    id: 3,
    name: 'Carla Pro',
    email: 'carla@exemplo.com',
    cpf: '123.456.789-00',
  },
  front_url: 'https://arquivos.exemplo.com/frente.jpg',
  back_url: null,
  selfie_url: 'https://arquivos.exemplo.com/selfie.jpg',
  ...overrides,
});

describe('AdminVerifications', () => {
  const mockListVerifications = jest.fn();
  const mockReviewVerification = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockListVerifications.mockResolvedValue([]);
    mockReviewVerification.mockResolvedValue(undefined);
    useAdminStore.setState({
      listVerifications: mockListVerifications,
      reviewVerification: mockReviewVerification,
    });
  });

  it('deve buscar os pedidos em análise e mostrar a lista vazia', async () => {
    const { UNSAFE_queryByType, findByText } = render(<AdminVerifications />);

    expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
    expect(await findByText('Nenhum pedido nesta lista.')).toBeTruthy();
    expect(mockListVerifications).toHaveBeenCalledWith('pending');
  });

  it('deve buscar de novo ao trocar o filtro', async () => {
    const { getByText, findByText } = render(<AdminVerifications />);
    await findByText('Nenhum pedido nesta lista.');

    fireEvent.press(getByText('Recusadas'));
    await waitFor(() =>
      expect(mockListVerifications).toHaveBeenLastCalledWith('rejected'),
    );
  });

  it('deve mostrar o erro quando a lista falha', async () => {
    mockListVerifications.mockRejectedValueOnce(new Error('falhou'));
    const { findByText } = render(<AdminVerifications />);

    expect(
      await findByText('Não foi possível carregar os pedidos.'),
    ).toBeTruthy();
  });

  it('deve listar os pedidos com dados do profissional e situação', async () => {
    mockListVerifications.mockResolvedValueOnce([
      makeVerification(),
      makeVerification({
        id: 10,
        status: 'approved',
        document_type: 'rg',
        professional: {
          id: 4,
          name: 'Davi Pro',
          email: 'davi@exemplo.com',
          cpf: '000.000.000-00',
        },
      }),
      makeVerification({
        id: 11,
        status: 'rejected',
        reject_reason: 'Foto ilegível',
        professional: {
          id: 5,
          name: 'Eva Pro',
          email: 'eva@exemplo.com',
          cpf: '111.111.111-11',
        },
      }),
    ]);
    const { findByText, getByText, getAllByText } = render(
      <AdminVerifications />,
    );

    expect(await findByText('Carla Pro')).toBeTruthy();
    expect(getByText('carla@exemplo.com · CPF 123.456.789-00')).toBeTruthy();
    expect(getAllByText(/^CNH · enviado em/)).toHaveLength(2);
    expect(getByText('Analisar')).toBeTruthy();
    expect(getByText(/^RG · enviado em/)).toBeTruthy();
    expect(getByText('Aprovada')).toBeTruthy();
    expect(getByText('Recusada — Foto ilegível')).toBeTruthy();
  });

  it('deve aprovar o pedido e recarregar a lista', async () => {
    mockListVerifications.mockResolvedValueOnce([makeVerification()]);
    const { findByText, getByText, queryByText } = render(
      <AdminVerifications />,
    );

    fireEvent.press(await findByText('Analisar'));
    expect(getByText('Verificar Carla Pro')).toBeTruthy();
    expect(getByText('Frente do documento')).toBeTruthy();
    expect(queryByText('Verso do documento')).toBeNull();
    expect(getByText('Selfie com o documento')).toBeTruthy();

    fireEvent.press(getByText('Aprovar'));

    await waitFor(() =>
      expect(mockReviewVerification).toHaveBeenCalledWith(9, 'approve', ''),
    );
    await waitFor(() => expect(queryByText('Verificar Carla Pro')).toBeNull());
    expect(mockListVerifications).toHaveBeenCalledTimes(2);
  });

  it('deve abrir a foto em tamanho grande', async () => {
    const openURL = jest
      .spyOn(Linking, 'openURL')
      .mockResolvedValue(undefined as unknown as true);
    mockListVerifications.mockResolvedValueOnce([makeVerification()]);
    const { findByText, getByLabelText } = render(<AdminVerifications />);

    fireEvent.press(await findByText('Analisar'));
    fireEvent.press(
      getByLabelText('Abrir Selfie com o documento em tamanho grande'),
    );

    expect(openURL).toHaveBeenCalledWith(
      'https://arquivos.exemplo.com/selfie.jpg',
    );
    openURL.mockRestore();
  });

  it('deve exigir motivo de pelo menos 5 caracteres para recusar', async () => {
    mockListVerifications.mockResolvedValueOnce([makeVerification()]);
    const { findByText, getByText, getByLabelText } = render(
      <AdminVerifications />,
    );

    fireEvent.press(await findByText('Analisar'));
    fireEvent.press(getByText('Recusar'));
    fireEvent.changeText(getByLabelText('Motivo da recusa'), 'ruim');
    fireEvent.press(getByText('Confirmar recusa'));

    expect(
      getByText('Explique o motivo da recusa (mínimo 5 caracteres).'),
    ).toBeTruthy();
    expect(mockReviewVerification).not.toHaveBeenCalled();

    fireEvent.changeText(
      getByLabelText('Motivo da recusa'),
      '  Documento vencido  ',
    );
    fireEvent.press(getByText('Confirmar recusa'));

    await waitFor(() =>
      expect(mockReviewVerification).toHaveBeenCalledWith(
        9,
        'reject',
        'Documento vencido',
      ),
    );
  });

  it('deve voltar da recusa para as opções iniciais', async () => {
    mockListVerifications.mockResolvedValueOnce([makeVerification()]);
    const { findByText, getByText, queryByLabelText } = render(
      <AdminVerifications />,
    );

    fireEvent.press(await findByText('Analisar'));
    fireEvent.press(getByText('Recusar'));
    expect(queryByLabelText('Motivo da recusa')).toBeTruthy();

    fireEvent.press(getByText('Voltar'));
    expect(queryByLabelText('Motivo da recusa')).toBeNull();
    expect(getByText('Aprovar')).toBeTruthy();
  });

  it('deve mostrar o erro quando a decisão falha', async () => {
    mockListVerifications.mockResolvedValueOnce([makeVerification()]);
    mockReviewVerification.mockRejectedValueOnce(new Error('falhou'));
    const { findByText, getByText } = render(<AdminVerifications />);

    fireEvent.press(await findByText('Analisar'));
    fireEvent.press(getByText('Aprovar'));

    expect(
      await findByText('Não foi possível registrar a decisão.'),
    ).toBeTruthy();
    expect(getByText('Verificar Carla Pro')).toBeTruthy();
  });

  it('deve fechar a folha pelo botão de fechar', async () => {
    mockListVerifications.mockResolvedValueOnce([makeVerification()]);
    const { findByText, getByLabelText, queryByText } = render(
      <AdminVerifications />,
    );

    fireEvent.press(await findByText('Analisar'));
    // O fundo escurecido fica fora da arvore acessivel (a folha e modal).
    fireEvent.press(getByLabelText('Fechar', { includeHiddenElements: true }));

    expect(queryByText('Verificar Carla Pro')).toBeNull();
  });
});
