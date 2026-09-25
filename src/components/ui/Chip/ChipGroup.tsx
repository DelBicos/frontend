import React from 'react';
import {
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

interface ChipGroupProps {
  children: React.ReactNode;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Linha de chips. No app, rola na horizontal (gesto de arrastar); no web os
 * chips quebram linha, porque com mouse nao da para arrastar e os ultimos
 * ficariam escondidos.
 */
function ChipGroup({ children, accessibilityLabel, style }: ChipGroupProps) {
  if (Platform.OS === 'web') {
    return (
      <View
        style={[styles.wrap, style]}
        accessibilityLabel={accessibilityLabel}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.scroll, style]}
      contentContainerStyle={styles.row}
      accessibilityLabel={accessibilityLabel}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scroll: {
    flexGrow: 0,
  },
  row: {
    gap: 8,
    paddingVertical: 2,
  },
});

export default ChipGroup;
