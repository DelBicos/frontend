import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

/** Titulo de secao padronizado da pagina inicial (heading para leitores de tela). */
export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  const colors = useColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.texts}>
        <Text
          style={styles.title}
          accessibilityRole="header"
          // Titulos de secao sao h2 no web (a pagina tem um unico h1).
          {...({ 'aria-level': 2 } as object)}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ? (
        <Pressable
          onPress={action.onPress}
          style={({ pressed }) => [styles.action, pressed && { opacity: 0.7 }]}
          accessibilityRole="link"
          hitSlop={8}>
          <Text style={styles.actionText}>{action.label}</Text>
          <FontAwesome
            name="angle-right"
            size={16}
            color={colors.primaryBlack}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 16,
    },
    texts: {
      flex: 1,
      gap: 2,
    },
    title: {
      fontSize: 24,
      lineHeight: 30,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
    },
    subtitle: {
      fontSize: 16,
      lineHeight: 22,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
    },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      minHeight: 44,
      paddingHorizontal: 4,
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    actionText: {
      fontSize: 16,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
      textDecorationLine: 'underline',
    },
  });
