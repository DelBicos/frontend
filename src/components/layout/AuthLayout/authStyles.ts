import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

/** Estilos comuns aos formularios de autenticacao. */
export const createAuthStyles = (colors: ColorsType) =>
  StyleSheet.create({
    primaryButton: {
      minHeight: 52,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: colors.primaryOrange,
      ...Platform.select({ web: { cursor: 'pointer' } as object }),
    },
    primaryButtonDisabled: {
      opacity: 0.55,
    },
    primaryButtonText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 18,
      color: '#000000',
    },
    linkButton: {
      minHeight: 44,
      justifyContent: 'center',
      alignSelf: 'flex-start',
    },
    linkText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.primaryBlack,
      textDecorationLine: 'underline',
    },
    alternate: {
      marginTop: 24,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      columnGap: 6,
    },
    alternateText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 17,
      color: colors.textSecondary,
    },
    alert: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      padding: 14,
      borderRadius: 12,
      marginBottom: 16,
    },
    alertError: {
      backgroundColor: colors.errorBackground,
    },
    alertSuccess: {
      backgroundColor: colors.successBackground,
    },
    alertText: {
      flex: 1,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      lineHeight: 22,
    },
    hint: {
      marginTop: -8,
      marginBottom: 16,
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    strong: {
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
    },
  });
