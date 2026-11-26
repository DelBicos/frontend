import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import EmptyState from '..';

describe('EmptyState', () => {
  it('mostra titulo, texto e acoes', () => {
    const { getByText } = render(
      <EmptyState icon="inbox" title="Nada aqui" text="Tente outra busca">
        <Text>Recarregar</Text>
      </EmptyState>,
    );
    expect(getByText('Nada aqui')).toBeTruthy();
    expect(getByText('Tente outra busca')).toBeTruthy();
    expect(getByText('Recarregar')).toBeTruthy();
  });

  it('mostra so o titulo quando nao ha texto nem acoes', () => {
    const { getByText, toJSON } = render(
      <EmptyState icon="inbox" title="Vazio" />,
    );
    expect(getByText('Vazio')).toBeTruthy();
    expect(JSON.stringify(toJSON())).not.toContain('Tente');
  });
});
