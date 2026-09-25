import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import AgendaCard from '@components/features/AgendaCard';
import { AppointmentDetailsModal } from '@components/features/AppointmentDetailsModal';
import { RateServiceModal } from '@components/features/RateServiceModal';
import PageContainer, { PageHeader } from '@components/layout/PageContainer';
import Chip, { ChipGroup } from '@components/ui/Chip';
import { useAppointmentStatusSocket } from '@hooks/useAppointmentStatusSocket';
import {
  AgendaRole,
  AgendaTab,
  groupAgenda,
  groupByDay,
} from '@lib/appointments';
import { confirmAction } from '@lib/utils/confirmAction';
import { useAppointmentStore } from '@stores/Appointment';
import { Appointment, AppointmentStatus } from '@stores/Appointment/types';
import { useFavoriteStore } from '@stores/Favorite';
import { useUserStore } from '@stores/User';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';

const POLLING_MS = 30000;

const TAB_LABELS: Record<AgendaTab, string> = {
  upcoming: 'Próximos',
  toComplete: 'A concluir',
  history: 'Histórico',
  canceled: 'Cancelados',
};

const EMPTY_TEXT: Record<AgendaRole, Record<AgendaTab, string>> = {
  professional: {
    upcoming: 'Nenhum atendimento marcado. Novos pedidos aparecem aqui.',
    toComplete: 'Tudo em dia: nenhum atendimento esperando conclusão.',
    history: 'Seus atendimentos concluídos aparecem aqui.',
    canceled: 'Nenhum agendamento cancelado.',
  },
  client: {
    upcoming: 'Você não tem agendamentos marcados.',
    toComplete: '',
    history: 'Seus serviços realizados aparecem aqui.',
    canceled: 'Nenhum agendamento cancelado.',
  },
};

interface MeusAgendamentosProps {
  role?: AgendaRole;
}

function MeusAgendamentos({ role = 'client' }: MeusAgendamentosProps) {
  const {
    appointments,
    loading,
    fetchAppointments,
    updateAppointmentStatus,
    completeAppointment,
  } = useAppointmentStore();
  const { addFavorite, removeFavorite, isFavorite } = useFavoriteStore();
  const user = useUserStore((s) => s.user);
  const colors = useColors();
  const styles = createStyles(colors);
  const navigation = useNavigation<any>();
  const isPro = role === 'professional';

  const [tab, setTab] = useState<AgendaTab>('upcoming');
  const [actionError, setActionError] = useState<string | null>(null);
  const [details, setDetails] = useState<Appointment | null>(null);
  const [toRate, setToRate] = useState<Appointment | null>(null);

  // Abas ficam montadas em segundo plano: so atualiza enquanto visivel.
  const isFocused = useIsFocused();
  useEffect(() => {
    if (!user || !isFocused) return;
    fetchAppointments(role);
    const interval = setInterval(() => fetchAppointments(role), POLLING_MS);
    return () => clearInterval(interval);
  }, [user, isFocused, fetchAppointments, role]);

  const refresh = useCallback(() => {
    void fetchAppointments(role);
  }, [fetchAppointments, role]);
  useAppointmentStatusSocket(refresh);

  const groups = useMemo(
    () => groupAgenda(appointments, role),
    [appointments, role],
  );
  const tabs: AgendaTab[] = isPro
    ? ['upcoming', 'toComplete', 'history', 'canceled']
    : ['upcoming', 'history', 'canceled'];

  if (!user) {
    return (
      <PageContainer maxWidth={560}>
        <View style={styles.gate}>
          <FontAwesome
            name="calendar-check-o"
            size={40}
            color={colors.primaryBlack}
          />
          <Text
            style={styles.gateTitle}
            accessibilityRole="header"
            {...({ 'aria-level': 1 } as object)}>
            Acompanhe seus agendamentos
          </Text>
          <Text style={styles.gateText}>
            Entre na sua conta para ver seus horários, pagar e avaliar serviços.
          </Text>
          <Pressable
            onPress={() => navigation.navigate('Login')}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && { opacity: 0.8 },
            ]}
            accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Entrar</Text>
          </Pressable>
        </View>
      </PageContainer>
    );
  }

  const withFeedback = async (ok: Promise<boolean>, message: string) => {
    setActionError(null);
    if (!(await ok)) setActionError(message);
  };

  const accept = (a: Appointment) =>
    withFeedback(
      updateAppointmentStatus(a.id, AppointmentStatus.CONFIRMED),
      'Não foi possível aceitar o pedido. Tente novamente.',
    );

  const decline = async (a: Appointment) => {
    const confirmed = await confirmAction({
      title: 'Recusar pedido?',
      message:
        'O cliente será avisado e, se já tiver pago, o valor será estornado.',
      confirmLabel: 'Recusar',
      destructive: true,
    });
    if (!confirmed) return;
    await withFeedback(
      updateAppointmentStatus(a.id, AppointmentStatus.CANCELED),
      'Não foi possível recusar o pedido. Tente novamente.',
    );
  };

  const complete = async (a: Appointment) => {
    const confirmed = await confirmAction({
      title: 'Concluir atendimento?',
      message:
        'Confirme que o serviço foi realizado. O cliente será convidado a avaliar.',
      confirmLabel: 'Concluir',
    });
    if (!confirmed) return;
    await withFeedback(
      completeAppointment(a.id),
      'Não foi possível concluir o atendimento. Tente novamente.',
    );
  };

  const pay = (a: Appointment) =>
    navigation.navigate('Checkout', {
      professionalId: a.professional_id,
      selectedTime: a.start_time,
      serviceId: a.Service.id,
      appointmentId: a.id,
      imageUrl: a.Service.banner_uri || undefined,
      professionalName: a.Professional?.User?.name,
    });

  const toggleFavorite = (a: Appointment) => {
    const professionalId = a.Professional.id;
    if (isFavorite(professionalId)) {
      removeFavorite(professionalId);
      return;
    }
    addFavorite({
      professionalId,
      professionalName: a.Professional.User.name,
      professionalAvatar: a.Professional.User.avatar_uri || undefined,
      category: a.Service.Subcategory?.name,
      serviceTitle: a.Service.title,
      addedAt: new Date().toISOString(),
    });
  };

  const renderCard = (a: Appointment, showDate: boolean) => (
    <AgendaCard
      key={a.id}
      appointment={a}
      role={role}
      showDate={showDate}
      onOpenDetails={() => setDetails(a)}
      onAccept={() => accept(a)}
      onDecline={() => decline(a)}
      onComplete={() => complete(a)}
      onPay={() => pay(a)}
      onRate={() => setToRate(a)}
      isFavorite={isFavorite(a.Professional?.id)}
      onToggleFavorite={() => toggleFavorite(a)}
    />
  );

  const items = groups[tab];

  return (
    <PageContainer>
      <PageHeader
        title={isPro ? 'Agenda' : 'Meus agendamentos'}
        subtitle={
          isPro
            ? 'Responda pedidos, acompanhe seus horários e conclua os atendimentos realizados.'
            : 'Acompanhe seus serviços, pague e avalie os profissionais.'
        }
      />

      <ChipGroup accessibilityLabel="Filtrar agendamentos" style={styles.tabs}>
        {tabs.map((key) => (
          <Chip
            key={key}
            label={`${TAB_LABELS[key]} (${groups[key].length})`}
            accessibilityLabel={`${TAB_LABELS[key]}, ${groups[key].length}`}
            selected={tab === key}
            onPress={() => setTab(key)}
          />
        ))}
      </ChipGroup>

      {actionError ? (
        <View style={styles.errorBox} accessibilityLiveRegion="assertive">
          <Text style={styles.errorText}>{actionError}</Text>
        </View>
      ) : null}

      {loading && appointments.length === 0 ? (
        <ActivityIndicator
          size="large"
          color={colors.primaryOrange}
          style={styles.loader}
        />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <FontAwesome
            name="calendar-o"
            size={28}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>{EMPTY_TEXT[role][tab]}</Text>
        </View>
      ) : tab === 'upcoming' ? (
        groupByDay(items).map((day) => (
          <View key={day.label} style={styles.day}>
            <Text
              style={styles.dayTitle}
              accessibilityRole="header"
              {...({ 'aria-level': 2 } as object)}>
              {day.label}
            </Text>
            <View style={styles.list}>
              {day.items.map((a) => renderCard(a, false))}
            </View>
          </View>
        ))
      ) : (
        <View style={styles.list}>{items.map((a) => renderCard(a, true))}</View>
      )}

      <AppointmentDetailsModal
        visible={!!details}
        onClose={() => setDetails(null)}
        appointment={details}
        onCancel={refresh}
      />

      {toRate && (
        <RateServiceModal
          visible={!!toRate}
          appointmentId={toRate.id}
          professionalName={toRate.Professional.User.name}
          serviceTitle={toRate.Service.title}
          existingRating={toRate.rating}
          existingReview={toRate.review}
          onClose={() => setToRate(null)}
          onSuccess={refresh}
        />
      )}
    </PageContainer>
  );
}

export default MeusAgendamentos;
