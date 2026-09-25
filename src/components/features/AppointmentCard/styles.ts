import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        android: {
          elevation: 3,
        },
        web: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      }),
    },
    imageContainer: {
      height: 120,
      position: 'relative',
      backgroundColor: colors.inputBackground,
    },
    cardImage: {
      width: '100%',
      height: '100%',
    },
    statusBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    badgeCompleted: {
      backgroundColor: colors.successText,
    },
    badgeUpcoming: {
      backgroundColor: colors.primaryBlue,
    },
    statusText: {
      color: colors.primaryWhite,
      fontSize: 10,
      fontFamily: 'Afacad-Bold',
      textTransform: 'uppercase',
    },
    favoriteButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderRadius: 20,
      padding: 6,
    },
    avatarContainer: {
      position: 'absolute',
      bottom: -20,
      left: 16,
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 3,
      borderColor: colors.cardBackground,
      backgroundColor: colors.inputBackground,
      overflow: 'hidden',
      zIndex: 1,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    content: {
      padding: 16,
      paddingTop: 28,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    idText: {
      fontSize: 11,
      fontFamily: 'Afacad-SemiBold',
      color: colors.textTertiary,
      marginBottom: 2,
    },
    profName: {
      fontSize: 14,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    serviceTitle: {
      fontSize: 16,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryOrange,
      marginBottom: 6,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    infoIcon: {
      width: 16,
      textAlign: 'center',
      marginRight: 6,
    },
    infoText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontFamily: 'Afacad-Regular',
      flex: 1,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 12,
    },
    detailsButton: {
      flex: 1,
      backgroundColor: colors.primaryBlue,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    rateButton: {
      flex: 1,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primaryOrange,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    btnTextPrimary: {
      color: colors.primaryWhite,
      fontSize: 14,
      fontFamily: 'Afacad-Bold',
    },
    btnTextSecondary: {
      color: colors.primaryOrange,
      fontSize: 14,
      fontFamily: 'Afacad-Bold',
    },
  });
