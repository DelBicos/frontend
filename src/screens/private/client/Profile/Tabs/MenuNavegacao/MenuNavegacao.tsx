import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  CommonActions,
} from '@react-navigation/native';
import { useUserStore } from '@stores/User';
import { ClientProfileSubRoutes } from '@screens/types';
import { useColors } from '@theme/ThemeProvider';
import { MaterialIcons } from '@expo/vector-icons';
import { createStyles } from './styles';

const menuOptions = [
  {
    id: ClientProfileSubRoutes.DadosConta,
    label: 'Dados da Conta',
    icon: 'person-outline',
    activeIcon: 'person',
  },
  {
    id: ClientProfileSubRoutes.MeusEnderecos,
    label: 'Endereços',
    icon: 'location-on',
    activeIcon: 'location-on',
  },
  {
    id: ClientProfileSubRoutes.Seguranca,
    label: 'Segurança',
    icon: 'lock-outline',
    activeIcon: 'lock',
  },

  {
    id: ClientProfileSubRoutes.Notificacoes,
    label: 'Notificações',
    icon: 'notifications-none',
    activeIcon: 'notifications',
  },
  {
    id: ClientProfileSubRoutes.Conversas,
    label: 'Conversas',
    icon: 'chat-bubble-outline',
    activeIcon: 'chat-bubble',
  },
  {
    id: ClientProfileSubRoutes.Favoritos,
    label: 'Favoritos',
    icon: 'favorite-border',
    activeIcon: 'favorite',
  },
  {
    id: ClientProfileSubRoutes.Avaliacoes,
    label: 'Avaliações',
    icon: 'star-outline',
    activeIcon: 'star',
  },
  {
    id: ClientProfileSubRoutes.Ajuda,
    label: 'Central de Ajuda',
    icon: 'help-outline',
    activeIcon: 'help',
  },
  {
    id: ClientProfileSubRoutes.Historico,
    label: 'Histórico',
    icon: 'history',
    activeIcon: 'history',
  },
  {
    id: ClientProfileSubRoutes.TornarParceiro,
    label: 'Tornar-se Colaborador',
    icon: 'card-travel',
    activeIcon: 'work',
  },
];

const MenuNavegacao = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const { user, signOut } = useUserStore();
  const colors = useColors();
  const styles = createStyles(colors);
  const isWebDesktop = Platform.OS === 'web' && width >= 900;

  const currentSubroute =
    (route.params as any)?.subroute || ClientProfileSubRoutes.DadosConta;

  const isProfessionalTab = route.name === 'ProfessionalProfileTab';

  const dynamicMenuOptions = menuOptions.map((option) => {
    if (option.id === ClientProfileSubRoutes.TornarParceiro) {
      if (isProfessionalTab) {
        return {
          ...option,
          id: 'VoltarCliente',
          label: 'Acessar Painel Cliente',
          icon: 'person',
          activeIcon: 'person',
        } as any;
      } else if (user?.professional_id) {
        return {
          ...option,
          id: 'AcessarParceiro',
          label: 'Acessar Painel Colaborador',
          icon: 'work',
          activeIcon: 'work',
        } as any;
      }
    }

    return option;
  });

  // Adiciona a opção de Sair da conta no final
  dynamicMenuOptions.push({
    id: 'SairConta',
    label: 'Sair da conta',
    icon: 'logout',
    activeIcon: 'logout',
    isDestructive: true,
  } as any);

  const handlePress = (subroute: string) => {
    if (subroute === 'VoltarCliente') {
      if (Platform.OS === 'web') {
        navigation.navigate('Feed');
      } else {
        // @ts-ignore
        navigation.navigate('MainTabs', { screen: 'FeedTab' });
      }
      return;
    }
    if (subroute === 'AcessarParceiro') {
      // @ts-ignore
      navigation.navigate('ProfessionalTabs', {
        screen: 'ProfessionalHomeTab',
      });
      return;
    }
    if (subroute === ClientProfileSubRoutes.Conversas) {
      if (isWebDesktop) {
        // @ts-ignore — inbox split dentro do perfil (menu lateral + lista + thread)
        navigation.setParams({ subroute });
        return;
      }
      // @ts-ignore — mobile: telas dedicadas no root stack
      navigation.navigate('ChatList');
      return;
    }
    if (subroute === ClientProfileSubRoutes.Ajuda) {
      navigation.navigate('TicketsList');
      return;
    }
    if (subroute === 'SairConta') {
      Alert.alert(
        'Sair da Conta',
        'Tem certeza que deseja sair da sua conta?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: () => {
              signOut();
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                }),
              );
            },
          },
        ],
      );
      return;
    }
    // @ts-ignore - Atualiza o parâmetro na rota atual
    navigation.setParams({ subroute });
  };

  return (
    <View style={styles.menuContainer}>
      {dynamicMenuOptions.map((item) => {
        const isActive = currentSubroute === item.id;
        const iconName = isActive ? item.activeIcon : item.icon;
        const isDestructive = (item as any).isDestructive;

        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              isActive && styles.activeMenuItem,
              (item as any).disabled && { opacity: 0.5 },
            ]}
            onPress={() => !(item as any).disabled && handlePress(item.id)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{
              selected: isActive,
              disabled: !!(item as any).disabled,
            }}
            accessibilityLabel={`Ir para ${item.label}`}>
            {isActive && <View style={styles.activeIndicator} />}

            <View style={styles.menuIconContainer}>
              <MaterialIcons
                name={iconName as any}
                size={22}
                color={
                  isActive
                    ? colors.primaryOrange
                    : isDestructive
                      ? colors.primaryRed
                      : colors.textTertiary
                }
              />
            </View>

            <Text
              style={[
                styles.menuText,
                isActive && styles.activeMenuText,
                isDestructive && { color: colors.primaryRed },
              ]}>
              {item.label}
            </Text>

            {!isActive && (
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={isDestructive ? colors.primaryRed : colors.borderColor}
                style={styles.chevronIcon}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default MenuNavegacao;
