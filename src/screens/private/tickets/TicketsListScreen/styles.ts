import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryWhite,
    },

    // ✅ Botão fixo no topo
    topBar: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      backgroundColor: colors.primaryWhite,
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryOrange,
      paddingVertical: 14,
      borderRadius: 10,
    },
    createButtonLabel: {
      color: colors.primaryWhite,
      fontSize: 14,
      fontWeight: '600',
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContent: {
      padding: 16,
      paddingBottom: 24,
    },

    // Empty state
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingTop: 48,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primaryBlack,
      marginTop: 16,
    },
    emptySubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 24,
      lineHeight: 20,
    },
    emptyButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.primaryOrange,
    },
    emptyButtonLabel: {
      color: colors.primaryOrange,
      fontSize: 14,
      fontWeight: '600',
    },
  });
