import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { navigationRef } from '@screens/navigationRef';
import { useColors } from '@theme/ThemeProvider';
import { ChatBotContext } from '@stores/ChatBot/types';
import { createStyles } from '../styles';

interface AppointmentStatusBannerProps {
  appointmentId: number;
  appointmentStatus: string | null;
  appointmentPaid: boolean;
  conversationContext: ChatBotContext | null;
}

/**
 * Banner exibido após o bot finalizar o agendamento (state === 'FINALIZADO').
 * Mostra o status atual (pending / confirmed / canceled) e oferece ações:
 * - Pagar → navega para Checkout
 * - Ver Agenda → navega para MySchedules
 */
export const AppointmentStatusBanner: React.FC<AppointmentStatusBannerProps> = ({
  appointmentId,
  appointmentStatus,
  appointmentPaid,
  conversationContext,
}) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  let navigation: any = null;
  try {
    navigation = useNavigation();
  } catch {
    // Fora do NavigationContainer (ex: ChatWidget global)
  }

  const iconName =
    appointmentStatus === 'confirmed'
      ? appointmentPaid ? 'check-circle' : 'exclamation-circle'
      : appointmentStatus === 'canceled' ? 'times-circle' : 'clock-o';

  const iconColor =
    appointmentStatus === 'confirmed' && appointmentPaid
      ? colors.successText
      : appointmentStatus === 'canceled' ? colors.errorText : colors.warningText;

  const textColor =
    appointmentStatus === 'canceled' ? colors.errorText : colors.warningText;

  const handleNavigateToCheckout = () => {
    const ctx = conversationContext as any;
    const selectedTime = ctx?.newDate || ctx?.date || ctx?.selectedDate;
    const params = {
      professionalId: ctx?.professionalId,
      selectedTime,
      serviceId: ctx?.serviceId,
      appointmentId,
      imageUrl: ctx?.imageUrl || undefined,
      professionalName: ctx?.professionalName,
    };

    if (navigation) {
      navigation.navigate('Checkout', params);
    } else if (navigationRef.isReady()) {
      navigationRef.navigate('Checkout', params);
    } else {
      const queryStr = [
        `professionalId=${ctx?.professionalId}`,
        `selectedTime=${encodeURIComponent(selectedTime || '')}`,
        `serviceId=${ctx?.serviceId}`,
        `appointmentId=${appointmentId}`,
        `imageUrl=${encodeURIComponent(ctx?.imageUrl || '')}`,
        `professionalName=${encodeURIComponent(ctx?.professionalName || '')}`,
      ].join('&');

      if (Platform.OS === 'web') {
        window.location.href = `/checkout?${queryStr}`;
      } else {
        import('react-native').then(({ Linking }) => {
          Linking.openURL(`delbicos://checkout?${queryStr}`);
        });
      }
    }
  };

  const handleNavigateToSchedules = () => {
    if (navigation) {
      navigation.navigate('MySchedules');
    } else if (navigationRef.isReady()) {
      navigationRef.navigate('MySchedules');
    } else if (Platform.OS === 'web') {
      window.location.href = `/profile?subroute=MeusAgendamentos`;
    } else {
      import('react-native').then(({ Linking }) => {
        Linking.openURL('delbicos://schedules');
      });
    }
  };

  return (
    <View
      style={[
        styles.hintBanner,
        {
          backgroundColor:
            appointmentStatus === 'canceled'
              ? colors.errorBackground
              : colors.warningBackground,
          paddingVertical: 12,
          marginVertical: 6,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
      ]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
        <FontAwesome name={iconName} size={16} color={iconColor} />
        <Text
          style={[
            styles.hintText,
            { color: textColor, fontFamily: 'Afacad-SemiBold', fontSize: 14 },
          ]}>
          {appointmentStatus === 'pending' &&
            'Aguardando o prestador aceitar o agendamento...'}
          {appointmentStatus === 'confirmed' &&
            !appointmentPaid &&
            'Agendamento aceito! Efetue o pagamento para finalizar.'}
          {appointmentStatus === 'confirmed' &&
            appointmentPaid &&
            '🎉 Tudo pronto! Agendamento pago e confirmado.'}
          {appointmentStatus === 'canceled' &&
            'Este agendamento foi cancelado ou recusado.'}
        </Text>
      </View>

      {appointmentStatus === 'confirmed' && !appointmentPaid && (
        <TouchableOpacity
          style={{
            backgroundColor: colors.primaryOrange,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 16,
            marginLeft: 12,
          }}
          onPress={handleNavigateToCheckout}
          accessibilityRole="button"
          accessibilityLabel="Pagar agendamento">
          <Text style={{ color: colors.primaryWhite, fontFamily: 'Afacad-Bold', fontSize: 13 }}>
            Pagar
          </Text>
        </TouchableOpacity>
      )}

      {appointmentStatus === 'confirmed' && appointmentPaid && (
        <TouchableOpacity
          style={{
            backgroundColor: colors.primaryBlue,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 16,
            marginLeft: 12,
          }}
          onPress={handleNavigateToSchedules}
          accessibilityRole="button"
          accessibilityLabel="Ver agendamento">
          <Text style={{ color: colors.primaryWhite, fontFamily: 'Afacad-Bold', fontSize: 13 }}>
            Ver Agenda
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
