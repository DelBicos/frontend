import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import Chip, { ChipGroup } from '@components/ui/Chip';
import InlineAlert from '@components/ui/InlineAlert';
import { useColors } from '@theme/ThemeProvider';
import AdminShell from '../components/AdminShell';
import ChartCard from '../components/ChartCard';
import { useAdminStats } from '../components/useAdminStats';
import {
  formatCount,
  formatMoney,
  MONTH_LABELS,
  STATUS_LABELS,
} from '../components/format';

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

/** Graficos mensais do ano escolhido. */
const AdminAnalytics: React.FC = () => {
  const colors = useColors();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const { stats, loading, error } = useAdminStats(year);

  const chartConfig = useMemo(
    () => ({
      backgroundGradientFrom: colors.cardBackground,
      backgroundGradientTo: colors.cardBackground,
      decimalPlaces: 0,
      color: () => colors.primaryBlue,
      labelColor: () => colors.textSecondary,
      propsForBackgroundLines: { stroke: colors.borderColor },
      propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primaryOrange },
    }),
    [colors],
  );

  const years = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <AdminShell
      title="Analytics"
      subtitle="Como a plataforma evolui mês a mês.">
      <ChipGroup accessibilityLabel="Ano" style={styles.years}>
        {years.map((y) => (
          <Chip
            key={y}
            label={String(y)}
            selected={y === year}
            onPress={() => setYear(y)}
          />
        ))}
      </ChipGroup>

      {error ? <InlineAlert type="error">{error}</InlineAlert> : null}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primaryOrange} />
      ) : null}

      {stats && !loading ? (
        <View style={styles.grid}>
          <ChartCard
            title="Valor movimentado por mês"
            summary={`Total no ano: ${formatMoney(stats.kpis.revenue)}`}>
            {(width) => (
              <BarChart
                data={{
                  labels: MONTH_LABELS,
                  datasets: [{ data: stats.revenueByMonth }],
                }}
                width={width}
                height={220}
                yAxisLabel="R$ "
                yAxisSuffix=""
                chartConfig={{
                  ...chartConfig,
                  color: () => colors.successText,
                }}
                fromZero
                withInnerLines
              />
            )}
          </ChartCard>

          <ChartCard
            title="Agendamentos por situação"
            summary={(
              Object.keys(STATUS_LABELS) as (keyof typeof STATUS_LABELS)[]
            )
              .map(
                (k) =>
                  `${STATUS_LABELS[k]}: ${formatCount(stats.statusTotals[k])}`,
              )
              .join('. ')}
            legend={[
              { color: colors.successText, label: STATUS_LABELS.completed },
              { color: colors.warningText, label: STATUS_LABELS.confirmed },
              { color: colors.errorText, label: STATUS_LABELS.canceled },
            ]}>
            {(width) => (
              <LineChart
                data={{
                  labels: MONTH_LABELS,
                  datasets: [
                    {
                      data: stats.appointmentsByMonth.completed,
                      color: () => colors.successText,
                    },
                    {
                      data: stats.appointmentsByMonth.confirmed,
                      color: () => colors.warningText,
                    },
                    {
                      data: stats.appointmentsByMonth.canceled,
                      color: () => colors.errorText,
                    },
                  ],
                }}
                width={width}
                height={220}
                chartConfig={chartConfig}
                bezier
                fromZero
                withInnerLines
              />
            )}
          </ChartCard>

          <ChartCard
            title="Novos usuários"
            summary={`${formatCount(sum(stats.usersByMonth))} no ano`}>
            {(width) => (
              <BarChart
                data={{
                  labels: MONTH_LABELS,
                  datasets: [{ data: stats.usersByMonth }],
                }}
                width={width}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  ...chartConfig,
                  color: () => colors.primaryOrange,
                }}
                fromZero
                withInnerLines
              />
            )}
          </ChartCard>

          <ChartCard
            title="Novos profissionais"
            summary={`${formatCount(sum(stats.professionalsByMonth))} no ano`}>
            {(width) => (
              <BarChart
                data={{
                  labels: MONTH_LABELS,
                  datasets: [{ data: stats.professionalsByMonth }],
                }}
                width={width}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  ...chartConfig,
                  color: () => colors.warningText,
                }}
                fromZero
                withInnerLines
              />
            )}
          </ChartCard>
        </View>
      ) : null}
    </AdminShell>
  );
};

const styles = StyleSheet.create({
  years: { marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
});

export default AdminAnalytics;
