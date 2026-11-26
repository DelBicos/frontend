import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HighlightCard } from '..';

const item = {
  id: '1',
  title: 'Pintores',
  description: 'Os melhores da cidade',
  image: 'https://img/1.png',
};

describe('HighlightCard', () => {
  it('vira link com chamada para acao e posicao', () => {
    const link = jest.fn();
    const { getByRole, getByText } = render(
      <HighlightCard
        item={{ ...item, link, ctaLabel: 'Ver profissionais' }}
        width={300}
        height={200}
        size="large"
        position={{ index: 0, total: 3 }}
        insetX={40}
      />,
    );
    const card = getByRole('link');
    expect(card.props.accessibilityLabel).toBe(
      'Destaque 1 de 3. Pintores. Os melhores da cidade',
    );
    expect(getByText('Ver profissionais')).toBeTruthy();
    fireEvent.press(card);
    expect(link).toHaveBeenCalled();
  });

  it('sem link nao e tocavel nem mostra chamada', () => {
    const { queryByRole, getByLabelText, queryByText } = render(
      <HighlightCard item={item} width={300} height={200} />,
    );
    expect(queryByRole('link')).toBeNull();
    expect(getByLabelText('Pintores. Os melhores da cidade')).toBeTruthy();
    expect(queryByText('Ver profissionais')).toBeNull();
  });
});
