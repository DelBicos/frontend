import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import AccordionItem from '..';

describe('AccordionItem', () => {
  it('abre e fecha ao tocar no titulo', () => {
    const { getByRole, getByText, queryByText } = render(
      <AccordionItem title="Como pagar?">Pix ou cartao</AccordionItem>,
    );
    const header = getByRole('button');
    expect(header.props.accessibilityState).toEqual({ expanded: false });
    expect(queryByText('Pix ou cartao')).toBeNull();

    fireEvent.press(header);
    expect(getByText('Pix ou cartao')).toBeTruthy();

    fireEvent.press(getByRole('button'));
    expect(queryByText('Pix ou cartao')).toBeNull();
  });

  it('comeca aberto e aceita elementos como conteudo', () => {
    const { getByText, getByRole } = render(
      <AccordionItem title="Detalhes" defaultOpen>
        <Text>Elemento</Text>
      </AccordionItem>,
    );
    expect(getByText('Elemento')).toBeTruthy();
    expect(getByRole('button').props.accessibilityState).toEqual({
      expanded: true,
    });
  });
});
