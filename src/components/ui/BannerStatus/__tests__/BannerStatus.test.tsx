import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BannerStatus from '..';

describe('BannerStatus', () => {
  it('agendado mostra a mensagem e o botao de lembrete', () => {
    const onReminderPress = jest.fn();
    const { getByText } = render(
      <BannerStatus status="Agendado" onReminderPress={onReminderPress} />,
    );
    expect(getByText('Serviço Agendado')).toBeTruthy();
    fireEvent.press(getByText('Criar lembrete'));
    expect(onReminderPress).toHaveBeenCalled();
  });

  it('pendente tambem permite lembrete', () => {
    const { getByText } = render(<BannerStatus status="Pendente" />);
    expect(getByText('Aguardando Confirmação')).toBeTruthy();
    expect(getByText('Criar lembrete')).toBeTruthy();
  });

  it.each([
    ['Executado', 'Serviço Executado'],
    ['Cancelado', 'Serviço Cancelado'],
  ] as const)('%s nao mostra lembrete', (status, message) => {
    const { getByText, queryByText } = render(<BannerStatus status={status} />);
    expect(getByText(message)).toBeTruthy();
    expect(queryByText('Criar lembrete')).toBeNull();
  });

  it('status desconhecido usa o de agendado', () => {
    const { getByText } = render(
      <BannerStatus status={'Outro' as unknown as 'Agendado'} />,
    );
    expect(getByText('Serviço Agendado')).toBeTruthy();
  });
});
