import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (
  colors: ColorsType,
  isMobile: boolean,
  isLightTheme: boolean,
) => {
  const shellBackground = isLightTheme
    ? colors.pageBackground
    : colors.secondaryGray;

  return StyleSheet.create({
    // --- WEB (barra lateral + conteudo) ---
    desktopContainer: {
      flex: 1,
      backgroundColor: shellBackground,
      overflow: 'hidden',
    },
    desktopWrapper: {
      flex: 1,
      minHeight: 0,
      flexDirection: 'row',
      width: '100%',
      alignSelf: 'center',
      paddingTop: 32,
      paddingBottom: 24,
      gap: 32,
      overflow: 'hidden',
    },
    desktopSidebar: {
      width: 272,
      alignSelf: 'stretch',
      minHeight: 0,
      padding: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
    },
    // As telas trazem seus proprios cartoes; aqui so a area de rolagem.
    desktopMainContent: {
      flex: 1,
      minWidth: 0,
      minHeight: 0,
    },
    desktopMainContentFill: {
      flex: 1,
      minHeight: 0,
    },
    desktopContentScroll: {
      flexGrow: 1,
      paddingBottom: 48,
    },
    desktopContentScrollView: {
      flex: 1,
    },

    // --- CELULAR ---
    mobileContainer: {
      flex: 1,
      backgroundColor: shellBackground,
    },
    mobileHeader: {
      minHeight: 56,
      paddingVertical: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    backButton: {
      width: 44,
      height: 44,
      marginLeft: -10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mobileHeaderTitle: {
      flex: 1,
      fontFamily: 'Afacad-Bold',
      fontSize: 21,
      color: colors.primaryBlack,
    },
    mobileContentScroll: {
      flexGrow: 1,
    },
    mobileContentScrollView: {
      flex: 1,
    },
    mobileMenuScroll: {
      paddingTop: 20,
      paddingBottom: 40,
    },
  });
};
