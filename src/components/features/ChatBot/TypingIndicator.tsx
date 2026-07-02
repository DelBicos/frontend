import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useColors } from '@theme/ThemeProvider';

const DOT_SIZE = 8;
const ANIMATION_DURATION = 400;

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
        styles.dot,
        { backgroundColor: color, transform: [{ translateY: anim }] },
      ]}
    />
  );
};

export const TypingIndicator: React.FC = () => {
  const colors = useColors();

  return (
    <View style={[styles.bubble, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
      <Dot delay={0} color={colors.textTertiary} />
      <Dot delay={160} color={colors.textTertiary} />
      <Dot delay={320} color={colors.textTertiary} />
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    gap: 5,
    marginVertical: 4,
    marginLeft: 12,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});
