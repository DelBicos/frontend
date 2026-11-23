import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, Animated } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';

const BOUNCE_HEIGHT = 4;
const ANIMATION_DURATION = 400;

const Dot: React.FC<{ delay: number; style: object }> = ({ delay, style }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: -BOUNCE_HEIGHT,
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
    <Animated.View style={[style, { transform: [{ translateY: anim }] }]} />
  );
};

interface TypingIndicatorProps {
  /** Texto curto abaixo do balão explicando o que o assistente está fazendo. */
  caption?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  caption,
}) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel={
        caption ? `Assistente digitando. ${caption}` : 'Assistente digitando'
      }
      accessibilityLiveRegion="polite"
      testID="chat-typing-indicator">
      <View style={styles.bubble}>
        <Dot delay={0} style={styles.dot} />
        <Dot delay={160} style={styles.dot} />
        <Dot delay={320} style={styles.dot} />
      </View>
      {caption ? (
        <Text style={styles.caption} numberOfLines={1} ellipsizeMode="tail">
          {caption}
        </Text>
      ) : null}
    </View>
  );
};
