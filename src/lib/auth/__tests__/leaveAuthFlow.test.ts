import { authScreensOnTop } from '../leaveAuthFlow';

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
