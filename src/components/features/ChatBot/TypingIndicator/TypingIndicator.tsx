import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';

const DOT_SIZE = 8;
const ANIMATION_DURATION = 400;

/** Estilo estático do ponto — não depende de tema, definido uma vez fora do componente. */
const dotStyle = StyleSheet.create({
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});

const Dot: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: -6,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);

  return (
    <Animated.View
      style={[
        dotStyle.dot,
        { backgroundColor: color, transform: [{ translateY: anim }] },
      ]}
    />
  );
};

export const TypingIndicator: React.FC = () => {
  const colors = useColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.bubble}>
      <Dot delay={0} color={colors.textTertiary} />
      <Dot delay={160} color={colors.textTertiary} />
      <Dot delay={320} color={colors.textTertiary} />
    </View>
  );
};

