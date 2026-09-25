import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
        },
        android: {
          elevation: 2,
        },
        web: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        },
      }),
    },
    title: {
      fontSize: 18,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlue,
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      paddingBottom: 8,
    },
    paymentSummary: {
      marginBottom: 16,
      gap: 8,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      fontSize: 14,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
    },
    value: {
      fontSize: 14,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
    },
    discountText: {
      color: colors.errorText,
      fontFamily: 'Afacad-Bold',
    },
    totalRow: {
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    totalLabel: {
      fontSize: 16,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
    },
    totalValue: {
      fontSize: 18,
      fontFamily: 'Afacad-Bold',
      color: colors.successText,
    },
    methodContainer: {
      backgroundColor: colors.inputBackground,
      padding: 12,
      borderRadius: 8,
    },
    methodTitle: {
      fontSize: 12,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    methodValue: {
      fontSize: 14,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlue,
    },
    note: {
      marginTop: 8,
      fontSize: 12,
      fontFamily: 'Afacad-Regular',
      color: colors.successText,
      fontStyle: 'italic',
    },
  });
