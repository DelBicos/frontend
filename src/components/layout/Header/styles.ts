import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

const pointer = Platform.select({ web: { cursor: 'pointer' } as object });

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    headerContainer: {
      backgroundColor: colors.cardBackground,
      borderBottomWidth: 1,
      borderColor: colors.borderColor,
      zIndex: 100,
    },

    // --- Linha 1 ---
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 72,
      gap: 24,
    },
    topBarCollapsed: {
      height: 64,
    },
    logoImage: {
      width: 160,
      height: 46,
    },
    logoImageSmall: {
      width: 128,
      height: 38,
    },
    nav: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    navLink: {
      height: 72,
      justifyContent: 'center',
      paddingHorizontal: 12,
      ...pointer,
    },
    navLinkHovered: {
      backgroundColor: colors.inputBackground,
    },
    navLinkStacked: {
      height: 'auto' as any,
      minHeight: 48,
      paddingHorizontal: 12,
      borderRadius: 10,
    },
    navLinkStackedActive: {
      backgroundColor: colors.inputBackground,
    },
    navText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    navTextActive: {
      fontFamily: 'Afacad-Bold',
    },
    navIndicator: {
      position: 'absolute',
      left: 12,
      right: 12,
      bottom: 0,
      height: 3,
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
      backgroundColor: colors.primaryOrange,
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      ...pointer,
    },

    // --- Conta ---
    accountTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minHeight: 44,
      paddingLeft: 4,
      paddingRight: 10,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...pointer,
    },
    accountName: {
      maxWidth: 120,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    authButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    authButtonsStacked: {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    outlineButton: {
      minHeight: 44,
      paddingHorizontal: 18,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.primaryBlack,
      alignItems: 'center',
      justifyContent: 'center',
      ...pointer,
    },
    outlineButtonHovered: {
      backgroundColor: colors.inputBackground,
    },
    outlineButtonText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    solidButton: {
      minHeight: 44,
      paddingHorizontal: 18,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryOrange,
      ...pointer,
    },
    solidButtonHovered: {
      backgroundColor: colors.primaryOrangeHover,
    },
    solidButtonText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
      color: '#000000',
    },
    buttonDisabled: {
      opacity: 0.55,
    },

    // --- Menus suspensos ---
    dropdown: {
      marginTop: 48,
      width: 220,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
      ...Platform.select({
        web: { boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.18)' } as object,
        default: { elevation: 8 },
      }),
    },
    accountDropdown: {
      width: 260,
    },
    dropdownCaption: {
      paddingHorizontal: 16,
      paddingTop: 6,
      paddingBottom: 4,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 13,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.textSecondary,
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 36,
      paddingHorizontal: 8,
    },
    dropdownIcon: {
      width: 24,
      marginRight: 10,
      textAlign: 'center',
    },
    dropdownText: {
      flex: 1,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    dropdownDivider: {
      height: 1,
      marginVertical: 6,
      backgroundColor: colors.divider,
    },
    accountHeader: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 10,
      marginBottom: 6,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    accountHeaderName: {
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
      color: colors.primaryBlack,
    },
    accountHeaderEmail: {
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      color: colors.textSecondary,
    },

    // --- Menu recolhido ---
    collapsedPanel: {
      paddingVertical: 12,
      gap: 8,
      borderTopWidth: 1,
      borderColor: colors.borderColor,
    },
    collapsedDivider: {
      height: 1,
      marginVertical: 4,
      backgroundColor: colors.borderColor,
    },
    collapsedCaption: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 14,
      color: colors.textSecondary,
    },

    // --- Linha 2: busca e local ---
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderColor: colors.borderColor,
    },
    searchField: {
      flex: 1,
      maxWidth: 720,
      flexDirection: 'row',
      alignItems: 'center',
      height: 48,
      paddingLeft: 16,
      paddingRight: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.inputBackground,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      minWidth: 0,
      height: '100%',
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      color: colors.primaryBlack,
      ...Platform.select({ web: { outlineStyle: 'none' } as object }),
    },
    searchClear: {
      width: 36,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      ...pointer,
    },
    searchButton: {
      height: 40,
      minWidth: 44,
      paddingHorizontal: 16,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryOrange,
      ...pointer,
    },
    locationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      height: 48,
      minWidth: 48,
      justifyContent: 'center',
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...pointer,
    },
    locationButtonHovered: {
      backgroundColor: colors.inputBackground,
    },
    locationText: {
      maxWidth: 200,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.primaryBlack,
    },

    // --- Modal do mapa ---
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    modalContainer: {
      width: '100%',
      maxWidth: 700,
      gap: 12,
      padding: 24,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 22,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
    },
    modalText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      color: colors.textSecondary,
    },
    mapWrapper: {
      width: '100%',
      height: 400,
      maxHeight: '60vh' as any,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    mapLoading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalButton: {
      minHeight: 48,
    },
  });
