import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';

interface EmptyStateProps {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  title: string;
  text?: string;
  /** Botao(oes) de acao. */
  children?: React.ReactNode;
}

/** Lista vazia ou erro: icone, titulo, explicacao e acao. */
function EmptyState({ icon, title, text, children }: EmptyStateProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <FontAwesome name={icon} size={28} color={colors.textSecondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {text ? <Text style={styles.text}>{text}</Text> : null}
      {children ? <View style={styles.actions}>{children}</View> : null}
    </View>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: 8,
      paddingVertical: 40,
      paddingHorizontal: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderColor,
    },
    icon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      marginBottom: 4,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.inputBackground,
    },
    title: {
      fontFamily: 'Afacad-Bold',
      fontSize: 20,
      textAlign: 'center',
      color: colors.primaryBlack,
    },
    text: {
      maxWidth: 440,
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      lineHeight: 22,
      textAlign: 'center',
      color: colors.textSecondary,
    },
    actions: {
      marginTop: 8,
      alignItems: 'center',
      gap: 8,
    },
  });

export default EmptyState;
