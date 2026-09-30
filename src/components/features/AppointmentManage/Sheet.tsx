import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';

import { webStyle } from '@lib/types/web';
interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Janela de dialogo simples usada pelas acoes de gestao do agendamento. */
export function Sheet({
  visible,
  title,
  onClose,
  children,
  footer,
}: SheetProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
        />
        <View
          style={styles.container}
          accessibilityViewIsModal
          {...(Platform.OS === 'web' ? ({ role: 'dialog' } as object) : {})}>
          <Text
            style={styles.title}
            accessibilityRole="header"
            {...({ 'aria-level': 2 } as object)}>
            {title}
          </Text>
          <ScrollView
            style={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

interface SheetButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}

export function SheetButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}: SheetButtonProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        (pressed || off) && styles.dim,
      ]}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' ? colors.primaryBlack : '#000000'}
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === 'secondary' && styles.secondaryText,
            variant === 'danger' && styles.dangerText,
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    container: {
      width: '100%',
      maxWidth: 480,
      maxHeight: '90%',
      borderRadius: 16,
      padding: 20,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    title: {
      fontFamily: 'Afacad-Bold',
      fontSize: 22,
      color: colors.primaryBlack,
      marginBottom: 12,
    },
    body: {
      flexGrow: 0,
    },
    footer: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
    },
    button: {
      flex: 1,
      minHeight: 44,
      paddingHorizontal: 14,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      ...webStyle({ cursor: 'pointer' }),
    },
    primary: { backgroundColor: colors.primaryOrange },
    secondary: { borderWidth: 1.5, borderColor: colors.primaryBlack },
    danger: { backgroundColor: colors.errorText },
    dim: { opacity: 0.6 },
    buttonText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
      // Texto escuro sobre laranja (contraste AA).
      color: '#000000',
    },
    secondaryText: { color: colors.primaryBlack },
    dangerText: { color: colors.primaryWhite },
  });
