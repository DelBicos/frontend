import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    loading: {
      marginVertical: 48,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      margin: -8,
    },
    gridItem: {
      padding: 8,
    },

    // --- Janela do formulario ---
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.overlay,
    },
    modalContent: {
      width: '100%',
      maxWidth: 560,
      maxHeight: '92%',
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    modalTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 22,
      color: colors.primaryBlack,
    },
    closeButton: {
      width: 44,
      height: 44,
      marginRight: -10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalHint: {
      marginBottom: 16,
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    formWrapper: {
      zIndex: 100,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
  });
