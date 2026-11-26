import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { navigationRef } from '@screens/navigationRef';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from '../styles';

interface TicketCreatedBannerProps {
  ticketId: number;
  ticketCode?: string;
  onClose?: () => void;
}

/**
 * Banner exibido depois que o chatbot abre um chamado de suporte.
 * O código do chamado e o botão "Ver chamado" levam ao detalhe do chamado.
 */
export const TicketCreatedBanner: React.FC<TicketCreatedBannerProps> = ({
  ticketId,
  ticketCode,
  onClose,
}) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const navigateToTicket = () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('TicketDetail', { id: ticketId });
    } else if (Platform.OS === 'web') {
      window.location.href = `/ticket-detail?id=${ticketId}`;
    } else {
      import('react-native').then(({ Linking }) => {
        Linking.openURL(`delbicos://ticket-detail?id=${ticketId}`);
      });
    }
  };

  const handleNavigateToTicket = () => {
    // Fecha o painel antes de trocar de tela, como no banner de agendamento.
    onClose?.();
    setTimeout(navigateToTicket, 0);
  };

  return (
    <View
      style={[
        styles.hintBanner,
        {
          backgroundColor: colors.successBackground,
          paddingVertical: 12,
          marginVertical: 6,
          justifyContent: 'space-between',
        },
      ]}>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
        <FontAwesome name="life-ring" size={16} color={colors.successText} />
        <Text
          style={[
            styles.hintText,
            {
              color: colors.successText,
              fontFamily: 'Afacad-SemiBold',
              fontSize: 14,
            },
          ]}>
          Chamado{' '}
          {ticketCode ? (
            <Text
              onPress={handleNavigateToTicket}
              accessibilityRole="link"
              style={{ textDecorationLine: 'underline' }}>
              {ticketCode}
            </Text>
          ) : null}{' '}
          aberto! Acompanhe as respostas da equipe.
        </Text>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: colors.primaryBlue,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 16,
          marginLeft: 12,
        }}
        onPress={handleNavigateToTicket}
        accessibilityRole="button"
        accessibilityLabel="Ver chamado">
        <Text
          style={{
            color: colors.primaryWhite,
            fontFamily: 'Afacad-Bold',
            fontSize: 13,
          }}>
          Ver chamado
        </Text>
      </TouchableOpacity>
    </View>
  );
};
