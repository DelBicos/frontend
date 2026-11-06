import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      padding: 4,
      gap: 4,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
      alignSelf: 'flex-start',
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      minHeight: 40,
      paddingHorizontal: 12,
      borderRadius: 9,
      ...Platform.select({ web: { cursor: 'pointer' } as object }),
    },
    containerFill: {
      alignSelf: 'stretch',
    },
    buttonFill: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 4,
      minHeight: 60,
      paddingHorizontal: 4,
    },
    labelFill: {
      fontSize: 14,
      textAlign: 'center',
    },
    buttonActive: {
      backgroundColor: colors.primaryOrange,
    },
    label: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 15,
      color: colors.primaryBlack,
    },
    labelActive: {
      color: '#000000',
    },
  });
