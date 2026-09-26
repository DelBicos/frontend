import { Platform } from 'react-native';
import { StackActions } from '@react-navigation/native';

/** Telas do fluxo de entrar/cadastrar (nao faz sentido voltar para elas). */
export const AUTH_ROUTES = [
  'Login',
  'Register',
  'VerificationScreen',
  'ForgotPassword',
];

interface MinimalNavigation {
  getState: () => { routes: { name: string }[]; index: number } | undefined;
  dispatch: (action: any) => void;
  reset: (state: any) => void;
}

/**
 * Quantas telas de autenticacao estao no topo da pilha, se houver outra
 * tela por baixo para onde voltar; 0 quando nao ha.
 */
export function authScreensOnTop(
  routes: { name: string }[],
  index: number,
): number {
  let count = 0;
  for (let i = index; i >= 0; i--) {
    if (!AUTH_ROUTES.includes(routes[i].name)) {
      return count;
    }
    count += 1;
  }
  return 0;
}

/**
 * Depois de entrar: volta para a tela de onde a pessoa veio (ex.: o
 * checkout). Sem tela anterior, vai para o inicio (no web, o profissional
 * vai para o painel).
 */
export function leaveAuthFlow(
  navigation: MinimalNavigation,
  isProfessional: boolean,
) {
  const state = navigation.getState();
  const toPop = state ? authScreensOnTop(state.routes, state.index) : 0;
  if (toPop > 0) {
    navigation.dispatch(StackActions.pop(toPop));
    return;
  }
  const home =
    Platform.OS === 'web' && isProfessional ? 'ProfessionalTabs' : 'Home';
  navigation.reset({ index: 0, routes: [{ name: home }] });
}
