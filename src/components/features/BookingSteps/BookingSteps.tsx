import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';

export const BOOKING_STEPS = [
  'Serviço e data',
  'Profissional e horário',
  'Pagamento',
  'Confirmação',
] as const;

interface BookingStepsProps {
  /** Etapa atual, de 1 a 4. */
  current: 1 | 2 | 3 | 4;
  /** Mostra "Voltar" no app (que nao tem cabecalho). Padrao: true. */
  showBack?: boolean;
}

/**
 * Progresso do agendamento, igual em todas as etapas. No app, que nao tem
 * cabecalho, inclui o botao de voltar.
 */
function BookingSteps({ current, showBack = true }: BookingStepsProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const navigation = useNavigation();
  const { isCompact } = useBreakpoint();
  const canGoBack = showBack && Platform.OS !== 'web' && navigation.canGoBack();

  return (
    <View style={styles.container}>
      {canGoBack ? (
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={8}>
          <FontAwesome
            name="arrow-left"
            size={16}
            color={colors.primaryBlack}
          />
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>
      ) : null}

      <View
        accessibilityRole="progressbar"
        accessibilityLabel={`Etapa ${current} de ${BOOKING_STEPS.length}: ${BOOKING_STEPS[current - 1]}`}
        accessibilityValue={{
          min: 1,
          max: BOOKING_STEPS.length,
          now: current,
        }}>
        <View style={styles.bars}>
          {BOOKING_STEPS.map((label, i) => (
            <View
              key={label}
              style={[styles.bar, i < current && styles.barDone]}
            />
          ))}
        </View>
        {isCompact ? (
          <Text style={styles.caption}>
            Etapa {current} de {BOOKING_STEPS.length} ·{' '}
            <Text style={styles.captionStrong}>
              {BOOKING_STEPS[current - 1]}
            </Text>
          </Text>
        ) : (
          <View style={styles.labels}>
            {BOOKING_STEPS.map((label, i) => (
              <Text
                key={label}
                style={[
                  styles.label,
                  i + 1 === current && styles.labelCurrent,
                  i + 1 < current && styles.labelDone,
                ]}>
                {i + 1 < current ? '✓ ' : `${i + 1}. `}
                {label}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      marginBottom: 20,
      gap: 12,
    },
    back: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 8,
      minHeight: 44,
    },
    backText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 17,
      color: colors.primaryBlack,
    },
    bars: {
      flexDirection: 'row',
      gap: 6,
    },
    bar: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.borderColor,
    },
    barDone: {
      backgroundColor: colors.primaryOrange,
    },
    caption: {
      marginTop: 8,
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    captionStrong: {
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
    },
    labels: {
      flexDirection: 'row',
      gap: 6,
      marginTop: 8,
    },
    label: {
      flex: 1,
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    labelCurrent: {
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
    },
    labelDone: {
      color: colors.primaryBlack,
    },
  });

export default BookingSteps;
