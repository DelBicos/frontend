import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DeslocamentoInitialCard } from '..';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

type Props = React.ComponentProps<typeof DeslocamentoInitialCard>;

const renderCard = (props: Partial<Props> = {}) => {
  const onCallClient = jest.fn();
  const utils = render(
    <DeslocamentoInitialCard
      clientName="João Lima"
      serviceTitle="Instalação elétrica"
      address="Av. Brasil, 500"
      onCallClient={onCallClient}
      {...props}
    />,
  );
  return { ...utils, onCallClient };
};

describe('DeslocamentoInitialCard', () => {
  it('deve exibir os dados do atendimento com horário padrão', () => {
    const { getByText } = renderCard();

    expect(getByText('Hoje às 14:00')).toBeTruthy();
    expect(getByText('Instalação elétrica')).toBeTruthy();
    expect(getByText('João Lima')).toBeTruthy();
    expect(getByText('Av. Brasil, 500')).toBeTruthy();
  });

  it('deve prefixar o horário com "Hoje às"', () => {
    const { getByText } = renderCard({ startTime: '09:15' });

    expect(getByText('Hoje às 09:15')).toBeTruthy();
  });

  it('deve manter o horário que já menciona hoje', () => {
    const { getByText } = renderCard({ startTime: 'Hoje, 10:00' });

    expect(getByText('Hoje, 10:00')).toBeTruthy();
  });

  it('deve esconder o telefone quando não informado', () => {
    const { queryByText } = renderCard();

    expect(queryByText('(11) 99999-0000')).toBeNull();
  });

  it('deve ligar para o cliente ao tocar no telefone', () => {
    const { getByText, onCallClient } = renderCard({
      clientPhone: '(11) 99999-0000',
    });

    fireEvent.press(getByText('(11) 99999-0000'));

    expect(onCallClient).toHaveBeenCalledTimes(1);
  });
});
