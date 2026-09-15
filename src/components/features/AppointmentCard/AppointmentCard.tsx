import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Rating } from 'react-native-ratings';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { Appointment, AppointmentStatus } from '@stores/Appointment/types';
import { useUserStore } from '@stores/User';
import { useAppointmentStore } from '@stores/Appointment';
import { useNavigation } from '@react-navigation/native';
import { createStyles } from './styles';

interface AppointmentCardProps {
  statusLabel: string;
  statusColor: string;
  appointment: Appointment;
  viewerRole?: 'client' | 'professional';
  statusVariant: AppointmentStatus;
  isFavorite: boolean;
  onToggleFavorite: (apt: Appointment) => void;
  onOpenDetails: (apt: Appointment) => void;
  onOpenRate?: (apt: Appointment) => void;
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const AppointmentCardComponent: React.FC<AppointmentCardProps> = ({
  statusLabel,
  statusColor,
  appointment,
  viewerRole,
  statusVariant,
  isFavorite,
  onToggleFavorite,
  onOpenDetails,
  onOpenRate,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);

  const user = useUserStore((state) => state.user);
  const updateAppointmentStatus = useAppointmentStore(
    (state) => state.updateAppointmentStatus,
  );
  const [loadingAction, setLoadingAction] = React.useState(false);
  const navigation = useNavigation();

  const handlePayNow = () => {
    // @ts-ignore
    navigation.navigate('Checkout', {
      professionalId: appointment.professional_id,
      selectedTime: appointment.start_time,
      serviceId: appointment.Service.id,
      appointmentId: appointment.id,
      imageUrl: appointment.Service.banner_uri || undefined,
      professionalName: appointment.Professional?.User?.name,
    });
  };

  const isProfessional = viewerRole
    ? viewerRole === 'professional'
    : user?.professional_id === appointment.professional_id;
  const isPending = statusVariant === AppointmentStatus.PENDING;
  const isPaymentPending =
    !isProfessional &&
    statusVariant === AppointmentStatus.CONFIRMED &&
    !appointment.payment_intent_id;

  const displayStatusLabel = isPaymentPending
    ? 'Pagamento pendente'
    : statusLabel;
  const displayStatusColor = isPaymentPending
    ? colors.primaryOrange
    : statusColor;

  const handleAccept = async () => {
    setLoadingAction(true);
    await updateAppointmentStatus(appointment.id, AppointmentStatus.CONFIRMED);
    setLoadingAction(false);
  };

  const handleReject = async () => {
    setLoadingAction(true);
    await updateAppointmentStatus(appointment.id, AppointmentStatus.CANCELED);
    setLoadingAction(false);
  };

  const imageUrl = useMemo(
    () =>
      appointment.Service.banner_uri || 'https://via.placeholder.com/400x200',
    [appointment.Service.banner_uri],
  );

  const displayAvatar = useMemo(() => {
    const uri = isProfessional
      ? appointment.Client.User.avatar_uri
      : appointment.Professional.User.avatar_uri;
    return uri || 'https://via.placeholder.com/100';
  }, [
    isProfessional,
    appointment.Client.User.avatar_uri,
    appointment.Professional.User.avatar_uri,
  ]);

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
        />

        <View style={[styles.statusBadge, { backgroundColor: displayStatusColor }]}>
          <Text style={styles.statusText}>{displayStatusLabel.toUpperCase()}</Text>
        </View>

        {statusVariant === AppointmentStatus.COMPLETED && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => onToggleFavorite(appointment)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <FontAwesome
              name={isFavorite ? 'heart' : 'heart-o'}
              size={20}
              color={isFavorite ? '#FF3B30' : '#FFF'}
            />
          </TouchableOpacity>
        )}

        <View style={styles.avatarContainer}>
          <Image source={{ uri: displayAvatar }} style={styles.avatarImage} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.idText}>Agendamento #{appointment.id}</Text>
            <Text style={styles.profName} numberOfLines={1}>
              {isProfessional
                ? `Cliente: ${appointment.Client.User.name}`
                : `Profissional: ${appointment.Professional.User.name}`}
            </Text>
          </View>
          {appointment.rating && (
            <View style={styles.ratingRow}>
              <Rating
                type="star"
                ratingCount={5}
                imageSize={12}
                readonly
                startingValue={appointment.rating}
                tintColor={colors.cardBackground}
                style={{ marginRight: 4, backgroundColor: 'transparent' }}
              />
            </View>
          )}
        </View>

        <Text style={styles.serviceTitle} numberOfLines={1}>
          {appointment.Service.title}
        </Text>

        <View style={styles.infoRow}>
          <FontAwesome
            name="calendar"
            size={12}
            color={colors.textTertiary}
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>
            {formatDateTime(appointment.start_time)}
          </Text>
        </View>

        <View style={styles.actions}>
          {isPending && isProfessional ? (
            loadingAction ? (
              <ActivityIndicator
                size="small"
                color={colors.primaryOrange}
                style={{ flex: 1 }}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.detailsButton,
                    {
                      backgroundColor: colors.primaryGreen,
                      borderColor: colors.primaryGreen,
                    },
                  ]}
                  onPress={handleAccept}
                  activeOpacity={0.8}>
                  <Text style={styles.btnTextPrimary}>Aceitar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.detailsButton,
                    { backgroundColor: '#ef4444', borderColor: '#ef4444' },
                  ]}
                  onPress={handleReject}
                  activeOpacity={0.8}>
                  <Text style={styles.btnTextPrimary}>Recusar</Text>
                </TouchableOpacity>
              </>
            )
          ) : (
            <>
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => onOpenDetails(appointment)}
                activeOpacity={0.8}>
                <Text style={styles.btnTextPrimary}>Detalhes</Text>
              </TouchableOpacity>

              {isPaymentPending && (
                <TouchableOpacity
                  style={[
                    styles.rateButton,
                    {
                      backgroundColor: colors.primaryOrange,
                      borderColor: colors.primaryOrange,
                      marginLeft: 8,
                    },
                  ]}
                  onPress={handlePayNow}
                  activeOpacity={0.8}>
                  <Text
                    style={[
                      styles.btnTextSecondary,
                      { color: colors.primaryWhite },
                    ]}>
                    Pagar
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {statusVariant === AppointmentStatus.COMPLETED && onOpenRate && (
            <TouchableOpacity
              style={styles.rateButton}
              onPress={() => onOpenRate(appointment)}
              activeOpacity={0.8}>
              <Text style={styles.btnTextSecondary}>Avaliar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export const AppointmentCard = React.memo(AppointmentCardComponent);
AppointmentCard.displayName = 'AppointmentCard';
