import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

import { webStyle } from '@utils/webStyle';
const GAP = 12;

export const createStyles = (colors: ColorsType, isCompact: boolean) =>
  StyleSheet.create({
    state: {
      minHeight: 200,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    },
    stateText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 17,
      color: colors.textSecondary,
      textAlign: 'center',
    },

    // --- Filtros ---
    chipsGroup: {
      marginBottom: isCompact ? 24 : 32,
    },
    resultCount: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 17,
      color: colors.textSecondary,
      marginBottom: 12,
    },

    // --- Secao por categoria ---
    section: {
      marginBottom: isCompact ? 32 : 40,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 14,
    },
    sectionTitleCard: {
      alignSelf: 'flex-start',
      maxWidth: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: isCompact ? 10 : 14,
      minHeight: isCompact ? 64 : 72,
      paddingHorizontal: isCompact ? 12 : 16,
      paddingVertical: isCompact ? 10 : 12,
      borderRadius: 16,
    },
    sectionIconBox: {
      width: isCompact ? 40 : 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTexts: {
      flexShrink: 1,
    },
    sectionTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: isCompact ? 19 : 22,
      lineHeight: isCompact ? 24 : 28,
    },
    sectionCount: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    sectionAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      minHeight: 44,
      paddingHorizontal: 4,
      ...webStyle({ cursor: 'pointer' }),
    },
    sectionActionText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.primaryBlack,
      textDecorationLine: 'underline',
    },

    // --- Grade de servicos ---
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -GAP / 2,
      rowGap: GAP,
    },
    gridCell: {
      paddingHorizontal: GAP / 2,
    },
    tile: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minHeight: 60,
      // Cresce ate a altura da linha da grade (cards alinhados). Altura em %
      // aqui fazia o card ocupar a tela inteira em alguns navegadores.
      flexGrow: 1,
      paddingHorizontal: isCompact ? 12 : 14,
      paddingVertical: isCompact ? 12 : 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
      ...webStyle({
        cursor: 'pointer',
        transition: 'border-color 0.15s ease, transform 0.15s ease',
      }),
    },
    tileActive: {
      borderColor: colors.primaryOrange,
      ...Platform.select({
        web: webStyle({ transform: [{ translateY: -2 }] }),
        default: { opacity: 0.8 },
      }),
    },
    tileTexts: {
      flex: 1,
    },
    tileTitle: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: isCompact ? 15 : 16,
      lineHeight: isCompact ? 18 : 20,
      color: colors.primaryBlack,
    },
    tileSubtitle: {
      fontFamily: 'Afacad-Regular',
      fontSize: 13,
      color: colors.textSecondary,
    },

    // --- Ajuda / busca inteligente ---
    helpCard: {
      marginTop: 8,
      flexDirection: isCompact ? 'column' : 'row',
      alignItems: isCompact ? 'flex-start' : 'center',
      gap: 16,
      padding: isCompact ? 18 : 24,
      borderRadius: 20,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    helpIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryOrange,
    },
    helpTexts: {
      flex: isCompact ? undefined : 1,
      gap: 4,
    },
    helpTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 19,
      color: colors.primaryBlack,
    },
    helpText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      lineHeight: 22,
      color: colors.textSecondary,
    },
    primaryButton: {
      minHeight: 48,
      paddingHorizontal: 20,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryOrange,
      maxWidth: '100%',
      ...webStyle({ cursor: 'pointer' }),
    },
    primaryButtonText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
      // Texto escuro sobre laranja (contraste AA).
      color: colors.textOnAccent,
    },
    fullWidth: {
      alignSelf: 'stretch',
    },
  });
