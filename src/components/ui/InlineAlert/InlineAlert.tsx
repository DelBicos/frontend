import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';

type AlertType = 'error' | 'success' | 'info';

/** Mensagem de erro/sucesso/aviso no proprio conteudo (anunciada a leitores de tela). */
function InlineAlert({
  type = 'error',
  children,
}: {
  type?: AlertType;
  children: React.ReactNode;
}) {
  const colors = useColors();
  const palette = {
    error: {
      bg: colors.errorBackground,
      fg: colors.errorText,
      icon: 'exclamation-circle',
    },
    success: {
      bg: colors.successBackground,
      fg: colors.successText,
      icon: 'check-circle',
    },
    info: {
      bg: colors.inputBackground,
      fg: colors.primaryBlack,
      icon: 'info-circle',
    },
  }[type];

  return (
    <View
      style={[styles.alert, { backgroundColor: palette.bg }]}
      accessibilityRole="alert"
      accessibilityLiveRegion={type === 'error' ? 'assertive' : 'polite'}>
      <FontAwesome
        name={palette.icon as any}
        size={18}
        color={palette.fg}
        style={styles.icon}
      />
      <Text style={[styles.text, { color: palette.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  icon: {
    marginTop: 2,
  },
  text: {
    flex: 1,
    fontFamily: 'Afacad-SemiBold',
    fontSize: 16,
    lineHeight: 22,
  },
});

export default InlineAlert;
