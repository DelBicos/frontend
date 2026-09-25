import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    sobreContainer: {
      flex: 1,
      backgroundColor: colors.inputBackground,
    },
    sobreContentContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    section: {
      marginBottom: 24,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 20,
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
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      paddingBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlue,
    },
    descriptionText: {
      fontSize: 15,
      fontFamily: 'Afacad-Regular',
      color: colors.primaryBlack,
      lineHeight: 24,
      textAlign: 'justify',
    },
    addressCard: {
      marginTop: 4,
    },
    addressStreet: {
      fontSize: 16,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 4,
    },
    addressDetail: {
      fontSize: 15,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      marginBottom: 12,
    },
    addressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    addressCity: {
      fontSize: 14,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlue,
    },
    addressZip: {
      fontSize: 12,
      fontFamily: 'Afacad-Regular',
      color: colors.textTertiary,
    },
    emptyContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.7,
      minHeight: 200,
    },
    emptyText: {
      marginTop: 12,
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: 'Afacad-Regular',
      textAlign: 'center',
    },
  });
