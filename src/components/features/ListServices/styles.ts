import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

const cardShadow = Platform.select({
  web: { boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.08)' } as any,
  default: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    // --- Filtros ---
    filterGroup: {
      gap: 8,
      marginBottom: 16,
    },
    toggleRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },

    // --- Resultados ---
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    tileFill: {
      flex: 1,
    },
    carousel: {
      gap: 12,
      paddingBottom: 8,
    },
    loadingContainer: {
      paddingVertical: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyContainer: {
      paddingVertical: 32,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderColor,
    },
    emptyText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    showMore: {
      alignSelf: 'center',
      marginTop: 16,
      minHeight: 44,
      paddingHorizontal: 24,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.primaryBlack,
      justifyContent: 'center',
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    showMoreText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.primaryBlack,
    },

    // --- Card em linha (listas, ex.: resultado de busca) ---
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 6,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...cardShadow,
    },
    info: {
      flex: 1,
      marginRight: 12,
      gap: 4,
    },
    title: {
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
      color: colors.primaryBlack,
    },

    // --- Card vertical (grade da pagina inicial) ---
    tile: {
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
      gap: 8,
      ...cardShadow,
    },
    tileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      minHeight: 24,
    },
    categoryTag: {
      flexShrink: 1,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 13,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    tileTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 19,
      lineHeight: 23,
      minHeight: 46,
      color: colors.primaryBlack,
    },
    tileFooter: {
      marginTop: 'auto',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    priceLabel: {
      fontFamily: 'Afacad-Regular',
      fontSize: 13,
      color: colors.textSecondary,
    },

    // --- Comum ---
    description: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      lineHeight: 20,
      minHeight: 40,
      color: colors.textSecondary,
    },
    availabilityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    availability: {
      flexShrink: 1,
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      color: colors.textSecondary,
    },
    noAvailability: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 14,
      color: colors.primaryRed,
    },
    nowBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
      backgroundColor: colors.successBackground,
    },
    nowBadgeInline: {
      alignSelf: 'flex-start',
    },
    nowDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primaryGreen,
    },
    nowBadgeText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 13,
      color: colors.successText,
    },
    price: {
      fontFamily: 'Afacad-Bold',
      fontSize: 20,
      color: colors.primaryBlack,
    },
    actionButton: {
      minHeight: 44,
      paddingHorizontal: 20,
      borderRadius: 999,
      justifyContent: 'center',
      backgroundColor: colors.primaryOrange,
      ...Platform.select({
        web: {
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
        } as any,
      }),
    },
    actionButtonActive: {
      backgroundColor: colors.primaryOrangeHover,
    },
    actionText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 18,
      // Texto escuro sobre laranja (contraste AA).
      color: '#000000',
    },
  });

export default createStyles;
