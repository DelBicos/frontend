import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

import { webStyle } from '@lib/types/web';
export const createStyles = (
  colors: ColorsType,
  isMobile: boolean,
  isDark: boolean,
) =>
  StyleSheet.create({
    // --- WEB (barra lateral + conteudo) ---
    desktopContainer: {
      flex: 1,
      backgroundColor: colors.secondaryGray,
      overflow: 'hidden',
    },
    desktopWrapper: {
      flex: 1,
      flexDirection: 'row',
      width: '100%',
      alignSelf: 'center',
      paddingTop: 32,
      gap: 32,
      overflow: 'hidden',
    },
    desktopSidebar: {
      width: 272,
      alignSelf: 'flex-start',
      padding: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
      ...webStyle({ maxHeight: 'calc(100vh - 200px)' }),
    },
    // As telas trazem seus proprios cartoes; aqui so a area de rolagem.
    desktopMainContent: {
      flex: 1,
      minWidth: 0,
    },
    desktopMainContentFill: {
      minHeight: 0,
      ...Platform.select({
        // 147px = header + pesquisar, 48px = desktopWrapper padding (24px top + 24px bottom)
        web: webStyle({
          height: 'calc(100vh - 195px)',
          maxHeight: 'calc(100vh - 195px)',
        }),
        default: {},
      }),
    },
    desktopContentScroll: {
      paddingBottom: 48,
    },

    // --- CELULAR ---
    mobileContainer: {
      flex: 1,
      backgroundColor: colors.secondaryGray,
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
    mobileMenuScroll: {
      paddingTop: 20,
      paddingBottom: 40,
    },
  });
