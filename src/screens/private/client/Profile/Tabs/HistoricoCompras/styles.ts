import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    monthBar: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 4,
      marginBottom: 16,
      padding: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
    },
    monthArrow: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      ...Platform.select({ web: { cursor: 'pointer' } as object }),
    },
    monthArrowOff: {
      opacity: 0.3,
    },
    monthText: {
      minWidth: 170,
      textAlign: 'center',
      fontFamily: 'Afacad-Bold',
      fontSize: 18,
      color: colors.primaryBlack,
    },
    stats: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 20,
    },
    stat: {
      flexGrow: 1,
      flexBasis: 140,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
    },
    statValue: {
      fontFamily: 'Afacad-Bold',
      fontSize: 24,
      color: colors.primaryBlack,
    },
    statLabel: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    list: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      padding: 14,
    },
    rowDivider: {
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    date: {
      width: 56,
      paddingVertical: 6,
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
    },
    dateText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 14,
      textAlign: 'center',
      color: colors.primaryBlack,
    },
    rowTexts: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    service: {
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
      color: colors.primaryBlack,
    },
    meta: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    badge: {
      alignSelf: 'flex-start',
      marginTop: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
    },
    badgeDone: {
      backgroundColor: colors.successBackground,
    },
    badgeCanceled: {
      backgroundColor: colors.errorBackground,
    },
    badgeText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 13,
    },
    rowEnd: {
      alignItems: 'flex-end',
      gap: 4,
    },
    price: {
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
      color: colors.primaryBlack,
    },
    priceCanceled: {
      color: colors.textSecondary,
      textDecorationLine: 'line-through',
    },
    rowActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      gap: 4,
    },
    exportBlock: {
      marginTop: 24,
    },
    exportText: {
      marginTop: -8,
      marginBottom: 16,
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      color: colors.textSecondary,
    },
    exportActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
  });
