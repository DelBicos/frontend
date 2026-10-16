import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryWhite,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primaryWhite,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      backgroundColor: colors.primaryWhite,
    },
    emptyText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    code: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textTertiary,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primaryBlack,
      marginBottom: 8,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 24,
    },
    metaText: {
      fontSize: 12,
      color: colors.textTertiary,
    },
    metaDot: {
      fontSize: 12,
      color: colors.textTertiary,
      marginHorizontal: 4,
    },
    section: {
      marginBottom: 24,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primaryBlack,
      marginBottom: 12,
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    emptyMessages: {
      paddingVertical: 24,
      alignItems: 'center',
    },
    emptyMessagesText: {
      marginTop: 8,
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      maxWidth: 280,
    },
  });