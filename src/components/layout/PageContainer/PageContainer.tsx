import React from 'react';
import {
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { useThemeStore, ThemeMode } from '@stores/Theme';
import { CONTENT_MAX_WIDTH, useBreakpoint } from '@lib/hooks/useBreakpoint';
import { ColorsType } from '@theme/types';

/**
 * Web: com o conteudo centralizado (janela maior que 1200px + margens),
 * reserva o espaco da barra de rolagem dos dois lados para ele ficar na
 * mesma posicao do cabecalho, que nao tem barra. Em telas menores o
 * conteudo ja comeca na margem, e a reserva a esquerda o deslocaria.
 */
export function useWebScrollGutter() {
  const { width, gutter } = useBreakpoint();
  if (Platform.OS !== 'web' || width < CONTENT_MAX_WIDTH + gutter * 2) {
    return null;
  }
  return { scrollbarGutter: 'stable both-edges' } as any;
}

interface PageContainerProps extends ScrollViewProps {
  children: React.ReactNode;
  /**
   * Largura maxima do conteudo dentro do contêiner padrao (alinhado a
   * esquerda). Padrao: a largura toda.
   */
  maxWidth?: number;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * Pagina rolavel com o fundo e as margens padrao do site: conteudo
 * centralizado, com largura maxima e margem lateral por tamanho de tela.
 */
function PageContainer({
  children,
  maxWidth = CONTENT_MAX_WIDTH,
  contentStyle,
  ...scrollProps
}: PageContainerProps) {
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);
  const { gutter, isCompact } = useBreakpoint();
  const scrollGutter = useWebScrollGutter();
  const background =
    theme === ThemeMode.LIGHT_HI_CONTRAST
      ? colors.primaryWhite
      : colors.secondaryGray;

  return (
    <ScrollView
      style={[{ flex: 1, backgroundColor: background }, scrollGutter]}
      contentContainerStyle={{
        paddingHorizontal: gutter,
        paddingTop: isCompact ? 16 : 32,
        paddingBottom: isCompact ? 32 : 64,
      }}
      keyboardShouldPersistTaps="handled"
      {...scrollProps}>
      {/* Contêiner igual em todas as paginas (mesma borda esquerda do
          cabecalho); paginas de leitura limitam a largura, alinhadas a
          esquerda, em vez de centralizar numa largura propria. */}
      <View
        style={{
          width: '100%',
          maxWidth: CONTENT_MAX_WIDTH,
          alignSelf: 'center',
        }}>
        <View style={[{ width: '100%', maxWidth }, contentStyle]}>
          {children}
        </View>
      </View>
    </ScrollView>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Pequeno rotulo acima do titulo. */
  eyebrow?: string;
  children?: React.ReactNode;
  align?: 'left' | 'center';
}

/** Cabecalho da pagina: o unico h1, com subtitulo e conteudo extra (ex.: busca). */
export function PageHeader({
  title,
  subtitle,
  eyebrow,
  children,
  align = 'left',
}: PageHeaderProps) {
  const colors = useColors();
  const { isCompact } = useBreakpoint();
  const styles = createHeaderStyles(colors, isCompact);
  const textAlign = align === 'center' ? 'center' : 'left';

  return (
    <View style={[styles.container, align === 'center' && styles.centered]}>
      {eyebrow ? (
        <Text style={[styles.eyebrow, { textAlign }]}>{eyebrow}</Text>
      ) : null}
      <Text
        style={[styles.title, { textAlign }]}
        accessibilityRole="header"
        {...({ 'aria-level': 1 } as object)}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { textAlign }]}>{subtitle}</Text>
      ) : null}
      {children ? <View style={styles.extra}>{children}</View> : null}
    </View>
  );
}

const createHeaderStyles = (colors: ColorsType, isCompact: boolean) =>
  StyleSheet.create({
    container: {
      marginBottom: isCompact ? 24 : 40,
      gap: 6,
    },
    centered: {
      alignItems: 'center',
    },
    eyebrow: {
      fontFamily: 'Afacad-Bold',
      fontSize: 14,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.textSecondary,
    },
    title: {
      fontFamily: 'Afacad-Bold',
      fontSize: isCompact ? 30 : 40,
      lineHeight: isCompact ? 36 : 48,
      color: colors.primaryBlack,
    },
    subtitle: {
      fontFamily: 'Afacad-Regular',
      fontSize: isCompact ? 17 : 19,
      lineHeight: isCompact ? 24 : 28,
      color: colors.textSecondary,
      maxWidth: 680,
    },
    extra: {
      marginTop: 16,
      width: '100%',
    },
  });

export default PageContainer;
