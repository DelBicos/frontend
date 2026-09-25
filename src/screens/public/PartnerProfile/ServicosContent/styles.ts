import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    servicosContainer: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.inputBackground,
    },
    listContainer: {
      paddingBottom: 40,
    },
    servicoCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
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
          elevation: 3,
        },
        web: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        },
      }),
    },
    servicoImagem: {
      width: '100%',
      height: 160,
      backgroundColor: colors.inputBackground,
    },
    servicoInfo: {
      padding: 16,
    },
    servicoHeader: {
      marginBottom: 8,
    },
    servicoNome: {
      fontSize: 18,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 4,
    },
    servicoDescricao: {
      fontSize: 14,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    detalhesRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    servicoPreco: {
      fontSize: 20,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlue,
    },
    duracaoBadge: {
      backgroundColor: colors.inputBackground,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    servicoDuracao: {
      fontSize: 12,
      fontFamily: 'Afacad-SemiBold',
      color: colors.textSecondary,
    },
    agendarButton: {
      backgroundColor: colors.primaryOrange,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    agendarButtonText: {
      color: colors.primaryWhite,
      fontSize: 16,
      fontFamily: 'Afacad-Bold',
    },
    emptyContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
      color: colors.textTertiary,
      textAlign: 'center',
    },
  });
