import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import InlineAlert from '@components/ui/InlineAlert';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
import AdminShell from '../components/AdminShell';
import StatCard from '../components/StatCard';
import { useAdminStats } from '../components/useAdminStats';
import { formatCount, formatMoney, STATUS_LABELS } from '../components/format';

import { useNavigation } from '@react-navigation/native';
import type { AppNavigation } from '@screens/types';
/** Visao geral: o que precisa de atencao agora e os numeros do ano. */
export default function AdminDashboard() {
  const navigation = useNavigation<AppNavigation>();
  const colors = useColors();
  const styles = createStyles(colors);
  const { stats, loading, error } = useAdminStats();

  const queues = stats?.queues;
  const kpis = stats?.kpis;

  return (
    <AdminShell
      title="Painel administrativo"
      subtitle="O que precisa da sua decisão e um resumo do DelBicos.">
      {error ? <InlineAlert type="error">{error}</InlineAlert> : null}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primaryOrange} />
      ) : null}

      {stats && queues && kpis ? (
        <>
          <Text style={styles.section} accessibilityRole="header">
            Aguardando você
          </Text>
          <View style={styles.row}>
            <StatCard
              label="Disputas abertas"
              value={formatCount(queues.openDisputes)}
              hint={
                queues.openDisputes ? 'Decida o reembolso' : 'Nenhuma pendente'
              }
              attention={queues.openDisputes > 0}
              onPress={() => navigation.navigate('AdminDisputes')}
            />
            <StatCard
              label="Verificações em análise"
              value={formatCount(queues.pendingVerifications)}
              hint={
                queues.pendingVerifications
                  ? 'Confira documento e selfie'
                  : 'Nenhuma pendente'
              }
              attention={queues.pendingVerifications > 0}
              onPress={() => navigation.navigate('AdminVerifications')}
            />
          </View>

          <Text style={styles.section} accessibilityRole="header">
            {`Resumo de ${stats.year}`}
          </Text>
          <View style={styles.row}>
            <StatCard
              label="Valor movimentado"
              value={formatMoney(kpis.revenue)}
              hint="Serviços concluídos e valores retidos"
            />
            <StatCard
              label="Agendamentos"
              value={formatCount(kpis.appointments)}
              hint={`${formatCount(kpis.completed)} concluídos`}
            />
            <StatCard
              label="Avaliação média"
              value={
                kpis.averageRating === null
                  ? '—'
                  : kpis.averageRating.toFixed(1).replace('.', ',')
              }
              hint={`${formatCount(kpis.ratingsCount)} avaliações`}
            />
          </View>
          <View style={[styles.row, styles.gap]}>
            <StatCard
              label="Usuários"
              value={formatCount(kpis.totalUsers)}
              hint="Cadastrados na plataforma"
            />
            <StatCard
              label="Profissionais"
              value={formatCount(kpis.totalProfessionals)}
              hint={`${formatCount(kpis.verifiedProfessionals)} verificados`}
            />
          </View>

          <Text style={styles.section} accessibilityRole="header">
            Agendamentos por situação
          </Text>
          <View style={styles.card}>
            {(Object.keys(STATUS_LABELS) as (keyof typeof STATUS_LABELS)[]).map(
              (key) => (
                <View key={key} style={styles.statusRow}>
                  <Text style={styles.statusLabel}>{STATUS_LABELS[key]}</Text>
                  <Text style={styles.statusValue}>
                    {formatCount(stats.statusTotals[key])}
                  </Text>
                </View>
              ),
            )}
          </View>
        </>
      ) : null}
    </AdminShell>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    section: {
      fontFamily: 'Afacad-Bold',
      fontSize: 22,
      color: colors.primaryBlack,
      marginTop: 8,
      marginBottom: 12,
    },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    gap: { marginTop: 16, marginBottom: 8 },
    card: {
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderColor,
    },
    statusLabel: {
      fontFamily: 'Afacad-Regular',
      fontSize: 17,
      color: colors.primaryBlack,
    },
    statusValue: {
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
      color: colors.primaryBlack,
    },
  });
