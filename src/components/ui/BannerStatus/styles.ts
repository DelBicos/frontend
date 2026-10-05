import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    statusContainer: {
      marginBottom: 16,
      width: '100%',
      alignItems: 'flex-start',
    },
    statusBanner: {
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      minWidth: 120,
    },
    statusText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    reminderButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    reminderText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 12,
      color: colors.primaryBlue,
      textDecorationLine: 'underline',
    },
  });
