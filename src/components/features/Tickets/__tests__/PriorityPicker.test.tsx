import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PriorityPicker } from '../PriorityPicker';
import { TICKET_PRIORITY_HINTS } from '@stores/Ticket';

describe('PriorityPicker', () => {
  it('deve renderizar as 4 prioridades em ordem de urgência', () => {
    const { getAllByRole } = render(
      <PriorityPicker value={null} onChange={jest.fn()} />,
    );

    const labels = getAllByRole('button').map(
      (button) => button.props.accessibilityLabel,
    );
    expect(labels).toEqual([
      'Prioridade Baixa',
      'Prioridade Média',
      'Prioridade Alta',
      'Prioridade Crítica',
    ]);
  });

  it('deve chamar onChange com o valor da prioridade tocada', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <PriorityPicker value={null} onChange={onChange} />,
    );

    fireEvent.press(getByText('Crítica'));
    expect(onChange).toHaveBeenCalledWith('CRITICA');
  });

  it('deve marcar a selecionada e mostrar o texto de apoio dela', () => {
    const { getByTestId, getByText, queryByText } = render(
      <PriorityPicker value="ALTA" onChange={jest.fn()} />,
    );

    expect(
      getByTestId('ticket-priority-ALTA').props.accessibilityState?.selected,
    ).toBe(true);
    expect(
      getByTestId('ticket-priority-BAIXA').props.accessibilityState?.selected,
    ).toBe(false);
    expect(getByText(TICKET_PRIORITY_HINTS.ALTA)).toBeTruthy();
    expect(queryByText(TICKET_PRIORITY_HINTS.BAIXA)).toBeNull();
  });

  it('deve exibir a mensagem de erro', () => {
    const { getByText } = render(
      <PriorityPicker
        value={null}
        onChange={jest.fn()}
        error="Selecione uma prioridade."
      />,
    );

    expect(getByText('Selecione uma prioridade.')).toBeTruthy();
  });
});
