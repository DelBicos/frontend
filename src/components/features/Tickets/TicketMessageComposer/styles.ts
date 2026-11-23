import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    label: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.primaryBlack,
      marginBottom: 6,
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
      minHeight: 96,
      maxHeight: 200,
      textAlignVertical: 'top',
    },
    inputReadOnly: {
      color: colors.textSecondary,
    },
    inputError: {
      borderColor: colors.primaryRed,
    },
    inputFooter: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      marginTop: 4,
      marginBottom: 12,
    },
    spacer: {
      flex: 1,
    },
    errorText: {
      flex: 1,
      fontSize: 12,
      color: colors.primaryRed,
    },
    counter: {
      fontSize: 11,
      color: colors.textTertiary,
    },
    counterLimit: {
      color: colors.primaryRed,
      fontWeight: '600',
    },
    retryButton: {
      alignSelf: 'flex-start',
      marginTop: -8,
      marginBottom: 16,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primaryOrange,
    },
    retryButtonLabel: {
      color: colors.primaryOrange,
      fontSize: 13,
      fontWeight: '600',
    },
    sendButton: {
      flexDirection: 'row',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 8,
      backgroundColor: colors.primaryOrange,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
    sendButtonLabel: {
      color: colors.textOnAccent,
      fontSize: 14,
      fontWeight: '600',
    },
  });
