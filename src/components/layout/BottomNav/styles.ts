import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      backgroundColor: colors.cardBackground,
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
      paddingTop: 6,
      paddingBottom: 6,
    },
    item: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 52,
      gap: 2,
    },
    indicator: {
      width: 56,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    indicatorActive: {
      backgroundColor: colors.primaryOrange + '22',
    },
    avatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1.5,
    },
    label: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 12,
    },
    labelActive: {
      fontFamily: 'Afacad-Bold',
    },
  });
