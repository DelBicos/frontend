import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    tabs: {
      marginBottom: 24,
    },
    loader: {
      paddingVertical: 48,
    },
    day: {
      marginBottom: 24,
    },
    dayTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 20,
      color: colors.primaryBlack,
      marginBottom: 10,
    },
    list: {
      gap: 12,
    },
    empty: {
      alignItems: 'center',
      gap: 12,
      paddingVertical: 40,
      paddingHorizontal: 24,
      borderRadius: 16,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderColor,
    },
    emptyText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 17,
      lineHeight: 24,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    errorBox: {
      padding: 14,
      borderRadius: 12,
      marginBottom: 16,
      backgroundColor: colors.errorBackground,
    },
    errorText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 15,
      color: colors.errorText,
    },

    // --- Sem login ---
    gate: {
      alignItems: 'center',
      gap: 12,
      padding: 28,
      borderRadius: 20,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    gateTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 24,
      textAlign: 'center',
      color: colors.primaryBlack,
    },
    gateText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 17,
      lineHeight: 24,
      textAlign: 'center',
      color: colors.textSecondary,
    },
    primaryButton: {
      minHeight: 48,
      paddingHorizontal: 28,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryOrange,
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    primaryButtonText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
      // Texto escuro sobre laranja (contraste AA).
      color: '#000000',
    },
  });
