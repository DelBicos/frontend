import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AdminShell from '@components/layout/AdminShell';
import Chip, { ChipGroup } from '@components/ui/Chip';
import InlineAlert from '@components/ui/InlineAlert';
import { Sheet, SheetButton } from '@components/ui/Sheet';
import { DISPUTE_REASON_LABELS } from '@components/features/AppointmentManage/DisputeSheet';
import { useAdminStore } from '@stores/Admin';
import type {
  AdminDispute,
  DisputeResolution,
} from '@stores/Appointment/types';
import { getApiErrorMessage } from '@api/errors';
import { centsToCurrency } from '@lib/appointments';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';

type Filter = 'open' | 'resolved';

const RESOLUTION_LABELS: Record<DisputeResolution, string> = {
  refund_full: 'Reembolso total',
  refund_partial: 'Reembolso parcial',
  rejected: 'Recusada',
};

/** "12,50" ou "12.50" em reais para centavos; null se invalido. */
export function reaisToCents(input: string): number | null {
  const normalized = input.trim().replace(/\./g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}

export default function AdminDisputes() {
  const colors = useColors();
  const { listDisputes } = useAdminStore();
  const styles = createStyles(colors);
  const [filter, setFilter] = useState<Filter>('open');
  const [items, setItems] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminDispute | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listDisputes(filter));
    } catch (err) {
      setError(
        getApiErrorMessage(err, 'Não foi possível carregar as disputas.'),
      );
    } finally {
      setLoading(false);
    }
  }, [filter, listDisputes]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminShell
      title="Disputas"
      subtitle="Analise as contestações dos clientes e decida o reembolso.">
      <ChipGroup accessibilityLabel="Filtrar disputas" style={styles.filters}>
        <Chip
          label="Abertas"
          selected={filter === 'open'}
          onPress={() => setFilter('open')}
        />
        <Chip
          label="Resolvidas"
          selected={filter === 'resolved'}
          onPress={() => setFilter('resolved')}
        />
      </ChipGroup>

      {error ? <InlineAlert type="error">{error}</InlineAlert> : null}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primaryOrange}
          style={styles.loader}
        />
      ) : items.length === 0 ? (
        <Text style={styles.empty}>
          {filter === 'open'
            ? 'Nenhuma disputa aberta.'
            : 'Nenhuma disputa resolvida.'}
        </Text>
      ) : (
        <View style={styles.list}>
          {items.map((d) => (
            <DisputeCard
              key={d.id}
              dispute={d}
              onResolve={() => setSelected(d)}
            />
          ))}
        </View>
      )}

      {selected ? (
        <ResolveSheet
          dispute={selected}
          onClose={() => setSelected(null)}
          onDone={() => {
            setSelected(null);
            void load();
          }}
        />
      ) : null}
    </AdminShell>
  );
}

function DisputeCard({
  dispute: d,
  onResolve,
}: {
  dispute: AdminDispute;
  onResolve: () => void;
}) {
  const colors = useColors();
  const styles = createStyles(colors);
  const a = d.Appointment;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{a?.Service?.title ?? 'Serviço'}</Text>
      <Text style={styles.meta}>
        Cliente: {a?.Client?.User?.name ?? '—'} · Profissional:{' '}
        {a?.Professional?.User?.name ?? '—'}
      </Text>
      <Text style={styles.meta}>
        Agendamento #{a?.short_id} · aberta em{' '}
        {new Date(d.createdAt).toLocaleDateString('pt-BR')}
      </Text>
      <Text style={styles.reason}>{DISPUTE_REASON_LABELS[d.reason]}</Text>
      <Text style={styles.description}>{d.description}</Text>
      {d.status === 'open' ? (
        <View style={styles.actions}>
          <SheetButton label="Decidir" onPress={onResolve} />
        </View>
      ) : (
        <Text style={styles.resolved}>
          {d.resolution ? RESOLUTION_LABELS[d.resolution] : 'Resolvida'}
          {d.refund_cents ? ` · ${centsToCurrency(d.refund_cents)}` : ''}
          {d.resolution_note ? ` — ${d.resolution_note}` : ''}
        </Text>
      )}
    </View>
  );
}

function ResolveSheet({
  dispute,
  onClose,
  onDone,
}: {
  dispute: AdminDispute;
  onClose: () => void;
  onDone: () => void;
}) {
  const colors = useColors();
  const { resolveDispute } = useAdminStore();
  const styles = createStyles(colors);
  const [resolution, setResolution] =
    useState<DisputeResolution>('refund_full');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const refundCents =
      resolution === 'refund_partial'
        ? (reaisToCents(amount) ?? undefined)
        : undefined;
    if (resolution === 'refund_partial' && !refundCents) {
      setError('Informe o valor a devolver em reais (ex.: 25,00).');
      return;
    }
    if (resolution === 'rejected' && !note.trim()) {
      setError('Explique o motivo de recusar a disputa.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await resolveDispute(dispute.id, {
        resolution,
        refundCents,
        note: note.trim() || undefined,
      });
      onDone();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível resolver a disputa.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      visible
      title="Decidir disputa"
      onClose={onClose}
      footer={
        <>
          <SheetButton label="Voltar" variant="secondary" onPress={onClose} />
          <SheetButton
            label="Confirmar decisão"
            onPress={submit}
            loading={busy}
          />
        </>
      }>
      <ChipGroup accessibilityLabel="Decisão" style={styles.filters}>
        {(Object.keys(RESOLUTION_LABELS) as DisputeResolution[]).map((key) => (
          <Chip
            key={key}
            label={RESOLUTION_LABELS[key]}
            selected={resolution === key}
            onPress={() => setResolution(key)}
          />
        ))}
      </ChipGroup>
      {resolution === 'refund_partial' ? (
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="Valor a devolver (R$)"
          placeholderTextColor={colors.textTertiary}
          keyboardType="decimal-pad"
          style={styles.input}
          accessibilityLabel="Valor a devolver em reais"
        />
      ) : null}
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder={
          resolution === 'rejected'
            ? 'Motivo (obrigatório)'
            : 'Observação (opcional)'
        }
        placeholderTextColor={colors.textTertiary}
        multiline
        maxLength={1000}
        style={[styles.input, styles.multiline]}
        accessibilityLabel="Observação da decisão"
      />
      {error ? <InlineAlert type="error">{error}</InlineAlert> : null}
    </Sheet>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    filters: { marginBottom: 12 },
    loader: { marginTop: 32 },
    empty: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 24,
    },
    list: { gap: 12 },
    card: {
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
      gap: 4,
    },
    cardTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 18,
      color: colors.primaryBlack,
    },
    meta: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    reason: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.primaryBlack,
      marginTop: 8,
    },
    description: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      lineHeight: 22,
      color: colors.primaryBlack,
    },
    actions: { marginTop: 12, flexDirection: 'row' },
    resolved: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 15,
      color: colors.successText,
      marginTop: 8,
    },
    input: {
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.inputBackground,
      color: colors.primaryBlack,
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      marginBottom: 12,
    },
    multiline: { minHeight: 80, textAlignVertical: 'top' },
  });
