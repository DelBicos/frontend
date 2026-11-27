import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('deve exibir título, texto e ações', () => {
    const { getByText } = render(
      <EmptyState icon="calendar" title="Nenhum agendamento" text="Agende já.">
        <Text>Buscar serviços</Text>
      </EmptyState>,
    );
    expect(getByText('Nenhum agendamento')).toBeTruthy();
    expect(getByText('Agende já.')).toBeTruthy();
    expect(getByText('Buscar serviços')).toBeTruthy();
  });

  it('deve exibir só o título', () => {
    const { getByText, toJSON } = render(
      <EmptyState icon="calendar" title="Vazio" />,
    );
    expect(getByText('Vazio')).toBeTruthy();
    expect(JSON.stringify(toJSON())).not.toContain('Agende');
  });
});
