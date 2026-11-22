import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    loading: {
      marginVertical: 48,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      margin: -6,
    },
    gridItem: {
      padding: 6,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
      overflow: 'hidden',
    },
    main: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 14,
      ...Platform.select({ web: { cursor: 'pointer' } as object }),
    },
    texts: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    name: {
      fontFamily: 'Afacad-Bold',
      fontSize: 18,
      color: colors.primaryBlack,
    },
    meta: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    heart: {
      width: 52,
      alignSelf: 'stretch',
      alignItems: 'center',
      justifyContent: 'center',
      borderLeftWidth: 1,
      borderLeftColor: colors.divider,
      ...Platform.select({ web: { cursor: 'pointer' } as object }),
    },
    heartPressed: {
      backgroundColor: colors.errorBackground,
    },
    undo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingVertical: 6,
      paddingLeft: 14,
      paddingRight: 6,
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
    },
    undoText: {
      flex: 1,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
  });
