import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType, isCompact: boolean) =>
  StyleSheet.create({
    loading: {
      marginVertical: 80,
    },
    columns: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 32,
    },
    mainColumn: {
      flex: 1,
      minWidth: 0,
      gap: 20,
    },
    sideColumn: {
      width: 460,
    },
    stack: {
      gap: 16,
    },

    card: {
      gap: 16,
      padding: isCompact ? 16 : 24,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' } as object,
        default: { elevation: 1 },
      }),
    },
    cardTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 21,
      color: colors.primaryBlack,
    },

    // --- Resumo ---
    proRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.inputBackground,
    },
    avatarFallback: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitials: {
      fontFamily: 'Afacad-Bold',
      fontSize: 20,
      color: colors.primaryBlack,
    },
    proTexts: {
      flex: 1,
      minWidth: 0,
    },
    serviceTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 19,
      lineHeight: 24,
      color: colors.primaryBlack,
    },
    proName: {
      fontFamily: 'Afacad-Regular',
      fontSize: 17,
      color: colors.textSecondary,
    },
    detailList: {
      gap: 10,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    detailText: {
      flex: 1,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 17,
      color: colors.primaryBlack,
    },
    totalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    totalLabel: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 18,
      color: colors.primaryBlack,
    },
    totalValue: {
      fontFamily: 'Afacad-Bold',
      fontSize: 24,
      color: colors.primaryBlack,
    },

    // --- Endereco ---
    addressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    addressTexts: {
      flex: 1,
      minWidth: 0,
    },
    addressMain: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 17,
      color: colors.primaryBlack,
    },
    addressSub: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },

    // --- Botoes ---
    primaryButton: {
      minHeight: 48,
      paddingHorizontal: 20,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primaryOrange,
      ...Platform.select({ web: { cursor: 'pointer' } as object }),
    },
    buttonLeft: {
      alignSelf: 'flex-start',
    },
    primaryButtonText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
      color: '#000000',
    },
    secondaryButton: {
      minHeight: 44,
      paddingHorizontal: 16,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.primaryBlack,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({ web: { cursor: 'pointer' } as object }),
    },
    secondaryButtonText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.primaryBlack,
    },

    // --- Pagamento ---
    preparing: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minHeight: 80,
    },
    errorBox: {
      gap: 12,
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.errorBackground,
    },
    errorRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    errorText: {
      flex: 1,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      lineHeight: 22,
      color: colors.errorText,
    },
    errorActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    note: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    noteText: {
      flex: 1,
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },

    // --- Estados ---
    stateCard: {
      alignItems: 'center',
      gap: 12,
      paddingVertical: 48,
      paddingHorizontal: 24,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    stateTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 21,
      color: colors.primaryBlack,
    },
    stateText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 17,
      lineHeight: 24,
      color: colors.textSecondary,
      textAlign: 'center',
      maxWidth: 480,
    },
    stateTextLeft: {
      fontFamily: 'Afacad-Regular',
      fontSize: 17,
      lineHeight: 24,
      color: colors.textSecondary,
    },

    // --- Formulario (botao pagar) ---
    form: {
      gap: 16,
    },
    formMessage: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 15,
      lineHeight: 21,
      color: colors.errorText,
      padding: 12,
      borderRadius: 10,
      backgroundColor: colors.errorBackground,
    },
    payButton: {
      minHeight: 54,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: colors.primaryOrange,
      ...Platform.select({ web: { cursor: 'pointer' } as object }),
    },
    payButtonDisabled: {
      opacity: 0.6,
    },
    payButtonText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 19,
      color: '#000000',
    },
    formHint: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      lineHeight: 22,
      color: colors.textSecondary,
    },
  });
