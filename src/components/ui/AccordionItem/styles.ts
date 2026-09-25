import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      marginBottom: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
        },
        android: {
          elevation: 2,
        },
        web: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease-in-out',
        },
      }),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: colors.cardBackground,
    },
    title: {
      fontSize: 16,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
      flex: 1,
      marginRight: 16,
    },
    icon: {
      marginLeft: 8,
    },
    body: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    bodyText: {
      marginTop: 12,
      fontSize: 15,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      lineHeight: 22,
    },
  });
