import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (
  colors: ColorsType,
  isMobile: boolean,
  isDark: boolean,
) =>
  StyleSheet.create({
    // --- ESTILOS BASE ---
    desktopContainer: {
      flex: 1,
      backgroundColor: isDark ? colors.secondaryGray : colors.primaryWhite,
      overflow: 'hidden',
    },
    desktopWrapper: {
      flex: 1,
      flexDirection: 'row',
      maxWidth: 1400,
      width: '100%',
      alignSelf: 'center',
      padding: 24,
      gap: 24,
      overflow: 'hidden',
    },

    // --- SIDEBAR (DESKTOP) ---
    desktopSidebar: {
      width: 300,
      backgroundColor: colors.cardBackground,
      borderRadius: 24,
      paddingVertical: 24,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        web: { boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)' },
        default: { elevation: 2 },
      }),
      display: 'flex',
      flexDirection: 'column',
      maxHeight:
        Platform.OS === 'web' ? ('calc(100vh - 195px)' as any) : undefined,
    },

    // --- CONTEÚDO PRINCIPAL (DESKTOP) ---
    desktopMainContent: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        web: { boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)' },
        default: { elevation: 2 },
      }),
      overflow: 'hidden',
    },
    desktopMainContentFill: {
      minHeight: 0,
      ...Platform.select({
        // 147px = header + pesquisar, 48px = desktopWrapper padding (24px top + 24px bottom)
        web: {
          height: 'calc(100vh - 195px)' as any,
          maxHeight: 'calc(100vh - 195px)' as any,
        },
        default: {},
      }),
    },
    desktopContentScroll: {
      padding: 40,
      minHeight: '100%',
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
