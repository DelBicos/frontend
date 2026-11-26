import React from 'react';
import { Platform, ScrollView, Text } from 'react-native';
import { render, renderHook } from '@testing-library/react-native';
import PageContainer, { PageHeader, useWebScrollGutter } from '..';

let mockWidth = 400;
jest.mock('@lib/hooks/useBreakpoint', () => {
  const actual = jest.requireActual('@lib/hooks/useBreakpoint');
  return {
    ...actual,
    useBreakpoint: () => actual.getBreakpointInfo(mockWidth),
  };
});

describe('PageContainer', () => {
  const originalOS = Platform.OS;
  afterEach(() => {
    Platform.OS = originalOS;
    mockWidth = 400;
  });

  it('renderiza o conteudo com margens de celular', () => {
    const { getByText, UNSAFE_getByType } = render(
      <PageContainer maxWidth={600}>
        <Text>conteudo</Text>
      </PageContainer>,
    );
    expect(getByText('conteudo')).toBeTruthy();
    expect(UNSAFE_getByType(ScrollView).props.contentContainerStyle).toEqual({
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 32,
    });
  });

  it('usa margens maiores no desktop', () => {
    mockWidth = 1400;
    const { UNSAFE_getByType } = render(
      <PageContainer>
        <Text>x</Text>
      </PageContainer>,
    );
    expect(UNSAFE_getByType(ScrollView).props.contentContainerStyle).toEqual({
      paddingHorizontal: 32,
      paddingTop: 32,
      paddingBottom: 64,
    });
  });
});

describe('useWebScrollGutter', () => {
  const originalOS = Platform.OS;
  afterEach(() => {
    Platform.OS = originalOS;
    mockWidth = 400;
  });

  it('nao reserva espaco no app', () => {
    mockWidth = 1600;
    const { result } = renderHook(() => useWebScrollGutter());
    expect(result.current).toBeNull();
  });

  it('nao reserva espaco no web em janela estreita', () => {
    Platform.OS = 'web';
    mockWidth = 1000;
    const { result } = renderHook(() => useWebScrollGutter());
    expect(result.current).toBeNull();
  });

  it('reserva o espaco da barra no web em janela larga', () => {
    Platform.OS = 'web';
    mockWidth = 1600;
    const { result } = renderHook(() => useWebScrollGutter());
    expect(result.current).toEqual({ scrollbarGutter: 'stable both-edges' });
  });
});

describe('PageHeader', () => {
  it('mostra rotulo, titulo, subtitulo e conteudo extra', () => {
    const { getByText, getByRole } = render(
      <PageHeader title="Ajuda" subtitle="Tire suas duvidas" eyebrow="Suporte" align="center">
        <Text>busca</Text>
      </PageHeader>,
    );
    expect(getByRole('header').props.children).toBe('Ajuda');
    expect(getByText('Suporte')).toBeTruthy();
    expect(getByText('Tire suas duvidas')).toBeTruthy();
    expect(getByText('busca')).toBeTruthy();
  });

  it('mostra so o titulo quando nao ha extras', () => {
    mockWidth = 1400;
    const { getByRole, queryByText } = render(<PageHeader title="Sobre" />);
    expect(getByRole('header')).toBeTruthy();
    expect(queryByText('Suporte')).toBeNull();
  });
});
