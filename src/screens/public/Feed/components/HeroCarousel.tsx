import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { HighlightCard, HighlightItem } from '@components/ui/HighlightCard';

const AUTOPLAY_INTERVAL_MS = 6000;

interface HeroCarouselProps {
  items: HighlightItem[];
  height: number;
  size: 'compact' | 'large';
  /** Setas de navegacao (uteis com mouse; no toque o gesto de arrastar basta). */
  showArrows: boolean;
}

/**
 * Carrossel de destaques da pagina inicial.
 *
 * Acessibilidade: a troca automatica para ao passar o mouse, ao interagir,
 * quando o sistema pede movimento reduzido e pelo botao de pausa (WCAG 2.2.2).
 * Indicadores e setas sao botoes com rotulo e area de toque de 44px.
 */
export function HeroCarousel({
  items,
  height,
  size,
  showArrows,
}: HeroCarouselProps) {
  const scrollRef = useRef<ScrollView | null>(null);
  const [slideWidth, setSlideWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((enabled) => mounted && setReduceMotion(enabled))
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      mounted = false;
      subscription?.remove?.();
    };
  }, []);

  const goTo = useCallback(
    (next: number, animated = true) => {
      if (!slideWidth || items.length === 0) return;
      const target = (next + items.length) % items.length;
      scrollRef.current?.scrollTo({ x: target * slideWidth, animated });
      setIndex(target);
    },
    [slideWidth, items.length],
  );

  const autoplay = !userPaused && !hovered && !reduceMotion && items.length > 1;

  useEffect(() => {
    if (!autoplay || !slideWidth) return;
    const timer = setInterval(() => goTo(index + 1), AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [autoplay, slideWidth, index, goTo]);

  const onLayout = (event: LayoutChangeEvent) => {
    const width = Math.round(event.nativeEvent.layout.width);
    if (width && width !== slideWidth) {
      setSlideWidth(width);
      // Mantem o slide atual alinhado apos redimensionar a janela.
      requestAnimationFrame(() =>
        scrollRef.current?.scrollTo({ x: index * width, animated: false }),
      );
    }
  };

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (!slideWidth) return;
    const next = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    if (next !== index) setIndex(next);
  };

  const hoverProps =
    Platform.OS === 'web'
      ? {
          onHoverIn: () => setHovered(true),
          onHoverOut: () => setHovered(false),
        }
      : {};

  return (
    <Pressable
      style={[styles.container, { height }]}
      onLayout={onLayout}
      accessible={false}
      // @ts-ignore - props de hover existem no react-native-web
      {...hoverProps}>
      {slideWidth > 0 && (
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollBeginDrag={() => setUserPaused(true)}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={slideWidth}
          accessibilityLabel="Destaques">
          {items.map((item, i) => (
            <HighlightCard
              key={item.id}
              item={item}
              width={slideWidth}
              height={height}
              size={size}
              position={{ index: i, total: items.length }}
              // Seta (48px) + margem (16px) + respiro: o texto nao fica sob as setas.
              insetX={showArrows ? 88 : undefined}
            />
          ))}
        </ScrollView>
      )}

      {showArrows && items.length > 1 && (
        <>
          <ControlButton
            icon="chevron-left"
            label="Destaque anterior"
            style={[styles.arrow, styles.arrowLeft]}
            onPress={() => {
              setUserPaused(true);
              goTo(index - 1);
            }}
          />
          <ControlButton
            icon="chevron-right"
            label="Próximo destaque"
            style={[styles.arrow, styles.arrowRight]}
            onPress={() => {
              setUserPaused(true);
              goTo(index + 1);
            }}
          />
        </>
      )}

      {items.length > 1 && (
        <View style={styles.controls}>
          {items.map((item, i) => (
            <Pressable
              key={item.id}
              onPress={() => {
                setUserPaused(true);
                goTo(i);
              }}
              style={styles.dotHitArea}
              accessibilityRole="button"
              accessibilityLabel={`Ir para o destaque ${i + 1}: ${item.title}`}
              accessibilityState={{ selected: i === index }}>
              <View style={[styles.dot, i === index && styles.dotActive]} />
            </Pressable>
          ))}
          <ControlButton
            icon={userPaused ? 'play' : 'pause'}
            label={
              userPaused
                ? 'Retomar troca automática'
                : 'Pausar troca automática'
            }
            style={styles.pauseButton}
            iconSize={12}
            onPress={() => setUserPaused((paused) => !paused)}
          />
        </View>
      )}
    </Pressable>
  );
}

function ControlButton({
  icon,
  label,
  onPress,
  style,
  iconSize = 16,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  onPress: () => void;
  style: any;
  iconSize?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [style, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}>
      <FontAwesome name={icon} size={iconSize} color="#FFFFFF" />
    </Pressable>
  );
}

const glass = {
  backgroundColor: 'rgba(0,0,0,0.45)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.35)',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  ...Platform.select({ web: { cursor: 'pointer' } as any }),
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1F2933',
  },
  arrow: {
    ...glass,
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  arrowLeft: { left: 16 },
  arrowRight: { right: 16 },
  controls: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotHitArea: {
    width: 28,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } as any }),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dotActive: {
    width: 22,
    backgroundColor: '#FFFFFF',
  },
  pauseButton: {
    ...glass,
    marginLeft: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  pressed: {
    opacity: 0.7,
  },
});
