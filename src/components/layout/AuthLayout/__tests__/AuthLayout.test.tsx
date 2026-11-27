import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { useThemeStore, ThemeMode } from '@stores/Theme';
import lightScheme from '@theme/light';
import AuthLayout, { AuthAlert, createAuthStyles } from '..';

let mockWidth = 400;
jest.mock('@lib/hooks/useBreakpoint', () => {
  const actual = jest.requireActual('@lib/hooks/useBreakpoint');
  return {
    ...actual,
    useBreakpoint: () => actual.getBreakpointInfo(mockWidth),
  };
});

const mockGoBack = jest.fn();
const mockReset = jest.fn();
let mockCanGoBack = true;
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: mockGoBack,
    reset: mockReset,
    canGoBack: () => mockCanGoBack,
  }),
  useRoute: () => ({ params: {} }),
}));

describe('AuthLayout', () => {
  beforeEach(() => {
    mockWidth = 400;
    mockCanGoBack = true;
    mockGoBack.mockClear();
    mockReset.mockClear();
    useThemeStore.setState({ theme: ThemeMode.LIGHT });
  });

  it('no celular mostra logo, titulo, subtitulo e formulario', () => {
    const { getByText, getByRole, getAllByLabelText, queryByText } = render(
      <AuthLayout title="Entrar" subtitle="Bem-vindo">
        <Text>form</Text>
      </AuthLayout>,
    );
    expect(getByRole('header').props.children).toBe('Entrar');
    expect(getByText('Bem-vindo')).toBeTruthy();
    expect(getByText('form')).toBeTruthy();
    expect(getAllByLabelText('DelBicos')).toHaveLength(1);
    expect(queryByText('Serviços de confiança, perto de você.')).toBeNull();
  });

  it('volta para a tela anterior quando possivel', () => {
    const { getByLabelText } = render(
      <AuthLayout title="Entrar">
        <Text>form</Text>
      </AuthLayout>,
    );
    fireEvent.press(getByLabelText('Voltar'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('vai para o inicio quando nao ha tela anterior', () => {
    mockCanGoBack = false;
    useThemeStore.setState({ theme: ThemeMode.DARK });
    const { getByLabelText } = render(
      <AuthLayout title="Entrar">
        <Text>form</Text>
      </AuthLayout>,
    );
    fireEvent.press(getByLabelText('Voltar'));
    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  });

  it('no desktop mostra o painel da marca e usa onBack', () => {
    mockWidth = 1400;
    const onBack = jest.fn();
    const { getByText, getByLabelText } = render(
      <AuthLayout title="Cadastro" onBack={onBack} maxWidth={600}>
        <Text>form</Text>
      </AuthLayout>,
    );
    expect(getByText('Serviços de confiança, perto de você.')).toBeTruthy();
    expect(getByText('Encontre profissionais perto de você')).toBeTruthy();
    fireEvent.press(getByLabelText('Voltar'));
    expect(onBack).toHaveBeenCalled();
    expect(mockGoBack).not.toHaveBeenCalled();
  });

  it('exporta o alerta e os estilos comuns', () => {
    const { getByText } = render(<AuthAlert>Erro ao entrar</AuthAlert>);
    expect(getByText('Erro ao entrar')).toBeTruthy();
    expect(createAuthStyles(lightScheme).primaryButton.minHeight).toBe(52);
  });
});
