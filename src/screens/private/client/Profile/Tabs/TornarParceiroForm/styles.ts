import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    benefits: {
      gap: 10,
      marginBottom: 20,
    },
    benefit: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    benefitIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryOrange,
    },
    benefitText: {
      flex: 1,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 17,
      color: colors.primaryBlack,
    },
    readonly: {
      gap: 2,
      marginBottom: 16,
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
    },
    readonlyLabel: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 14,
      color: colors.textSecondary,
    },
    readonlyValue: {
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
      color: colors.primaryBlack,
    },
    label: {
      marginBottom: 8,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    textarea: {
      minHeight: 140,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.inputBackground,
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      lineHeight: 22,
      color: colors.primaryBlack,
    },
    textareaError: {
      borderColor: colors.errorText,
      borderWidth: 1.5,
    },
    textareaFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
      marginTop: 6,
    },
    hint: {
      marginTop: -8,
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    hintBelow: {
      marginTop: 12,
    },
    error: {
      color: colors.errorText,
    },
    doneIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      backgroundColor: colors.successBackground,
    },
    doneTitle: {
      textAlign: 'center',
      fontFamily: 'Afacad-Bold',
      fontSize: 22,
      color: colors.primaryBlack,
    },
    doneText: {
      marginTop: 6,
      marginBottom: 16,
      textAlign: 'center',
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      lineHeight: 22,
      color: colors.textSecondary,
    },
    center: {
      alignSelf: 'center',
    },
  });
