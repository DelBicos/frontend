import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

import { webStyle } from '@utils/webStyle';
export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },

    // --- Card de categoria ---
    card: {
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.cardBackground,
      ...Platform.select({
        web: webStyle({
          boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.12)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }),
        default: { elevation: 3 },
      }),
    },
    // Card com imagem: proporcao fixa. Sem imagem: altura minima, para o
    // icone e o titulo nunca se sobreporem.
    cardMedia: {
      aspectRatio: 16 / 10,
    },
    cardPlain: {
      flex: 1,
      minHeight: 112,
    },
    cardHovered: {
      transform: [{ translateY: -3 }],
      ...webStyle({ boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.2)' }),
    },
    cardImage: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    plainContent: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 8,
      padding: 14,
    },
    plainIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardGradient: {
      paddingHorizontal: 14,
      paddingTop: 28,
      paddingBottom: 14,
    },
    cardTitle: {
      fontSize: 18,
      lineHeight: 22,
      fontFamily: 'Afacad-Bold',
    },
    // Titulo sobre a foto: claro, com sombra para manter a leitura.
    cardTitleOnImage: {
      color: colors.textOnImage,
      textShadowColor: colors.overlay,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },

    // --- Variante compacta (celular) ---
    cardCompact: {
      borderRadius: 12,
    },
    cardMediaCompact: {
      aspectRatio: 3 / 2,
    },
    cardPlainCompact: {
      minHeight: 96,
    },
    plainContentCompact: {
      padding: 10,
      gap: 6,
    },
    cardPressed: {
      opacity: 0.85,
    },
    plainIconCompact: {
      width: 34,
      height: 34,
      borderRadius: 17,
    },
    cardGradientCompact: {
      paddingHorizontal: 10,
      paddingTop: 20,
      paddingBottom: 10,
    },
    cardTitleCompact: {
      fontSize: 16,
      lineHeight: 19,
    },

    loadingContainer: {
      height: 130,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    emptyText: {
      color: colors.textSecondary,
      fontFamily: 'Afacad-Regular',
    },
  });
