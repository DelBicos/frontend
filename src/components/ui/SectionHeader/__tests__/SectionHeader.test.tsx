import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SectionHeader } from '../SectionHeader';

describe('SectionHeader', () => {
  it('deve exibir título como heading, subtítulo e ação', () => {
    const onPress = jest.fn();
    const { getByRole, getByText } = render(
      <SectionHeader
        title="Populares"
        subtitle="Mais pedidos"
        level={3}
        action={{ label: 'Ver todos', onPress }}
      />,
    );
    expect(getByRole('header').props['aria-level']).toBe(3);
    expect(getByText('Mais pedidos')).toBeTruthy();
    fireEvent.press(getByRole('link'));
    expect(onPress).toHaveBeenCalled();
  });

  it('deve renderizar só o título', () => {
    const { getByRole, queryByRole } = render(
      <SectionHeader title="Categorias" />,
    );
    expect(getByRole('header').props['aria-level']).toBe(2);
    expect(queryByRole('link')).toBeNull();
  });
});
