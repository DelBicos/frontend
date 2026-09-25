import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      marginTop: 16,
    },
    paymentElementContainer: {
      marginBottom: 24,
      minHeight: 200,
    },
    checkoutButton: {
      backgroundColor: colors.primaryBlue,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    checkoutButtonDisabled: {
      backgroundColor: colors.textTertiary,
      opacity: 0.7,
    },
    checkoutButtonText: {
      color: colors.primaryWhite,
      fontSize: 16,
      fontFamily: 'Afacad-Bold',
    },
    errorMessageText: {
      color: colors.errorText,
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 16,
      padding: 8,
      backgroundColor: colors.errorBackground,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.errorText,
    },
  });
