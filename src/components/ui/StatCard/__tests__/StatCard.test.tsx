import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StatCard from '..';

describe('StatCard', () => {
  it('mostra rotulo, valor e dica com rotulo acessivel', () => {
    const { getByText, getByLabelText } = render(
      <StatCard label="Pedidos" value="12" hint="hoje" />,
    );
    expect(getByText('Pedidos')).toBeTruthy();
    expect(getByText('12')).toBeTruthy();
    expect(getByText('hoje')).toBeTruthy();
    expect(getByLabelText('Pedidos: 12. hoje')).toBeTruthy();
  });

  it('vira link quando recebe onPress', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <StatCard label="Fila" value="3" attention onPress={onPress} />,
    );
    const link = getByRole('link');
    expect(link.props.accessibilityLabel).toBe('Fila: 3. ');
    fireEvent.press(link);
    expect(onPress).toHaveBeenCalled();
  });
});
