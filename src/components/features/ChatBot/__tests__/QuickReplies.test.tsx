import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { QuickReplies } from '../QuickReplies';

describe('QuickReplies', () => {
  it('não deve renderizar sem opções', () => {
    const { toJSON } = render(
      <QuickReplies
        quickReplies={[]}
        suggestedTimes={[]}
        onSelect={jest.fn()}
      />,
    );

    expect(toJSON()).toBeNull();
  });

  it('deve enviar a resposta rápida escolhida', () => {
    const onSelect = jest.fn();
    const { getByLabelText, queryByText } = render(
      <QuickReplies
        quickReplies={[
          { label: 'Sim', value: 'sim' },
          { label: 'Não', value: 'nao' },
        ]}
        onSelect={onSelect}
      />,
    );

    expect(queryByText('Horários disponíveis:')).toBeNull();
    fireEvent.press(getByLabelText('Não'));

    expect(onSelect).toHaveBeenCalledWith('nao', 'Não');
  });

  it('deve listar horários sugeridos e enviar o escolhido', () => {
    const onSelect = jest.fn();
    const { getByText, getByLabelText } = render(
      <QuickReplies
        suggestedTimes={[
          { label: 'Sáb, 5 jul às 14:00', value: '2026-07-05|14:00' },
        ]}
        onSelect={onSelect}
      />,
    );

    expect(getByText('Horários disponíveis:')).toBeTruthy();
    fireEvent.press(getByLabelText('Agendar para Sáb, 5 jul às 14:00'));

    expect(onSelect).toHaveBeenCalledWith(
      '2026-07-05|14:00',
      'Sáb, 5 jul às 14:00',
    );
  });

  it('deve bloquear as opções quando desabilitado', () => {
    const onSelect = jest.fn();
    const { getByLabelText } = render(
      <QuickReplies
        quickReplies={[{ label: 'Sim', value: 'sim' }]}
        suggestedTimes={[{ label: '14:00', value: '14:00' }]}
        onSelect={onSelect}
        disabled
      />,
    );

    fireEvent.press(getByLabelText('Sim'));
    fireEvent.press(getByLabelText('Agendar para 14:00'));

    expect(onSelect).not.toHaveBeenCalled();
  });
});
