import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import InlineAlert from '@components/ui/InlineAlert';
import { getApiErrorMessage } from '@api/errors';
import { useAppointmentStore } from '@stores/Appointment';
import type { Dispute } from '@stores/Appointment/types';
import {
  AgendaRole,
  canCancel,
  canDispute,
  canMarkNoShow,
  canReschedule,
  centsToCurrency,
  formatDayLabel,
  formatTimeRange,
  pendingReschedule,
} from '@lib/appointments';
import { confirmAction } from '@lib/utils/confirmAction';
import { Appointment, AppointmentStatus } from '@stores/Appointment/types';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
import { CancelSheet } from './CancelSheet';
import { DisputeSheet, DISPUTE_REASON_LABELS } from './DisputeSheet';
import { RescheduleSheet } from './RescheduleSheet';

type Sheet = 'cancel' | 'reschedule' | 'dispute' | null;
type Busy = 'noshow' | 'accept' | 'decline' | null;

const DISPUTE_STATES = [
  AppointmentStatus.COMPLETED,
  AppointmentStatus.NO_SHOW,
  AppointmentStatus.CONFIRMED,
];

const RESOLUTION_LABELS: Record<string, string> = {
  refund_full: 'Reembolso total aprovado',
  refund_partial: 'Reembolso parcial aprovado',
  rejected: 'Disputa recusada',
};

const CANCELED_BY: Record<string, string> = {
  client: 'pelo cliente',
  professional: 'pelo profissional',
  system: 'automaticamente (sem resposta do profissional)',
};

interface Props {
  appointment: Appointment;
  role: AgendaRole;
  /** Chamado depois de qualquer acao que altere o agendamento. */
  onChanged: () => void;
}

/** Acoes de gestao (cancelar, reagendar, nao compareceu, disputa) e o que ja aconteceu. */
export function AppointmentManagePanel({
  appointment: a,
  role,
  onChanged,
}: Props) {
  const colors = useColors();
  const { getDispute, markNoShow, respondToReschedule } = useAppointmentStore();
  const styles = createStyles(colors);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dispute, setDispute] = useState<Dispute | null>(null);

  const reschedule = pendingReschedule(a, role);
  const showDispute = canDispute(a, role);

  // Descobre se ja existe disputa (para mostrar o andamento em vez do botao).
  useEffect(() => {
    setDispute(null);
    if (!a.payment_intent_id || !DISPUTE_STATES.includes(a.status)) return;
    let cancelled = false;
    getDispute(a.id)
      .then((data) => !cancelled && setDispute(data))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [a.id, a.status, a.payment_intent_id, getDispute]);

  const done = (message: string) => {
    setError(null);
    setNotice(message);
    onChanged();
  };

  const run = async (
    kind: Busy,
    action: () => Promise<void>,
    message: string,
  ) => {
    setBusy(kind);
    setError(null);
    setNotice(null);
    try {
      await action();
      done(message);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível concluir a ação.'));
    } finally {
      setBusy(null);
    }
  };

  const noShow = async () => {
    const ok = await confirmAction({
      title: 'Cliente não compareceu?',
      message:
        'O valor do serviço fica retido para você e o cliente é avisado. Ele poderá contestar em até 7 dias.',
      confirmLabel: 'Confirmar',
      destructive: true,
    });
    if (ok)
      await run(
        'noshow',
        () => markNoShow(a.id),
        'Não comparecimento registrado.',
      );
  };

  const button = (
    label: string,
    onPress: () => void,
    tone: 'default' | 'danger' = 'default',
    kind: Busy = null,
  ) => (
    <Pressable
      key={label}
      onPress={onPress}
      disabled={!!busy}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.action,
        tone === 'danger' && styles.actionDanger,
        (pressed || (busy && busy === kind)) && styles.dim,
      ]}>
      <Text
        style={[
          styles.actionText,
          tone === 'danger' && styles.actionDangerText,
        ]}>
        {label}
      </Text>
    </Pressable>
  );

  const actions: React.ReactNode[] = [];
  if (!reschedule && canReschedule(a)) {
    actions.push(button('Reagendar', () => setSheet('reschedule')));
  }
  if (canMarkNoShow(a, role)) {
    actions.push(button('Cliente não compareceu', noShow, 'danger', 'noshow'));
  }
  if (canCancel(a)) {
    actions.push(
      button('Cancelar agendamento', () => setSheet('cancel'), 'danger'),
    );
  }
  if (showDispute && !dispute) {
    actions.push(button('Abrir disputa', () => setSheet('dispute')));
  }

  const closedInfo = (() => {
    if (a.status === AppointmentStatus.CANCELED && a.canceled_by) {
      const money =
        a.retained_cents || a.refunded_cents
          ? ` Retido: ${centsToCurrency(a.retained_cents ?? 0)} · Devolvido: ${centsToCurrency(a.refunded_cents ?? 0)}.`
          : '';
      const reason = a.cancellation_reason
        ? ` Motivo: ${a.cancellation_reason}.`
        : '';
      return `Cancelado ${CANCELED_BY[a.canceled_by]}.${reason}${money}`;
    }
    if (a.status === AppointmentStatus.NO_SHOW) {
      return `Não comparecimento registrado. Valor retido: ${centsToCurrency(a.retained_cents ?? 0)}.`;
    }
    return null;
  })();

  return (
    <View style={styles.container}>
      {closedInfo ? <InlineAlert type="info">{closedInfo}</InlineAlert> : null}

      {reschedule ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            {reschedule === 'incoming'
              ? `${role === 'client' ? 'O profissional' : 'O cliente'} pediu para mudar para ${formatDayLabel(a.reschedule_requested_start!)}, ${formatTimeRange(a.reschedule_requested_start!)}.`
              : `Você pediu para mudar para ${formatDayLabel(a.reschedule_requested_start!)}, ${formatTimeRange(a.reschedule_requested_start!)}. Aguardando resposta.`}
          </Text>
          {reschedule === 'incoming' ? (
            <View style={styles.bannerActions}>
              {button('Recusar', () =>
                run(
                  'decline',
                  () => respondToReschedule(a.id, false),
                  'Pedido recusado.',
                ),
              )}
              {button('Aceitar novo horário', () =>
                run(
                  'accept',
                  () => respondToReschedule(a.id, true),
                  'Horário atualizado.',
                ),
              )}
            </View>
          ) : null}
        </View>
      ) : null}

      {dispute ? (
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>
            Disputa: {DISPUTE_REASON_LABELS[dispute.reason]}
          </Text>
          <Text style={styles.bannerText}>
            {dispute.status === 'open'
              ? 'Em análise pela equipe DelBicos.'
              : `${RESOLUTION_LABELS[dispute.resolution ?? ''] ?? 'Resolvida'}${
                  dispute.refund_cents
                    ? ` (${centsToCurrency(dispute.refund_cents)})`
                    : ''
                }.${dispute.resolution_note ? ` ${dispute.resolution_note}` : ''}`}
          </Text>
        </View>
      ) : null}

      {actions.length > 0 ? (
        <View style={styles.actions}>{actions}</View>
      ) : null}

      {notice ? <InlineAlert type="success">{notice}</InlineAlert> : null}
      {error ? <InlineAlert type="error">{error}</InlineAlert> : null}

      <CancelSheet
        visible={sheet === 'cancel'}
        appointment={a}
        role={role}
        onClose={() => setSheet(null)}
        onDone={done}
      />
      <RescheduleSheet
        visible={sheet === 'reschedule'}
        appointment={a}
        onClose={() => setSheet(null)}
        onDone={done}
      />
      <DisputeSheet
        visible={sheet === 'dispute'}
        appointment={a}
        onClose={() => setSheet(null)}
        onDone={(message) => {
          done(message);
          getDispute(a.id)
            .then(setDispute)
            .catch(() => undefined);
        }}
      />
    </View>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: { gap: 10, marginTop: 8 },
    banner: {
      padding: 12,
      borderRadius: 12,
      backgroundColor: colors.warningBackground,
      gap: 8,
    },
    bannerTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 15,
      color: colors.warningText,
    },
    bannerText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      lineHeight: 21,
      color: colors.warningText,
    },
    bannerActions: { flexDirection: 'row', gap: 8 },
    actions: { gap: 8 },
    action: {
      flex: 1,
      minHeight: 44,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: colors.primaryBlack,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionDanger: { borderColor: colors.errorText },
    actionText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    actionDangerText: { color: colors.errorText },
    dim: { opacity: 0.6 },
  });
