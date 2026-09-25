import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    headerContainer: {
      backgroundColor: colors.cardBackground,
      zIndex: 100,
    },

    // --- MOBILE HEADER ---
    mobileHeader: {
      height: 60,
      backgroundColor: colors.cardBackground,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderColor: colors.borderColor,
      paddingHorizontal: 16,
      zIndex: 100,
    },
    mobileLogoContainer: {
      flex: 1,
      alignItems: 'center',
    },
    mobileLogo: {
      width: 120,
      height: 36,
      resizeMode: 'contain',
    },
    mobileMenuTrigger: {
      padding: 4,
      width: 36,
      alignItems: 'flex-start',
    },
    mobileProfileContainer: {
      width: 36,
      alignItems: 'flex-end',
    },
    mobileProfileImage: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.inputBackground,
    },

    // --- DESKTOP HEADER (Top Bar) ---
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 80,
      paddingHorizontal: 32,
      borderBottomWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
    },
    logoImage: {
      width: 180,
      height: 50,
      resizeMode: 'contain',
    },

    // --- MENU DE NAVEGAÇÃO (DESKTOP) ---
    menu: {
      flexDirection: 'row',
      gap: 24,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      marginHorizontal: 20,
    },
    menuItemPressable: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      ...Platform.select({
        web: { transition: 'background-color 0.2s ease' } as any,
      }),
    },
    menuItemHovered: {
      backgroundColor: colors.primaryOrange,
    },
    menuItemText: {
      fontSize: 15,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
    },
    menuItemTextHovered: {
      color: colors.primaryWhite,
    },

    // --- SEÇÃO DIREITA ---
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    locationContainer: {
      alignItems: 'flex-start',
    },
    locationLabel: {
      fontFamily: 'Afacad-Regular',
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 2,
    },

    // --- USER DROPDOWN ---
    userContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      cursor: 'pointer',
    },
    profileImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.inputBackground,
    },
    authButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    // --- SEARCH BAR ---
    searchBar: {
      backgroundColor: colors.primaryBlue,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      paddingVertical: 12,
      gap: 20,
    },
    searchText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontFamily: 'Afacad-SemiBold',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      overflow: 'hidden',
      width: 400,
      height: 44,
    },
    searchInput: {
      flex: 1,
      paddingHorizontal: 16,
      fontSize: 14,
      fontFamily: 'Afacad-Regular',
      height: '100%',
      color: '#000000',
      ...Platform.select({
        web: { outlineStyle: 'none' } as any,
      }),
    },
    searchButton: {
      paddingHorizontal: 16,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#E0E0E0',
    },

    // --- MENU POPUP (DROPDOWN) ---
    menuOptionsContainer: {
      borderRadius: 12,
      marginTop: 45,
      width: 240,
      backgroundColor: colors.cardBackground,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
        },
        android: { elevation: 8 },
        web: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)' },
      }),
    },
    menuOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    menuIcon: {
      marginRight: 16,
      width: 24,
      textAlign: 'center',
    },
    menuOptionText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 15,
      color: colors.primaryBlack,
    },
    menuDivider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: 8,
    },

    // --- MODAL MAPA ---
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      width: '100%',
      maxWidth: 700,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
    },
    mapWrapper: {
      width: '100%',
      height: 400,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    modalButton: {
      backgroundColor: colors.primaryOrange,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    modalButtonDisabled: {
      backgroundColor: colors.textTertiary,
      opacity: 0.7,
    },
    modalButtonText: {
      color: '#FFFFFF',
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
    },
  });
