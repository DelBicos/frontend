import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: colors.primaryBlack,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    code: {
      fontSize: 12,
      color: colors.textTertiary,
      fontWeight: '500',
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primaryBlack,
      marginBottom: 12,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    footerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      marginRight: 6,
    },
    footerText: {
      fontSize: 12,
      color: colors.textTertiary,
    },
    chevron: {
      position: 'absolute',
      right: 12,
      top: '50%',
      marginTop: -7,
    },
  });