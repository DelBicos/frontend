import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { navigationRef } from '@screens/navigationRef';
import { useColors } from '@theme/ThemeProvider';
import { ChatBotContext } from '@stores/ChatBot/types';
import { localDateTimeToISO } from '@lib/helpers/datetime';
import { createStyles } from '../styles';

interface AppointmentStatusBannerProps {
  appointmentId: number;
  appointmentStatus: string | null;
  appointmentPaid: boolean;
  conversationContext: ChatBotContext | null;
  onClose?: () => void;
}

/**
 * Banner exibido enquanto o chatbot acompanha um agendamento.
 * Mostra o status atual (pending / confirmed / canceled) e oferece ações:
 * - Pagar → navega para Checkout
 * - Ver Agenda → navega para MySchedules
 */
export const AppointmentStatusBanner: React.FC<
  AppointmentStatusBannerProps
> = ({
  appointmentId,
  appointmentStatus,
  appointmentPaid,
  conversationContext,
  onClose,
}) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const iconName =
    appointmentStatus === 'confirmed'
      ? appointmentPaid
        ? 'check-circle'
        : 'exclamation-circle'
      : appointmentStatus === 'canceled'
        ? 'times-circle'
        : 'clock-o';

  const iconColor =
    appointmentStatus === 'confirmed' && appointmentPaid
      ? colors.successText
      : appointmentStatus === 'canceled'
        ? colors.errorText
        : colors.warningText;

  const textColor =
    appointmentStatus === 'canceled' ? colors.errorText : colors.warningText;

  const navigateToCheckout = () => {
    const ctx = conversationContext;
    const selectedDate = ctx?.newDate || ctx?.date || ctx?.selectedDate;
    const selectedClock = ctx?.newTime || ctx?.time || ctx?.selectedTime;
    const selectedTime =
      selectedDate && selectedClock
        ? localDateTimeToISO(selectedDate, selectedClock)
        : selectedDate || '';
    const params = {
      professionalId: ctx?.professionalId,
      selectedTime,
      serviceId: ctx?.serviceId,
      appointmentId,
      imageUrl: undefined,
      professionalName: ctx?.professionalName,
    };

    if (navigationRef.isReady()) {
      navigationRef.navigate('Checkout', params);
    } else {
      const queryStr = [
        `professionalId=${ctx?.professionalId}`,
        `selectedTime=${encodeURIComponent(selectedTime || '')}`,
        `serviceId=${ctx?.serviceId}`,
        `appointmentId=${appointmentId}`,
        'imageUrl=',
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

  const handleNavigateToCheckout = () => {
    // Fecha o painel antes de trocar de tela para que o checkout fique livre.
    onClose?.();
    setTimeout(navigateToCheckout, 0);
  };

  const handleNavigateToSchedules = () => {
    if (navigationRef.isReady()) {
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
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
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
          <Text
            style={{
              color: colors.primaryWhite,
              fontFamily: 'Afacad-Bold',
              fontSize: 13,
            }}>
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
          <Text
            style={{
              color: colors.primaryWhite,
              fontFamily: 'Afacad-Bold',
              fontSize: 13,
            }}>
            Ver Agenda
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
