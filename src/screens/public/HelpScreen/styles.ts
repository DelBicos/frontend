import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

import { webStyle } from '@lib/types/web';
export const createStyles = (colors: ColorsType, isCompact: boolean) =>
  StyleSheet.create({
    chipsGroup: {
      marginBottom: isCompact ? 24 : 32,
    },
    resultCount: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 17,
      color: colors.textSecondary,
      marginBottom: 16,
    },
    topic: {
      marginBottom: isCompact ? 28 : 36,
    },
    topicHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 14,
    },
    termsLink: {
      alignSelf: 'flex-start',
      minHeight: 44,
      justifyContent: 'center',
      marginTop: 16,
    },
    termsLinkText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.primaryBlack,
      textDecorationLine: 'underline',
    },
    topicIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryOrange,
    },
    topicTitle: {
      flex: 1,
      fontFamily: 'Afacad-Bold',
      fontSize: isCompact ? 21 : 24,
      lineHeight: isCompact ? 26 : 30,
      color: colors.primaryBlack,
    },

    // --- Contato ---
    contactCard: {
      flexDirection: isCompact ? 'column' : 'row',
      alignItems: isCompact ? 'stretch' : 'center',
      gap: 16,
      padding: isCompact ? 20 : 28,
      borderRadius: 20,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    contactTexts: {
      flex: isCompact ? undefined : 1,
      gap: 4,
    },
    contactTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 22,
      color: colors.primaryBlack,
    },
    contactText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      lineHeight: 23,
      color: colors.textSecondary,
    },
    contactButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      minHeight: 48,
      paddingHorizontal: 22,
      borderRadius: 999,
      backgroundColor: colors.primaryOrange,
      ...webStyle({ cursor: 'pointer' }),
    },
    contactButtonText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
      // Texto escuro sobre laranja (contraste AA).
      color: '#000000',
    },
  });
