import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (
  colors: ColorsType,
  options: { isHighContrast: boolean; isCompact: boolean },
) => {
  const background = options.isHighContrast
    ? colors.primaryWhite
    : colors.secondaryGray;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: background,
    },
    list: {
      flex: 1,
      backgroundColor: background,
    },
    visuallyHidden: {
      position: 'absolute',
      width: 1,
      height: 1,
      overflow: 'hidden',
      opacity: 0,
    },
    header: {
      paddingTop: options.isCompact ? 8 : 16,
    },
    section: {
      marginTop: options.isCompact ? 32 : 48,
    },

    // --- Busca (apps nativos) ---
    searchSection: {
      marginBottom: 16,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.cardBackground,
      borderRadius: 999,
      minHeight: 52,
      paddingHorizontal: 18,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
        },
        android: { elevation: 2 },
      }),
    },
    searchInput: {
      flex: 1,
      fontSize: 17,
      fontFamily: 'Afacad-Regular',
      color: colors.primaryBlack,
      paddingVertical: 12,
    },
    searchClear: {
      padding: 4,
    },
    dropdownContainer: {
      position: 'absolute',
      top: 60,
      left: 0,
      right: 0,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        },
        android: { elevation: 6 },
      }),
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minHeight: 52,
      paddingHorizontal: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    dropdownIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dropdownName: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
    },
    dropdownEmpty: {
      padding: 16,
      alignItems: 'center',
    },
    dropdownEmptyText: {
      fontSize: 15,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
};
