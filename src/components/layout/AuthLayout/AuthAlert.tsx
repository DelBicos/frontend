import React from 'react';
import { Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { createAuthStyles } from './authStyles';

/** Mensagem de erro/sucesso dentro do formulario (anunciada a leitores de tela). */
function AuthAlert({
  type = 'error',
  children,
}: {
  type?: 'error' | 'success';
  children: React.ReactNode;
}) {
  const colors = useColors();
  const styles = createAuthStyles(colors);
  const color = type === 'error' ? colors.errorText : colors.successText;
  return (
    <View
      style={[
        styles.alert,
        type === 'error' ? styles.alertError : styles.alertSuccess,
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive">
      <FontAwesome
        name={type === 'error' ? 'exclamation-circle' : 'check-circle'}
        size={18}
        color={color}
        style={{ marginTop: 2 }}
      />
      <Text style={[styles.alertText, { color }]}>{children}</Text>
    </View>
  );
}

export default AuthAlert;
