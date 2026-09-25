import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (
  colors: ColorsType,
  isDark: boolean = false,
  isHighContrast: boolean = false,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark
        ? colors.secondaryGray
        : isHighContrast
          ? colors.primaryWhite
          : '#DDE6F0',
    },

    // --- Header Imersivo ---
    headerWrapper: {
      position: 'relative',
      marginBottom: 70,
      backgroundColor: colors.primaryBlack,
    },
    headerImage: {
      width: '100%',
      height: 220,
    },
    gradientOverlay: {
      flex: 1,
      paddingTop: Platform.OS === 'android' ? 45 : 25,
      paddingHorizontal: 16,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.3)',
    },

    // --- Card Flutuante ---
    floatingInfoCard: {
      position: 'absolute',
      bottom: -50,
      left: 16,
      right: 16,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        android: {
          elevation: 6,
        },
        web: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        },
      }),
    },
    floatingCardContentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    avatarContainer: {
      marginRight: 16,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: { elevation: 3 },
      }),
    },
    avatarImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: colors.cardBackground,
      backgroundColor: colors.inputBackground,
    },
    avatarFallback: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    infoColumn: {
      flex: 1,
      justifyContent: 'center',
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 6,
    },
    profileName: {
      fontSize: 20,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      flex: 1,
      marginRight: 8,
      lineHeight: 24,
    },
    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 4,
    },
    ratingValue: {
      fontSize: 14,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryOrange,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap',
    },
    locationText: {
      fontSize: 14,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
    },
    reviewCount: {
      fontSize: 14,
      fontFamily: 'Afacad-Regular',
      color: colors.textTertiary,
    },
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: colors.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      paddingHorizontal: 16,
      marginTop: 8,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
    },
    tabItemActive: {
      borderBottomColor: colors.primaryOrange,
    },
    tabText: {
      fontSize: 15,
      fontFamily: 'Afacad-Regular',
      color: colors.textTertiary,
    },
    tabTextActive: {
      fontFamily: 'Afacad-Bold',
      color: colors.primaryOrange,
    },
    contentWrapper: {
      flex: 1,
      backgroundColor: colors.inputBackground,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: colors.inputBackground,
    },
    errorText: {
      fontSize: 18,
      fontFamily: 'Afacad-Bold',
      color: colors.errorText,
      marginBottom: 20,
      textAlign: 'center',
    },
    backButtonError: {
      backgroundColor: colors.primaryBlue,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    backButtonTextError: {
      color: colors.primaryWhite,
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
    },
  });
