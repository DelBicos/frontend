import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: 'transparent',
    },
    pageTitle: {
      fontSize: 24,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 24,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      minHeight: 300,
    },
    emptyText: {
      fontSize: 18,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
      textAlign: 'center',
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      fontFamily: 'Afacad-Regular',
    },
    scrollContent: {
      paddingBottom: 40,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    cardWrapper: {
      width: '100%',
    },
    favCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
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
      }),
    },
    favCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    favAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    favInfoContainer: {
      flex: 1,
      marginLeft: 16,
    },
    favName: {
      fontSize: 18,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 4,
    },
    favCategory: {
      fontSize: 14,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
    },
    favServiceTitle: {
      fontSize: 13,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlue,
      marginTop: 2,
    },
    favRemoveButton: {
      padding: 8,
      alignSelf: 'flex-start',
    },
    favFooter: {
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      paddingTop: 12,
      alignItems: 'flex-end',
    },
    favProfileButton: {
      backgroundColor: colors.primaryOrange,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    favProfileButtonText: {
      color: colors.primaryWhite,
      fontSize: 14,
      fontFamily: 'Afacad-Bold',
    },
  });
