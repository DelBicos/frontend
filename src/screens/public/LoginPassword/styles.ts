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
    formContainer: {
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

    // --- Role Switcher (User/Admin) ---
    roleToggle: {
      flexDirection: 'row',
      width: '100%',
      marginBottom: 24,
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 4,
    },
    roleButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    roleButtonActive: {
      backgroundColor: colors.primaryBlue,
      // Sombra sutil no botão ativo
      ...Platform.select({
        web: { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
        default: { elevation: 1 },
      }),
    },
    roleText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      color: colors.textSecondary,
    },
    roleTextActive: {
      color: colors.primaryWhite,
      fontFamily: 'Afacad-Bold',
    },

    title: {
      fontSize: 28,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlue,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      marginBottom: 32,
      textAlign: 'center',
    },

    // --- Form Elements ---
    inputWrapper: {
      width: '100%',
      marginBottom: 16,
    },
    button: {
      height: 50,
      backgroundColor: colors.primaryBlue,
      borderRadius: 12,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
      flexDirection: 'row',
    },
    buttonDisabled: {
      backgroundColor: colors.textTertiary,
      opacity: 0.8,
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    buttonText: {
      color: colors.primaryWhite,
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
    },

    // --- Links ---
    linkContainer: {
      marginTop: 24,
      flexDirection: 'row',
      alignItems: 'center',
    },
    linkText: {
      color: colors.textSecondary,
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
    },
    linkTextBold: {
      fontFamily: 'Afacad-Bold',
      color: colors.primaryOrange,
      textDecorationLine: 'underline',
      marginLeft: 4,
    },

    // --- Footer ---
    footer: {
      padding: 20,
      textAlign: 'center',
      fontSize: 12,
      fontFamily: 'Afacad-Regular',
      color: colors.primaryWhite,
      opacity: 0.8,
    },

    // --- Modal ---
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.overlay,
      padding: 24,
    },
    modalContent: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      ...Platform.select({
        default: { elevation: 10 },
      }),
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: 'Afacad-Bold',
      color: colors.errorText,
      marginBottom: 12,
    },
    modalText: {
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
      color: colors.primaryBlack,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    modalButton: {
      width: '100%',
      marginTop: 0,
      backgroundColor: colors.primaryBlue,
    },
  });
