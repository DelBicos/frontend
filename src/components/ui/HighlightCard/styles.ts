import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (
  colors: ColorsType,
  size: 'compact' | 'large' = 'compact',
) => {
  const large = size === 'large';
  return StyleSheet.create({
    card: {
      backgroundColor: colors.inputBackground,
      overflow: 'hidden',
    },
    image: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    gradient: {
      flex: 1,
      justifyContent: 'flex-end',
      padding: large ? 40 : 20,
      // Espaco para os indicadores/controles sobrepostos ao rodape do slide.
      paddingBottom: large ? 64 : 52,
    },
    textContainer: {
      gap: large ? 8 : 6,
      maxWidth: large ? 560 : '100%',
    },
    title: {
      fontFamily: 'Afacad-Bold',
      fontSize: large ? 40 : 26,
      lineHeight: large ? 44 : 30,
      color: '#FFFFFF',
      textShadowColor: 'rgba(0, 0, 0, 0.6)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    description: {
      fontFamily: 'Afacad-Regular',
      fontSize: large ? 20 : 16,
      lineHeight: large ? 26 : 21,
      color: '#F5F5F5',
      textShadowColor: 'rgba(0, 0, 0, 0.6)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    cta: {
      marginTop: large ? 12 : 8,
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minHeight: 44,
      paddingHorizontal: 18,
      borderRadius: 999,
      // Texto escuro sobre o laranja da marca: contraste AA (branco ficaria ~2,6:1).
      backgroundColor: colors.primaryOrange,
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    ctaText: {
      fontFamily: 'Afacad-Bold',
      // 18px em negrito conta como "texto grande" (WCAG), mantendo contraste
      // suficiente tambem no laranja mais escuro do tema de alto contraste.
      fontSize: 18,
      color: '#000000',
    },
  });
};
