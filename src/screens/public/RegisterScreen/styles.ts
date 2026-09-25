import { StyleSheet, Platform } from 'react-native';

export const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryOrange,
    },
    scrollContainer: {
      flex: 1,
    },
    contentContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    logo: {
      width: 150,
      height: 150,
      marginBottom: 40,
    },
    formContainer: {
      backgroundColor: colors.primaryWhite,
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 500,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        android: {
          elevation: 5,
        },
        web: {
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        },
      }),
    },
    title: {
      fontSize: 32,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlue,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
      color: '#6c757d',
      marginBottom: 32,
      textAlign: 'center',
    },
    errorText: {
      color: '#D32F2F',
      fontSize: 14,
      marginTop: 4,
      fontFamily: 'Afacad-Regular',
    },
    row: {
      flexDirection: Platform.OS === 'web' ? 'row' : 'column',
      gap: 16,
    },
    col: {
      flex: 1,
    },
    locationContainer: {
      flexDirection: 'row',
      width: '100%',
    },
    locationInput: {
      flex: 1,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      backgroundColor: '#F8F9FA',
    },
    locationButton: {
      backgroundColor: colors.primaryBlue,
      paddingHorizontal: 16,
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    locationButtonText: {
      fontSize: 20,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      borderWidth: 1,
      borderColor: '#CED4DA',
      borderRadius: 8,
    },
    passwordInput: {
      flex: 1,
      borderWidth: 0,
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    passwordContainerError: {
      borderColor: '#D32F2F',
      borderWidth: 1.5,
    },
    eyeButton: {
      padding: 12,
    },
    eyeIcon: {
      fontSize: 24,
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
      justifyContent: 'flex-start',
      width: '100%',
    },
    termsText: {
      marginLeft: 12,
      fontSize: 14,
      color: '#495057',
      fontFamily: 'Afacad-Regular',
      flexShrink: 1,
    },
    button: {
      backgroundColor: colors.primaryBlue,
      padding: 16,
      borderRadius: 8,
      width: '100%',
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: colors.primaryWhite,
      fontWeight: 'bold',
      fontSize: 16,
      fontFamily: 'Afacad-Bold',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    linkText: {
      marginTop: 24,
      color: colors.primaryBlue,
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      textAlign: 'center',
    },
    linkTextBold: {
      fontFamily: 'Afacad-Bold',
      textDecorationLine: 'underline',
    },
    footer: {
      padding: 10,
      textAlign: 'center',
      fontSize: 12,
      color: colors.primaryWhite,
    },
  });
