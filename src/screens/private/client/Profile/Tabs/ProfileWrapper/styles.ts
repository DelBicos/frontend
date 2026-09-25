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

    // --- MOBILE ---
    mobileContainer: {
      flex: 1,
      backgroundColor: isDark ? colors.secondaryGray : colors.primaryWhite,
    },
    mobileHeader: {
      paddingTop: 16,
      paddingBottom: 16,
      paddingHorizontal: 20,
      backgroundColor: colors.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    backButtonIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.inputBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backButtonText: {
      fontSize: 16,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
    },
    mobileContentScroll: {
      flexGrow: 1,
      padding: 20,
    },
    mobileMenuScroll: {
      padding: 20,
      paddingBottom: 40,
    },
    mobileMenuHeader: {
      marginBottom: 24,
      marginTop: 10,
    },
    mobileMenuTitle: {
      fontSize: 32,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlue,
      marginBottom: 8,
    },
    mobileMenuSubtitle: {
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
      color: colors.textTertiary,
    },
    mobileMenuCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        default: { elevation: 2 },
        web: { boxShadow: '0px 4px 15px rgba(0,0,0,0.05)' },
      }),
    },
  });
