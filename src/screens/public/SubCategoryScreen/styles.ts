import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

const cardShadow = Platform.select({
  web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' } as object,
  default: { elevation: 1 },
});

export const createStyles = (colors: ColorsType, isCompact: boolean) =>
  StyleSheet.create({
    columns: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 40,
    },
    mainColumn: {
      flex: 1,
      minWidth: 0,
    },
    sideColumn: {
      width: 420,
    },
    section: {
      marginBottom: isCompact ? 28 : 32,
    },
    loading: {
      marginVertical: 40,
    },
    emptyText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 17,
      color: colors.textSecondary,
    },

    // --- Servicos (radio) ---
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -6,
    },
    gridItem: {
      padding: 6,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      minHeight: 64,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
      ...Platform.select({
        web: { cursor: 'pointer', transition: 'border-color 0.15s' } as object,
      }),
    },
    optionHover: {
      borderColor: colors.textTertiary,
    },
    optionSelected: {
      borderColor: colors.primaryOrange,
      backgroundColor: colors.backgroundElevated,
    },
    optionIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.inputBackground,
    },
    optionText: {
      flex: 1,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 17,
      lineHeight: 22,
      color: colors.primaryBlack,
    },
    radio: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.textTertiary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: {
      borderColor: colors.primaryOrange,
      backgroundColor: colors.primaryOrange,
    },

    // --- Calendario ---
    calendarCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      paddingVertical: 8,
      paddingHorizontal: 4,
      overflow: 'hidden',
      ...cardShadow,
    },

    // --- Resumo e continuar ---
    summary: {
      gap: 10,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...cardShadow,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    summaryText: {
      flex: 1,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 17,
      color: colors.primaryBlack,
    },
    summaryMissing: {
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
    },
    continueButton: {
      marginTop: 6,
      minHeight: 52,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: colors.primaryOrange,
    },
    continueButtonHover: {
      backgroundColor: colors.primaryOrangeHover,
    },
    continueButtonDisabled: {
      backgroundColor: colors.inputBackground,
    },
    continueText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 18,
      color: '#000000',
    },
    continueTextDisabled: {
      color: colors.textSecondary,
    },
  });
