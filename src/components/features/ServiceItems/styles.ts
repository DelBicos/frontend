import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderRadius: 8,
      marginBottom: 16,
      overflow: 'hidden',
      backgroundColor: colors.cardBackground,
    },
    header: {
      backgroundColor: colors.primaryOrange,
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    headerText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 12,
      color: colors.primaryWhite,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    itemDetails: {
      backgroundColor: colors.inputBackground,
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    lastItem: {
      borderBottomWidth: 0,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    itemName: {
      fontFamily: 'Afacad-Bold',
      fontSize: 14,
      color: colors.primaryBlack,
      flex: 1,
      marginRight: 8,
    },
    itemDate: {
      fontFamily: 'Afacad-Regular',
      fontSize: 12,
      color: colors.textSecondary,
    },
    itemTime: {
      fontFamily: 'Afacad-Regular',
      fontSize: 12,
      color: colors.textSecondary,
    },
    itemPrice: {
      fontFamily: 'Afacad-Bold',
      fontSize: 14,
      color: colors.primaryBlack,
    },
    professionalText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 12,
      color: colors.primaryBlue,
      marginTop: 4,
    },
    label: {
      color: colors.textTertiary,
      fontFamily: 'Afacad-Regular',
    },
  });
