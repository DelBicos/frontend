import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HighlightCard } from '../HighlightCard';

const item = {
  id: '1',
  title: 'Eletricistas',
  description: 'Os melhores da região',
  image: 'https://exemplo.com/img.png',
};

describe('HighlightCard', () => {
  it('deve ser um link com posição e chamada para ação', () => {
    const link = jest.fn();
    const { getByRole, getByText } = render(
      <HighlightCard
        item={{ ...item, link, ctaLabel: 'Ver profissionais' }}
        width={300}
        height={200}
        size="large"
        position={{ index: 0, total: 3 }}
        insetX={24}
      />,
    );
    const card = getByRole('link');
    expect(card.props.accessibilityLabel).toBe(
      'Destaque 1 de 3. Eletricistas. Os melhores da região',
    );
    expect(getByText('Ver profissionais')).toBeTruthy();
    fireEvent.press(card);
    expect(link).toHaveBeenCalled();
  });

  it('deve renderizar sem link nem posição', () => {
    const { getByLabelText, queryByRole } = render(
      <HighlightCard item={item} width={300} height={200} />,
    );
    expect(getByLabelText('Eletricistas. Os melhores da região')).toBeTruthy();
    expect(queryByRole('link')).toBeNull();
  });
});
