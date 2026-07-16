import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
<<<<<<< HEAD
import { navigationRef } from '@screens/navigationRef';
import { useColors } from '@theme/ThemeProvider';
import { ChatBotContext } from '@stores/ChatBot/types';
import { localDateTimeToISO } from '@lib/helpers/datetime';
=======
import { useNavigation } from '@react-navigation/native';
import { navigationRef } from '@screens/navigationRef';
import { useColors } from '@theme/ThemeProvider';
import { ChatBotContext } from '@stores/ChatBot/types';
>>>>>>> 4bc7981 (Refatoracao do ChatWindow em micro-componentes, ajustes de tipagem e correcao de layout no ChatBot)
import { createStyles } from '../styles';

interface AppointmentStatusBannerProps {
  appointmentId: number;
  appointmentStatus: string | null;
  appointmentPaid: boolean;
  conversationContext: ChatBotContext | null;
<<<<<<< HEAD
  onClose?: () => void;
}

/**
 * Banner exibido enquanto o chatbot acompanha um agendamento.
=======
}

/**
 * Banner exibido após o bot finalizar o agendamento (state === 'FINALIZADO').
>>>>>>> 4bc7981 (Refatoracao do ChatWindow em micro-componentes, ajustes de tipagem e correcao de layout no ChatBot)
 * Mostra o status atual (pending / confirmed / canceled) e oferece ações:
 * - Pagar → navega para Checkout
 * - Ver Agenda → navega para MySchedules
 */
<<<<<<< HEAD
export const AppointmentStatusBanner: React.FC<
  AppointmentStatusBannerProps
> = ({
=======
export const AppointmentStatusBanner: React.FC<AppointmentStatusBannerProps> = ({
>>>>>>> 4bc7981 (Refatoracao do ChatWindow em micro-componentes, ajustes de tipagem e correcao de layout no ChatBot)
  appointmentId,
  appointmentStatus,
  appointmentPaid,
  conversationContext,
<<<<<<< HEAD
  onClose,
=======
>>>>>>> 4bc7981 (Refatoracao do ChatWindow em micro-componentes, ajustes de tipagem e correcao de layout no ChatBot)
}) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

<<<<<<< HEAD
  const iconName =
    appointmentStatus === 'confirmed'
      ? appointmentPaid
        ? 'check-circle'
        : 'exclamation-circle'
      : appointmentStatus === 'canceled'
        ? 'times-circle'
        : 'clock-o';
=======
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
>>>>>>> 4bc7981 (Refatoracao do ChatWindow em micro-componentes, ajustes de tipagem e correcao de layout no ChatBot)

  const iconColor =
    appointmentStatus === 'confirmed' && appointmentPaid
      ? colors.successText
<<<<<<< HEAD
      : appointmentStatus === 'canceled'
        ? colors.errorText
        : colors.warningText;
=======
      : appointmentStatus === 'canceled' ? colors.errorText : colors.warningText;
>>>>>>> 4bc7981 (Refatoracao do ChatWindow em micro-componentes, ajustes de tipagem e correcao de layout no ChatBot)

  const textColor =
    appointmentStatus === 'canceled' ? colors.errorText : colors.warningText;

<<<<<<< HEAD
  const navigateToCheckout = () => {
    const ctx = conversationContext;
    const selectedDate = ctx?.newDate || ctx?.date || ctx?.selectedDate;
    const selectedClock = ctx?.newTime || ctx?.time || ctx?.selectedTime;
    const selectedTime =
      selectedDate && selectedClock
        ? localDateTimeToISO(selectedDate, selectedClock)
        : selectedDate || '';
    const params = {
      professionalId: ctx?.professionalId ?? 0,
      selectedTime,
      serviceId: ctx?.serviceId ?? 0,
      appointmentId,
      imageUrl: undefined,
      professionalName: ctx?.professionalName,
    };

    if (navigationRef.isReady()) {
=======
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
>>>>>>> 4bc7981 (Refatoracao do ChatWindow em micro-componentes, ajustes de tipagem e correcao de layout no ChatBot)
      navigationRef.navigate('Checkout', params);
    } else {
      const queryStr = [
        `professionalId=${ctx?.professionalId}`,
        `selectedTime=${encodeURIComponent(selectedTime || '')}`,
        `serviceId=${ctx?.serviceId}`,
        `appointmentId=${appointmentId}`,
<<<<<<< HEAD
        'imageUrl=',
=======
        `imageUrl=${encodeURIComponent(ctx?.imageUrl || '')}`,
>>>>>>> 4bc7981 (Refatoracao do ChatWindow em micro-componentes, ajustes de tipagem e correcao de layout no ChatBot)
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

<<<<<<< HEAD
  const handleNavigateToCheckout = () => {
    // Fecha o painel antes de trocar de tela para que o checkout fique livre.
    onClose?.();
    setTimeout(navigateToCheckout, 0);
  };

  const navigateToSchedules = () => {
    if (navigationRef.isReady()) {
=======
  const handleNavigateToSchedules = () => {
    if (navigation) {
      navigation.navigate('MySchedules');
    } else if (navigationRef.isReady()) {
>>>>>>> 4bc7981 (Refatoracao do ChatWindow em micro-componentes, ajustes de tipagem e correcao de layout no ChatBot)
      navigationRef.navigate('MySchedules');
    } else if (Platform.OS === 'web') {
      window.location.href = `/profile?subroute=MeusAgendamentos`;
    } else {
      import('react-native').then(({ Linking }) => {
        Linking.openURL('delbicos://schedules');
      });
    }
  };

<<<<<<< HEAD
  const handleNavigateToSchedules = () => {
    // Libera a tela antes de abrir a agenda no navegador principal.
    onClose?.();
    setTimeout(navigateToSchedules, 0);
  };

=======
>>>>>>> 4bc7981 (Refatoracao do ChatWindow em micro-componentes, ajustes de tipagem e correcao de layout no ChatBot)
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
<<<<<<< HEAD
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
=======
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
>>>>>>> 4bc7981 (Refatoracao do ChatWindow em micro-componentes, ajustes de tipagem e correcao de layout no ChatBot)
        <FontAwesome name={iconName} size={16} color={iconColor} />
        <Text
          style={[
            styles.hintText,
            { color: textColor, fontFamily: 'Afacad-SemiBold', fontSize: 14 },
          ]}>
          {appointmentStatus === 'pending' &&
<<<<<<< HEAD
            !appointmentPaid &&
            'Agendamento criado! Efetue o pagamento para prosseguir.'}
          {appointmentStatus === 'pending' &&
            appointmentPaid &&
            'Pagamento efetuado! Aguardando aceite do prestador...'}
=======
            'Aguardando o prestador aceitar o agendamento...'}
>>>>>>> 4bc7981 (Refatoracao do ChatWindow em micro-componentes, ajustes de tipagem e correcao de layout no ChatBot)
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

<<<<<<< HEAD
      {!appointmentPaid && appointmentStatus !== 'canceled' && (
=======
      {appointmentStatus === 'confirmed' && !appointmentPaid && (
>>>>>>> 4bc7981 (Refatoracao do ChatWindow em micro-componentes, ajustes de tipagem e correcao de layout no ChatBot)
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
<<<<<<< HEAD
          <Text
            style={{
              color: colors.primaryWhite,
              fontFamily: 'Afacad-Bold',
              fontSize: 13,
            }}>
=======
          <Text style={{ color: colors.primaryWhite, fontFamily: 'Afacad-Bold', fontSize: 13 }}>
>>>>>>> 4bc7981 (Refatoracao do ChatWindow em micro-componentes, ajustes de tipagem e correcao de layout no ChatBot)
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
<<<<<<< HEAD
          <Text
            style={{
              color: colors.primaryWhite,
              fontFamily: 'Afacad-Bold',
              fontSize: 13,
            }}>
=======
          <Text style={{ color: colors.primaryWhite, fontFamily: 'Afacad-Bold', fontSize: 13 }}>
>>>>>>> 4bc7981 (Refatoracao do ChatWindow em micro-componentes, ajustes de tipagem e correcao de layout no ChatBot)
            Ver Agenda
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
