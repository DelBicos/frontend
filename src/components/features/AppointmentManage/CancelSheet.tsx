import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import InlineAlert from '@components/ui/InlineAlert';
import { getApiErrorMessage } from '@api/errors';
import { useAppointmentStore } from '@stores/Appointment';
import type { CancellationOutcome } from '@stores/Appointment/types';
import { AgendaRole, centsToCurrency } from '@lib/appointments';
import { Appointment } from '@stores/Appointment/types';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
import { Sheet, SheetButton } from '@components/ui/Sheet';

const MAX_REASON = 500;

/** Texto da faixa da politica de cancelamento, com os valores reais. */
export function describeCancellation(
  outcome: CancellationOutcome,
  role: AgendaRole,
  paid: boolean,
): string {
  if (!paid) {
    return 'Este agendamento ainda não foi pago, então não há nenhuma cobrança.';
  }
  const refund = centsToCurrency(outcome.refundCents);
  const retained = centsToCurrency(outcome.retainedCents);
  switch (outcome.tier) {
    case 'unconfirmed':
      return 'O profissional ainda não aceitou o pedido, então nada foi cobrado. A reserva no cartão será liberada.';
    case 'free':
      return `Cancelamento gratuito (mais de 24h de antecedência). Você recebe ${refund} de volta.`;
    case 'mid':
      return `Faltam menos de 24h. O profissional retém ${outcome.retentionPercent}% (${retained}) pelo horário reservado e você recebe ${refund} de volta.`;
    case 'late':
      return `Faltam menos de 2h. O profissional retém ${outcome.retentionPercent}% (${retained}) e você recebe ${refund} de volta.`;
    case 'full_refund':
    default:
      return role === 'professional'
        ? `O cliente recebe o reembolso total (${refund}). Como o serviço já estava aceito, o cancelamento fica registrado no seu perfil.`
        : `Você recebe o reembolso total (${refund}).`;
  }
}

interface CancelSheetProps {
  visible: boolean;
  appointment: Appointment;
  role: AgendaRole;
  onClose: () => void;
  onDone: (message: string) => void;
}

export function CancelSheet({
  visible,
  appointment,
  role,
  onClose,
  onDone,
}: CancelSheetProps) {
  const colors = useColors();
  const { previewCancellation, cancelAppointment } = useAppointmentStore();
  const styles = createStyles(colors);
  const [outcome, setOutcome] = useState<CancellationOutcome | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setOutcome(null);
    setError(null);
    setReason('');
    previewCancellation(appointment.id)
      .then((data) => !cancelled && setOutcome(data))
      .catch((err) => {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              err,
              'Não foi possível calcular o valor do cancelamento.',
            ),
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [visible, appointment.id, previewCancellation]);

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await cancelAppointment(appointment.id, reason);
      onDone('Agendamento cancelado.');
      onClose();
    } catch (err) {
      setError(
        getApiErrorMessage(err, 'Não foi possível cancelar. Tente novamente.'),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      visible={visible}
      title="Cancelar agendamento"
      onClose={onClose}
      footer={
        <>
          <SheetButton label="Voltar" variant="secondary" onPress={onClose} />
          <SheetButton
            label="Cancelar agendamento"
            variant="danger"
            onPress={confirm}
            loading={busy}
            disabled={!outcome}
          />
        </>
      }>
      <Text style={styles.service}>{appointment.Service?.title}</Text>
      {outcome ? (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {describeCancellation(
              outcome,
              role,
              !!appointment.payment_intent_id,
            )}
          </Text>
        </View>
      ) : !error ? (
        <ActivityIndicator color={colors.primaryOrange} style={styles.loader} />
      ) : null}

      <Text style={styles.label}>Motivo (opcional)</Text>
      <TextInput
        value={reason}
        onChangeText={setReason}
        maxLength={MAX_REASON}
        multiline
        placeholder="Conte brevemente o que aconteceu"
        placeholderTextColor={colors.textTertiary}
        style={styles.input}
        accessibilityLabel="Motivo do cancelamento"
      />
      {error ? <InlineAlert type="error">{error}</InlineAlert> : null}
    </Sheet>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    service: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    summary: {
      padding: 12,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
      marginBottom: 16,
    },
    summaryText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      lineHeight: 22,
      color: colors.primaryBlack,
    },
    loader: { marginVertical: 16 },
    label: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 15,
      color: colors.primaryBlack,
      marginBottom: 6,
    },
    input: {
      minHeight: 72,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.inputBackground,
      color: colors.primaryBlack,
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      textAlignVertical: 'top',
      marginBottom: 12,
    },
  });
