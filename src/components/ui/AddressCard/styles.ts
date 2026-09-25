import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        },
        android: {
          elevation: 2,
        },
        web: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease',
        },
      }),
    },
    cardPrimary: {
      borderColor: colors.primaryOrange,
      backgroundColor: colors.backgroundElevated,
    },

    // Cabeçalho
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    iconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconCirclePrimary: {
      backgroundColor: colors.primaryOrange,
    },
    cardTitle: {
      fontSize: 14,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryOrange,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    deleteButton: {
      padding: 8,
    },

    // Corpo
    body: {
      marginBottom: 16,
    },
    streetText: {
      fontSize: 18,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 4,
    },
    complementText: {
      fontSize: 14,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      marginBottom: 4,
      fontStyle: 'italic',
    },
    detailText: {
      fontSize: 15,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      marginBottom: 2,
    },
    zipText: {
      fontSize: 14,
      fontFamily: 'Afacad-Regular',
      color: colors.textTertiary,
      marginTop: 4,
    },

    // Rodapé
    footer: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      paddingTop: 12,
      gap: 16,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingRight: 12,
    },
    actionText: {
      fontSize: 14,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlue,
    },
  });
