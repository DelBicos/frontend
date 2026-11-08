import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      width: '100%',
      maxWidth: 500,
      borderRadius: 12,
      padding: 24,
      maxHeight: '90%',
      backgroundColor: colors.cardBackground,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    professionalImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginRight: 16,
      backgroundColor: colors.inputBackground,
    },
    headerInfo: {
      flex: 1,
    },
    professionalName: {
      fontSize: 18,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 4,
    },
    superscript: {
      fontSize: 14,
      color: colors.primaryOrange,
      fontFamily: 'Afacad-Regular',
    },
    dateText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Afacad-SemiBold',
    },
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryOrange,
      marginBottom: 12,
    },
    infoContainer: {
      marginBottom: 24,
    },
    infoRow: {
      marginBottom: 16,
    },
    infoLabel: {
      fontSize: 14,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      fontFamily: 'Afacad-Regular',
    },
    statusText: {
      fontSize: 14,
      fontFamily: 'Afacad-SemiBold',
    },
    buttonContainer: {
      gap: 12,
    },
    okButton: {
      backgroundColor: colors.primaryOrange,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    okButtonText: {
      color: colors.primaryWhite,
      fontSize: 14,
      fontFamily: 'Afacad-SemiBold',
    },
    cancelButton: {
      backgroundColor: 'transparent',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.errorText,
    },
    cancelButtonText: {
      color: colors.errorText,
      fontSize: 14,
      fontFamily: 'Afacad-SemiBold',
    },
    // Atendimento em domicílio: código de início e acompanhamento no mapa
    codeBanner: {
      borderWidth: 2,
      borderColor: colors.primaryOrange,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      alignItems: 'center',
    },
    codeTitle: {
      fontSize: 13,
      color: colors.primaryOrange,
      fontFamily: 'Afacad-Bold',
      letterSpacing: 1,
      marginBottom: 4,
    },
    codeHint: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 12,
    },
    codeBox: {
      backgroundColor: colors.primaryOrange,
      paddingHorizontal: 28,
      paddingVertical: 10,
      borderRadius: 14,
    },
    codeText: {
      fontSize: 32,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryWhite,
      letterSpacing: 6,
    },
    trackButton: {
      backgroundColor: colors.primaryBlue,
      paddingVertical: 14,
      borderRadius: 14,
      marginBottom: 16,
      alignItems: 'center',
    },
    trackButtonText: {
      color: colors.primaryWhite,
      fontSize: 15,
      fontFamily: 'Afacad-SemiBold',
    },
  });
