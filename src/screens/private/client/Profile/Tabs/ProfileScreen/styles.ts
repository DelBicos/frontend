import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createLoadingStyles = (colors: ColorsType) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
    },
  });
