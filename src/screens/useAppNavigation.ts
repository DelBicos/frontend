import { useNavigation } from '@react-navigation/native';
import type { NavigationParams } from './types';

/**
 * Navegacao usada pelas telas. As rotas e os parametros formam um grafo
 * grande (pilha + abas aninhadas), entao a tipagem estrita do React
 * Navigation nao ajuda aqui: o que se garante e o nome da rota.
 */
export interface AppNavigation {
  navigate: (
    screen: keyof NavigationParams | (string & {}),
    params?: object,
  ) => void;
  push: (
    screen: keyof NavigationParams | (string & {}),
    params?: object,
  ) => void;
  replace: (
    screen: keyof NavigationParams | (string & {}),
    params?: object,
  ) => void;
  goBack: () => void;
  canGoBack: () => boolean;
  setParams: (params: object) => void;
  reset: (state: object) => void;
  dispatch: (action: object) => void;
  getState: () => { routes: { name: string }[]; index: number } | undefined;
  getParent: () => AppNavigation | undefined;
  addListener: (event: string, callback: () => void) => () => void;
  setOptions: (options: object) => void;
}

export function useAppNavigation(): AppNavigation {
  return useNavigation() as unknown as AppNavigation;
}
