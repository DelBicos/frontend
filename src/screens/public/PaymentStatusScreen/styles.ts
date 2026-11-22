import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType, isCompact: boolean) =>
  StyleSheet.create({
    card: {
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
      alignItems: 'center',
      gap: 14,
      padding: isCompact ? 20 : 32,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' } as object,
        default: { elevation: 1 },
      }),
    },
    icon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconSuccess: {
      backgroundColor: colors.successBackground,
    },
    iconError: {
      backgroundColor: colors.errorBackground,
    },
    iconWarning: {
      backgroundColor: colors.warningBackground,
    },
    title: {
      fontFamily: 'Afacad-Bold',
      fontSize: isCompact ? 26 : 30,
      lineHeight: isCompact ? 32 : 36,
      color: colors.primaryBlack,
      textAlign: 'center',
    },
    text: {
      fontFamily: 'Afacad-Regular',
      fontSize: 17,
      lineHeight: 24,
      color: colors.textSecondary,
      textAlign: 'center',
    },

    details: {
      alignSelf: 'stretch',
      gap: 12,
      marginTop: 4,
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    detailIcon: {
      width: 20,
      alignItems: 'center',
      paddingTop: 3,
    },
    detailTexts: {
      flex: 1,
      minWidth: 0,
    },
    detailLabel: {
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      color: colors.textSecondary,
    },
    detailValue: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 17,
      color: colors.primaryBlack,
    },

    actions: {
      alignSelf: 'stretch',
      gap: 10,
      marginTop: 6,
    },
    primaryButton: {
      minHeight: 52,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryOrange,
      ...Platform.select({ web: { cursor: 'pointer' } as object }),
    },
    primaryButtonText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 18,
      color: '#000000',
    },
    secondaryButton: {
      minHeight: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primaryBlack,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      ...Platform.select({ web: { cursor: 'pointer' } as object }),
    },
    secondaryButtonText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 17,
      color: colors.primaryBlack,
    },
    feedback: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 15,
      color: colors.successText,
    },
    feedbackError: {
      color: colors.errorText,
    },
    link: {
      minHeight: 44,
      justifyContent: 'center',
    },
    linkText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.primaryBlack,
      textDecorationLine: 'underline',
    },
  });
