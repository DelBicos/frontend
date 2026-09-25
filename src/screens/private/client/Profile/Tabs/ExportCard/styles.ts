import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
        web: {
          boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        } as any,
      }),
    },
    cardDisabled: {
      opacity: 0.7,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 4,
    },
    desc: {
      fontSize: 13,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
    },
    actionIcon: {
      marginLeft: 8,
    },
  });
