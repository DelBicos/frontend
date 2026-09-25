import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    pageTitle: {
      fontSize: 24,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 24,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    formContainer: {
      gap: 16,
    },
    messageBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
      borderWidth: 1,
    },
    successBanner: {
      backgroundColor: colors.successBackground,
      borderColor: colors.successText,
    },
    errorBanner: {
      backgroundColor: colors.errorBackground,
      borderColor: colors.errorText,
    },
    messageText: {
      fontSize: 14,
      fontFamily: 'Afacad-SemiBold',
      flex: 1,
    },
    successText: {
      color: colors.successText,
    },
    errorText: {
      color: colors.errorText,
    },

    requirementsContainer: {
      marginTop: 8,
      padding: 16,
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
    },
    requirementsTitle: {
      fontSize: 14,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 12,
    },
    reqItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    reqText: {
      fontSize: 13,
      fontFamily: 'Afacad-Regular',
      marginLeft: 8,
    },

    buttonContainer: {
      marginTop: 24,
      alignItems: 'flex-end',
    },
    button: {
      backgroundColor: colors.primaryOrange,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      minWidth: 150,
      alignItems: 'center',
    },
    buttonDisabled: {
      backgroundColor: colors.textTertiary,
      opacity: 0.7,
    },
    buttonText: {
      color: colors.primaryWhite,
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
    },
  });
