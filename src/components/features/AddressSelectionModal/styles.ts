import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    keyboardAvoidingView: {
      width: '100%',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.cardBackground,
      width: '100%',
      maxWidth: 500,
      borderRadius: 20,
      padding: 24,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
        web: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
        },
      }),
    },
    modalContentCompact: {
      padding: 16,
      borderRadius: 16,
    },

    // --- Header ---
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    modalTitle: {
      flex: 1,
      fontSize: 20,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      paddingRight: 12,
    },
    closeButton: {
      padding: 4,
    },
    headerSpacer: {
      width: 24,
    },

    listContainer: {
      width: '100%',
      minHeight: 84,
      marginBottom: 16,
    },
    addressList: {
      flex: 1,
    },
    listContent: {
      paddingRight: Platform.OS === 'web' ? 8 : 0,
    },
    addressItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      minHeight: 76,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.inputBackground,
      marginBottom: 12,
    },
    selectedAddressItem: {
      borderColor: colors.primaryOrange,
      backgroundColor: colors.backgroundElevated,
      borderWidth: 2,
    },

    // Radio Button Customizado
    radioContainer: {
      marginRight: 12,
    },
    radioOuter: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.textTertiary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioOuterSelected: {
      borderColor: colors.primaryOrange,
    },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primaryOrange,
    },

    // Textos do Endereço
    addressInfo: {
      flex: 1,
      minWidth: 0,
    },
    addressText: {
      fontSize: 16,
      lineHeight: 20,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
      marginBottom: 2,
    },
    addressSubtext: {
      fontSize: 14,
      lineHeight: 18,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
    },

    // --- Botão "Adicionar Novo" ---
    newAddressButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.primaryOrange,
      borderStyle: 'dashed',
      backgroundColor: 'transparent',
      marginBottom: 24,
      gap: 8,
    },
    newAddressButtonText: {
      flexShrink: 1,
      fontSize: 16,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryOrange,
      textAlign: 'center',
    },

    actionsContainer: {
      flexShrink: 0,
    },

    // --- Botão "Confirmar" (Fixo no fundo) ---
    confirmButton: {
      backgroundColor: colors.primaryOrange,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    disabledButton: {
      backgroundColor: colors.textTertiary,
      opacity: 0.7,
    },
    confirmButtonText: {
      fontSize: 18,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryWhite,
    },

    // --- Estados de Loading/Empty ---
    centerState: {
      padding: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stateText: {
      marginTop: 12,
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
    },

    // --- ScrollView do Formulário ---
    formScrollView: {
      flexShrink: 1,
      marginBottom: 16,
    },
  });
