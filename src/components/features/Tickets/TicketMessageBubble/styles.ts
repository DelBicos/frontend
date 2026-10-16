import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.secondaryGray,
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
      borderLeftWidth: 3,
      borderLeftColor: colors.textTertiary,
    },
    adminContainer: {
      backgroundColor: colors.badgeBackground,
      borderLeftColor: colors.primaryOrange,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 10,
    },
    avatarFallback: {
      backgroundColor: colors.primaryBlue,
      justifyContent: 'center',
      alignItems: 'center',
    },
    authorInfo: {
      flex: 1,
    },
    authorName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primaryBlack,
      marginBottom: 2,
    },
    authorMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    authorBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: colors.secondaryBeige,
    },
    adminBadge: {
      backgroundColor: colors.primaryOrange,
    },
    authorBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    adminBadgeText: {
      color: colors.primaryWhite,
    },
    dateText: {
      fontSize: 10,
      color: colors.textTertiary,
    },
    content: {
      fontSize: 14,
      color: colors.primaryBlack,
      lineHeight: 20,
    },
    attachment: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      gap: 4,
    },
    attachmentText: {
      fontSize: 12,
      color: colors.primaryOrange,
      textDecorationLine: 'underline',
    },
  });