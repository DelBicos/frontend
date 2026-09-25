import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryOrange,
    },
    contentContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    logo: {
      width: 120,
      height: 120,
      resizeMode: 'contain',
      marginBottom: 32,
    },
    card: {
      width: '100%',
      maxWidth: 450,
      backgroundColor: colors.cardBackground,
      borderRadius: 24,
      padding: 32,
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
        web: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        },
      }),
    },
    title: {
      fontSize: 28,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlue,
      marginBottom: 12,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      marginBottom: 32,
      textAlign: 'center',
      lineHeight: 24,
    },
    emailText: {
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlue,
    },

    // Botões
    button: {
      height: 50,
      backgroundColor: colors.primaryBlue,
      borderRadius: 12,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 16,
    },
    buttonDisabled: {
      backgroundColor: colors.textTertiary,
      opacity: 0.8,
    },
    buttonText: {
      color: colors.primaryWhite,
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
    },

    // Reenviar
    resendButton: {
      marginTop: 24,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
    },
    resendText: {
      color: colors.primaryOrange,
      fontSize: 16,
      fontFamily: 'Afacad-Bold',
      textDecorationLine: 'underline',
    },
    resendTextDisabled: {
      color: colors.textTertiary,
      textDecorationLine: 'none',
      fontFamily: 'Afacad-Regular',
    },

    // Footer
    footer: {
      padding: 16,
      textAlign: 'center',
      fontSize: 12,
      fontFamily: 'Afacad-Regular',
      color: colors.primaryWhite,
      opacity: 0.8,
    },
  });
