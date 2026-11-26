import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StatCard from '../StatCard';

describe('StatCard', () => {
  it('deve ser um cartão estático acessível', () => {
    const { getByLabelText, getByText, queryByRole } = render(
      <StatCard label="Agendamentos" value="12" hint="Esta semana" />,
    );
    expect(getByLabelText('Agendamentos: 12. Esta semana')).toBeTruthy();
    expect(getByText('Esta semana')).toBeTruthy();
    expect(queryByRole('link')).toBeNull();
  });

  it('deve ser um link quando tocável', () => {
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
