import React from 'react';
import { render } from '@testing-library/react-native';
import { FontAwesome } from '@expo/vector-icons';
import Stars from '..';

describe('Stars', () => {
  it('desenha estrelas cheias, meia e vazias conforme a nota', () => {
    const { UNSAFE_getAllByType } = render(<Stars value={3.5} />);
    const names = UNSAFE_getAllByType(FontAwesome).map((i) => i.props.name);
    expect(names).toEqual(['star', 'star', 'star', 'star-half-o', 'star-o']);
  });

  it('aplica tamanho e cor recebidos', () => {
    const { UNSAFE_getAllByType } = render(
      <Stars value={0} size={20} color="red" />,
    );
    const icons = UNSAFE_getAllByType(FontAwesome);
    expect(icons).toHaveLength(5);
    expect(icons[0].props.size).toBe(20);
    expect(icons[0].props.color).toBe('red');
    expect(icons[0].props.name).toBe('star-o');
  });
});
