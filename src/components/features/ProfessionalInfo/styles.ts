import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 0,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 12,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    textContainer: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    name: {
      fontSize: 16,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 2,
    },
    serviceDetails: {
      fontSize: 12,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    viewProfileButton: {
      paddingVertical: 2,
    },
    viewProfileText: {
      fontSize: 12,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlue,
      textDecorationLine: 'underline',
    },
  });
