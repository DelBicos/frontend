import React from 'react';
import { Image } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import Avatar from '..';

describe('Avatar', () => {
  it('mostra a foto quando recebe uri', () => {
    const { UNSAFE_getByType, queryByText } = render(
      <Avatar uri="https://foto/1.png" name="Ana Souza" size={50} />,
    );
    const image = UNSAFE_getByType(Image);
    expect(image.props.source).toEqual({ uri: 'https://foto/1.png' });
    expect(queryByText('AS')).toBeNull();
  });

  it('mostra as iniciais quando nao ha foto', () => {
    const { getByText } = render(<Avatar name="Ana Souza" />);
    expect(getByText('AS')).toBeTruthy();
  });

  it('troca a foto pelas iniciais quando a imagem falha', () => {
    const { UNSAFE_getByType, getByText } = render(
      <Avatar uri="https://foto/quebrada.png" name="Bruno Lima" />,
    );
    fireEvent(UNSAFE_getByType(Image), 'error');
    expect(getByText('BL')).toBeTruthy();
  });
});
