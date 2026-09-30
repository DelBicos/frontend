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
