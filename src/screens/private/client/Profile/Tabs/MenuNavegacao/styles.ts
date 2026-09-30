import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    menuContainer: {
      gap: 16,
    },
    section: {
      gap: 2,
    },
    sectionTitle: {
      paddingHorizontal: 12,
      marginBottom: 4,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 13,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.textSecondary,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 44,
      paddingHorizontal: 12,
      borderRadius: 10,
      overflow: 'hidden',
      ...Platform.select({
        web: {
          transition: 'background-color 0.15s ease',
          cursor: 'pointer',
        } as object,
      }),
    },
    menuItemHovered: {
      backgroundColor: colors.inputBackground,
    },
    activeMenuItem: {
      backgroundColor: colors.inputBackground,
    },
    activeIndicator: {
      position: 'absolute',
      left: 0,
      top: 10,
      bottom: 10,
      width: 4,
      borderTopRightRadius: 4,
      borderBottomRightRadius: 4,
      backgroundColor: colors.primaryOrange,
    },
    menuIcon: {
      width: 28,
      marginRight: 10,
    },
    menuText: {
      flex: 1,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    activeMenuText: {
      fontFamily: 'Afacad-Bold',
    },
  });
