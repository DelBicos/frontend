import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    loadingContainer: {
      flex: 1,
      paddingVertical: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },

    listContent: {
      width: '100%',
      alignSelf: 'center',
      paddingTop: 16,
      paddingBottom: 32,
    },

    columnWrapper: {
      justifyContent: 'flex-start',
    },

    cardWrapper: {
      alignItems: 'stretch',
    },

    footerContainer: {
      paddingVertical: 24,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    footerText: {
      fontSize: 14,
      color: colors.textTertiary,
      fontFamily: 'Afacad-Regular',
      textAlign: 'center',
    },

    emptyContainer: {
      padding: 32,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 200,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      fontFamily: 'Afacad-Regular',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textTertiary,
      textAlign: 'center',
      fontFamily: 'Afacad-Regular',
    },
  });
