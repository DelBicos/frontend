import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    wrapper: {
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
      backgroundColor: colors.backgroundElevated,
    },
    heading: {
      paddingHorizontal: 12,
      color: colors.primaryBlack,
      fontSize: 15,
      fontFamily: 'Afacad-SemiBold',
    },
    helper: {
      paddingHorizontal: 12,
      marginTop: 2,
      color: colors.textSecondary,
      fontSize: 12,
    },
    scrollContent: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 10,
    },
    card: {
      width: 300,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderRadius: 14,
      backgroundColor: colors.cardBackground,
      gap: 7,
    },
    professionalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },
    avatarFallback: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.inputBackground,
    },
    professionalInfo: {
      flex: 1,
      gap: 3,
    },
    professionalName: {
      color: colors.primaryBlack,
      fontSize: 16,
      fontFamily: 'Afacad-SemiBold',
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    ratingText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    serviceTitle: {
      color: colors.primaryBlack,
      fontSize: 16,
      fontFamily: 'Afacad-SemiBold',
      marginTop: 2,
    },
    categoryText: {
      color: colors.primaryOrange,
      fontSize: 12,
      fontFamily: 'Afacad-SemiBold',
    },
    description: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    detailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    detail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    price: {
      color: colors.primaryGreen,
      fontSize: 14,
      fontFamily: 'Afacad-SemiBold',
    },
    detailText: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    professionalDescription: {
      color: colors.textTertiary,
      fontSize: 12,
      lineHeight: 16,
    },
    selectButton: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: colors.primaryOrange,
    },
    selectButtonDisabled: {
      opacity: 0.55,
    },
    selectButtonText: {
      color: colors.primaryWhite,
      fontSize: 14,
      fontFamily: 'Afacad-SemiBold',
    },
  });
