import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    inboxRoot: {
      flex: 1,
      flexDirection: 'row',
      minHeight: 0,
      height: '100%',
    },
    listColumn: {
      width: 320,
      minWidth: 280,
      maxWidth: 360,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: colors.divider,
      minHeight: 0,
    },
    divider: {
      width: 0,
    },
    threadColumn: {
      flex: 1,
      minWidth: 0,
      minHeight: 0,
    },
    emptyThread: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      backgroundColor: colors.inputBackground,
    },
    emptyThreadTitle: {
      marginTop: 20,
      fontSize: 20,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
    },
    emptyThreadText: {
      marginTop: 8,
      fontSize: 15,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      maxWidth: 320,
      lineHeight: 22,
    },
    mobileListOnly: {
      flex: 1,
      minHeight: 400,
    },
  });
