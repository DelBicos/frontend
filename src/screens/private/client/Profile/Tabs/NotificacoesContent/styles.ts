import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: 'transparent',
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContent: {
      paddingBottom: 20,
    },
    card: {
      marginBottom: 10,
      borderRadius: 16,
      shadowColor: colors.primaryBlack,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    unreadCard: {
      borderColor: colors.primaryOrange,
      backgroundColor: colors.backgroundElevated,
    },
    readCard: {
      borderColor: colors.borderColor,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    logo: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
      backgroundColor: colors.inputBackground,
    },
    textContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    title: {
      fontSize: 16,
      fontFamily: 'Afacad-Bold',
      marginBottom: 4,
    },
    message: {
      fontSize: 14,
      fontFamily: 'Afacad-Regular',
      lineHeight: 20,
    },
    date: {
      fontSize: 12,
      fontFamily: 'Afacad-Regular',
      marginLeft: 8,
      alignSelf: 'flex-start',
      marginTop: 2,
    },
    errorText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
      color: colors.errorText,
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
      color: colors.textTertiary,
    },

    // --- MODAL ---
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 500,
      maxHeight: '80%',
      ...Platform.select({
        default: { elevation: 10 },
        web: { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
      }),
    },
    modalInnerContainer: {},
    modalTitle: {
      fontSize: 20,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryOrange,
      textAlign: 'center',
      marginBottom: 16,
    },
    modalMessageScroll: {
      marginVertical: 12,
      maxHeight: 300,
    },
    modalMessage: {
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
      color: colors.primaryBlack,
      lineHeight: 24,
    },
    modalDate: {
      fontSize: 14,
      fontFamily: 'Afacad-Regular',
      color: colors.textTertiary,
      textAlign: 'center',
      marginBottom: 24,
      marginTop: 12,
    },
    modalButton: {
      backgroundColor: colors.primaryOrange,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    modalButtonLabel: {
      fontSize: 16,
      color: colors.primaryWhite,
      fontFamily: 'Afacad-Bold',
    },
  });
