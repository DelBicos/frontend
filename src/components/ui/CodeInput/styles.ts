import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    codeContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      maxWidth: 450,
      alignSelf: 'center',
      marginBottom: 24,
      gap: 8,
    },
    codeInput: {
      width: 48,
      height: 56,
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderRadius: 12,
      textAlign: 'center',
      fontSize: 24,
      fontFamily: 'Afacad-Bold',
      backgroundColor: colors.inputBackground,
      color: colors.primaryBlack,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    codeInputFocused: {
      borderColor: colors.primaryOrange,
      borderWidth: 2,
      backgroundColor: colors.cardBackground,
      transform: [{ scale: 1.05 }],
    },
    codeInputFilled: {
      borderColor: colors.primaryBlue,
      backgroundColor: '#F0F7FF',
    },
  });
