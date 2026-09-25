import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: 'transparent',
    },
    pageTitle: {
      fontSize: 24,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 24,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      minHeight: 300,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: 'Afacad-Regular',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      minHeight: 300,
    },
    emptyText: {
      fontSize: 18,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textTertiary,
      textAlign: 'center',
      lineHeight: 20,
      fontFamily: 'Afacad-Regular',
    },
    scrollContent: {
      paddingBottom: 40,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    cardWrapper: {
      width: '100%',
    },
  });
