import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    loading: {
      marginVertical: 48,
    },
    summary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      padding: 20,
      marginBottom: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
    },
    average: {
      fontFamily: 'Afacad-Bold',
      fontSize: 44,
      lineHeight: 48,
      color: colors.primaryBlack,
    },
    summaryTexts: {
      gap: 4,
    },
    summaryText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      color: colors.textSecondary,
    },
    pendingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
    },
    pendingDivider: {
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    pendingTexts: {
      flex: 1,
      minWidth: 0,
    },
    pendingName: {
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
      color: colors.primaryBlack,
    },
    pendingMeta: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    sectionTitle: {
      marginTop: 8,
      marginBottom: 12,
      fontFamily: 'Afacad-Bold',
      fontSize: 20,
      color: colors.primaryBlack,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      margin: -6,
    },
    gridItem: {
      padding: 6,
    },
  });
