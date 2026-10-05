import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Chip, { ChipGroup } from '@components/ui/Chip';
import InlineAlert from '@components/ui/InlineAlert';
import { getApiErrorMessage } from '@api/errors';
import { useAppointmentStore } from '@stores/Appointment';
import type { DisputeReason } from '@stores/Appointment/types';
import { Appointment, AppointmentStatus } from '@stores/Appointment/types';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
import { Sheet, SheetButton } from './Sheet';

const MIN_DESCRIPTION = 10;
const MAX_DESCRIPTION = 1000;

export const DISPUTE_REASON_LABELS: Record<DisputeReason, string> = {
  service_not_done: 'Serviço não foi feito',
  poor_quality: 'Serviço com problemas',
  wrong_charge: 'Cobrança incorreta',
  wrong_no_show: 'Eu compareci',
  professional_absent: 'Profissional não apareceu',
  other: 'Outro motivo',
};

/** Motivos que fazem sentido para o estado do agendamento. */
export function reasonsFor(status: AppointmentStatus): DisputeReason[] {
  switch (status) {
    case AppointmentStatus.NO_SHOW:
      return ['wrong_no_show', 'other'];
    case AppointmentStatus.CONFIRMED:
      return ['professional_absent', 'other'];
    default:
      return ['service_not_done', 'poor_quality', 'wrong_charge', 'other'];
  }
}

interface DisputeSheetProps {
  visible: boolean;
  appointment: Appointment;
  onClose: () => void;
  onDone: (message: string) => void;
}

export function DisputeSheet({
  visible,
  appointment,
  onClose,
  onDone,
}: DisputeSheetProps) {
  const colors = useColors();
  const { openDispute } = useAppointmentStore();
  const styles = createStyles(colors);
  const reasons = reasonsFor(appointment.status);
  const [reason, setReason] = useState<DisputeReason>(reasons[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (description.trim().length < MIN_DESCRIPTION) {
      setError(
        `Descreva o que aconteceu (mínimo de ${MIN_DESCRIPTION} caracteres).`,
      );
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await openDispute(appointment.id, {
        reason,
        description: description.trim(),
      });
      onDone('Disputa aberta. Nossa equipe vai analisar e você será avisado.');
      setDescription('');
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível abrir a disputa.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      visible={visible}
      title="Abrir disputa"
      onClose={onClose}
      footer={
        <>
          <SheetButton label="Voltar" variant="secondary" onPress={onClose} />
          <SheetButton label="Enviar disputa" onPress={submit} loading={busy} />
        </>
      }>
      <Text style={styles.text}>
        Se algo saiu errado com “{appointment.Service?.title}”, conte para nós.
        A equipe analisa o caso e pode devolver parte ou todo o valor.
      </Text>
      <Text style={styles.label}>O que aconteceu?</Text>
      <ChipGroup accessibilityLabel="Motivo da disputa" style={styles.chips}>
        {reasons.map((key) => (
          <Chip
            key={key}
            label={DISPUTE_REASON_LABELS[key]}
            selected={reason === key}
            onPress={() => setReason(key)}
          />
        ))}
      </ChipGroup>
      <Text style={styles.label}>Descrição</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        maxLength={MAX_DESCRIPTION}
        multiline
        placeholder="Explique com detalhes"
        placeholderTextColor={colors.textTertiary}
        style={styles.input}
        accessibilityLabel="Descrição da disputa"
      />
      <View>
        {error ? <InlineAlert type="error">{error}</InlineAlert> : null}
      </View>
    </Sheet>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    text: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      lineHeight: 22,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    label: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 15,
      color: colors.primaryBlack,
      marginBottom: 6,
    },
    chips: { marginBottom: 12 },
    input: {
      minHeight: 96,
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
