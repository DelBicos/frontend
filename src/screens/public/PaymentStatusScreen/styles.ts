import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (
  colors: ColorsType,
  isDark: boolean = false,
  isHighContrast: boolean = false,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      backgroundColor: isDark
        ? colors.secondaryGray
        : isHighContrast
          ? colors.primaryWhite
          : '#DDE6F0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      width: '100%',
      maxWidth: 500,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 32,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: { elevation: 5 },
        web: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)' },
      }),
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    iconSuccess: {
      backgroundColor: colors.successBackground,
    },
    iconError: {
      backgroundColor: colors.errorBackground,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlue,
      marginBottom: 12,
      textAlign: 'center',
    },
    message: {
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 24,
    },
    button: {
      width: '100%',
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    buttonText: {
      color: colors.primaryWhite,
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
    },
    receiptButton: {
      backgroundColor: colors.primaryOrange,
      marginBottom: 16,
    },
    homeButton: {
      backgroundColor: colors.primaryBlue,
    },
    errorButton: {
      backgroundColor: colors.primaryBlue,
    },
    buttonDisabled: {
      opacity: 0.7,
      backgroundColor: colors.textTertiary,
    },
  });
