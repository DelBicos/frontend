import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType, isCompact: boolean) =>
  StyleSheet.create({
    loading: {
      marginVertical: 60,
    },
    headerLinks: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: 20,
    },
    link: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minHeight: 44,
    },
    linkText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.primaryBlack,
      textDecorationLine: 'underline',
    },

    toolbar: {
      gap: 12,
      marginBottom: 16,
    },
    count: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 17,
      color: colors.textSecondary,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -8,
    },
    gridItem: {
      padding: 8,
    },
    serviceList: {
      gap: 12,
    },

    empty: {
      alignItems: 'center',
      gap: 12,
      paddingVertical: isCompact ? 32 : 48,
      paddingHorizontal: 24,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    emptyTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 21,
      color: colors.primaryBlack,
      textAlign: 'center',
    },
    emptyText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 17,
      lineHeight: 24,
      color: colors.textSecondary,
      textAlign: 'center',
      maxWidth: 520,
    },
    emptyButton: {
      marginTop: 8,
      minHeight: 48,
      paddingHorizontal: 24,
      borderRadius: 12,
      justifyContent: 'center',
      backgroundColor: colors.primaryOrange,
      ...Platform.select({ web: { cursor: 'pointer' } as object }),
    },
    emptyButtonText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
      color: '#000000',
    },
  });
