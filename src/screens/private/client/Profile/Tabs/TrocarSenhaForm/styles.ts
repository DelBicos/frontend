import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: 16,
    },
    rowNarrow: {
      flexDirection: 'column',
      gap: 0,
    },
    col: {
      flex: 1,
      minWidth: 0,
    },
    hint: {
      marginTop: -4,
      marginBottom: 20,
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      lineHeight: 21,
      color: colors.textSecondary,
    },
    strength: {
      gap: 6,
      marginTop: -4,
      marginBottom: 20,
    },
    bars: {
      flexDirection: 'row',
      gap: 6,
    },
    bar: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.borderColor,
    },
    strengthText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    strengthLabel: {
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
    },
    tip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 4,
    },
    tipText: {
      flex: 1,
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
  });
