import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    wrapper: {
      paddingBottom: 6,
    },
    label: {
      fontSize: 12,
      paddingHorizontal: 12,
      marginBottom: 4,
      color: colors.textSecondary,
    },
    scroll: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      gap: 8,
    },
    chip: {
      borderWidth: 1.5,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 7,
    },
    timeChip: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chipText: {
      fontSize: 14,
    },
  });
