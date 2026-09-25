import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.inputBackground,
    },
    // Centraliza o conteúdo em telas grandes
    centerContainer: {
      alignItems: 'center',
      paddingBottom: 40,
    },
    contentMaxWidth: {
      width: '100%',
      maxWidth: 1100,
      padding: 24,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    backButtonText: {
      color: colors.primaryBlue,
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
    },
    pageTitle: {
      fontSize: 28,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlue,
      marginBottom: 24,
    },

    // Layout Grid (Web vs Mobile)
    mainContent: {
      flexDirection: Platform.OS === 'web' ? 'row' : 'column',
      gap: 24,
    },
    leftColumn: {
      flex: Platform.OS === 'web' ? 1 : 1,
      marginBottom: Platform.OS !== 'web' ? 24 : 0,
    },
    rightColumn: {
      flex: Platform.OS === 'web' ? 1 : 1,
    },

    // --- Card de Resumo (Esquerda) ---
    summaryCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      overflow: 'hidden',
      ...Platform.select({
        web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' },
        default: { elevation: 2 },
      }),
    },
    summaryImage: {
      width: '100%',
      height: 200,
      backgroundColor: colors.inputBackground,
    },
    summaryDetails: {
      padding: 20,
    },
    summaryHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    profName: {
      fontSize: 20,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryOrange,
    },
    serviceTitle: {
      fontSize: 16,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
      marginBottom: 4,
    },
    priceTag: {
      fontSize: 22,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlue,
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: 16,
    },
    dateLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Afacad-Regular',
    },
    dateValue: {
      fontSize: 16,
      color: colors.primaryBlack,
      fontFamily: 'Afacad-Bold',
      marginTop: 4,
    },

    // --- Seção de Pagamento (Direita) ---
    paymentCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' },
        default: { elevation: 2 },
      }),
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlue,
      marginBottom: 16,
    },

    // --- Endereço ---
    addressContainer: {
      marginBottom: 24,
      padding: 16,
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    addressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    addressText: {
      flex: 1,
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      color: colors.textSecondary,
    },
    changeAddressText: {
      color: colors.primaryOrange,
      fontFamily: 'Afacad-Bold',
      fontSize: 14,
      textDecorationLine: 'underline',
    },
    changeAddressLink: {
      fontSize: 14,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryOrange,
      textDecorationLine: 'underline',
    },
    selectAddressBtn: {
      backgroundColor: colors.primaryOrange,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 24,
    },
    selectAddressBtnText: {
      color: colors.primaryWhite,
      fontFamily: 'Afacad-Bold',
    },

    // --- Loading / Error ---
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 400,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: 'Afacad-Regular',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    errorText: {
      fontSize: 16,
      color: colors.errorText,
      textAlign: 'center',
      marginBottom: 24,
      fontFamily: 'Afacad-SemiBold',
    },
  });
