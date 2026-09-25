import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
import { useProfessionalStore } from '@stores/Professional';
import Chip, { ChipGroup } from '@components/ui/Chip';

/** 0 = sem limite (o backend nao aplica a regra de raio). */
const PRESETS = [5, 10, 20, 50, 0];

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const radiusLabel = (km: number) => (km === 0 ? 'Sem limite' : `${km} km`);

/**
 * Area de atendimento (raio em km a partir do endereco principal), editada
 * aqui mesmo em "Meus servicos": e parte do que o profissional oferece.
 */
function ServiceAreaCard({ professionalId }: { professionalId: number }) {
  const colors = useColors();
  const styles = createStyles(colors);
  const { fetchProfessionalById, updateRadius } = useProfessionalStore();

  const [radius, setRadius] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [state, setState] = useState<SaveState>('idle');

  useEffect(() => {
    fetchProfessionalById(professionalId).then((prof) => {
      setRadius(prof?.service_radius_km ?? 0);
    });
  }, [professionalId, fetchProfessionalById]);

  const save = async (km: number) => {
    setState('saving');
    try {
      await updateRadius(professionalId, km);
      setRadius(km);
      setCustom('');
      setState('saved');
    } catch {
      setState('error');
    }
  };

  const customKm = parseInt(custom, 10);
  const isCustomValid = !Number.isNaN(customKm) && customKm > 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <FontAwesome name="map-marker" size={20} color="#000000" />
        </View>
        <View style={styles.texts}>
          <Text
            style={styles.title}
            accessibilityRole="header"
            {...({ 'aria-level': 2 } as object)}>
            Área de atendimento
          </Text>
          <Text style={styles.description}>
            Até onde você se desloca a partir do seu endereço principal.
            Clientes fora desse raio não conseguem agendar.
          </Text>
        </View>
      </View>

      {radius === null ? (
        <ActivityIndicator color={colors.primaryOrange} />
      ) : (
        <>
          <ChipGroup accessibilityLabel="Raio de atendimento">
            {PRESETS.map((km) => (
              <Chip
                key={km}
                label={radiusLabel(km)}
                selected={radius === km}
                onPress={() => radius !== km && save(km)}
              />
            ))}
            {!PRESETS.includes(radius) ? (
              <Chip
                label={radiusLabel(radius)}
                selected
                onPress={() => undefined}
              />
            ) : null}
          </ChipGroup>

          <View style={styles.customRow}>
            <TextInput
              value={custom}
              onChangeText={(v) => setCustom(v.replace(/[^0-9]/g, ''))}
              placeholder="Outro raio (km)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={4}
              style={styles.input}
              accessibilityLabel="Outro raio de atendimento em quilômetros"
              onSubmitEditing={() => isCustomValid && save(customKm)}
            />
            <Pressable
              onPress={() => save(customKm)}
              disabled={!isCustomValid || state === 'saving'}
              style={({ pressed }) => [
                styles.button,
                (!isCustomValid || state === 'saving') && styles.disabled,
                pressed && { opacity: 0.8 },
              ]}
              accessibilityRole="button"
              accessibilityState={{ disabled: !isCustomValid }}>
              <Text style={styles.buttonText}>Aplicar</Text>
            </Pressable>
          </View>

          <Text
            style={[styles.status, state === 'error' && styles.statusError]}
            accessibilityLiveRegion="polite">
            {state === 'saving'
              ? 'Salvando…'
              : state === 'saved'
                ? `Salvo: ${radius === 0 ? 'você atende sem limite de distância' : `você atende até ${radius} km`}.`
                : state === 'error'
                  ? 'Não foi possível salvar. Tente novamente.'
                  : radius === 0
                    ? 'Atualmente sem limite de distância.'
                    : `Atualmente até ${radius} km.`}
          </Text>
        </>
      )}
    </View>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    card: {
      gap: 14,
      padding: 20,
      borderRadius: 18,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    header: {
      flexDirection: 'row',
      gap: 14,
    },
    icon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryOrange,
    },
    texts: {
      flex: 1,
      gap: 2,
    },
    title: {
      fontFamily: 'Afacad-Bold',
      fontSize: 20,
      color: colors.primaryBlack,
    },
    description: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      lineHeight: 21,
      color: colors.textSecondary,
    },
    customRow: {
      flexDirection: 'row',
      gap: 10,
      maxWidth: 360,
    },
    input: {
      flex: 1,
      minHeight: 44,
      paddingHorizontal: 16,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.inputBackground,
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    button: {
      minHeight: 44,
      paddingHorizontal: 18,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.primaryBlack,
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    disabled: {
      opacity: 0.4,
    },
    buttonText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    status: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 15,
      color: colors.textSecondary,
    },
    statusError: {
      color: colors.errorText,
    },
  });

export default ServiceAreaCard;
