import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
    },
    chipSelected: {
      backgroundColor: colors.primaryOrange,
      borderColor: colors.primaryOrange,
    },
    chipLabel: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    chipLabelSelected: {
      color: colors.primaryWhite,
      fontWeight: '600',
    },
    errorText: {
      marginTop: 6,
      fontSize: 12,
      color: colors.primaryRed,
    },
  });
