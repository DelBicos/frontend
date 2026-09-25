import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

const GAP = 16;

export const createStyles = (
  colors: ColorsType,
  isCompact: boolean,
  isExpanded: boolean,
) =>
  StyleSheet.create({
    // --- Apresentacao ---
    hero: {
      flexDirection: isExpanded ? 'row' : 'column',
      alignItems: 'center',
      gap: isExpanded ? 48 : 24,
      marginBottom: isCompact ? 40 : 64,
    },
    heroTexts: {
      flex: isExpanded ? 1 : undefined,
      alignSelf: 'stretch',
      gap: 12,
    },
    eyebrow: {
      fontFamily: 'Afacad-Bold',
      fontSize: 14,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.textSecondary,
    },
    heroTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: isCompact ? 32 : 44,
      lineHeight: isCompact ? 38 : 52,
      color: colors.primaryBlack,
      marginBottom: 4,
    },
    paragraph: {
      fontFamily: 'Afacad-Regular',
      fontSize: isCompact ? 17 : 19,
      lineHeight: isCompact ? 26 : 29,
      color: colors.textSecondary,
    },
    heroPhotoWrapper: {
      flex: isExpanded ? 1 : undefined,
      width: isExpanded ? undefined : '100%',
      maxWidth: 560,
      aspectRatio: 631 / 520,
    },
    heroPhoto: {
      width: '100%',
      height: '100%',
    },

    section: {
      marginBottom: isCompact ? 40 : 64,
    },

    // --- Valores ---
    valuesRow: {
      flexDirection: isCompact ? 'column' : 'row',
      gap: GAP,
    },
    valueCard: {
      flex: isCompact ? undefined : 1,
      gap: 8,
      padding: 22,
      borderRadius: 18,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    valueIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryOrange,
      marginBottom: 4,
    },
    valueTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 20,
      color: colors.primaryBlack,
    },
    valueText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      lineHeight: 23,
      color: colors.textSecondary,
    },

    // --- Equipe ---
    teamGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -GAP / 2,
      rowGap: GAP,
    },
    teamCell: {
      paddingHorizontal: GAP / 2,
    },
    devCard: {
      height: '100%',
      alignItems: 'center',
      padding: 20,
      borderRadius: 18,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    devPhoto: {
      width: 132,
      height: 132,
      marginBottom: 8,
    },
    devName: {
      fontFamily: 'Afacad-Bold',
      fontSize: 20,
      textAlign: 'center',
      color: colors.primaryBlack,
    },
    devRole: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 15,
      textAlign: 'center',
      color: colors.textSecondary,
      marginBottom: 10,
    },
    devBio: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
      color: colors.textSecondary,
    },
    readMore: {
      minHeight: 44,
      justifyContent: 'center',
      paddingHorizontal: 8,
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    readMoreText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 15,
      color: colors.primaryBlack,
      textDecorationLine: 'underline',
    },
    devLinks: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 'auto',
      paddingTop: 4,
    },
    devLink: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    devLinkActive: {
      borderColor: colors.primaryOrange,
      backgroundColor: colors.inputBackground,
    },

    footer: {
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      textAlign: 'center',
      color: colors.textSecondary,
    },
  });
