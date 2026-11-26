import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { AppointmentManagePanel } from '../AppointmentManagePanel';
import { useAppointmentStore } from '@stores/Appointment';
import {
  Appointment,
  AppointmentStatus,
  Dispute,
} from '@stores/Appointment/types';
import { AgendaRole } from '@lib/appointments';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));

const mockConfirm = jest.fn();
jest.mock('@lib/utils/confirmAction', () => ({
  confirmAction: (...args: unknown[]) => mockConfirm(...args),
}));

const HOUR = 60 * 60 * 1000;
const fromNow = (hours: number) =>
  new Date(Date.now() + hours * HOUR).toISOString();

const buildAppointment = (overrides: Partial<Appointment> = {}): Appointment =>
  ({
    id: 10,
    status: AppointmentStatus.CONFIRMED,
    start_time: fromNow(48),
    end_time: fromNow(49),
    payment_intent_id: null,
    Service: { title: 'Limpeza residencial', price: '150.00' },
    ...overrides,
  }) as unknown as Appointment;

const buildDispute = (overrides: Partial<Dispute> = {}): Dispute => ({
  id: 1,
  appointment_id: 10,
  reason: 'poor_quality',
  description: 'Ficou sujo',
  status: 'open',
  createdAt: '2026-11-20T10:00:00.000Z',
  ...overrides,
});

const renderPanel = (appointment: Appointment, role: AgendaRole = 'client') => {
  const onChanged = jest.fn();
  const utils = render(
    <AppointmentManagePanel
      appointment={appointment}
      role={role}
      onChanged={onChanged}
    />,
  );
  return { ...utils, onChanged };
};

describe('AppointmentManagePanel', () => {
  let getDispute: jest.Mock;
  let markNoShow: jest.Mock;
  let respondToReschedule: jest.Mock;

  beforeEach(() => {
    getDispute = jest.fn(() => Promise.resolve(null));
    markNoShow = jest.fn(() => Promise.resolve());
    respondToReschedule = jest.fn(() => Promise.resolve());
    mockConfirm.mockReset();
    useAppointmentStore.setState({
      getDispute,
      markNoShow,
      respondToReschedule,
      previewCancellation: jest.fn(() => new Promise(() => {})),
      cancelAppointment: jest.fn(),
      getRescheduleSlots: jest.fn(() => Promise.resolve([])),
      requestReschedule: jest.fn(),
      openDispute: jest.fn(() => Promise.resolve()),
    });
  });

  it('deve oferecer reagendar e cancelar com antecedência', () => {
    const { getByText, queryByText } = renderPanel(buildAppointment());

    expect(getByText('Reagendar')).toBeTruthy();
    expect(getByText('Cancelar agendamento')).toBeTruthy();
    expect(queryByText('Abrir disputa')).toBeNull();
    expect(getDispute).not.toHaveBeenCalled();
  });

  it('deve abrir as folhas de reagendar e cancelar', () => {
    const { getByText, getAllByText } = renderPanel(buildAppointment());

    fireEvent.press(getByText('Reagendar'));
    expect(getByText('Pedir reagendamento')).toBeTruthy();
    fireEvent.press(getAllByText('Voltar')[0]);

    fireEvent.press(getByText('Cancelar agendamento'));
    expect(getAllByText('Cancelar agendamento').length).toBeGreaterThan(1);
  });

  it('não deve mostrar ações em atendimentos encerrados sem pagamento', () => {
    const { queryByRole } = renderPanel(
      buildAppointment({ status: AppointmentStatus.COMPLETED }),
    );

    expect(queryByRole('button')).toBeNull();
  });

  it('deve explicar quem cancelou, o motivo e os valores', () => {
    const { getByText } = renderPanel(
      buildAppointment({
        status: AppointmentStatus.CANCELED,
        canceled_by: 'professional',
        cancellation_reason: 'Imprevisto',
        retained_cents: 3000,
        refunded_cents: 12000,
      }),
    );

    expect(
      getByText(
        /^Cancelado pelo profissional\. Motivo: Imprevisto\. Retido: R\$\s?30,00 · Devolvido: R\$\s?120,00\.$/,
      ),
    ).toBeTruthy();
  });

  it('deve explicar o cancelamento automático sem valores', () => {
    const { getByText } = renderPanel(
      buildAppointment({
        status: AppointmentStatus.CANCELED,
        canceled_by: 'system',
      }),
    );

    expect(
      getByText(
        'Cancelado automaticamente (sem resposta do profissional).',
      ),
    ).toBeTruthy();
  });

  it('deve mostrar o valor retido no não comparecimento', () => {
    const { getByText } = renderPanel(
      buildAppointment({
        status: AppointmentStatus.NO_SHOW,
        start_time: fromNow(-30 * 24),
        end_time: fromNow(-30 * 24 + 1),
      }),
    );

    expect(
      getByText(/^Não comparecimento registrado\. Valor retido: R\$\s?0,00\.$/),
    ).toBeTruthy();
  });

  it('deve registrar o não comparecimento após a confirmação', async () => {
    mockConfirm.mockResolvedValue(true);
    const { getByText, findByText, onChanged } = renderPanel(
      buildAppointment({ start_time: fromNow(-1), end_time: fromNow(0) }),
      'professional',
    );

    await act(async () => {
      fireEvent.press(getByText('Cliente não compareceu'));
    });

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Cliente não compareceu?' }),
    );
    expect(markNoShow).toHaveBeenCalledWith(10);
    expect(await findByText('Não comparecimento registrado.')).toBeTruthy();
    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it('não deve registrar o não comparecimento sem confirmação', async () => {
    mockConfirm.mockResolvedValue(false);
    const { getByText } = renderPanel(
      buildAppointment({ start_time: fromNow(-1), end_time: fromNow(0) }),
      'professional',
    );

    await act(async () => {
      fireEvent.press(getByText('Cliente não compareceu'));
    });

    expect(markNoShow).not.toHaveBeenCalled();
  });

  it('deve mostrar o erro quando a ação falha', async () => {
    mockConfirm.mockResolvedValue(true);
    markNoShow.mockRejectedValue(new Error('falhou'));
    const { getByText, findByText, onChanged } = renderPanel(
      buildAppointment({ start_time: fromNow(-1), end_time: fromNow(0) }),
      'professional',
    );

    await act(async () => {
      fireEvent.press(getByText('Cliente não compareceu'));
    });

    expect(await findByText('Não foi possível concluir a ação.')).toBeTruthy();
    expect(onChanged).not.toHaveBeenCalled();
  });

  it('deve permitir aceitar o reagendamento pedido pela outra parte', async () => {
    const { getByText, findByText } = renderPanel(
      buildAppointment({
        reschedule_requested_start: fromNow(72),
        reschedule_requested_by: 'professional',
      }),
    );

    expect(getByText(/^O profissional pediu para mudar para /)).toBeTruthy();
    await act(async () => {
      fireEvent.press(getByText('Aceitar novo horário'));
    });

    expect(respondToReschedule).toHaveBeenCalledWith(10, true);
    expect(await findByText('Horário atualizado.')).toBeTruthy();
  });

  it('deve permitir recusar o reagendamento pedido pelo cliente', async () => {
    const { getByText, findByText, queryByText } = renderPanel(
      buildAppointment({
        reschedule_requested_start: fromNow(72),
        reschedule_requested_by: 'client',
      }),
      'professional',
    );

    expect(getByText(/^O cliente pediu para mudar para /)).toBeTruthy();
    expect(queryByText('Reagendar')).toBeNull();
    await act(async () => {
      fireEvent.press(getByText('Recusar'));
    });

    expect(respondToReschedule).toHaveBeenCalledWith(10, false);
    expect(await findByText('Pedido recusado.')).toBeTruthy();
  });

  it('deve mostrar que o próprio pedido de reagendamento aguarda resposta', () => {
    const { getByText, queryByText } = renderPanel(
      buildAppointment({
        reschedule_requested_start: fromNow(72),
        reschedule_requested_by: 'client',
      }),
    );

    expect(getByText(/Aguardando resposta\.$/)).toBeTruthy();
    expect(queryByText('Aceitar novo horário')).toBeNull();
  });

  it('deve oferecer abrir disputa e mostrar o andamento depois de enviada', async () => {
    getDispute
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(buildDispute());
    const { getByText, getByLabelText, findByText, queryByText } = renderPanel(
      buildAppointment({
        status: AppointmentStatus.COMPLETED,
        payment_intent_id: 'pi_1',
        start_time: fromNow(-2),
        end_time: fromNow(-1),
        completed_at: fromNow(-1),
      }),
    );
    await act(async () => {});

    fireEvent.press(getByText('Abrir disputa'));
    fireEvent.changeText(
      getByLabelText('Descrição da disputa'),
      'O serviço ficou incompleto',
    );
    await act(async () => {
      fireEvent.press(getByText('Enviar disputa'));
    });

    expect(
      await findByText('Disputa: Serviço com problemas'),
    ).toBeTruthy();
    expect(getByText('Em análise pela equipe DelBicos.')).toBeTruthy();
    expect(queryByText('Abrir disputa')).toBeNull();
  });

  it('deve mostrar a resolução da disputa com o reembolso e a nota', async () => {
    getDispute.mockResolvedValue(
      buildDispute({
        status: 'resolved',
        resolution: 'refund_partial',
        refund_cents: 5000,
        resolution_note: 'Acordo entre as partes.',
      }),
    );
    const { findByText } = renderPanel(
      buildAppointment({
        status: AppointmentStatus.COMPLETED,
        payment_intent_id: 'pi_1',
        start_time: fromNow(-2),
      }),
    );

    expect(
      await findByText(
        /^Reembolso parcial aprovado \(R\$\s?50,00\)\. Acordo entre as partes\.$/,
      ),
    ).toBeTruthy();
  });

  it('deve mostrar "Resolvida" para resolução desconhecida', async () => {
    getDispute.mockResolvedValue(
      buildDispute({ status: 'resolved', resolution: null }),
    );
    const { findByText } = renderPanel(
      buildAppointment({
        status: AppointmentStatus.COMPLETED,
        payment_intent_id: 'pi_1',
        start_time: fromNow(-2),
      }),
    );

    expect(await findByText('Resolvida.')).toBeTruthy();
  });

  it('deve ignorar falha ao consultar a disputa', async () => {
    getDispute.mockRejectedValue(new Error('falhou'));
    const { findByText } = renderPanel(
      buildAppointment({
        status: AppointmentStatus.COMPLETED,
        payment_intent_id: 'pi_1',
        start_time: fromNow(-2),
      }),
    );

    expect(await findByText('Abrir disputa')).toBeTruthy();
  });
});
