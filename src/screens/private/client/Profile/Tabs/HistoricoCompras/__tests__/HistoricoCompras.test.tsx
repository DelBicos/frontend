import React from 'react';
import { Platform } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HistoricoCompras from '../HistoricoCompras';
import { useAppointmentStore } from '@stores/Appointment';
import { Appointment, AppointmentStatus } from '@stores/Appointment/types';
import {
  generateCSV,
  generateFileURI,
  generateXLSX,
} from '@lib/helpers/fileGenerator';
import { downloadFile, shareContent } from '@lib/helpers/shareHelperSimple';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

jest.mock('expo-file-system/legacy', () => ({
  EncodingType: { Base64: 'base64', UTF8: 'utf8' },
}));

jest.mock('@lib/helpers/fileGenerator', () => ({
  generateCSV: jest.fn(),
  generateXLSX: jest.fn(),
  generateFileURI: jest.fn(),
}));

jest.mock('@lib/helpers/shareHelperSimple', () => ({
  shareContent: jest.fn(),
  downloadFile: jest.fn(),
}));

jest.mock('@components/features/AppointmentDetailsModal', () => {
  const { Text, View } = jest.requireActual('react-native');
  return {
    AppointmentDetailsModal: ({
      visible,
      appointment,
      onClose,
    }: {
      visible: boolean;
      appointment: { Service: { title: string } } | null;
      onClose: () => void;
    }) =>
      visible ? (
        <View>
          <Text>Detalhe: {appointment?.Service.title}</Text>
          <Text onPress={onClose}>Fechar detalhe</Text>
        </View>
      ) : null,
  };
});

jest.mock('@components/features/RateServiceModal', () => {
  const { Text, View } = jest.requireActual('react-native');
  return {
    RateServiceModal: ({
      professionalName,
      onClose,
      onSuccess,
    }: {
      professionalName: string;
      onClose: () => void;
      onSuccess: () => void;
    }) => (
      <View>
        <Text>Avaliar {professionalName}</Text>
        <Text onPress={onSuccess}>Enviar avaliação</Text>
        <Text onPress={onClose}>Fechar avaliação</Text>
      </View>
    ),
  };
});

const now = new Date();
const inMonth = (offset: number, day: number) =>
  new Date(now.getFullYear(), now.getMonth() + offset, day, 12).toISOString();

const makeAppointment = (overrides: Partial<Appointment> = {}): Appointment =>
  ({
    id: 1,
    status: AppointmentStatus.COMPLETED,
    start_time: inMonth(0, 1),
    end_time: inMonth(0, 1),
    rating: null,
    review: null,
    final_price: 150,
    Service: { id: 9, title: 'Pintura', price: 150 },
    Professional: { id: 4, User: { name: 'Carlos Pintor' } },
    Client: { id: 31, User: { name: 'Maria Cliente' } },
    ...overrides,
  }) as unknown as Appointment;

const mockGenerateCSV = generateCSV as jest.Mock;
const mockGenerateXLSX = generateXLSX as jest.Mock;
const mockGenerateFileURI = generateFileURI as jest.Mock;
const mockShare = shareContent as jest.Mock;
const mockDownload = downloadFile as jest.Mock;

describe('HistoricoCompras', () => {
  const mockFetch = jest.fn();
  const mockFetchSheet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAppointmentStore.setState({
      appointments: [],
      fetchAppointments: mockFetch,
      fetchAppointmentsAsSheet: mockFetchSheet,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve buscar os atendimentos do cliente ao abrir', () => {
    render(<HistoricoCompras />);
    expect(mockFetch).toHaveBeenCalledWith('client');
  });

  it('deve mostrar o estado vazio do mês', () => {
    const { getByText } = render(<HistoricoCompras />);

    expect(getByText('Nada neste mês')).toBeTruthy();
    expect(getByText('gasto no mês')).toBeTruthy();
    expect(getByText('concluídos')).toBeTruthy();
    expect(getByText('cancelados')).toBeTruthy();
  });

  it('deve listar só concluídos e cancelados do mês com o resumo', () => {
    useAppointmentStore.setState({
      appointments: [
        makeAppointment({ id: 1, start_time: inMonth(0, 1) }),
        makeAppointment({
          id: 2,
          status: AppointmentStatus.CANCELED,
          start_time: inMonth(0, 2),
          final_price: null,
          Service: { id: 8, title: 'Elétrica', price: 'x' } as never,
        }),
        makeAppointment({
          id: 3,
          status: AppointmentStatus.CONFIRMED,
          Service: { id: 7, title: 'Confirmado' } as never,
        }),
        makeAppointment({
          id: 4,
          start_time: inMonth(-1, 10),
          Service: { id: 6, title: 'Mês passado' } as never,
        }),
      ],
    });
    const { getByText, queryByText, getAllByText } = render(
      <HistoricoCompras />,
    );

    expect(getByText('Pintura')).toBeTruthy();
    expect(getByText('Elétrica')).toBeTruthy();
    expect(queryByText('Confirmado')).toBeNull();
    expect(queryByText('Mês passado')).toBeNull();
    expect(getByText('concluído')).toBeTruthy();
    expect(getByText('cancelado')).toBeTruthy();
    expect(getByText('Concluído')).toBeTruthy();
    expect(getByText('Cancelado')).toBeTruthy();
    expect(getByText('—')).toBeTruthy();
    expect(getAllByText(/150,00/).length).toBe(2);
    expect(getAllByText('Carlos Pintor').length).toBe(2);
  });

  it('deve navegar entre os meses sem passar do atual', () => {
    useAppointmentStore.setState({
      appointments: [
        makeAppointment({
          id: 4,
          start_time: inMonth(-1, 10),
          Service: { id: 6, title: 'Mês passado' } as never,
        }),
      ],
    });
    const { getByLabelText, getByText, queryByText } = render(
      <HistoricoCompras />,
    );

    expect(getByLabelText('Próximo mês').props.accessibilityState).toEqual({
      disabled: true,
    });
    fireEvent.press(getByLabelText('Mês anterior'));
    expect(getByText('Mês passado')).toBeTruthy();
    fireEvent.press(getByLabelText('Próximo mês'));
    expect(queryByText('Mês passado')).toBeNull();
  });

  it('deve abrir e fechar os detalhes de um atendimento', () => {
    useAppointmentStore.setState({ appointments: [makeAppointment()] });
    const { getByLabelText, getByText, queryByText } = render(
      <HistoricoCompras />,
    );

    fireEvent.press(getByLabelText('Detalhes de Pintura'));
    expect(getByText('Detalhe: Pintura')).toBeTruthy();
    fireEvent.press(getByText('Fechar detalhe'));
    expect(queryByText('Detalhe: Pintura')).toBeNull();
  });

  it('deve abrir a avaliação de um concluído sem nota e recarregar ao enviar', () => {
    useAppointmentStore.setState({
      appointments: [
        makeAppointment({ id: 1 }),
        makeAppointment({
          id: 2,
          rating: 5,
          Service: { id: 8, title: 'Já avaliado' } as never,
        }),
      ],
    });
    const { getAllByText, getByText, queryByText } = render(
      <HistoricoCompras />,
    );

    expect(getAllByText('Avaliar').length).toBe(1);
    fireEvent.press(getByText('Avaliar'));
    expect(getByText('Avaliar Carlos Pintor')).toBeTruthy();
    fireEvent.press(getByText('Enviar avaliação'));
    expect(mockFetch).toHaveBeenCalledTimes(2);
    fireEvent.press(getByText('Fechar avaliação'));
    expect(queryByText('Avaliar Carlos Pintor')).toBeNull();
  });

  describe('como profissional', () => {
    it('deve mostrar os ganhos, o nome do cliente e não oferecer avaliação', () => {
      useAppointmentStore.setState({ appointments: [makeAppointment()] });
      const { getByText, queryByText } = render(
        <HistoricoCompras role="professional" />,
      );

      expect(mockFetch).toHaveBeenCalledWith('professional');
      expect(getByText('Seus trabalhos e ganhos, mês a mês.')).toBeTruthy();
      expect(getByText('ganho no mês')).toBeTruthy();
      expect(getByText('Maria Cliente')).toBeTruthy();
      expect(queryByText('Avaliar')).toBeNull();
    });
  });

  describe('exportação', () => {
    const rows = [{ servico: 'Pintura', valor: 150 }];

    it('deve avisar quando não há dados para exportar', async () => {
      mockFetchSheet.mockResolvedValue([]);
      const { getByText, findByText } = render(<HistoricoCompras />);

      fireEvent.press(getByText('CSV'));

      expect(
        await findByText('Ainda não há dados para exportar.'),
      ).toBeTruthy();
      expect(mockGenerateCSV).not.toHaveBeenCalled();
    });

    it('deve gerar e compartilhar o CSV', async () => {
      mockFetchSheet.mockResolvedValue(rows);
      mockGenerateCSV.mockResolvedValue('servico,valor');
      mockGenerateFileURI.mockResolvedValue('file://historico.csv');
      mockShare.mockResolvedValue(true);
      const { getByText, findByText } = render(<HistoricoCompras />);

      fireEvent.press(getByText('CSV'));

      expect(await findByText('Arquivo gerado.')).toBeTruthy();
      expect(mockGenerateCSV).toHaveBeenCalledWith([
        ['servico', 'valor'],
        ['Pintura', 150],
      ]);
      expect(mockGenerateFileURI).toHaveBeenCalledWith(
        'servico,valor',
        expect.stringMatching(/^historico_delbicos_.*\.csv$/),
        'text/csv',
      );
      expect(mockShare).toHaveBeenCalledWith('file://historico.csv');
      expect(mockDownload).not.toHaveBeenCalled();
    });

    it('deve gerar o Excel em base64', async () => {
      mockFetchSheet.mockResolvedValue(rows);
      mockGenerateXLSX.mockResolvedValue('UEsDBA==');
      mockGenerateFileURI.mockResolvedValue('file://historico.xlsx');
      mockShare.mockResolvedValue(true);
      const { getByText, findByText } = render(<HistoricoCompras />);

      fireEvent.press(getByText('Excel (.xlsx)'));

      expect(await findByText('Arquivo gerado.')).toBeTruthy();
      expect(mockGenerateXLSX).toHaveBeenCalledWith([
        {
          title: 'Histórico',
          sheetData: [
            ['servico', 'valor'],
            ['Pintura', 150],
          ],
        },
      ]);
      expect(mockGenerateFileURI).toHaveBeenCalledWith(
        'UEsDBA==',
        expect.stringMatching(/\.xlsx$/),
        'application/octet-stream',
        'base64',
      );
    });

    it('deve mostrar erro quando o arquivo não é gerado', async () => {
      mockFetchSheet.mockResolvedValue(rows);
      mockGenerateXLSX.mockResolvedValue(null);
      const { getByText, findByText } = render(<HistoricoCompras />);

      fireEvent.press(getByText('Excel (.xlsx)'));

      expect(
        await findByText('Não foi possível gerar o arquivo. Tente de novo.'),
      ).toBeTruthy();
      expect(mockShare).not.toHaveBeenCalled();
    });

    it('deve mostrar erro quando o CSV vem vazio', async () => {
      mockFetchSheet.mockResolvedValue(rows);
      mockGenerateCSV.mockResolvedValue('');
      const { getByText, findByText } = render(<HistoricoCompras />);

      fireEvent.press(getByText('CSV'));

      expect(
        await findByText('Não foi possível gerar o arquivo. Tente de novo.'),
      ).toBeTruthy();
      expect(mockGenerateFileURI).not.toHaveBeenCalled();
    });

    it('deve baixar o arquivo na web quando não dá para compartilhar', async () => {
      jest.replaceProperty(Platform, 'OS', 'web');
      mockFetchSheet.mockResolvedValue(rows);
      mockGenerateCSV.mockResolvedValue('servico,valor');
      mockGenerateFileURI.mockResolvedValue('blob:historico');
      mockShare.mockResolvedValue(false);
      const { getByText, findByText } = render(<HistoricoCompras />);

      fireEvent.press(getByText('CSV'));

      expect(await findByText('Arquivo gerado.')).toBeTruthy();
      expect(mockDownload).toHaveBeenCalledWith(
        'blob:historico',
        expect.stringMatching(/\.csv$/),
      );
    });

    it('deve mostrar erro quando a busca da planilha falha', async () => {
      mockFetchSheet.mockRejectedValue(new Error('rede'));
      const { getByText, findByText } = render(<HistoricoCompras />);

      fireEvent.press(getByText('CSV'));

      expect(
        await findByText('Não foi possível gerar o arquivo. Tente de novo.'),
      ).toBeTruthy();
      await waitFor(() =>
        expect(
          getByText('CSV').parent?.parent?.props.accessibilityState,
        ).toEqual({ disabled: false, busy: false }),
      );
    });
  });
});
