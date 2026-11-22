import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
import { Appointment } from '@stores/Appointment/types';
import { AppNavigation } from '@screens/types';

/** Etapas do atendimento em domicílio que continuam na tela de deslocamento. */
const ACTIVE_STEPS = ['in_transit', 'arrived', 'in_progress'];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** O atendimento em andamento ou, se não houver, o próximo confirmado de hoje. */
export function pickTodayVisit(
  appointments: Appointment[],
  now = new Date(),
): Appointment | null {
  const active = appointments.find((a) => ACTIVE_STEPS.includes(a.status));
  if (active) return active;
  return (
    appointments
      .filter(
        (a) =>
          a.status === 'confirmed' && isSameDay(new Date(a.start_time), now),
      )
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
      )[0] ?? null
  );
}

interface TodayVisitCardProps {
  appointments: Appointment[];
}

/** Atalho do painel do profissional para iniciar ou retomar o deslocamento. */
export function TodayVisitCard({ appointments }: TodayVisitCardProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<AppNavigation>();
  const visit = useMemo(() => pickTodayVisit(appointments), [appointments]);

  if (!visit) return null;

  const time = new Date(visit.start_time).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const resuming = ACTIVE_STEPS.includes(visit.status);
  const clientName = visit.Client?.User?.name || 'Cliente';

  return (
    <Pressable
      onPress={() =>
        navigation.navigate('DeslocamentoScreen', {
          appointmentId: visit.id,
          serviceTitle: visit.Service?.title,
          clientName,
          clientPhone: visit.Client?.User?.phone,
          startTime: `Hoje às ${time}`,
          status: visit.status,
        })
      }
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={
        resuming ? 'Retomar o atendimento' : 'Iniciar o deslocamento'
      }>
      <View style={styles.icon}>
        <FontAwesome name="car" size={20} color={colors.primaryWhite} />
      </View>
      <View style={styles.texts}>
        <Text style={styles.title}>
          {resuming ? 'Atendimento em andamento' : 'Atendimento de hoje'}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {visit.Service?.title || 'Serviço'} · {clientName} · {time}
        </Text>
      </View>
      <Text style={styles.action}>{resuming ? 'Retomar' : 'Vamos!'}</Text>
    </Pressable>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 16,
      marginBottom: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.primaryOrange,
      backgroundColor: colors.backgroundElevated,
    },
    pressed: { opacity: 0.8 },
    icon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryOrange,
    },
    texts: { flex: 1, minWidth: 0 },
    title: {
      fontSize: 16,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
    },
    action: {
      fontSize: 15,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryOrange,
    },
  });
