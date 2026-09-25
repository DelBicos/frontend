import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },

    // --- Card com imagem (tablet/desktop) ---
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

    // --- Bolha com icone (celular) ---
    bubbleCard: {
      alignItems: 'center',
      minHeight: 44,
    },
    bubble: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    bubbleTitle: {
      fontSize: 14,
      lineHeight: 17,
      fontFamily: 'Afacad-SemiBold',
      textAlign: 'center',
      color: colors.primaryBlack,
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
