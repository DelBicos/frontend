import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import CustomSelect from '@components/ui/CustomSelect';
import CustomTextInput from '@components/ui/CustomTextInput';
import { useColors } from '@theme/ThemeProvider';

const DAYS = [
  { label: 'Domingo', value: '0' },
  { label: 'Segunda', value: '1' },
  { label: 'Terça', value: '2' },
  { label: 'Quarta', value: '3' },
  { label: 'Quinta', value: '4' },
  { label: 'Sexta', value: '5' },
  { label: 'Sábado', value: '6' },
];

function timeToMinutes(t: string) {
  const m = t.match(/^(\d{2}):(\d{2})$/);
  if (!m) return NaN;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  return h * 60 + mm;
}

function isValidTimeFormat(t: string) {
  const m = t.match(/^(\d{2}):(\d{2})$/);
  if (!m) return false;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  return h >= 0 && h <= 23 && mm >= 0 && mm <= 59;
}

function padTime(t: string) {
  const m = t.match(/^(\d{1,2}):(\d{1,2})$/);
  if (!m) return t;
  const h = m[1].padStart(2, '0');
  const mm = m[2].padStart(2, '0');
  return `${h}:${mm}`;
}

export default function AvailabilityManager({ control, setValue, watch }: any) {
  const colors = useColors();
  const styles = createStyles(colors);
  const availabilities = watch('availabilities') || [];

  const [selectedDays, setSelectedDays] = useState<string[]>(['1']);
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('12:00');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  // Mensagem de validacao na propria tela (Alert nao aparece no web).
  const [error, setError] = useState<string | null>(null);

  const addAvailability = () => {
    setError(null);
    // strict validation: format and range
    const startP = padTime(start);
    const endP = padTime(end);
    if (!isValidTimeFormat(startP) || !isValidTimeFormat(endP)) {
      setError('Use o formato HH:MM (ex: 09:00)');
      return;
    }
    const s = timeToMinutes(startP);
    const e = timeToMinutes(endP);
    if (s >= e) {
      setError('Hora de início deve ser antes da hora de término.');
      return;
    }
    // selectedDays should contain one or more day strings
    if (!Array.isArray(selectedDays) || selectedDays.length === 0) {
      setError('Selecione ao menos um dia da semana.');
      return;
    }

    // For editing mode: only allow single-day editing
    if (editingIndex !== null) {
      const editing = availabilities[editingIndex];
      if (!editing) return;
      const dayNum = Number(editing.day);
      const overlapping = (availabilities as any[]).some(
        (a: any, idx: number) => {
          if (idx === editingIndex) return false;
          if (Number(a.day) !== dayNum) return false;
          const as = timeToMinutes(a.start);
          const ae = timeToMinutes(a.end);
          return !(e <= as || s >= ae);
        },
      );
      if (overlapping) {
        setError('Já existe uma disponibilidade que se sobrepõe neste dia.');
        return;
      }
      const updated = (availabilities as any[]).map((a: any, i: number) =>
        i === editingIndex ? { day: dayNum, start: startP, end: endP } : a,
      );
      setValue('availabilities', updated);
      setEditingIndex(null);
      setSelectedDays([String(dayNum)]);
      return;
    }

    // Add entries for each selected day, validating overlap and duplicates per day
    const next = [...(availabilities as any[])];
    for (const d of selectedDays) {
      const dayNum = Number(d);
      if (!Number.isInteger(dayNum) || dayNum < 0 || dayNum > 6) continue;

      const duplicate = next.some(
        (a: any) =>
          Number(a.day) === dayNum && a.start === startP && a.end === endP,
      );
      if (duplicate) continue;

      const overlapping = next.some((a: any) => {
        if (Number(a.day) !== dayNum) return false;
        const as = timeToMinutes(a.start);
        const ae = timeToMinutes(a.end);
        return !(e <= as || s >= ae);
      });
      if (overlapping) continue;

      next.push({ day: dayNum, start: startP, end: endP });
    }
    setValue('availabilities', next);
    // reset to defaults
    setSelectedDays(['1']);
    setStart('09:00');
    setEnd('12:00');
    setEditingIndex(null);
  };

  const removeAt = (index: number) => {
    const next = availabilities.filter((_: any, i: number) => i !== index);
    setValue('availabilities', next);
  };

  const startEdit = (index: number) => {
    const a = availabilities[index];
    if (!a) return;
    setSelectedDays([String(a.day)]);
    setStart(String(a.start));
    setEnd(String(a.end));
    setEditingIndex(index);
  };

  const grouped = useMemo(() => {
    return (availabilities as any[])
      .map((a) => ({ ...a }))
      .sort(
        (x, y) =>
          x.day - y.day || timeToMinutes(x.start) - timeToMinutes(y.start),
      );
  }, [availabilities]);

  return (
    <View style={styles.container}>
      {/* ── Seleção de dias ── */}
      <Text style={styles.sectionLabel}>Dias da semana</Text>
      <View style={styles.daysRow}>
        {DAYS.map((d) => {
          const active = selectedDays.includes(d.value);
          const hovered = hoveredDay === d.value;
          return (
            <Pressable
              key={d.value}
              onPress={() =>
                setSelectedDays((prev) =>
                  prev.includes(d.value)
                    ? prev.filter((x) => x !== d.value)
                    : [...prev, d.value],
                )
              }
              accessibilityRole="button"
              accessibilityLabel={d.label}
              accessibilityState={{ selected: active }}
              onHoverIn={() => setHoveredDay(d.value)}
              onHoverOut={() => setHoveredDay(null)}
              style={[
                styles.dayChip,
                active && styles.dayChipActive,
                hovered && !active && styles.dayChipHover,
              ]}>
              <Text
                style={[
                  styles.dayChipText,
                  active && styles.dayChipTextActive,
                  hovered && !active && { color: colors.primaryBlack },
                ]}>
                {d.label.slice(0, 3)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Horários ── */}
      <Text style={styles.sectionLabel}>Horário</Text>
      <View style={styles.timeRow}>
        <View style={styles.timeField}>
          <CustomTextInput
            label="Início"
            value={start}
            onChangeText={setStart}
            keyboardType="numeric"
            placeholder="09:00"
          />
        </View>
        <View style={styles.timeSeparator}>
          <Text style={styles.timeDash}>→</Text>
        </View>
        <View style={styles.timeField}>
          <CustomTextInput
            label="Fim"
            value={end}
            onChangeText={setEnd}
            keyboardType="numeric"
            placeholder="18:00"
          />
        </View>
      </View>

      {error ? (
        <Text style={styles.errorText} accessibilityLiveRegion="assertive">
          {error}
        </Text>
      ) : null}

      {/* ── Botão adicionar ── */}
      <TouchableOpacity style={styles.addBtn} onPress={addAvailability}>
        <Text style={styles.addText}>
          {editingIndex !== null ? '✓  Salvar alteração' : '+  Adicionar'}
        </Text>
      </TouchableOpacity>

      {/* ── Lista de disponibilidades adicionadas ── */}
      {grouped.length === 0 ? (
        <Text style={styles.emptyText}>
          Nenhuma disponibilidade adicionada.
        </Text>
      ) : (
        <View style={styles.list}>
          {grouped.map((a, idx) => (
            <Pressable
              key={`${a.day}-${a.start}-${idx}`}
              onHoverIn={() => setHoveredIndex(idx)}
              onHoverOut={() => setHoveredIndex(null)}
              style={[
                styles.itemCard,
                hoveredIndex === idx && styles.itemCardHover,
              ]}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemDay}>
                  {DAYS[a.day]?.label || `Dia ${a.day}`}
                </Text>
                <View style={styles.itemTimeBadge}>
                  <Text style={styles.itemTimeText}>
                    {a.start} → {a.end}
                  </Text>
                </View>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.actionBtnEdit}
                  onPress={() => startEdit(idx)}>
                  <Text style={styles.actionBtnEditText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtnRemove}
                  onPress={() => removeAt(idx)}>
                  <Text style={styles.actionBtnRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    errorText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 14,
      color: colors.errorText,
      marginBottom: 8,
    },
    container: {
      marginTop: 8,
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    sectionLabel: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 13,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 10,
      marginTop: 4,
    },
    // Dias
    daysRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    dayChip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colors.borderColor,
      backgroundColor: colors.inputBackground,
    },
    dayChipActive: {
      backgroundColor: colors.primaryOrange,
      borderColor: colors.primaryOrange,
    },
    dayChipText: {
      fontFamily: 'Afacad-Medium',
      fontSize: 14,
      color: colors.textSecondary,
    },
    dayChipTextActive: {
      color: '#fff',
      fontFamily: 'Afacad-SemiBold',
    },
    // Horários
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    timeField: { flex: 1 },
    timeSeparator: {
      paddingHorizontal: 10,
      paddingTop: 18,
    },
    timeDash: {
      fontSize: 18,
      color: colors.textSecondary,
    },
    // Botão
    addBtn: {
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor: colors.primaryOrange,
    },
    addText: {
      color: '#fff',
      fontFamily: 'Afacad-SemiBold',
      fontSize: 15,
    },
    // Lista
    emptyText: {
      color: colors.textSecondary,
      fontFamily: 'Afacad-Regular',
      marginTop: 12,
      textAlign: 'center',
    },
    list: { marginTop: 14, gap: 8 },
    itemCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: 10,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    itemCardHover: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.primaryOrange,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 6,
      transform: [{ translateY: -1 }],
    },
    dayChipHover: {
      backgroundColor: colors.inputBackground,
      borderColor: colors.primaryOrange,
    },
    itemLeft: { flex: 1, gap: 4 },
    itemDay: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 14,
      color: colors.primaryBlack,
    },
    itemTimeBadge: {
      alignSelf: 'flex-start',
      paddingVertical: 2,
      paddingHorizontal: 8,
      borderRadius: 6,
      backgroundColor: colors.primaryOrange + '22',
    },
    itemTimeText: {
      fontFamily: 'Afacad-Medium',
      fontSize: 13,
      color: colors.primaryOrange,
    },
    itemActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    actionBtnEdit: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#0ea5e9',
    },
    actionBtnEditText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 13,
      color: '#0ea5e9',
    },
    actionBtnRemove: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: '#fee2e2',
    },
    actionBtnRemoveText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 13,
      color: '#e55353',
    },
  });
