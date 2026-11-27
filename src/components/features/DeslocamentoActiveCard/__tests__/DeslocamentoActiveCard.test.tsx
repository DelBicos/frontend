import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DeslocamentoActiveCard } from '..';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

type Props = React.ComponentProps<typeof DeslocamentoActiveCard>;

const renderCard = (props: Partial<Props> = {}) => {
  const onOpenMap = jest.fn();
  const utils = render(
    <DeslocamentoActiveCard
      clientName="Maria Souza"
      serviceTitle="Corte de cabelo"
      address="Rua das Flores, 123"
      inProgress={false}
      arrived={false}
      onOpenMap={onOpenMap}
      {...props}
    />,
  );
  return { ...utils, onOpenMap };
};

describe('DeslocamentoActiveCard', () => {
  it('deve exibir cliente, serviço, endereço e horário padrão', () => {
    const { getByText, getAllByText } = renderCard();

    expect(getByText('Maria Souza')).toBeTruthy();
    expect(getAllByText('Serviço: Corte de cabelo')).toHaveLength(2);
    expect(getByText('Rua das Flores, 123')).toBeTruthy();
    expect(getByText('Horário: Hoje')).toBeTruthy();
  });

  it('deve exibir o horário informado', () => {
    const { getByText } = renderCard({ startTime: '14:30' });

    expect(getByText('Horário: 14:30')).toBeTruthy();
  });

  it('deve abrir o mapa ao tocar no botão', () => {
    const { getByText, onOpenMap } = renderCard();

    fireEvent.press(getByText('Mapa'));

    expect(onOpenMap).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar o aviso de deslocamento antes da chegada', () => {
    const { getByText } = renderCard();

    expect(getByText('Deslocamento em Andamento')).toBeTruthy();
  });

  it('deve mostrar a chegada confirmada', () => {
    const { getByText, queryByText } = renderCard({ arrived: true });

    expect(getByText('Chegada Confirmada 🎯')).toBeTruthy();
    expect(queryByText('Deslocamento em Andamento')).toBeNull();
  });

  it('deve mostrar o serviço em andamento', () => {
    const { getByText } = renderCard({ arrived: true, inProgress: true });

    expect(getByText('Serviço em Andamento ⚡')).toBeTruthy();
  });

  it('deve mostrar o atendimento concluído', () => {
    const { getByText, queryByText } = renderCard({
      arrived: true,
      inProgress: true,
      completed: true,
    });

    expect(getByText('Atendimento Concluído 🎉')).toBeTruthy();
    expect(queryByText('Serviço em Andamento ⚡')).toBeNull();
  });
});
