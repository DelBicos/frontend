import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AdminDisputes, { reaisToCents } from '../AdminDisputes';
import { useAdminStore } from '@stores/Admin';
import type { AdminDispute } from '@stores/Appointment/types';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useRoute: () => ({ name: 'AdminDisputes', params: {} }),
}));

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

const makeDispute = (overrides: Partial<AdminDispute> = {}): AdminDispute => ({
  id: 7,
  appointment_id: 70,
  reason: 'poor_quality',
  description: 'O chuveiro continua pingando.',
  status: 'open',
  createdAt: '2026-09-10T12:00:00.000Z',
  Appointment: {
    short_id: 'AB12',
    status: 'completed',
    Service: { title: 'Instalação de chuveiro' },
    Client: { User: { name: 'Ana Cliente', email: 'ana@exemplo.com' } },
    Professional: { User: { name: 'Bruno Pro', email: 'bruno@exemplo.com' } },
  },
  ...overrides,
});

describe('reaisToCents', () => {
  it('deve converter reais com vírgula, ponto de milhar ou inteiros', () => {
    expect(reaisToCents('25,00')).toBe(2500);
    expect(reaisToCents('1.234,5')).toBe(123450);
    expect(reaisToCents(' 10 ')).toBe(1000);
  });

  it('deve recusar valores inválidos', () => {
    expect(reaisToCents('abc')).toBeNull();
    expect(reaisToCents('12,345')).toBeNull();
    expect(reaisToCents('')).toBeNull();
  });
});

describe('AdminDisputes', () => {
  const mockListDisputes = jest.fn();
  const mockResolveDispute = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockListDisputes.mockResolvedValue([]);
    mockResolveDispute.mockResolvedValue({});
    useAdminStore.setState({
      listDisputes: mockListDisputes,
      resolveDispute: mockResolveDispute,
    });
  });

  it('deve mostrar o carregamento e depois a lista vazia de abertas', async () => {
    const { UNSAFE_queryByType, findByText } = render(<AdminDisputes />);

    expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
    expect(await findByText('Nenhuma disputa aberta.')).toBeTruthy();
    expect(mockListDisputes).toHaveBeenCalledWith('open');
  });

  it('deve buscar as resolvidas ao trocar o filtro', async () => {
    const { getByText, findByText } = render(<AdminDisputes />);
    await findByText('Nenhuma disputa aberta.');

    fireEvent.press(getByText('Resolvidas'));

    expect(await findByText('Nenhuma disputa resolvida.')).toBeTruthy();
    expect(mockListDisputes).toHaveBeenLastCalledWith('resolved');
  });

  it('deve mostrar o erro quando a lista falha', async () => {
    mockListDisputes.mockRejectedValueOnce(new Error('falhou'));
    const { findByText } = render(<AdminDisputes />);

    expect(
      await findByText('Não foi possível carregar as disputas.'),
    ).toBeTruthy();
  });

  it('deve mostrar os dados da disputa aberta', async () => {
    mockListDisputes.mockResolvedValueOnce([makeDispute()]);
    const { findByText, getByText } = render(<AdminDisputes />);

    expect(await findByText('Instalação de chuveiro')).toBeTruthy();
    expect(
      getByText('Cliente: Ana Cliente · Profissional: Bruno Pro'),
    ).toBeTruthy();
    expect(getByText(/Agendamento #AB12/)).toBeTruthy();
    expect(getByText('Serviço com problemas')).toBeTruthy();
    expect(getByText('O chuveiro continua pingando.')).toBeTruthy();
    expect(getByText('Decidir')).toBeTruthy();
  });

  it('deve usar textos padrão quando faltam dados do agendamento', async () => {
    mockListDisputes.mockResolvedValueOnce([
      makeDispute({ Appointment: undefined }),
    ]);
    const { findByText, getByText } = render(<AdminDisputes />);

    expect(await findByText('Serviço')).toBeTruthy();
    expect(getByText('Cliente: — · Profissional: —')).toBeTruthy();
  });

  it('deve mostrar a decisão das disputas resolvidas', async () => {
    mockListDisputes.mockResolvedValueOnce([
      makeDispute({
        id: 1,
        status: 'resolved',
        resolution: 'refund_partial',
        refund_cents: 2500,
        resolution_note: 'Metade do valor',
      }),
      makeDispute({ id: 2, status: 'resolved', resolution: null }),
    ]);
    const { findByText, getByText } = render(<AdminDisputes />);

    expect(
      await findByText(/Reembolso parcial · R\$\s25,00 — Metade do valor/),
    ).toBeTruthy();
    expect(getByText('Resolvida')).toBeTruthy();
  });

  it('deve resolver com reembolso total e recarregar a lista', async () => {
    mockListDisputes.mockResolvedValueOnce([makeDispute()]);
    const { findByText, getByText, queryByText } = render(<AdminDisputes />);

    fireEvent.press(await findByText('Decidir'));
    expect(getByText('Decidir disputa')).toBeTruthy();

    fireEvent.press(getByText('Confirmar decisão'));

    await waitFor(() =>
      expect(mockResolveDispute).toHaveBeenCalledWith(7, {
        resolution: 'refund_full',
        refundCents: undefined,
        note: undefined,
      }),
    );
    await waitFor(() => expect(queryByText('Decidir disputa')).toBeNull());
    expect(mockListDisputes).toHaveBeenCalledTimes(2);
  });

  it('deve exigir o valor no reembolso parcial', async () => {
    mockListDisputes.mockResolvedValueOnce([makeDispute()]);
    const { findByText, getByText, getByLabelText } = render(<AdminDisputes />);

    fireEvent.press(await findByText('Decidir'));
    fireEvent.press(getByText('Reembolso parcial'));
    fireEvent.press(getByText('Confirmar decisão'));

    expect(
      getByText('Informe o valor a devolver em reais (ex.: 25,00).'),
    ).toBeTruthy();
    expect(mockResolveDispute).not.toHaveBeenCalled();

    fireEvent.changeText(getByLabelText('Valor a devolver em reais'), '25,00');
    fireEvent.changeText(
      getByLabelText('Observação da decisão'),
      '  Metade do valor  ',
    );
    fireEvent.press(getByText('Confirmar decisão'));

    await waitFor(() =>
      expect(mockResolveDispute).toHaveBeenCalledWith(7, {
        resolution: 'refund_partial',
        refundCents: 2500,
        note: 'Metade do valor',
      }),
    );
  });

  it('deve exigir o motivo ao recusar a disputa', async () => {
    mockListDisputes.mockResolvedValueOnce([makeDispute()]);
    const { findByText, getByText, getByLabelText } = render(<AdminDisputes />);

    fireEvent.press(await findByText('Decidir'));
    fireEvent.press(getByText('Recusada'));
    fireEvent.press(getByText('Confirmar decisão'));

    expect(getByText('Explique o motivo de recusar a disputa.')).toBeTruthy();
    expect(mockResolveDispute).not.toHaveBeenCalled();

    fireEvent.changeText(
      getByLabelText('Observação da decisão'),
      'Serviço feito',
    );
    fireEvent.press(getByText('Confirmar decisão'));

    await waitFor(() =>
      expect(mockResolveDispute).toHaveBeenCalledWith(7, {
        resolution: 'rejected',
        refundCents: undefined,
        note: 'Serviço feito',
      }),
    );
  });

  it('deve mostrar o erro quando a decisão falha e manter a folha aberta', async () => {
    mockListDisputes.mockResolvedValueOnce([makeDispute()]);
    mockResolveDispute.mockRejectedValueOnce(new Error('falhou'));
    const { findByText, getByText } = render(<AdminDisputes />);

    fireEvent.press(await findByText('Decidir'));
    fireEvent.press(getByText('Confirmar decisão'));

    expect(
      await findByText('Não foi possível resolver a disputa.'),
    ).toBeTruthy();
    expect(getByText('Decidir disputa')).toBeTruthy();
  });

  it('deve fechar a folha em "Voltar" sem decidir', async () => {
    mockListDisputes.mockResolvedValueOnce([makeDispute()]);
    const { findByText, getByText, queryByText } = render(<AdminDisputes />);

    fireEvent.press(await findByText('Decidir'));
    fireEvent.press(getByText('Voltar'));

    expect(queryByText('Decidir disputa')).toBeNull();
    expect(mockResolveDispute).not.toHaveBeenCalled();
  });
});
