import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      height: 56,
      overflow: 'hidden',
    },
    input: {
      flex: 1,
      paddingHorizontal: 16,
      height: '100%',
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
      color: colors.primaryBlack,
    },
    inputError: {
      borderColor: colors.errorText,
      borderWidth: 1.5,
    },
    eyeButton: {
      paddingHorizontal: 16,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
