import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Chip, { ChipGroup } from '@components/ui/Chip';
import InlineAlert from '@components/ui/InlineAlert';
import { getApiErrorMessage } from '@api/errors';
import { getRescheduleSlots, requestReschedule } from '@api/appointments';
import {
  formatLongDate,
  formatShortDay,
  isSlotBookable,
  minBookingDate,
  nextDays,
  slotDate,
} from '@lib/booking';
import { RESCHEDULE_MIN_HOURS } from '@lib/appointments';
import { Appointment } from '@stores/Appointment/types';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
import { Sheet, SheetButton } from './Sheet';

/** Quantos dias a frente o cliente pode escolher. */
const DAYS_AHEAD = 14;

interface RescheduleSheetProps {
  visible: boolean;
  appointment: Appointment;
  onClose: () => void;
  onDone: (message: string) => void;
}

export function RescheduleSheet({
  visible,
  appointment,
  onClose,
  onDone,
}: RescheduleSheetProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const days = useMemo(
    () => (visible ? nextDays(minBookingDate(), DAYS_AHEAD) : []),
    [visible],
  );
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Ao abrir, recomeca a escolha.
  useEffect(() => {
    if (!visible) return;
    setDay(null);
    setTime(null);
    setSlots(null);
    setError(null);
  }, [visible]);

  // Carrega os horarios livres do dia escolhido.
  useEffect(() => {
    if (!visible || !day) return;
    let cancelled = false;
    setSlots(null);
    setTime(null);
    setError(null);
    getRescheduleSlots(appointment.id, day)
      .then((list) => {
        if (!cancelled) setSlots(list.filter((t) => isSlotBookable(day, t)));
      })
      .catch((err) => {
        if (!cancelled) {
          setSlots([]);
          setError(
            getApiErrorMessage(err, 'Não foi possível carregar os horários.'),
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [visible, day, appointment.id]);

  const submit = async () => {
    if (!day || !time) return;
    setBusy(true);
    setError(null);
    try {
      await requestReschedule(
        appointment.id,
        slotDate(day, time).toISOString(),
      );
      onDone('Pedido enviado. Avisaremos quando a outra parte responder.');
      onClose();
    } catch (err) {
      setError(
        getApiErrorMessage(err, 'Não foi possível pedir o reagendamento.'),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      visible={visible}
      title="Pedir reagendamento"
      onClose={onClose}
      footer={
        <>
          <SheetButton label="Voltar" variant="secondary" onPress={onClose} />
          <SheetButton
            label="Enviar pedido"
            onPress={submit}
            loading={busy}
            disabled={!day || !time}
          />
        </>
      }>
      <Text style={styles.text}>
        Escolha um novo horário para “{appointment.Service?.title}”. A outra
        parte precisa aceitar; até lá, vale o horário atual. O pedido precisa
        ser feito com pelo menos {RESCHEDULE_MIN_HOURS}h de antecedência.
      </Text>

      <Text style={styles.label}>Dia</Text>
      <ChipGroup accessibilityLabel="Dia do novo horário" style={styles.chips}>
        {days.map((key) => (
          <Chip
            key={key}
            label={formatShortDay(key)}
            accessibilityLabel={formatLongDate(key)}
            selected={day === key}
            onPress={() => setDay(key)}
          />
        ))}
      </ChipGroup>

      {day ? (
        <>
          <Text style={styles.label}>Horário</Text>
          {slots === null ? (
            <ActivityIndicator
              color={colors.primaryOrange}
              style={styles.loader}
            />
          ) : slots.length === 0 ? (
            <Text style={styles.empty}>
              Sem horários livres neste dia. Escolha outro dia.
            </Text>
          ) : (
            <ChipGroup
              accessibilityLabel="Horários livres"
              style={styles.chips}>
              {slots.map((slot) => (
                <Chip
                  key={slot}
                  label={slot}
                  selected={time === slot}
                  onPress={() => setTime(slot)}
                />
              ))}
            </ChipGroup>
          )}
        </>
      ) : null}

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
    loader: { marginVertical: 12 },
    empty: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 12,
    },
  });
