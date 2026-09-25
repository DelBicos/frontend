import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center',
      marginVertical: 10,
    },
    sliderWrapper: {
      width: '100%',
    },
    listContent: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      flexGrow: 1,
      gap: 16, // gap between items (supported in React Native 0.71+)
    },
    // --- GRID STYLE (MOBILE) ---
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      paddingHorizontal: 16,
      gap: 20, // gap for react native 0.71+
    },
    // --- BUBBLE STYLE (MOBILE) ---
    bubbleCard: {
      alignItems: 'center',
      width: 80,
    },
    bubble: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      // Usando a nova propriedade boxShadow do React Native (0.74+) que funciona no Android
      // para criar sombras com direção (offset) real, ignorando a limitação do elevation.
      boxShadow: '-4px 4px 10px rgba(204, 104, 0, 0.3)',
    },
    bubbleTitle: {
      fontSize: 12,
      fontFamily: 'Afacad-SemiBold',
      textAlign: 'center',
      color: colors.primaryBlack,
      lineHeight: 14,
    },

    // --- IMAGE CARD STYLE (WEB) ---
    webCard: {
      width: 220,
      height: 140,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.cardBackground,
      ...Platform.select({
        web: {
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
        } as any,
      }),
    },
    webCardHovered: {
      transform: [{ scale: 1.03 }],
    },
    webCardImage: {
      width: '100%',
      height: '100%',
      justifyContent: 'flex-end',
    },
    webCardGradient: {
      height: '50%',
      justifyContent: 'flex-end',
      padding: 16,
    },
    webCardTitle: {
      fontSize: 18,
      fontFamily: 'Afacad-Bold',
      color: '#FFFFFF',
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
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
