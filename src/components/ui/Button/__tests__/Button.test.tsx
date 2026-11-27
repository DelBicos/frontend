import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '..';
import { Styled } from '../styled';
import lightScheme from '@theme/light';

const findPressable = (root: { findAll: Function }) =>
  root.findAll(
    (n: { props: Record<string, unknown> }) =>
      typeof n.props.onHoverIn === 'function',
  )[0];

describe('Button', () => {
  it('deve chamar onPress e renderizar os ícones', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button
        onPress={onPress}
        startIcon={<Text>ini</Text>}
        endIcon={<Text>fim</Text>}
        noWrap>
        Entrar
      </Button>,
    );
    fireEvent.press(getByText('Entrar'));
    expect(onPress).toHaveBeenCalled();
    expect(getByText('ini')).toBeTruthy();
    expect(getByText('fim')).toBeTruthy();
  });

  it('deve mostrar carregando e bloquear o toque', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress} loading>
        Entrar
      </Button>,
    );
    expect(getByText('Carregando...')).toBeTruthy();
    fireEvent.press(getByText('Carregando...'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('deve aplicar e remover o hover', () => {
    const { getByText, UNSAFE_root } = render(
      <Button onPress={jest.fn()} variant="outlined" colorVariant="primaryBlue">
        Ok
      </Button>,
    );
    fireEvent(findPressable(UNSAFE_root), 'hoverIn');
    expect(getByText('Ok')).toBeTruthy();
    fireEvent(findPressable(UNSAFE_root), 'hoverOut');
    expect(getByText('Ok')).toBeTruthy();
  });

  it('deve ignorar hover e toque quando desabilitado', () => {
    const onPress = jest.fn();
    const { UNSAFE_root } = render(
      <Button onPress={onPress} disabled>
        Ok
      </Button>,
    );
    const pressable = findPressable(UNSAFE_root);
    fireEvent(pressable, 'hoverIn');
    pressable.props.onPress();
    expect(onPress).not.toHaveBeenCalled();
  });

  describe('Styled.fromVariants', () => {
    const colorVariants = [
      'primary',
      'primaryBlue',
      'secondary',
      'primaryWhite',
      'primaryGreen',
      'modalPrimary',
      'primaryOrange',
    ] as const;

    it.each(colorVariants)('gera estilos contornados para a cor %s', (c) => {
      const s = Styled.fromVariants(
        lightScheme,
        c,
        'large',
        'AfacadBold16',
        'outlined',
        false,
        true,
      );
      expect(s.container.borderWidth).toBe(1.5);
      expect(s.text.flexShrink).toBe(1);
    });

    it('usa os padrões para chaves inválidas e aplica desabilitado', () => {
      const s = Styled.fromVariants(
        lightScheme,
        'x' as 'primary',
        'y' as 'medium',
        'z' as 'AfacadRegular20',
        'contained',
        true,
      );
      expect(s.container.backgroundColor).toBe(
        s.state.disabled.container.backgroundColor,
      );
    });

    it('usa cores padrão quando faltam hover e desabilitado', () => {
      const s = Styled.createButton({
        defaultColors: { backgroundColor: '#111111', color: '#222222' },
        defaultFont: { fontSize: 12, fontFamily: 'Afacad-Regular' },
        defaultSize: {
          borderRadius: 1,
          paddingVertical: 1,
          paddingHorizontal: 1,
        },
      });
      expect(s.state.disabled.container.backgroundColor).toBe('#E0E0E0');
      expect(s.state.disabled.text.color).toBe('#999');
      expect(s.state.hover.text.color).toBe('#222222');
    });
  });
});
