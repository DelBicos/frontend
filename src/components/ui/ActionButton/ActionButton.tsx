import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
  loading?: boolean;
  disabled?: boolean;
  /** Ocupa a largura toda. */
  block?: boolean;
  size?: 'md' | 'sm';
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'link';
  style?: StyleProp<ViewStyle>;
}

/**
 * Botao padrao do app. Primario: laranja com texto preto (contraste AA);
 * secundario: contorno; perigo: vermelho; fantasma: so texto.
 */
function ActionButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  block = false,
  size = 'md',
  accessibilityLabel,
  accessibilityRole = 'button',
  style,
}: ActionButtonProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const isDisabled = disabled || loading;
  const fg = {
    primary: '#000000',
    secondary: colors.primaryBlack,
    danger: colors.errorText,
    ghost: colors.primaryBlack,
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed, hovered }: any) => [
        styles.base,
        size === 'sm' && styles.small,
        styles[variant],
        hovered && !isDisabled && styles[`${variant}Hover` as const],
        block && styles.block,
        isDisabled && styles.disabled,
        pressed && { opacity: 0.8 },
        style,
      ]}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}>
      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : icon ? (
        <FontAwesome name={icon} size={size === 'sm' ? 14 : 16} color={fg} />
      ) : null}
      <Text
        style={[
          styles.text,
          size === 'sm' && styles.textSmall,
          { color: fg },
          variant === 'ghost' && styles.textGhost,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    base: {
      minHeight: 48,
      paddingHorizontal: 20,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-start',
      gap: 8,
      ...Platform.select({ web: { cursor: 'pointer' } as object }),
    },
    small: {
      minHeight: 40,
      paddingHorizontal: 14,
      borderRadius: 10,
    },
    block: {
      alignSelf: 'stretch',
    },
    disabled: {
      opacity: 0.5,
    },
    primary: {
      backgroundColor: colors.primaryOrange,
    },
    primaryHover: {
      backgroundColor: colors.primaryOrangeHover,
    },
    secondary: {
      borderWidth: 1,
      borderColor: colors.primaryBlack,
    },
    secondaryHover: {
      backgroundColor: colors.inputBackground,
    },
    danger: {
      borderWidth: 1,
      borderColor: colors.errorText,
    },
    dangerHover: {
      backgroundColor: colors.errorBackground,
    },
    ghost: {
      paddingHorizontal: 8,
    },
    ghostHover: {
      backgroundColor: colors.inputBackground,
    },
    text: {
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
    },
    textSmall: {
      fontSize: 15,
    },
    textGhost: {
      fontFamily: 'Afacad-SemiBold',
      textDecorationLine: 'underline',
    },
  });

export default ActionButton;
