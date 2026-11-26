import React from 'react';
import { Linking, Platform } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { useThemeStore, ThemeMode } from '@stores/Theme';
import AboutUsScreen from '../AboutUsScreen';
import { developers } from '../aboutUsData';

let mockWidth = 1280;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWidth, height: 900, scale: 1, fontScale: 1 }),
}));

jest.mock('@expo/vector-icons', () => ({ FontAwesome: () => null }));

const originalOS = Platform.OS;

describe('AboutUsScreen', () => {
  beforeEach(() => {
    mockWidth = 1280;
    useThemeStore.setState({ theme: ThemeMode.LIGHT });
    // O jest-expo ja mocka o Linking: zera as chamadas do teste anterior.
    jest.spyOn(Linking, 'openURL').mockClear().mockResolvedValue(true);
  });

  afterEach(() => {
    Platform.OS = originalOS;
    jest.restoreAllMocks();
  });

  it('mostra a missão, os valores e os desenvolvedores', () => {
    const { getByText, getByLabelText } = render(<AboutUsScreen />);

    expect(getByText('Quem Somos')).toBeTruthy();
    expect(getByText('No que acreditamos')).toBeTruthy();
    expect(getByText('Economia local')).toBeTruthy();
    expect(getByText('Desenvolvedores')).toBeTruthy();
    developers.forEach((dev) => {
      expect(getByText(dev.name)).toBeTruthy();
      expect(getByLabelText(`Foto de ${dev.name}`)).toBeTruthy();
    });
  });

  it('abre o LinkedIn, o GitHub e o portfólio de cada pessoa', () => {
    const { getByLabelText } = render(<AboutUsScreen />);
    const [dev] = developers;

    fireEvent.press(getByLabelText(`LinkedIn de ${dev.name}`));
    fireEvent.press(getByLabelText(`GitHub de ${dev.name}`));
    fireEvent.press(getByLabelText(`Portfólio de ${dev.name}`));

    expect(Linking.openURL).toHaveBeenCalledWith(dev.linkedin);
    expect(Linking.openURL).toHaveBeenCalledWith(dev.github);
    expect(Linking.openURL).toHaveBeenCalledWith(dev.portfolio);
  });

  it('não abre nada quando o link da pessoa não existe', () => {
    const [dev] = developers;
    const saved = { ...dev };
    dev.linkedin = undefined;
    dev.github = undefined;
    dev.portfolio = undefined;
    try {
      const { getByLabelText } = render(<AboutUsScreen />);
      const button = getByLabelText(`LinkedIn de ${dev.name}`);
      expect(button.props.accessibilityState).toEqual(
        expect.objectContaining({ disabled: true }),
      );
      fireEvent.press(button);
      expect(Linking.openURL).not.toHaveBeenCalled();
    } finally {
      Object.assign(dev, saved);
    }
  });

  it.each([
    ['celular', 375, ThemeMode.LIGHT, 'ios'],
    ['computador no tema escuro', 1280, ThemeMode.DARK, 'web'],
    ['alto contraste', 1280, ThemeMode.LIGHT_HI_CONTRAST, 'android'],
    ['celular no tema escuro', 375, ThemeMode.DARK, 'android'],
  ] as const)('monta a tela no %s', (_label, width, theme, os) => {
    mockWidth = width;
    Platform.OS = os;
    useThemeStore.setState({ theme });

    const { getByText } = render(<AboutUsScreen />);

    expect(getByText('Quem Somos')).toBeTruthy();
    expect(
      getByText(new RegExp(`© DelBicos - ${new Date().getFullYear()}`)),
    ).toBeTruthy();
  });
});
