import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SectionHeader from '..';

describe('SectionHeader', () => {
  it('mostra titulo como heading e subtitulo', () => {
    const { getByRole, getByText, queryByRole } = render(
      <SectionHeader title="Destaques" subtitle="Da semana" level={3} />,
    );
    expect(getByRole('header').props.children).toBe('Destaques');
    expect(getByText('Da semana')).toBeTruthy();
    expect(queryByRole('link')).toBeNull();
  });

  it('mostra a acao e chama onPress', () => {
    const onPress = jest.fn();
    const { getByRole, getByText } = render(
      <SectionHeader title="Categorias" action={{ label: 'Ver todas', onPress }} />,
    );
    expect(getByText('Ver todas')).toBeTruthy();
    fireEvent.press(getByRole('link'));
    expect(onPress).toHaveBeenCalled();
  });
});
