import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';

/** Mesma largura em que o perfil troca a barra lateral pela lista do app. */
export const PROFILE_WIDE_MIN = 900;

interface ProfilePageProps {
  title: string;
  subtitle?: string;
  /** Acao principal ao lado do titulo (ex.: "Novo endereco"). */
  action?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Moldura das telas do perfil. No celular o titulo ja aparece na barra do
 * topo, entao aqui so vao subtitulo e acao.
 */
function ProfilePage({ title, subtitle, action, children }: ProfilePageProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const { width } = useWindowDimensions();
  const isWide = width >= PROFILE_WIDE_MIN;

  return (
    <View style={styles.container}>
      {isWide || subtitle || action ? (
        <View style={styles.header}>
          <View style={styles.texts}>
            {isWide ? (
              <Text
                style={styles.title}
                accessibilityRole="header"
                {...({ 'aria-level': 1 } as object)}>
                {title}
              </Text>
            ) : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {action ? <View style={styles.action}>{action}</View> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    header: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 24,
    },
    texts: {
      flexGrow: 1,
      flexBasis: 260,
      gap: 4,
    },
    title: {
      fontFamily: 'Afacad-Bold',
      fontSize: 30,
      lineHeight: 36,
      color: colors.primaryBlack,
    },
    subtitle: {
      fontFamily: 'Afacad-Regular',
      fontSize: 17,
      lineHeight: 24,
      color: colors.textSecondary,
    },
    action: {
      flexShrink: 0,
    },
  });

/** Cartao simples usado dentro das telas do perfil. */
export function ProfileCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const colors = useColors();
  return (
    <View
      style={{
        padding: 20,
        marginBottom: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.borderColor,
        backgroundColor: colors.cardBackground,
      }}>
      {title ? (
        <Text
          style={{
            marginBottom: 16,
            fontFamily: 'Afacad-Bold',
            fontSize: 20,
            color: colors.primaryBlack,
          }}
          accessibilityRole="header"
          {...({ 'aria-level': 2 } as object)}>
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

export default ProfilePage;
