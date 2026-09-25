import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType, isCompact: boolean) =>
  StyleSheet.create({
    chipsScroll: {
      flexGrow: 0,
      marginBottom: isCompact ? 24 : 32,
    },
    chipsRow: {
      gap: 8,
      paddingVertical: 2,
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
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    contactButtonText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
      // Texto escuro sobre laranja (contraste AA).
      color: '#000000',
    },
  });
