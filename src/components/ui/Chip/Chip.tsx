import React from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
  tone?: 'primary' | 'secondary';
  accessibilityLabel?: string;
}

/** Filtro em formato de pilula, com estado selecionado para leitores de tela. */
function Chip({
  label,
  selected,
  onPress,
  icon,
  tone = 'primary',
  accessibilityLabel,
}: ChipProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const selectedStyle =
    tone === 'primary' ? styles.selected : styles.secondarySelected;
  const selectedText =
    tone === 'primary' ? styles.textSelected : styles.textSecondarySelected;
  const textColor = selected
    ? (selectedText.color as string)
    : colors.primaryBlack;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && selectedStyle,
        pressed && { opacity: 0.75 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}>
      {icon ? <FontAwesome name={icon} size={14} color={textColor} /> : null}
      <Text style={[styles.text, selected && selectedText]}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    chip: {
      minHeight: 40,
      paddingHorizontal: 16,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    selected: {
      backgroundColor: colors.primaryOrange,
      borderColor: colors.primaryOrange,
    },
    secondarySelected: {
      backgroundColor: colors.primaryBlack,
      borderColor: colors.primaryBlack,
    },
    text: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 15,
      color: colors.primaryBlack,
    },
    textSelected: {
      // Texto escuro sobre laranja (contraste AA).
      color: '#000000',
    },
    textSecondarySelected: {
      color: colors.primaryWhite,
    },
  });

export default Chip;
