import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    pageTitle: {
      fontSize: 24,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 24,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    contentWrapper: {
      // Flex direction é controlado via lógica responsiva no componente
    },

    // --- Avatar ---
    avatarContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarTouchable: {
      position: 'relative',
      width: 120,
      height: 120,
      borderRadius: 60,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    avatarAnimatedWrapper: {
      width: '100%',
      height: '100%',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.inputBackground,
    },
    avatarOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarOverlayText: {
      color: 'white',
      fontFamily: 'Afacad-Bold',
      fontSize: 12,
      marginTop: 4,
    },

    // --- Form ---
    saveButtonContainer: {
      marginTop: 24,
      alignItems: 'flex-end',
    },
    saveButton: {
      backgroundColor: colors.primaryOrange,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    saveButtonText: {
      color: colors.primaryWhite,
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
    },

    // --- MODAL DE OPÇÕES (AVATAR) CENTRALIZADO ---
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay, // Ex: 'rgba(0,0,0,0.5)'
      justifyContent: 'center', // Centraliza verticalmente
      alignItems: 'center', // Centraliza horizontalmente
      padding: 20,
    },
    optionsContainer: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16, // Bordas arredondadas em todos os lados
      padding: 24,
      width: '100%',
      maxWidth: 360, // Tamanho máximo para parecer um modal elegante
      borderWidth: 1,
      borderColor: colors.borderColor,
      // Sombras para dar profundidade (pop-up)
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
        },
        android: {
          elevation: 10,
        },
        web: {
          boxShadow: '0px 4px 20px rgba(0,0,0,0.2)',
        },
      }),
    },
    optionButton: {
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      alignItems: 'center',
    },
    optionText: {
      fontSize: 16,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlue,
      textAlign: 'center',
    },
    removeOption: {
      borderBottomWidth: 0,
      marginTop: 4,
    },
    removeText: {
      color: colors.errorText,
    },
    cancelOption: {
      marginTop: 16,
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      borderBottomWidth: 0,
    },
    cancelText: {
      color: colors.textSecondary,
      fontFamily: 'Afacad-Bold',
    },

    // --- STATUS MODAL ---
    statusModalContainer: {
      backgroundColor: colors.cardBackground,
      width: '80%',
      maxWidth: 300,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    statusModalIcon: {
      fontSize: 40,
      marginBottom: 16,
    },
    statusModalTitle: {
      fontSize: 20,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 8,
    },
    statusModalMessage: {
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    statusModalButton: {
      backgroundColor: colors.primaryBlue,
      paddingVertical: 10,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    statusModalButtonText: {
      color: colors.primaryWhite,
      fontFamily: 'Afacad-Bold',
    },
  });
