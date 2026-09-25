import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },

    // --- Card de categoria ---
    card: {
      aspectRatio: 16 / 10,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.cardBackground,
      ...Platform.select({
        web: {
          boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.12)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        } as any,
        default: { elevation: 3 },
      }),
    },
    cardHovered: {
      transform: [{ translateY: -3 }],
      ...Platform.select({
        web: { boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.2)' } as any,
      }),
    },
    cardImage: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    cardIcon: {
      position: 'absolute',
      top: 16,
      left: 16,
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: 'rgba(255,255,255,0.18)',
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
      color: '#FFFFFF',
      textShadowColor: 'rgba(0, 0, 0, 0.6)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },

    // --- Variante compacta (celular) ---
    cardCompact: {
      aspectRatio: 3 / 2,
      borderRadius: 12,
    },
    cardPressed: {
      opacity: 0.85,
    },
    cardIconCompact: {
      top: 10,
      left: 10,
      width: 38,
      height: 38,
      borderRadius: 19,
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
