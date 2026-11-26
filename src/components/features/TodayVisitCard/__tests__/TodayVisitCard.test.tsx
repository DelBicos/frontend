import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TodayVisitCard } from '..';
import type { Appointment } from '@stores/Appointment/types';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
}));

jest.mock('@expo/vector-icons', () => ({ FontAwesome: () => null }));

const NOW = new Date('2026-12-02T08:00:00Z');

const appt = (overrides: Record<string, unknown>) =>
  ({
    id: 1,
    status: 'confirmed',
    start_time: '2026-12-02T14:30:00Z',
    ...overrides,
  }) as unknown as Appointment;

describe('TodayVisitCard', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
    mockNavigate.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('não deve renderizar sem atendimento hoje', () => {
    const { toJSON } = render(
      <TodayVisitCard
        appointments={[appt({ start_time: '2026-12-03T14:30:00Z' })]}
      />,
    );

    expect(toJSON()).toBeNull();
  });

  it('deve convidar a iniciar o deslocamento do atendimento de hoje', () => {
    const { getByText, getByLabelText } = render(
      <TodayVisitCard
        appointments={[
          appt({
            id: 9,
            Service: { title: 'Faxina' },
            Client: { User: { name: 'Maria', phone: '11999990000' } },
          }),
        ]}
      />,
    );

    expect(getByText('Atendimento de hoje')).toBeTruthy();
    expect(getByText('Faxina · Maria · 14:30')).toBeTruthy();
    expect(getByText('Vamos!')).toBeTruthy();

    fireEvent.press(getByLabelText('Iniciar o deslocamento'));

    expect(mockNavigate).toHaveBeenCalledWith('DeslocamentoScreen', {
      appointmentId: 9,
      serviceTitle: 'Faxina',
      clientName: 'Maria',
      clientPhone: '11999990000',
      startTime: 'Hoje às 14:30',
      status: 'confirmed',
    });
  });

  it('deve oferecer retomar o atendimento em andamento com textos padrão', () => {
    const { getByText, getByLabelText } = render(
      <TodayVisitCard appointments={[appt({ id: 3, status: 'arrived' })]} />,
    );

    expect(getByText('Atendimento em andamento')).toBeTruthy();
    expect(getByText('Serviço · Cliente · 14:30')).toBeTruthy();

    fireEvent.press(getByLabelText('Retomar o atendimento'));

    expect(mockNavigate).toHaveBeenCalledWith(
      'DeslocamentoScreen',
      expect.objectContaining({
        appointmentId: 3,
        clientName: 'Cliente',
        status: 'arrived',
      }),
    );
    expect(getByText('Retomar')).toBeTruthy();
  });
});
