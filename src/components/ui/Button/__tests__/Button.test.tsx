import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '..';
import { Styled } from '../styled';
import lightScheme from '@theme/light';

type TestNode = ReturnType<typeof render>['UNSAFE_root'];

describe('Button', () => {
  it('mostra o texto e chama onPress', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Salvar</Button>);
    fireEvent.press(getByText('Salvar'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('nao chama onPress quando desabilitado', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress} disabled>
        Salvar
      </Button>,
    );
    fireEvent.press(getByText('Salvar'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('mostra carregando no lugar do texto', () => {
    const onPress = jest.fn();
    const { getByText, queryByText } = render(
      <Button onPress={onPress} loading>
        Salvar
      </Button>,
    );
    expect(getByText('Carregando...')).toBeTruthy();
    expect(queryByText('Salvar')).toBeNull();
  });

  it('mostra icones de inicio e fim', () => {
    const { getByText } = render(
      <Button
        onPress={jest.fn()}
        startIcon={<Text>ini</Text>}
        endIcon={<Text>fim</Text>}
        noWrap
        variant="outlined"
        colorVariant="secondary"
        sizeVariant="large"
        fontVariant="AfacadBold16">
        Ok
      </Button>,
    );
    expect(getByText('ini')).toBeTruthy();
    expect(getByText('fim')).toBeTruthy();
    expect(getByText('Ok').props.numberOfLines).toBe(1);
  });

  it('muda o estilo no hover e volta ao sair', () => {
    const { getByText, UNSAFE_root } = render(
      <Button onPress={jest.fn()}>Hover</Button>,
    );
    const pressable = UNSAFE_root.findAll(
      (n: TestNode) => typeof n.props.onHoverIn === 'function',
    )[0];
    const before = getByText('Hover').props.style;
    fireEvent(pressable, 'hoverIn');
    expect(getByText('Hover').props.style).not.toEqual(before);
    fireEvent(pressable, 'hoverOut');
    expect(getByText('Hover').props.style).toEqual(before);
  });

  it('ignora o hover quando desabilitado', () => {
    const { getByText, UNSAFE_root } = render(
      <Button onPress={jest.fn()} disabled>
        Hover
      </Button>,
    );
    const pressable = UNSAFE_root.findAll(
      (n: TestNode) => typeof n.props.onHoverIn === 'function',
    )[0];
    const before = getByText('Hover').props.style;
    fireEvent(pressable, 'hoverIn');
    expect(getByText('Hover').props.style).toEqual(before);
  });
});

describe('Styled.fromVariants', () => {
  it('usa variantes padrao quando a chave nao existe', () => {
    const styles = Styled.fromVariants(
      lightScheme,
      'inexistente' as unknown as 'primary',
      'inexistente' as unknown as 'medium',
      'inexistente' as unknown as 'AfacadRegular20',
    );
    expect(styles.container.backgroundColor).toBe(lightScheme.primaryBlue);
    expect(styles.text.fontSize).toBe(20);
  });

  it('aplica as cores de desabilitado', () => {
    const styles = Styled.fromVariants(
      lightScheme,
      'primary',
      'medium',
      'AfacadRegular20',
      'contained',
      true,
    );
    expect(styles.container.backgroundColor).toBe(lightScheme.inputBackground);
    expect(styles.text.color).toBe(lightScheme.textTertiary);
  });

  it('usa cores padrao quando faltam hover e disabled', () => {
    const styles = Styled.createButton({
      defaultColors: { backgroundColor: '#111', color: '#fff' },
      defaultSize: { borderRadius: 1, paddingVertical: 1, paddingHorizontal: 1 },
      defaultFont: { fontSize: 10, fontFamily: 'x' },
      variant: 'outlined',
    });
    expect(styles.container.backgroundColor).toBe('transparent');
    expect(styles.container.borderColor).toBe('#111');
    expect(styles.state.hover.text.color).toBe('#111');
    expect(styles.state.disabled.container.backgroundColor).toBe('#E0E0E0');
    expect(styles.state.disabled.text.color).toBe('#999');
  });

  it('troca a cor da borda no hover do contorno', () => {
    const styles = Styled.fromVariants(
      lightScheme,
      'secondary',
      'medium',
      'AfacadRegular20',
      'outlined',
    );
    expect(styles.state.hover.container.borderColor).toBe(lightScheme.primaryWhite);
  });
});
