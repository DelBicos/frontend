import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import AccordionItem from '../AccordionItem';

describe('AccordionItem', () => {
  it('deve começar fechado e abrir ao tocar no título', () => {
    const { getByText, queryByText, getByRole } = render(
      <AccordionItem title="Como agendar?">Escolha um serviço.</AccordionItem>,
    );
    expect(queryByText('Escolha um serviço.')).toBeNull();
    expect(getByRole('button').props.accessibilityState).toEqual({
      expanded: false,
    });
    fireEvent.press(getByText('Como agendar?'));
    expect(getByText('Escolha um serviço.')).toBeTruthy();
    expect(getByRole('button').props.accessibilityState).toEqual({
      expanded: true,
    });
  });

  it('deve fechar ao tocar de novo', () => {
    const { getByText, queryByText } = render(
      <AccordionItem title="Pergunta" defaultOpen>
        Resposta
      </AccordionItem>,
    );
    expect(getByText('Resposta')).toBeTruthy();
    fireEvent.press(getByText('Pergunta'));
    expect(queryByText('Resposta')).toBeNull();
  });

  it('deve renderizar filhos que não são texto', () => {
    const { getByTestId } = render(
      <AccordionItem title="Pergunta" defaultOpen>
        <Text testID="custom">Conteúdo</Text>
      </AccordionItem>,
    );
    expect(getByTestId('custom')).toBeTruthy();
  });
});
