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
    scrollContainer: {
      flexGrow: 1,
      padding: 24,
    },
    mainContent: {
      flexDirection: Platform.OS === 'web' ? 'row' : 'column',
      width: '100%',
      gap: 24,
    },
    leftColumn: {
      flex: Platform.OS === 'web' ? 3 : 1,
      minWidth: Platform.OS === 'web' ? 300 : '100%',
    },
    rightColumn: {
      flex: Platform.OS === 'web' ? 2 : 1,
      minWidth: Platform.OS === 'web' ? 300 : '100%',
      marginTop: Platform.OS !== 'web' ? 24 : 0,
    },
    pageTitle: {
      fontSize: 24,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlue,
      marginBottom: 16,
    },
    subCategoryListContainer: {
      paddingBottom: 16,
    },
    subCategoryButton: {
      flex: 1,
      minHeight: 60,
      flexDirection: 'row',
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderRadius: 12,
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      margin: 6,
      ...Platform.select({
        web: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease-in-out',
          cursor: 'pointer',
        },
        default: {
          elevation: 2,
        },
      }),
    },
    subCategoryIcon: {
      marginRight: 16,
      width: 24, // Ensures icons are aligned
      textAlign: 'center',
    },
    subCategoryText: {
      fontSize: 15,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryOrange,
      textAlign: 'left',
    },

    calendarContainer: {
      backgroundColor: colors.primaryOrange,
      borderRadius: 16,
      overflow: 'hidden',
      paddingBottom: 10,
      borderWidth: 1,
      borderColor: colors.primaryOrange,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
        web: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
        },
      }),
    },

    continueButton: {
      backgroundColor: colors.primaryBlue,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 24,
    },
    continueButtonDisabled: {
      backgroundColor: colors.textTertiary,
      opacity: 0.7,
    },
    continueButtonText: {
      color: colors.primaryWhite,
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
    },
    footer: {
      padding: 20,
      textAlign: 'center',
      fontSize: 12,
      color: colors.textTertiary,
      fontFamily: 'Afacad-Regular',
      marginTop: 'auto',
    },
  });
