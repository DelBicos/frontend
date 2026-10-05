import type { ChatCorrespondent, ChatRoomStatus } from '@stores/Chat';

export enum ClientProfileSubRoutes {
  DadosConta = 'DadosConta',
  MeusEnderecos = 'MeusEnderecos',
  TrocarSenha = 'TrocarSenha',
  Seguranca = 'Seguranca',
  Verificacao = 'Verificacao',
  MeusAgendamentos = 'MeusAgendamentos',
  Notificacoes = 'Notificacoes',
  Conversas = 'Conversas',
  Favoritos = 'Favoritos',
  Avaliacoes = 'Avaliacoes',
  Historico = 'Historico',
  Pagamentos = 'Pagamentos',
  Ajuda = 'Ajuda',
  TornarParceiro = 'TornarParceiro',
}

export type ClientProfileParams = {
  [K in ClientProfileSubRoutes]: undefined;
};

export type NavigationParams = {
  Home: undefined;
  Login: { admin?: string } | undefined;
  ForgotPassword: { email?: string } | undefined;
  Feed: undefined;
  PartnerProfile: { id: string };
  Register: undefined;
  NotFound: undefined;
  VerificationScreen: { email: string };
  Category: undefined;
  SubCategoryScreen: {
    categoryId: number;
    categoryTitle?: string;
    serviceId?: number;
    singleSubCategory?: { id: number; title: string };
    /** Vindo do perfil de um profissional: mostra so os horarios dele. */
    professionalId?: number;
    professionalName?: string;
  };
  ClientProfile: { subroute?: ClientProfileSubRoutes };
  SearchResult:
    | {
        subCategoryId: number;
        subCategoryTitle?: string;
        date: string;
        professionalId?: number;
        professionalName?: string;
      }
    | { query: string };
  Checkout: {
    professionalId: number;
    priceFrom?: number;
    selectedTime: string;
    imageUrl?: string;
    professionalName?: string;
    serviceId: number;
    /** Id publico (short_id) de um agendamento pendente a pagar. */
    appointmentId?: string;
  };
  PaymentStatus:
    | {
        appointmentId?: number;
        paymentIntentId?: string;
      }
    | undefined;
  MySchedules: undefined;
  ProfessionalTabs: undefined;
  ProfessionalHomeTab: undefined;
  ProfessionalSchedulesTab: undefined;
  ProfessionalEarningsTab: undefined;
  ProfessionalServicesTab: undefined;
  ProfessionalProfileTab: undefined;
  Help: undefined;
  Terms: undefined;
  AboutUs: undefined;
  AdminDashboard: undefined;
  AdminAnalytics: undefined;
  AdminDisputes: undefined;
  AdminVerifications: undefined;
  ChatList: undefined;
  ChatThread: {
    roomId: number;
    correspondent?: ChatCorrespondent | null;
    serviceTitle?: string | null;
    roomStatus?: ChatRoomStatus;
  };
  ChatBot: undefined;
};

/**
 * Navegacao usada pelas telas e features. As rotas e os parametros formam um
 * grafo grande (pilha + abas aninhadas), entao a tipagem estrita do React
 * Navigation nao ajuda aqui: o que se garante e o nome da rota.
 * Uso: `useNavigation<AppNavigation>()`.
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
