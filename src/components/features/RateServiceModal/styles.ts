import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      backgroundColor: colors.cardBackground,
      borderRadius: 24,
      padding: 24,
      width: '100%',
      maxWidth: 450,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        },
        android: {
          elevation: 10,
        },
        web: {
          boxShadow: '0px 10px 30px rgba(0,0,0,0.2)',
        },
      }),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    closeButton: {
      padding: 8,
    },
    title: {
      fontSize: 20,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 24,
    },
    highlightText: {
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlue,
    },
    ratingContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    ratingComponent: {
      paddingVertical: 10,
      backgroundColor: 'transparent',
    },
    ratingLabel: {
      fontSize: 16,
      fontFamily: 'Afacad-SemiBold',
      marginTop: 8,
    },
    inputWrapper: {
      marginBottom: 24,
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
      color: colors.primaryBlack,
      minHeight: 120,
      backgroundColor: colors.inputBackground,
      textAlignVertical: 'top',
    },
    charCounter: {
      fontSize: 12,
      color: colors.textTertiary,
      textAlign: 'right',
      marginTop: 6,
      fontFamily: 'Afacad-Regular',
    },
    submitButton: {
      backgroundColor: colors.primaryOrange,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitButtonDisabled: {
      backgroundColor: colors.textTertiary,
      opacity: 0.5,
    },
    submitButtonText: {
      color: colors.primaryWhite,
      fontSize: 16,
      fontFamily: 'Afacad-Bold',
    },

    // --- Success Modal Interno ---
    successOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 10,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.overlay,
      borderRadius: 24,
    },
    successCard: {
      backgroundColor: colors.cardBackground,
      padding: 32,
      borderRadius: 24,
      alignItems: 'center',
      width: '100%',
    },
    successIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.successText,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    successTitle: {
      fontSize: 22,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 8,
    },
    successMessage: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      fontFamily: 'Afacad-Regular',
    },
    successButton: {
      backgroundColor: colors.successText,
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 30,
    },
    successButtonText: {
      color: colors.primaryWhite,
      fontSize: 16,
      fontFamily: 'Afacad-Bold',
    },
  });
