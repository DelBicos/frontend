import React from 'react';
import { Image } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import Avatar from '../Avatar';

describe('Avatar', () => {
  it('deve exibir a foto quando há uri', () => {
    const { UNSAFE_getByType } = render(
      <Avatar uri="https://exemplo.com/foto.png" name="Ana Lima" />,
    );
    expect(UNSAFE_getByType(Image).props.source).toEqual({
      uri: 'https://exemplo.com/foto.png',
    });
  });

  it('deve cair para as iniciais quando a foto falha', () => {
    const { UNSAFE_getByType, getByText } = render(
      <Avatar
        uri="https://exemplo.com/quebrada.png"
        name="Ana Lima"
        size={60}
      />,
    );
    fireEvent(UNSAFE_getByType(Image), 'error');
    expect(getByText('AL')).toBeTruthy();
  });

  it('deve exibir as iniciais sem foto', () => {
    const { getByText } = render(<Avatar name="João Souza" />);
    expect(getByText('JS')).toBeTruthy();
  });
});
