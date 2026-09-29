import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';

interface VerifiedBadgeProps {
  /** Mostra o texto "Verificado" ao lado do selo. */
  showLabel?: boolean;
  size?: number;
}

/** Selo de profissional com identidade verificada por um administrador. */
function VerifiedBadge({ showLabel = false, size = 16 }: VerifiedBadgeProps) {
  const colors = useColors();
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel="Profissional verificado"
      accessibilityRole="image">
      <MaterialIcons name="verified" size={size} color={colors.successText} />
      {showLabel ? (
        <Text
          style={[
            styles.label,
            { color: colors.successText, fontSize: size - 2 },
          ]}>
          Verificado
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  label: { fontFamily: 'Afacad-Bold' },
});

export default VerifiedBadge;
