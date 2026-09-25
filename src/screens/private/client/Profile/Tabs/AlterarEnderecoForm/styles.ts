import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      paddingBottom: 80,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
      paddingHorizontal: 4,
    },
    pageTitle: {
      fontSize: 24,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
    },
    addButton: {
      backgroundColor: colors.primaryOrange,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    addButtonText: {
      color: colors.primaryWhite,
      fontFamily: 'Afacad-Bold',
      fontSize: 14,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    cardWrapper: {
      width: '100%',
      marginBottom: 0,
    },
    centerContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 300,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: 'Afacad-Regular',
    },
    errorText: {
      fontSize: 16,
      color: colors.errorText,
      textAlign: 'center',
      marginBottom: 20,
      fontFamily: 'Afacad-Regular',
    },
    retryButton: {
      backgroundColor: colors.primaryBlue,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    retryButtonText: {
      color: colors.primaryWhite,
      fontFamily: 'Afacad-Bold',
      fontSize: 14,
    },
    emptyText: {
      fontSize: 18,
      color: colors.textTertiary,
      textAlign: 'center',
      fontFamily: 'Afacad-Regular',
    },

    // --- MODAL STYLES ---
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.cardBackground,
      width: '100%',
      maxWidth: 600,
      borderRadius: 16,
      padding: 24,
      maxHeight: '90%',
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        web: { boxShadow: '0px 4px 20px rgba(0,0,0,0.15)' },
        default: { elevation: 10 },
      }),
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      paddingBottom: 12,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
    },
    closeButton: {
      padding: 4,
    },
    modalActions: {
      marginTop: 24,
    },
    saveModalButton: {
      backgroundColor: colors.primaryBlue,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveModalButtonText: {
      color: colors.primaryWhite,
      fontSize: 16,
      fontFamily: 'Afacad-Bold',
    },
  });
