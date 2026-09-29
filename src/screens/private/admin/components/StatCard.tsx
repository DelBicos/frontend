import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  /** Destaca o cartao (ex.: fila com itens esperando). */
  attention?: boolean;
  onPress?: () => void;
}

/** Indicador do painel: rotulo, valor grande e uma dica. */
function StatCard({ label, value, hint, attention, onPress }: StatCardProps) {
  const colors = useColors();
  const styles = createStyles(colors, !!attention);
  const content = (
    <>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </>
  );
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="link"
        accessibilityLabel={`${label}: ${value}. ${hint ?? ''}`}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
        {content}
      </Pressable>
    );
  }
  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`${label}: ${value}. ${hint ?? ''}`}>
      {content}
    </View>
  );
}

const createStyles = (colors: ColorsType, attention: boolean) =>
  StyleSheet.create({
    card: {
      flexGrow: 1,
      flexBasis: 220,
      padding: 20,
      borderRadius: 16,
      borderWidth: attention ? 2 : 1,
      borderColor: attention ? colors.primaryOrange : colors.borderColor,
      backgroundColor: colors.cardBackground,
      gap: 4,
    },
    label: {
      fontFamily: 'Afacad-Bold',
      fontSize: 15,
      color: colors.textSecondary,
    },
    value: {
      fontFamily: 'Afacad-Bold',
      fontSize: 34,
      lineHeight: 40,
      color: colors.primaryBlack,
    },
    hint: {
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      color: colors.textSecondary,
    },
  });

export default StatCard;
