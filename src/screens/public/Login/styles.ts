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
      width: 150,
      height: 150,
      resizeMode: 'contain',
      marginBottom: 32,
    },
    card: {
      width: '100%',
      maxWidth: 420,
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
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
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
    button: {
      backgroundColor: colors.primaryBlue,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      width: '100%',
      alignItems: 'center',
      marginTop: 12,
    },
    buttonText: {
      color: colors.primaryWhite,
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
    },
    inputContainer: {
      width: '100%',
      marginTop: 24,
      marginBottom: 12,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginVertical: 24,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: colors.divider,
    },
    dividerText: {
      marginHorizontal: 12,
      color: colors.textTertiary,
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primaryBlue,
    },
    buttonTextSecondary: {
      color: colors.primaryBlue,
    },
    footer: {
      padding: 16,
      textAlign: 'center',
      fontSize: 12,
      fontFamily: 'Afacad-Regular',
      color: colors.primaryWhite,
      opacity: 0.8,
    },
  });
