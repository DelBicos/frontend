import React from 'react';
import { Text, ImageBackground, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';

export interface HighlightItem {
  id: string;
  title: string;
  description: string;
  image: string;
  /** Texto do botao de acao (ex.: "Ver profissionais"). */
  ctaLabel?: string;
  link?: () => void;
}

interface HighlightCardProps {
  item: HighlightItem;
  width: number;
  height: number;
  /** Titulos maiores e texto mais largo em telas grandes. */
  size?: 'compact' | 'large';
  /** Posicao no carrossel, anunciada por leitores de tela. */
  position?: { index: number; total: number };
  /** Recuo lateral extra do texto (ex.: espaco para setas do carrossel). */
  insetX?: number;
}

const HighlightCardComponent: React.FC<HighlightCardProps> = ({
  item,
  width,
  height,
  size = 'compact',
  position,
  insetX,
}) => {
  const colors = useColors();
  const styles = createStyles(colors, size);
  const positionLabel = position
    ? `Destaque ${position.index + 1} de ${position.total}. `
    : '';

  return (
    <Pressable
      onPress={item.link}
      disabled={!item.link}
      style={[styles.card, { width, height }]}
      accessibilityRole={item.link ? 'link' : undefined}
      accessibilityLabel={`${positionLabel}${item.title}. ${item.description}`}
      accessibilityHint={item.ctaLabel}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.image}
        resizeMode="cover"
        accessibilityIgnoresInvertColors>
        <LinearGradient
          colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.85)']}
          locations={[0, 0.45, 1]}
          style={[
            styles.gradient,
            insetX !== undefined && { paddingHorizontal: insetX },
          ]}>
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
            {item.ctaLabel ? (
              <View style={styles.cta}>
                <Text style={styles.ctaText}>{item.ctaLabel}</Text>
                <FontAwesome name="arrow-right" size={14} color="#000000" />
              </View>
            ) : null}
          </View>
        </LinearGradient>
      </ImageBackground>
    </Pressable>
  );
};

export const HighlightCard = React.memo(HighlightCardComponent);
HighlightCard.displayName = 'HighlightCard';
