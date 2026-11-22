import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    // Os campos ja tem espacamento proprio (CustomTextInput).
    container: {
      zIndex: 100,
      position: 'relative',
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 12,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'flex-start',
    },
    cityRow: {
      zIndex: 2000,
      elevation: 2000,
      marginBottom: 0,
      ...Platform.select({
        web: { position: 'relative', zIndex: 2000 },
      }),
    },
    col: {},
    cepContainer: {
      zIndex: 1,
      position: 'relative',
    },
    errorText: {
      color: colors.errorText,
      fontSize: 12,
      fontFamily: 'Afacad-Regular',
      marginTop: 4,
      marginBottom: 4,
    },
    loader: {
      position: 'absolute',
      right: 12,
      top: 42,
    },
    footer: {
      zIndex: -1,
      elevation: -1,
      marginTop: 8,
    },
  });
