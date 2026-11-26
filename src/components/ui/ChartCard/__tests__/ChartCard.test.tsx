import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import ChartCard from '..';

type TestNode = ReturnType<typeof render>['UNSAFE_root'];

describe('ChartCard', () => {
  it('so desenha o grafico depois de medir a largura', () => {
    const children = jest.fn((w: number) => <Text>{`largura ${w}`}</Text>);
    const { getByText, queryByText, getByLabelText, UNSAFE_root } = render(
      <ChartCard
        title="Receita"
        summary="Subiu 10%"
        legend={[{ color: 'red', label: 'Mes atual' }]}>
        {children}
      </ChartCard>,
    );
    expect(getByText('Receita')).toBeTruthy();
    expect(getByText('Mes atual')).toBeTruthy();
    expect(getByLabelText('Receita. Subiu 10%')).toBeTruthy();
    expect(queryByText(/largura/)).toBeNull();

    const card = UNSAFE_root.findAll(
      (n: TestNode) => typeof n.props.onLayout === 'function',
    )[0];
    fireEvent(card, 'layout', { nativeEvent: { layout: { width: 500.7 } } });
    expect(getByText('largura 460')).toBeTruthy();

    fireEvent(card, 'layout', { nativeEvent: { layout: { width: 100 } } });
    expect(getByText('largura 240')).toBeTruthy();
  });

  it('funciona sem legenda', () => {
    const { queryByText } = render(
      <ChartCard title="Vazio" summary="Nada">
        {() => null}
      </ChartCard>,
    );
    expect(queryByText('Mes atual')).toBeNull();
  });
});
