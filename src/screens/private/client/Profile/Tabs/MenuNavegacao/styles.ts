import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    menuContainer: {
      flex: 1,
      gap: 8,
      paddingVertical: 16,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: 'transparent',
      overflow: 'hidden',
      ...Platform.select({
        web: {
          transition: 'background-color 0.2s ease',
          cursor: 'pointer',
        } as any,
      }),
    },
    activeMenuItem: {
      backgroundColor: colors.inputBackground,
    },
    activeIndicator: {
      position: 'absolute',
      left: 0,
      height: 24,
      width: 4,
      backgroundColor: colors.primaryOrange,
      borderTopRightRadius: 4,
      borderBottomRightRadius: 4,
    },
    menuIconContainer: {
      width: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    menuText: {
      fontSize: 16,
      fontFamily: 'Afacad-SemiBold',
      color: colors.textSecondary,
      flex: 1,
    },
    activeMenuText: {
      fontFamily: 'Afacad-Bold',
      color: colors.primaryOrange,
    },
    chevronIcon: {
      marginLeft: 'auto',
    },
  });
