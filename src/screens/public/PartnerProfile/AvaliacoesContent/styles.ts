import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    listContent: {
      padding: 16,
      paddingBottom: 40,
    },
    summaryContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      marginBottom: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    summaryTitle: {
      fontSize: 18,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
    },
    summaryCount: {
      fontSize: 14,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
    },
    reviewCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
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
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        },
      }),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    avatarContainer: {
      marginRight: 12,
    },
    avatarImage: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.inputBackground,
    },
    avatarFallback: {
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.borderColor,
    },

    headerInfo: {
      flex: 1,
      justifyContent: 'center',
      minHeight: 48,
    },
    topLine: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    userName: {
      fontSize: 16,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
      flex: 1,
      marginRight: 8,
    },
    dateText: {
      fontSize: 12,
      fontFamily: 'Afacad-Regular',
      color: colors.textTertiary,
    },
    ratingWrapper: {
      alignItems: 'flex-start',
    },
    commentContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    commentText: {
      fontSize: 15,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      lineHeight: 22,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      marginTop: 40,
    },
    emptyText: {
      fontSize: 18,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginTop: 16,
      textAlign: 'center',
    },
    emptySubText: {
      fontSize: 14,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
    },
  });
