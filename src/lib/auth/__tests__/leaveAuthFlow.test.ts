import { Platform } from 'react-native';
import { StackActions } from '@react-navigation/native';
import { authScreensOnTop, leaveAuthFlow } from '../leaveAuthFlow';

const r = (...names: string[]) => names.map((name) => ({ name }));

describe('authScreensOnTop', () => {
  it('volta para a tela anterior ao fluxo de login', () => {
    expect(authScreensOnTop(r('Home', 'Checkout', 'Login'), 2)).toBe(1);
    expect(
      authScreensOnTop(
        r('Home', 'Checkout', 'Login', 'Register', 'VerificationScreen'),
        4,
      ),
    ).toBe(3);
  });

  it('sem tela anterior, nao ha para onde voltar', () => {
    expect(authScreensOnTop(r('Login'), 0)).toBe(0);
    expect(authScreensOnTop(r('Login', 'ForgotPassword'), 1)).toBe(0);
  });
});

describe('leaveAuthFlow', () => {
  const previousOS = Platform.OS;
  const setOS = (os: string) =>
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => os,
    });

  const navigation = (
    state: { routes: { name: string }[]; index: number } | undefined,
  ) => ({
    getState: jest.fn(() => state),
    dispatch: jest.fn(),
    reset: jest.fn(),
  });

  afterEach(() => setOS(previousOS));

  it('volta as telas de login quando ha tela anterior', () => {
    const nav = navigation({
      routes: r('Home', 'Checkout', 'Login'),
      index: 2,
    });
    leaveAuthFlow(nav, false);
    expect(nav.dispatch).toHaveBeenCalledWith(StackActions.pop(1));
    expect(nav.reset).not.toHaveBeenCalled();
  });

  it('sem tela anterior vai para o inicio', () => {
    setOS('ios');
    const nav = navigation({ routes: r('Login'), index: 0 });
    leaveAuthFlow(nav, true);
    expect(nav.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  });

  it('sem estado de navegacao tambem vai para o inicio', () => {
    setOS('web');
    const nav = navigation(undefined);
    leaveAuthFlow(nav, false);
    expect(nav.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  });

  it('no web o profissional vai para o painel', () => {
    setOS('web');
    const nav = navigation({ routes: r('Login'), index: 0 });
    leaveAuthFlow(nav, true);
    expect(nav.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'ProfessionalTabs' }],
    });
  });
});
