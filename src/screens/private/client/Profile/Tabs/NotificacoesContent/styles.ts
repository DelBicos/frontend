import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    loading: {
      marginVertical: 48,
    },
    chips: {
      marginBottom: 20,
    },
    group: {
      marginBottom: 24,
    },
    groupLabel: {
      marginBottom: 8,
      marginLeft: 4,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 14,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.textSecondary,
    },
    list: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
      overflow: 'hidden',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      padding: 14,
      ...Platform.select({ web: { cursor: 'pointer' } as object }),
    },
    itemDivider: {
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    itemPressed: {
      backgroundColor: colors.inputBackground,
    },
    icon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.inputBackground,
    },
    texts: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 8,
    },
    title: {
      flex: 1,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 17,
      color: colors.primaryBlack,
    },
    titleUnread: {
      fontFamily: 'Afacad-Bold',
    },
    time: {
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      color: colors.textSecondary,
    },
    message: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      lineHeight: 22,
      color: colors.textSecondary,
    },
    dot: {
      width: 10,
      height: 10,
      marginTop: 6,
      borderRadius: 5,
      backgroundColor: colors.primaryOrange,
    },
  });
