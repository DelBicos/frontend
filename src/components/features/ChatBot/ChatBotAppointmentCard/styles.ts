import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      overflow: 'hidden',
      marginVertical: 4,
      marginHorizontal: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 12,
      gap: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.inputBackground,
    },
    avatarFallback: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerText: {
      flex: 1,
    },
    serviceTitle: {
      fontSize: 15,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
    },
    professionalName: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    subcategory: {
      fontSize: 11,
      color: colors.primaryOrange,
      marginTop: 2,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 3,
    },
    ratingText: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    statusBadge: {
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
      alignSelf: 'flex-start',
    },
    statusText: {
      fontSize: 11,
      fontFamily: 'Afacad-SemiBold',
    },
    details: {
      padding: 12,
      gap: 6,
    },
    description: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    detailText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    actions: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      gap: 6,
    },
    rescheduleButton: {
      borderRightWidth: 0.5,
      borderRightColor: colors.divider,
    },
    cancelButton: {},
    disabledButton: {
      opacity: 0.5,
    },
    actionText: {
      fontSize: 14,
      fontFamily: 'Afacad-SemiBold',
    },
  });
