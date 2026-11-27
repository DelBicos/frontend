import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

import ChartCard from '../ChartCard';

type Node = ReturnType<typeof render>['UNSAFE_root'];

describe('ChartCard', () => {
  it('deve renderizar o gráfico só depois de medir a largura', () => {
    const chart = jest.fn((width: number) => <Text>largura {width}</Text>);
    const { getByText, queryByText, getByLabelText, UNSAFE_root } = render(
      <ChartCard title="Ganhos" summary="Subiu 10%">
        {chart}
      </ChartCard>,
    );
    expect(queryByText(/largura/)).toBeNull();
    expect(getByLabelText('Ganhos. Subiu 10%')).toBeTruthy();

    const card = UNSAFE_root.findAll(
      (n: Node) => typeof n.props.onLayout === 'function',
    )[0];
    fireEvent(card, 'layout', { nativeEvent: { layout: { width: 600.7 } } });
    expect(getByText('largura 560')).toBeTruthy();

    fireEvent(card, 'layout', { nativeEvent: { layout: { width: 100 } } });
    expect(getByText('largura 240')).toBeTruthy();
  });

  it('deve exibir a legenda', () => {
    const { getByText } = render(
      <ChartCard
        title="Serviços"
        summary="Resumo"
        legend={[
          { color: 'red', label: 'Concluídos' },
          { color: 'blue', label: 'Cancelados' },
        ]}>
        {() => null}
      </ChartCard>,
    );
    expect(getByText('Concluídos')).toBeTruthy();
    expect(getByText('Cancelados')).toBeTruthy();
  });
});
