import { AppointmentCard } from '@components/features/AppointmentCard';
import { AppointmentDetailsModal } from '@components/features/AppointmentDetailsModal';
import { RateServiceModal } from '@components/features/RateServiceModal';
import { Button } from '@components/ui/Button';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppointmentStore } from '@stores/Appointment';
import { Appointment, AppointmentStatus } from '@stores/Appointment/types';
import { useFavoriteStore } from '@stores/Favorite';
import { useUserStore } from '@stores/User';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { createStyles } from './styles';

const appointmentStatusRenderInfo = (
  colors: ColorsType,
): {
  [key in AppointmentStatus]: {
    label: string;
    icon: keyof typeof FontAwesome.glyphMap;
    color: string;
    emptyText: string;
  };
} => ({
  [AppointmentStatus.PENDING]: {
    label: 'Pendente',
    icon: 'clock-o',
    color: colors.primaryOrange,
    emptyText: 'Você não tem agendamentos a serem confirmados.',
  },
  [AppointmentStatus.CONFIRMED]: {
    label: 'Confirmado',
    icon: 'check-circle-o',
    color: colors.primaryGreen,
    emptyText: 'Você não tem agendamentos futuros confirmados.',
  },
  [AppointmentStatus.COMPLETED]: {
    label: 'Histórico',
    icon: 'check-circle-o',
    color: colors.primaryBlue,
    emptyText: 'Nenhum agendamento realizado ainda.',
  },
  [AppointmentStatus.CANCELED]: {
    label: 'Cancelado',
    icon: 'times-circle',
    color: '#FF0000',
    emptyText: 'Nenhum agendamento cancelado.',
  },
});

const appointmentStatusRenderOrder: AppointmentStatus[] = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.COMPLETED,
  AppointmentStatus.CANCELED,
];

interface MeusAgendamentosProps {
  role?: 'client' | 'professional';
}

function MeusAgendamentos({ role }: MeusAgendamentosProps = {}) {
  const {
    appointments,
    appointmentsByStatus,
    fetchAppointments,
    updateAppointmentStatus,
  } = useAppointmentStore();
  const { addFavorite, removeFavorite, isFavorite } = useFavoriteStore();
  const { user } = useUserStore();
  const colors = useColors();
  const styles = createStyles(colors);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRateModalVisible, setIsRateModalVisible] = useState(false);
  const [appointmentToRate, setAppointmentToRate] =
    useState<Appointment | null>(null);

  const [activeFilter, setActiveFilter] = useState<'all' | AppointmentStatus>(
    'all',
  );

  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      fetchAppointments(role);

      // Polling: Atualiza os agendamentos automaticamente a cada 30 segundos
      const interval = setInterval(() => {
        fetchAppointments(role);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user, fetchAppointments, role]);

  const proximosAgendamentos = useMemo(() => {
    return appointments
      .filter((apt) => apt.status === 'pending' || apt.status === 'confirmed')
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
      );
  }, [appointments]);

  const agendamentosRealizados = useMemo(() => {
    return appointments
      .filter((apt) => apt.status === 'completed')
      .sort(
        (a, b) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
      );
  }, [appointments]);

  if (!user) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
            minHeight: 400,
          },
        ]}>
        <FontAwesome
          name="calendar-check-o"
          size={56}
          color={colors.primaryOrange}
          style={{ marginBottom: 16 }}
        />
        <Text
          style={{
            fontSize: 22,
            fontFamily: 'Afacad-Bold',
            color: colors.primaryBlack,
            textAlign: 'center',
            marginBottom: 8,
          }}>
          Acompanhe seus Agendamentos
        </Text>
        <Text
          style={{
            fontSize: 15,
            fontFamily: 'Afacad-Regular',
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: 24,
            maxWidth: 320,
            lineHeight: 22,
          }}>
          Para visualizar seus compromissos, solicitar novos serviços ou ver seu
          histórico, faça login.
        </Text>
        <Button
          colorVariant="primaryOrange"
          sizeVariant="default"
          fontVariant="AfacadBold16"
          onPress={() => (navigation as any).navigate('Login')}>
          Entrar ou Cadastrar-se
        </Button>
      </View>
    );
  }

  const handleToggleFavorite = (appointment: Appointment) => {
    const professionalId = appointment.Professional.id;
    if (isFavorite(professionalId)) {
      removeFavorite(professionalId);
    } else {
      addFavorite({
        professionalId,
        professionalName: appointment.Professional.User.name,
        professionalAvatar:
          appointment.Professional.User.avatar_uri || undefined,
        category: appointment.Service.Subcategory?.name,
        serviceTitle: appointment.Service.title,
        addedAt: new Date().toISOString(),
      });
    }
  };

  const handleAccept = async () => {
    if (!selectedAppointment) return;
    const success = await updateAppointmentStatus(
      selectedAppointment.id,
      AppointmentStatus.CONFIRMED,
    );
    if (success) {
      setIsModalVisible(false);
    } else {
      // Alert.alert('Erro', 'Não foi possível aceitar o agendamento.');
    }
  };

  const handleReject = async () => {
    if (!selectedAppointment) return;
    const success = await updateAppointmentStatus(
      selectedAppointment.id,
      AppointmentStatus.CANCELED,
    );
    if (success) {
      setIsModalVisible(false);
    } else {
      // Alert.alert('Erro', 'Não foi possível recusar o agendamento.');
    }
  };

  const EmptyState = ({ text }: { text: string }) => (
    <View style={styles.emptyContainer}>
      <FontAwesome
        name="calendar-o"
        size={40}
        color={colors.textTertiary}
        style={{ marginBottom: 12 }}
      />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.pageTitle}>Meus Agendamentos</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            activeFilter === 'all' && styles.filterChipActive,
          ]}
          onPress={() => setActiveFilter('all')}>
          <Text
            style={[
              styles.filterText,
              activeFilter === 'all' && styles.filterTextActive,
            ]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            activeFilter === AppointmentStatus.PENDING &&
              styles.filterChipActive,
          ]}
          onPress={() => setActiveFilter(AppointmentStatus.PENDING)}>
          <Text
            style={[
              styles.filterText,
              activeFilter === AppointmentStatus.PENDING &&
                styles.filterTextActive,
            ]}>
            Pendentes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            activeFilter === AppointmentStatus.CONFIRMED &&
              styles.filterChipActive,
          ]}
          onPress={() => setActiveFilter(AppointmentStatus.CONFIRMED)}>
          <Text
            style={[
              styles.filterText,
              activeFilter === AppointmentStatus.CONFIRMED &&
                styles.filterTextActive,
            ]}>
            Confirmados
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            activeFilter === AppointmentStatus.COMPLETED &&
              styles.filterChipActive,
          ]}
          onPress={() => setActiveFilter(AppointmentStatus.COMPLETED)}>
          <Text
            style={[
              styles.filterText,
              activeFilter === AppointmentStatus.COMPLETED &&
                styles.filterTextActive,
            ]}>
            Histórico
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            activeFilter === AppointmentStatus.CANCELED &&
              styles.filterChipActive,
          ]}
          onPress={() => setActiveFilter(AppointmentStatus.CANCELED)}>
          <Text
            style={[
              styles.filterText,
              activeFilter === AppointmentStatus.CANCELED &&
                styles.filterTextActive,
            ]}>
            Cancelados
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {appointmentStatusRenderOrder
        .filter((status) => activeFilter === 'all' || status === activeFilter)
        .map((status) => {
          const renderInfo = appointmentStatusRenderInfo(colors)[status];
          const appointmentInfo = appointmentsByStatus[status] || [];

          return (
            <View key={status} style={styles.section}>
              <View
                style={[
                  styles.sectionHeader,
                  { backgroundColor: renderInfo.color },
                ]}>
                <FontAwesome
                  name={renderInfo.icon}
                  size={18}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.sectionTitle}>{renderInfo.label}</Text>
              </View>

              {appointmentInfo.length === 0 ? (
                <EmptyState text={renderInfo.emptyText} />
              ) : (
                <View style={styles.grid}>
                  {appointmentInfo.map((apt) => (
                    <View
                      key={apt.id}
                      style={[styles.gridItem, isDesktop && { width: '48%' }]}>
                      <AppointmentCard
                        statusLabel={renderInfo.label}
                        statusColor={renderInfo.color}
                        appointment={apt}
                        statusVariant={status}
                        isFavorite={isFavorite(apt.Professional.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onOpenDetails={() => {
                          setSelectedAppointment(apt);
                          setIsModalVisible(true);
                        }}
                        onOpenRate={
                          status === AppointmentStatus.COMPLETED
                            ? () => {
                                setAppointmentToRate(apt);
                                setIsRateModalVisible(true);
                              }
                            : undefined
                        }
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

      <AppointmentDetailsModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        appointment={selectedAppointment}
        onCancel={() => fetchAppointments(role)}
        onAccept={
          user?.id === selectedAppointment?.Professional?.user_id
            ? handleAccept
            : undefined
        }
        onReject={
          user?.id === selectedAppointment?.Professional?.user_id
            ? handleReject
            : undefined
        }
      />

      {appointmentToRate && (
        <RateServiceModal
          visible={isRateModalVisible}
          appointmentId={appointmentToRate.id}
          professionalName={appointmentToRate.Professional.User.name}
          serviceTitle={appointmentToRate.Service.title}
          existingRating={appointmentToRate.rating}
          existingReview={appointmentToRate.review}
          onClose={() => setIsRateModalVisible(false)}
          onSuccess={() => fetchAppointments(role)}
        />
      )}
    </ScrollView>
  );
}

export default MeusAgendamentos;
