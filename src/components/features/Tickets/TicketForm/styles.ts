import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: colors.primaryWhite,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 24,
    },
    contextBanner: {
      backgroundColor: colors.badgeBackground,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    contextBannerText: {
      color: colors.badgeText,
      fontSize: 13,
    },
    label: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.primaryBlack,
      marginBottom: 6,
      marginTop: 16,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 14,
      color: colors.primaryBlack,
      backgroundColor: colors.inputBackground,
      minHeight: 48,
    },
    textarea: {
      minHeight: 120,
      textAlignVertical: 'top',
    },
    inputError: {
      borderColor: colors.primaryRed,
    },
    counter: {
      fontSize: 11,
      color: colors.textTertiary,
      textAlign: 'right',
      marginTop: 4,
    },
    errorText: {
      fontSize: 12,
      color: colors.primaryRed,
      marginTop: 4,
    },
    externalError: {
      marginTop: 16,
      textAlign: 'center',
    },
    footer: {
      flexDirection: 'row',
      gap: 12,
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      backgroundColor: colors.primaryWhite,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.borderColor,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryWhite,
    },
    cancelButtonLabel: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    submitButton: {
      flex: 2,
      paddingVertical: 14,
      borderRadius: 8,
      backgroundColor: colors.primaryOrange,
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitButtonDisabled: {
      opacity: 0.5,
    },
    submitButtonLabel: {
      color: colors.primaryWhite,
      fontSize: 14,
      fontWeight: '600',
    },
  });