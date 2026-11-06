import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';

interface ChartCardProps {
  title: string;
  /** Texto para leitores de tela (o grafico em si nao e acessivel). */
  summary: string;
  legend?: { color: string; label: string }[];
  /** Recebe a largura util do cartao para o grafico se ajustar a tela. */
  children: (width: number) => React.ReactNode;
}

/** Cartao de grafico que mede a propria largura (responsivo). */
function ChartCard({ title, summary, legend, children }: ChartCardProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const [width, setWidth] = useState(0);

  return (
    <View
      style={styles.card}
      onLayout={(e) => setWidth(Math.floor(e.nativeEvent.layout.width))}>
      <Text
        style={styles.title}
        accessibilityRole="header"
        {...({ 'aria-level': 2 } as object)}>
        {title}
      </Text>
      <View accessible accessibilityLabel={`${title}. ${summary}`}>
        {width > 0 ? children(Math.max(240, width - 40)) : null}
      </View>
      {legend ? (
        <View style={styles.legend}>
          {legend.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    card: {
      flexGrow: 1,
      flexBasis: 420,
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
      overflow: 'hidden',
      gap: 12,
    },
    title: {
      fontFamily: 'Afacad-Bold',
      fontSize: 20,
      color: colors.primaryBlack,
    },
    legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 12, height: 12, borderRadius: 6 },
    legendText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      color: colors.textSecondary,
    },
  });

export default ChartCard;
