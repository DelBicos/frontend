import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    photoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
    },
    photoRowNarrow: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    photoActions: {
      flex: 1,
      gap: 12,
    },
    buttons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    feedback: {
      marginTop: 16,
      marginBottom: -16,
    },
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
    readonly: {
      gap: 2,
      marginBottom: 20,
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
    },
    readonlyLabel: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 14,
      color: colors.textSecondary,
    },
    readonlyValue: {
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
      color: colors.primaryBlack,
    },
    hint: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      lineHeight: 21,
      color: colors.textSecondary,
    },
    link: {
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
      textDecorationLine: 'underline',
    },
    formActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
    },
  });
