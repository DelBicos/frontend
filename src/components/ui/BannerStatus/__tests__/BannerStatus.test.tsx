import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BannerStatus from '../BannerStatus';

describe('BannerStatus', () => {
  it.each([
    ['Agendado', 'Serviço Agendado', true],
    ['Pendente', 'Aguardando Confirmação', true],
    ['Executado', 'Serviço Executado', false],
    ['Cancelado', 'Serviço Cancelado', false],
  ] as const)('status %s mostra "%s"', (status, message, hasReminder) => {
    const { getByText, queryByText } = render(<BannerStatus status={status} />);
    expect(getByText(message)).toBeTruthy();
    expect(!!queryByText('Criar lembrete')).toBe(hasReminder);
  });

  it('deve chamar onReminderPress', () => {
    const onReminderPress = jest.fn();
    const { getByText } = render(
      <BannerStatus status="Agendado" onReminderPress={onReminderPress} />,
    );
    fireEvent.press(getByText('Criar lembrete'));
    expect(onReminderPress).toHaveBeenCalled();
  });

  it('deve usar Agendado para status desconhecido', () => {
    const { getByText } = render(
      <BannerStatus status={'Outro' as 'Agendado'} />,
    );
    expect(getByText('Serviço Agendado')).toBeTruthy();
  });
});
