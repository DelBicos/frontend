import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: 'transparent',
    },
    pageTitle: {
      fontSize: 24,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      marginBottom: 24,
    },
    contentWrapper: {
      gap: 24,
      paddingBottom: 40,
    },
    section: {
      borderRadius: 16,
      padding: 20,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: { elevation: 2 },
        web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' },
      }),
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 16,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconBox: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.inputBackground,
    },
    serviceText: {
      fontSize: 15,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
    },
    dateText: {
      fontSize: 12,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
    },
    priceText: {
      fontSize: 15,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
    },
    emptyState: {
      padding: 20,
      alignItems: 'center',
    },
    exportSection: {
      marginTop: 8,
    },
    grid: {
      gap: 16,
      flexDirection: 'column',
    },
    gridItem: {
      width: '100%',
    },
    datePickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      alignSelf: 'flex-start',
      marginBottom: 20,
    },
    datePickerButtonText: {
      fontSize: 16,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlue,
      marginLeft: 8,
    },
    badgeContainer: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginTop: 4,
    },
    badgeText: {
      fontSize: 12,
      fontFamily: 'Afacad-Medium',
    },
    detailsButton: {
      marginTop: 8,
      paddingVertical: 6,
      paddingHorizontal: 16,
      backgroundColor: colors.primaryBlue,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    detailsButtonText: {
      color: colors.primaryWhite,
      fontFamily: 'Afacad-Medium',
      fontSize: 12,
    },
    rateButton: {
      marginTop: 8,
      paddingVertical: 6,
      paddingHorizontal: 16,
      backgroundColor: colors.primaryOrange,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    rateButtonText: {
      color: colors.primaryWhite,
      fontFamily: 'Afacad-Medium',
      fontSize: 12,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '80%',
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 16,
      textAlign: 'center',
    },
    pickerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    pickerWrapper: {
      flex: 1,
    },
    modalButton: {
      marginTop: 20,
      backgroundColor: colors.primaryBlue,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    modalButtonText: {
      color: colors.primaryWhite,
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
    },
  });
