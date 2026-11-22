import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { EncodingType } from 'expo-file-system/legacy';
import { AppointmentDetailsModal } from '@components/features/AppointmentDetailsModal';
import { RateServiceModal } from '@components/features/RateServiceModal';
import ActionButton from '@components/ui/ActionButton';
import EmptyState from '@components/ui/EmptyState';
import InlineAlert from '@components/ui/InlineAlert';
import {
  generateCSV,
  generateFileURI,
  generateXLSX,
} from '@lib/helpers/fileGenerator';
import { downloadFile, shareContent } from '@lib/helpers/shareHelperSimple';
import { appointmentPrice, formatCurrency } from '@lib/appointments';
import { useAppointmentStore } from '@stores/Appointment';
import { Appointment } from '@stores/Appointment/types';
import { useColors } from '@theme/ThemeProvider';
import ProfilePage, { ProfileCard } from '../../components/ProfilePage';
import { createStyles } from './styles';

type Role = 'client' | 'professional';

const monthLabel = (month: number, year: number) => {
  const text = new Date(year, month).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

/** Atendimentos concluidos/cancelados por mes, com resumo e exportacao. */
export default function HistoricoCompras({
  role = 'client',
}: { role?: Role } = {}) {
  const colors = useColors();
  const styles = createStyles(colors);
  const isClient = role === 'client';
  const { appointments, fetchAppointments, fetchAppointmentsAsSheet } =
    useAppointmentStore();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [details, setDetails] = useState<Appointment | null>(null);
  const [toRate, setToRate] = useState<Appointment | null>(null);
  const [exporting, setExporting] = useState<'csv' | 'xlsx' | null>(null);
  const [exportMsg, setExportMsg] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchAppointments(role);
  }, [fetchAppointments, role]);

  const items = useMemo(
    () =>
      appointments
        .filter((a) => a.status === 'completed' || a.status === 'canceled')
        .filter((a) => {
          const d = new Date(a.start_time);
          return d.getMonth() === month && d.getFullYear() === year;
        })
        .sort(
          (a, b) =>
            new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
        ),
    [appointments, month, year],
  );

  const completed = items.filter((a) => a.status === 'completed');
  const total = completed.reduce(
    (sum, a) => sum + (appointmentPrice(a) ?? 0),
    0,
  );
  const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setMonth(d.getMonth());
    setYear(d.getFullYear());
  };

  const exportFile = async (type: 'csv' | 'xlsx') => {
    setExporting(type);
    setExportMsg(null);
    try {
      const rows = await fetchAppointmentsAsSheet(role);
      if (rows.length === 0) {
        setExportMsg({
          type: 'info',
          text: 'Ainda não há dados para exportar.',
        });
        return;
      }
      const table = [Object.keys(rows[0]), ...rows.map(Object.values)];
      const fileName = `historico_delbicos_${new Date().toISOString().split('T')[0]}`;
      let uri: string | null = null;
      if (type === 'csv') {
        const content = await generateCSV(table);
        if (content) {
          uri = await generateFileURI(content, `${fileName}.csv`, 'text/csv');
        }
      } else {
        const content = await generateXLSX([
          { title: 'Histórico', sheetData: table },
        ]);
        if (content) {
          uri = await generateFileURI(
            content,
            `${fileName}.xlsx`,
            'application/octet-stream',
            EncodingType.Base64,
          );
        }
      }
      if (!uri) throw new Error('arquivo');
      const shared = await shareContent(uri);
      if (!shared && Platform.OS === 'web') {
        await downloadFile(uri, `${fileName}.${type}`);
      }
      setExportMsg({ type: 'success', text: 'Arquivo gerado.' });
    } catch {
      setExportMsg({
        type: 'error',
        text: 'Não foi possível gerar o arquivo. Tente de novo.',
      });
    } finally {
      setExporting(null);
    }
  };

  const counterpart = (a: Appointment) =>
    isClient ? a.Professional?.User?.name : a.Client?.User?.name;

  return (
    <ProfilePage
      title="Histórico"
      subtitle={
        isClient
          ? 'Atendimentos concluídos e cancelados, mês a mês.'
          : 'Seus trabalhos e ganhos, mês a mês.'
      }>
      <View style={styles.monthBar}>
        <Pressable
          onPress={() => shiftMonth(-1)}
          style={styles.monthArrow}
          accessibilityRole="button"
          accessibilityLabel="Mês anterior">
          <FontAwesome
            name="chevron-left"
            size={16}
            color={colors.primaryBlack}
          />
        </Pressable>
        <Text style={styles.monthText} accessibilityLiveRegion="polite">
          {monthLabel(month, year)}
        </Text>
        <Pressable
          onPress={() => shiftMonth(1)}
          disabled={isCurrentMonth}
          style={[styles.monthArrow, isCurrentMonth && styles.monthArrowOff]}
          accessibilityRole="button"
          accessibilityLabel="Próximo mês"
          accessibilityState={{ disabled: isCurrentMonth }}>
          <FontAwesome
            name="chevron-right"
            size={16}
            color={colors.primaryBlack}
          />
        </Pressable>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatCurrency(total)}</Text>
          <Text style={styles.statLabel}>
            {isClient ? 'gasto no mês' : 'ganho no mês'}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{completed.length}</Text>
          <Text style={styles.statLabel}>
            {completed.length === 1 ? 'concluído' : 'concluídos'}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {items.length - completed.length}
          </Text>
          <Text style={styles.statLabel}>
            {items.length - completed.length === 1 ? 'cancelado' : 'cancelados'}
          </Text>
        </View>
      </View>

      {items.length === 0 ? (
        <EmptyState
          icon="history"
          title="Nada neste mês"
          text="Use as setas para ver outros meses."
        />
      ) : (
        <View style={styles.list}>
          {items.map((a, i) => {
            const done = a.status === 'completed';
            const price = appointmentPrice(a);
            return (
              <View key={a.id} style={[styles.row, i > 0 && styles.rowDivider]}>
                <View style={styles.date}>
                  <Text style={styles.dateText}>{dayLabel(a.start_time)}</Text>
                </View>
                <View style={styles.rowTexts}>
                  <Text style={styles.service} numberOfLines={1}>
                    {a.Service?.title}
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {counterpart(a)}
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      done ? styles.badgeDone : styles.badgeCanceled,
                    ]}>
                    <Text
                      style={[
                        styles.badgeText,
                        { color: done ? colors.successText : colors.errorText },
                      ]}>
                      {done ? 'Concluído' : 'Cancelado'}
                    </Text>
                  </View>
                </View>
                <View style={styles.rowEnd}>
                  <Text style={[styles.price, !done && styles.priceCanceled]}>
                    {price != null ? formatCurrency(price) : '—'}
                  </Text>
                  <View style={styles.rowActions}>
                    <ActionButton
                      label="Detalhes"
                      variant="ghost"
                      size="sm"
                      onPress={() => setDetails(a)}
                      accessibilityLabel={`Detalhes de ${a.Service?.title}`}
                    />
                    {isClient && done && !a.rating ? (
                      <ActionButton
                        label="Avaliar"
                        size="sm"
                        onPress={() => setToRate(a)}
                      />
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.exportBlock}>
        <ProfileCard title="Exportar histórico completo">
          <Text style={styles.exportText}>
            Todos os atendimentos, de todos os meses, numa planilha.
          </Text>
          {exportMsg ? (
            <InlineAlert type={exportMsg.type}>{exportMsg.text}</InlineAlert>
          ) : null}
          <View style={styles.exportActions}>
            <ActionButton
              label="Excel (.xlsx)"
              icon="file-excel-o"
              variant="secondary"
              onPress={() => exportFile('xlsx')}
              loading={exporting === 'xlsx'}
              disabled={!!exporting}
            />
            <ActionButton
              label="CSV"
              icon="file-text-o"
              variant="secondary"
              onPress={() => exportFile('csv')}
              loading={exporting === 'csv'}
              disabled={!!exporting}
            />
          </View>
        </ProfileCard>
      </View>

      <AppointmentDetailsModal
        visible={!!details}
        onClose={() => setDetails(null)}
        appointment={details}
      />
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
}
