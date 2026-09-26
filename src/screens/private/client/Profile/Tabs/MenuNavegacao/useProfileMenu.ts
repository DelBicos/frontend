import { useCallback } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import {
  CommonActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUserStore } from '@stores/User';
import { ClientProfileSubRoutes } from '@screens/types';
import { confirmAction } from '@lib/utils/confirmAction';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

export interface ProfileMenuItem {
  id: string;
  label: string;
  icon: IconName;
  /** Texto de apoio na lista do app. */
  hint?: string;
}

export interface ProfileMenuSection {
  title: string;
  items: ProfileMenuItem[];
}

/** Titulos das subtelas (cabecalho do app). */
export const SUBROUTE_TITLES: Partial<Record<string, string>> = {
  [ClientProfileSubRoutes.DadosConta]: 'Dados da conta',
  [ClientProfileSubRoutes.MeusEnderecos]: 'Endereços',
  [ClientProfileSubRoutes.Seguranca]: 'Senha e segurança',
  [ClientProfileSubRoutes.Notificacoes]: 'Notificações',
  [ClientProfileSubRoutes.Conversas]: 'Conversas',
  [ClientProfileSubRoutes.Favoritos]: 'Favoritos',
  [ClientProfileSubRoutes.Avaliacoes]: 'Avaliações',
  [ClientProfileSubRoutes.Historico]: 'Histórico',
  [ClientProfileSubRoutes.MeusAgendamentos]: 'Agendamentos',
  [ClientProfileSubRoutes.TornarParceiro]: 'Seja um colaborador',
};

/**
 * Opcoes do perfil e o que cada uma faz. Usado pela lista do app e pela
 * barra lateral do web, para as duas terem as mesmas opcoes.
 */
export function useProfileMenu() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const { user, signOut } = useUserStore();
  const isProfessionalTab = route.name === 'ProfessionalProfileTab';
  const isWebDesktop = Platform.OS === 'web' && width >= 900;

  const partnerItem: ProfileMenuItem = isProfessionalTab
    ? {
        id: 'VoltarCliente',
        label: 'Usar como cliente',
        icon: 'person',
        hint: 'Buscar e agendar serviços',
      }
    : user?.professional_id
      ? {
          id: 'AcessarParceiro',
          label: 'Painel do colaborador',
          icon: 'work',
          hint: 'Pedidos, agenda e serviços',
        }
      : {
          id: ClientProfileSubRoutes.TornarParceiro,
          label: 'Seja um colaborador',
          icon: 'work-outline',
          hint: 'Ofereça seus serviços no DelBicos',
        };

  const sections: ProfileMenuSection[] = [
    {
      title: 'Conta',
      items: [
        {
          id: ClientProfileSubRoutes.DadosConta,
          label: 'Dados da conta',
          icon: 'person-outline',
        },
        {
          id: ClientProfileSubRoutes.MeusEnderecos,
          label: 'Endereços',
          icon: 'location-on',
        },
        {
          id: ClientProfileSubRoutes.Seguranca,
          label: 'Senha e segurança',
          icon: 'lock-outline',
        },
        {
          id: ClientProfileSubRoutes.Notificacoes,
          label: 'Notificações',
          icon: 'notifications-none',
        },
      ],
    },
    {
      title: 'Atividade',
      items: [
        {
          id: ClientProfileSubRoutes.Conversas,
          label: 'Conversas',
          icon: 'chat-bubble-outline',
        },
        {
          id: ClientProfileSubRoutes.Favoritos,
          label: 'Favoritos',
          icon: 'favorite-border',
        },
        {
          id: ClientProfileSubRoutes.Avaliacoes,
          label: 'Avaliações',
          icon: 'star-outline',
        },
        {
          id: ClientProfileSubRoutes.Historico,
          label: 'Histórico',
          icon: 'history',
        },
      ],
    },
    { title: 'Colaborador', items: [partnerItem] },
  ];

  const signOutWithConfirm = useCallback(async () => {
    const ok = await confirmAction({
      title: 'Sair da conta',
      message: 'Você vai precisar entrar de novo para agendar e conversar.',
      confirmLabel: 'Sair',
      destructive: true,
    });
    if (!ok) return;
    signOut();
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Home' }] }),
    );
  }, [navigation, signOut]);

  const open = useCallback(
    (id: string) => {
      if (id === 'VoltarCliente') {
        if (Platform.OS === 'web') navigation.navigate('Feed');
        else navigation.navigate('MainTabs', { screen: 'FeedTab' });
        return;
      }
      if (id === 'AcessarParceiro') {
        navigation.navigate('ProfessionalTabs', {
          screen: 'ProfessionalHomeTab',
        });
        return;
      }
      // Conversas no celular: telas proprias (lista -> conversa).
      if (id === ClientProfileSubRoutes.Conversas && !isWebDesktop) {
        navigation.navigate('ChatList');
        return;
      }
      navigation.setParams({ subroute: id });
    },
    [navigation, isWebDesktop],
  );

  return { sections, open, signOut: signOutWithConfirm, user };
}
