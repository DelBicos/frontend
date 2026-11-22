import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { ReviewCard } from '@components/ui/ReviewCard';
import { RateServiceModal } from '@components/features/RateServiceModal';
import Avatar from '@components/ui/Avatar';
import Stars from '@components/ui/Stars';
import ActionButton from '@components/ui/ActionButton';
import EmptyState from '@components/ui/EmptyState';
import { useAppointmentStore } from '@stores/Appointment';
import { Appointment } from '@stores/Appointment/types';
import { useColors } from '@theme/ThemeProvider';
import ProfilePage, { ProfileCard } from '../../components/ProfilePage';
import { createStyles } from './styles';

interface AvaliacoesTabProps {
  role?: 'client' | 'professional';
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const byDateDesc = (a: Appointment, b: Appointment) =>
  new Date(b.start_time).getTime() - new Date(a.start_time).getTime();

/**
 * Cliente: avaliacoes feitas e atendimentos esperando avaliacao.
 * Profissional: avaliacoes recebidas, com a media.
 */
const AvaliacoesTab: React.FC<AvaliacoesTabProps> = ({ role = 'client' }) => {
  const colors = useColors();
  const styles = createStyles(colors);
  const { width } = useWindowDimensions();
  const columns = width >= 1100 ? 2 : 1;
  const isClient = role === 'client';
  const { appointments, fetchAppointments, loading } = useAppointmentStore();
  const [toRate, setToRate] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments(role);
  }, [fetchAppointments, role]);

  const reviewed = useMemo(
    () =>
      appointments
        .filter((a) => typeof a.rating === 'number' && a.rating > 0)
        .sort(byDateDesc),
    [appointments],
  );
  const pending = useMemo(
    () =>
      isClient
        ? appointments
            .filter((a) => a.status === 'completed' && !a.rating)
            .sort(byDateDesc)
        : [],
    [appointments, isClient],
  );
  const average = reviewed.length
    ? reviewed.reduce((sum, a) => sum + (a.rating ?? 0), 0) / reviewed.length
    : 0;

  const person = (a: Appointment) =>
    isClient ? a.Professional?.User : a.Client?.User;

  if (loading && appointments.length === 0) {
    return (
      <ProfilePage title="Avaliações">
        <ActivityIndicator
          size="large"
          color={colors.primaryBlack}
          style={styles.loading}
        />
      </ProfilePage>
    );
  }

  return (
    <ProfilePage
      title={isClient ? 'Avaliações' : 'Avaliações recebidas'}
      subtitle={
        isClient
          ? 'Sua opinião ajuda outros clientes a escolher.'
          : 'O que os clientes disseram sobre seus atendimentos.'
      }>
      {!isClient && reviewed.length > 0 ? (
        <View style={styles.summary}>
          <Text style={styles.average}>
            {average.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
          </Text>
          <View style={styles.summaryTexts}>
            <Stars value={average} size={18} color="#B45309" />
            <Text style={styles.summaryText}>
              {reviewed.length}{' '}
              {reviewed.length === 1 ? 'avaliação' : 'avaliações'}
            </Text>
          </View>
        </View>
      ) : null}

      {pending.length > 0 ? (
        <ProfileCard title="Esperando sua avaliação">
          {pending.map((a, i) => (
            <View
              key={a.id}
              style={[styles.pendingRow, i > 0 && styles.pendingDivider]}>
              <Avatar
                uri={a.Professional?.User?.avatar_uri}
                name={a.Professional?.User?.name}
                size={40}
              />
              <View style={styles.pendingTexts}>
                <Text style={styles.pendingName} numberOfLines={1}>
                  {a.Service?.title}
                </Text>
                <Text style={styles.pendingMeta} numberOfLines={1}>
                  {a.Professional?.User?.name} · {formatDate(a.start_time)}
                </Text>
              </View>
              <ActionButton
                label="Avaliar"
                icon="star"
                size="sm"
                onPress={() => setToRate(a)}
              />
            </View>
          ))}
        </ProfileCard>
      ) : null}

      {reviewed.length === 0 ? (
        pending.length === 0 ? (
          <EmptyState
            icon="star-o"
            title={
              isClient
                ? 'Nenhuma avaliação ainda'
                : 'Nenhuma avaliação recebida'
            }
            text={
              isClient
                ? 'Depois que um atendimento for concluído, ele aparece aqui para você avaliar.'
                : 'As avaliações dos seus clientes aparecem aqui depois dos atendimentos.'
            }
          />
        ) : null
      ) : (
        <>
          {isClient ? (
            <Text
              style={styles.sectionTitle}
              accessibilityRole="header"
              {...({ 'aria-level': 2 } as object)}>
              Suas avaliações
            </Text>
          ) : null}
          <View style={styles.grid}>
            {reviewed.map((a) => (
              <View
                key={a.id}
                style={[styles.gridItem, { width: `${100 / columns}%` }]}>
                <ReviewCard
                  rating={a.rating ?? 0}
                  serviceTitle={a.Service?.title ?? 'Serviço'}
                  personName={person(a)?.name ?? ''}
                  personAvatar={person(a)?.avatar_uri}
                  date={formatDate(a.start_time)}
                  review={a.review}
                  onEdit={isClient ? () => setToRate(a) : undefined}
                />
              </View>
            ))}
          </View>
        </>
      )}

      {toRate ? (
        <RateServiceModal
          visible
          appointmentId={toRate.id}
          professionalName={toRate.Professional.User.name}
          serviceTitle={toRate.Service.title}
          existingRating={toRate.rating}
          existingReview={toRate.review}
          onClose={() => setToRate(null)}
          onSuccess={() => fetchAppointments(role)}
        />
      ) : null}
    </ProfilePage>
  );
};

export default AvaliacoesTab;
