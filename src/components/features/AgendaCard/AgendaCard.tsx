import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import { Appointment, AppointmentStatus } from '@stores/Appointment/types';
import {
  AgendaRole,
  appointmentPrice,
  canComplete,
  formatCurrency,
  formatDayLabel,
  formatTimeRange,
  isExpired,
  needsPayment,
} from '@lib/appointments';

type Busy = 'accept' | 'decline' | 'complete' | null;

interface AgendaCardProps {
  appointment: Appointment;
  role: AgendaRole;
  /** Mostra a data (quando a lista nao esta agrupada por dia). */
  showDate?: boolean;
  onOpenDetails: () => void;
  onAccept?: () => Promise<void>;
  onDecline?: () => Promise<void>;
  onComplete?: () => Promise<void>;
  onPay?: () => void;
  onRate?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

function statusInfo(
  a: Appointment,
  role: AgendaRole,
  colors: ColorsType,
): { label: string; bg: string; fg: string } {
  if (isExpired(a)) {
    return {
      label: 'Expirado',
      bg: colors.inputBackground,
      fg: colors.textSecondary,
    };
  }
  if (needsPayment(a, role)) {
    return {
      label: 'Pagamento pendente',
      bg: colors.warningBackground,
      fg: colors.warningText,
    };
  }
  switch (a.status) {
    case AppointmentStatus.PENDING:
      return {
        label:
          role === 'professional'
            ? 'Aguardando sua resposta'
            : 'Aguardando o profissional',
        bg: colors.warningBackground,
        fg: colors.warningText,
      };
    case AppointmentStatus.CONFIRMED:
      return canComplete(a) && new Date(a.end_time) < new Date()
        ? {
            label:
              role === 'professional'
                ? 'Falta concluir'
                : 'Aguardando conclusão',
            bg: colors.warningBackground,
            fg: colors.warningText,
          }
        : {
            label: 'Confirmado',
            bg: colors.successBackground,
            fg: colors.successText,
          };
    case AppointmentStatus.COMPLETED:
      return {
        label: 'Concluído',
        bg: colors.badgeBackground,
        fg: colors.badgeText,
      };
    default:
      return {
        label: 'Cancelado',
        bg: colors.errorBackground,
        fg: colors.errorText,
      };
  }
}

/** Cartao de agendamento com as acoes do momento para cliente ou profissional. */
function AgendaCard({
  appointment: a,
  role,
  showDate = false,
  onOpenDetails,
  onAccept,
  onDecline,
  onComplete,
  onPay,
  onRate,
  isFavorite,
  onToggleFavorite,
}: AgendaCardProps) {
  const colors = useColors();
  const { isCompact } = useBreakpoint();
  const styles = createStyles(colors, isCompact);
  const [busy, setBusy] = useState<Busy>(null);

  const isPro = role === 'professional';
  const other = isPro ? a.Client?.User : a.Professional?.User;
  const otherName = other?.name ?? (isPro ? 'Cliente' : 'Profissional');
  const service = a.Service?.title ?? 'Serviço';
  const price = appointmentPrice(a);
  const status = statusInfo(a, role, colors);
  const place = a.Address
    ? [a.Address.neighborhood, a.Address.city].filter(Boolean).join(', ')
    : null;

  const run = async (kind: Busy, action?: () => Promise<void>) => {
    if (!action) return;
    setBusy(kind);
    try {
      await action();
    } finally {
      setBusy(null);
    }
  };

  const showRespond =
    isPro && a.status === AppointmentStatus.PENDING && !isExpired(a);
  const showComplete = isPro && canComplete(a) && !!onComplete;
  const showPay = needsPayment(a, role) && !!onPay;
  const showRate =
    !isPro && a.status === AppointmentStatus.COMPLETED && !!onRate;
  const showFavorite =
    !isPro && a.status === AppointmentStatus.COMPLETED && !!onToggleFavorite;

  const primary = (
    label: string,
    kind: Busy,
    action?: () => Promise<void> | void,
  ) => (
    <Pressable
      onPress={() =>
        kind
          ? run(kind, action as () => Promise<void>)
          : (action as () => void)?.()
      }
      disabled={!!busy}
      style={({ pressed }) => [
        styles.button,
        styles.primary,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${service}`}>
      {busy === kind && kind ? (
        <ActivityIndicator size="small" color="#000000" />
      ) : (
        <Text style={styles.primaryText}>{label}</Text>
      )}
    </Pressable>
  );

  const secondary = (
    label: string,
    kind: Busy,
    action?: () => Promise<void> | void,
  ) => (
    <Pressable
      onPress={() =>
        kind
          ? run(kind, action as () => Promise<void>)
          : (action as () => void)?.()
      }
      disabled={!!busy}
      style={({ pressed }) => [
        styles.button,
        styles.secondary,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${service}`}>
      {busy === kind && kind ? (
        <ActivityIndicator size="small" color={colors.primaryBlack} />
      ) : (
        <Text style={styles.secondaryText}>{label}</Text>
      )}
    </Pressable>
  );

  return (
    <View style={styles.card}>
      <Pressable
        onPress={onOpenDetails}
        style={({ hovered }: any) => [
          styles.main,
          hovered && styles.mainHovered,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${service} com ${otherName}, ${formatDayLabel(a.start_time)} ${formatTimeRange(a.start_time, a.end_time)}. ${status.label}. Ver detalhes`}>
        {other?.avatar_uri ? (
          <Image source={{ uri: other.avatar_uri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitial}>
              {otherName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.texts}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {service}
            </Text>
            {price != null ? (
              <Text style={styles.price}>{formatCurrency(price)}</Text>
            ) : null}
          </View>
          <Text style={styles.subtitle} numberOfLines={1}>
            {isPro ? 'Cliente' : 'Profissional'}: {otherName}
          </Text>
          <View style={styles.meta}>
            <FontAwesome
              name="clock-o"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={styles.metaText}>
              {showDate ? `${formatDayLabel(a.start_time)} · ` : ''}
              {formatTimeRange(a.start_time, a.end_time)}
            </Text>
          </View>
          {isPro && place ? (
            <View style={styles.meta}>
              <FontAwesome
                name="map-marker"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.metaText} numberOfLines={1}>
                {place}
              </Text>
            </View>
          ) : null}
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.fg }]}>
              {status.label}
            </Text>
          </View>
        </View>
        {showFavorite ? (
          <Pressable
            onPress={onToggleFavorite}
            style={styles.favorite}
            accessibilityRole="button"
            accessibilityState={{ selected: !!isFavorite }}
            accessibilityLabel={
              isFavorite
                ? `Remover ${otherName} dos favoritos`
                : `Favoritar ${otherName}`
            }>
            <FontAwesome
              name={isFavorite ? 'heart' : 'heart-o'}
              size={20}
              color={isFavorite ? colors.errorText : colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </Pressable>

      {showRespond || showComplete || showPay || showRate ? (
        <View style={styles.actions}>
          {showRespond ? (
            <>
              {secondary('Recusar', 'decline', onDecline)}
              {primary('Aceitar', 'accept', onAccept)}
            </>
          ) : null}
          {showComplete
            ? primary('Concluir atendimento', 'complete', onComplete)
            : null}
          {showPay ? primary('Pagar agora', null, onPay) : null}
          {showRate
            ? secondary(a.rating ? 'Editar avaliação' : 'Avaliar', null, onRate)
            : null}
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ColorsType, isCompact: boolean) =>
  StyleSheet.create({
    card: {
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
      overflow: 'hidden',
    },
    main: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      padding: isCompact ? 14 : 16,
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    mainHovered: {
      backgroundColor: colors.inputBackground,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },
    avatarFallback: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.inputBackground,
    },
    avatarInitial: {
      fontFamily: 'Afacad-Bold',
      fontSize: 18,
      color: colors.primaryBlack,
    },
    texts: {
      flex: 1,
      gap: 4,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 8,
    },
    title: {
      flex: 1,
      fontFamily: 'Afacad-Bold',
      fontSize: 18,
      color: colors.primaryBlack,
    },
    price: {
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    subtitle: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    metaText: {
      flex: 1,
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    badge: {
      alignSelf: 'flex-start',
      marginTop: 4,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 999,
    },
    badgeText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 13,
    },
    favorite: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -8,
      marginRight: -8,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: isCompact ? 14 : 16,
      paddingBottom: isCompact ? 14 : 16,
    },
    button: {
      flex: 1,
      minHeight: 44,
      paddingHorizontal: 14,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    primary: {
      backgroundColor: colors.primaryOrange,
    },
    primaryText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
      // Texto escuro sobre laranja (contraste AA).
      color: '#000000',
    },
    secondary: {
      borderWidth: 1.5,
      borderColor: colors.primaryBlack,
    },
    secondaryText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    pressed: {
      opacity: 0.75,
    },
  });

export default AgendaCard;
