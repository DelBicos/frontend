import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DeslocamentoActionBar } from '..';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

type Props = React.ComponentProps<typeof DeslocamentoActionBar>;

const renderBar = (props: Partial<Props> = {}) => {
  const handlers = {
    onArrived: jest.fn(),
    onCheckin: jest.fn(),
    onCheckout: jest.fn(),
    onBack: jest.fn(),
  };
  const utils = render(
    <DeslocamentoActionBar
      arrived={false}
      inProgress={false}
      completed={false}
      arrivedLoading={false}
      {...handlers}
      {...props}
    />,
  );
  return { ...utils, ...handlers };
};

describe('DeslocamentoActionBar', () => {
  it('deve oferecer "Cheguei no Local" antes da chegada', () => {
    const { getByText, onArrived, onCheckin } = renderBar();

    fireEvent.press(getByText('Cheguei no Local 🎯'));

    expect(onArrived).toHaveBeenCalledTimes(1);
    expect(onCheckin).not.toHaveBeenCalled();
  });

  it('deve mostrar o carregamento e esconder o texto enquanto registra a chegada', () => {
    const { queryByText, UNSAFE_getByType } = renderBar({
      arrivedLoading: true,
    });

    expect(queryByText('Cheguei no Local 🎯')).toBeNull();
    const { ActivityIndicator } = jest.requireActual('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('deve pedir o código do cliente depois da chegada', () => {
    const { getByText, queryByText, onCheckin } = renderBar({
      arrived: true,
      arrivedLoading: true,
    });

    expect(queryByText('Cheguei no Local 🎯')).toBeNull();
    fireEvent.press(getByText('Digitar Código do Cliente 🔐'));

    expect(onCheckin).toHaveBeenCalledTimes(1);
  });

  it('deve oferecer o check-out com o atendimento em andamento', () => {
    const { getByText, onCheckout } = renderBar({
      arrived: true,
      inProgress: true,
    });

    fireEvent.press(getByText('Finalizar Atendimento (Check-out) 🏁'));

    expect(onCheckout).toHaveBeenCalledTimes(1);
  });

  it('deve voltar ao painel quando o atendimento termina', () => {
    const { getByText, onBack } = renderBar({
      arrived: true,
      inProgress: true,
      completed: true,
    });

    fireEvent.press(getByText('Voltar ao painel'));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
