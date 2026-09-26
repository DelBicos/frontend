import type { NavigationState, PartialState } from '@react-navigation/native';

type AnyState = NavigationState | PartialState<NavigationState>;

export type BottomNavMode = 'client' | 'professional';
export type BottomNavSection =
  'home' | 'search' | 'schedules' | 'services' | 'profile';

export interface BottomNavItem {
  section: BottomNavSection;
  /** Nome da aba dentro do navegador de abas (MainTabs/ProfessionalTabs). */
  tab: string;
  label: string;
  icon: string;
}

export const CLIENT_ITEMS: BottomNavItem[] = [
  { section: 'home', tab: 'FeedTab', label: 'Início', icon: 'home' },
  { section: 'search', tab: 'CategoryTab', label: 'Buscar', icon: 'search' },
  {
    section: 'schedules',
    tab: 'SchedulesTab',
    label: 'Agenda',
    icon: 'calendar-o',
  },
  { section: 'profile', tab: 'ProfileTab', label: 'Perfil', icon: 'user-o' },
];

export const PROFESSIONAL_ITEMS: BottomNavItem[] = [
  {
    section: 'home',
    tab: 'ProfessionalHomeTab',
    label: 'Início',
    icon: 'home',
  },
  {
    section: 'schedules',
    tab: 'ProfessionalSchedulesTab',
    label: 'Agenda',
    icon: 'calendar-o',
  },
  {
    section: 'services',
    tab: 'ProfessionalServicesTab',
    label: 'Serviços',
    icon: 'wrench',
  },
  {
    section: 'profile',
    tab: 'ProfessionalProfileTab',
    label: 'Perfil',
    icon: 'user-o',
  },
];

/** Rotas de tela cheia (login, pagamento, conversa) onde a barra fica oculta. */
export const HIDDEN_ROUTES = new Set([
  'Login',
  'ForgotPassword',
  'Register',
  'VerificationScreen',
  'Checkout',
  'PaymentStatus',
  'ChatThread',
  'ChatBot',
]);

/** Telas do stack raiz e a secao da barra a que pertencem. */
const ROUTE_SECTIONS: Record<string, BottomNavSection> = {
  Feed: 'home',
  SubCategoryScreen: 'home',
  SearchResult: 'home',
  PartnerProfile: 'home',
  Category: 'search',
  MySchedules: 'schedules',
  ClientProfile: 'profile',
  ChatList: 'profile',
  Help: 'profile',
  AboutUs: 'profile',
  AdminDashboard: 'profile',
  AdminAnalytics: 'profile',
};

const TAB_CONTAINERS = new Set(['Home', 'MainTabs', 'ProfessionalTabs']);

export interface BottomNavState {
  mode: BottomNavMode;
  /** Rota do stack raiz que contem as abas (para voltar a ela). */
  container: string;
  activeTab: string | undefined;
  items: BottomNavItem[];
}

const itemsFor = (mode: BottomNavMode) =>
  mode === 'professional' ? PROFESSIONAL_ITEMS : CLIENT_ITEMS;

/**
 * Descobre qual conjunto de abas mostrar e qual aba destacar, olhando o
 * stack raiz de cima para baixo. Telas empilhadas (perfil do parceiro,
 * resultados de busca...) herdam a secao a que pertencem.
 */
export function getBottomNavState(
  rootState: AnyState | undefined,
  isProfessionalUser: boolean,
): BottomNavState {
  const routes = rootState?.routes ?? [];
  const top = rootState?.index ?? routes.length - 1;
  let section: BottomNavSection | undefined;

  for (let i = top; i >= 0; i--) {
    const route = routes[i];
    if (!route) continue;

    if (TAB_CONTAINERS.has(route.name)) {
      const mode: BottomNavMode =
        route.name === 'ProfessionalTabs' ||
        (route.name === 'Home' && isProfessionalUser)
          ? 'professional'
          : 'client';
      const items = itemsFor(mode);
      const nested = route.state as AnyState | undefined;
      const focusedTab =
        nested?.routes?.[nested.index ?? 0]?.name ?? items[0].tab;
      const activeTab = section
        ? (items.find((item) => item.section === section)?.tab ?? focusedTab)
        : focusedTab;
      return { mode, container: route.name, activeTab, items };
    }

    // Fica com a tela mais proxima das abas: e ela que iniciou o fluxo
    // (ex.: Categorias -> Subcategoria continua destacando "Buscar").
    section = ROUTE_SECTIONS[route.name] ?? section;
  }

  const mode: BottomNavMode = isProfessionalUser ? 'professional' : 'client';
  const items = itemsFor(mode);
  return {
    mode,
    container: 'Home',
    activeTab: items.find((item) => item.section === section)?.tab,
    items,
  };
}

/** Nome da rota mais interna em foco (ex.: 'FeedTab', 'ChatBot'). */
export function getFocusedRouteName(state: AnyState | undefined) {
  let current: AnyState | undefined = state;
  let name: string | undefined;
  while (current?.routes?.length) {
    const route = current.routes[current.index ?? current.routes.length - 1];
    name = route?.name;
    current = route?.state as AnyState | undefined;
  }
  return name;
}
