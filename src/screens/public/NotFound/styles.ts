import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryOrange,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    icon: {
      marginBottom: 24,
    },
    errorText: {
      fontSize: 48,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryWhite,
      marginBottom: 8,
      textAlign: 'center',
    },
    descriptionText: {
      fontSize: 18,
      fontFamily: 'Afacad-Regular',
      color: colors.primaryWhite,
      marginBottom: 48,
      textAlign: 'center',
      opacity: 0.9,
    },
    button: {
      backgroundColor: colors.primaryBlue,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 35,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      maxWidth: 300,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    buttonText: {
      fontSize: 20,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryWhite,
    },
  });
