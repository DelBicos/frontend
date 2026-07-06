import type { ChatCorrespondent, ChatRoomStatus } from '@stores/Chat';

export enum ClientProfileSubRoutes {
  DadosConta = 'DadosConta',
  MeusEnderecos = 'MeusEnderecos',
  TrocarSenha = 'TrocarSenha',
  Seguranca = 'Seguranca',
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
  Login: undefined;
  LoginPassword: undefined;
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
  };
  ClientProfile: { subroute?: ClientProfileSubRoutes };
  SearchResult: { subCategoryId: number; date: string };
  Checkout: {
    professionalId: number;
    priceFrom?: number;
    selectedTime: string;
    imageUrl?: string;
    professionalName?: string;
    serviceId: number;
    appointmentId?: number;
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
  ProfessionalAvailabilityTab: undefined;
  ProfessionalProfileTab: undefined;
  Help: undefined;
  AboutUs: undefined;
  AdminDashboard: undefined;
  AdminAnalytics: undefined;
  ProfessionalArea: undefined;
  ChatList: undefined;
  ChatThread: {
    roomId: number;
    correspondent?: ChatCorrespondent | null;
    serviceTitle?: string | null;
    roomStatus?: ChatRoomStatus;
  };
  ChatBot: undefined;
};
