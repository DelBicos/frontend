import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

import { webStyle } from '@lib/types/web';
export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
      zIndex: 100,
      position: 'relative',
      ...webStyle({ overflow: 'visible' }),
    },
    inputContainer: {
      position: 'relative',
      width: '100%',
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      marginTop: 4,
      backgroundColor: colors.cardBackground,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.borderColor,
      maxHeight: 220,
      zIndex: 9999,
      elevation: 9999,

      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        web: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
        },
      }),
    },
    item: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      ...webStyle({ cursor: 'pointer' }),
    },
    itemText: {
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
      color: colors.primaryBlack,
    },
    emptyText: {
      padding: 16,
      textAlign: 'center',
      color: colors.textTertiary,
      fontSize: 14,
      fontFamily: 'Afacad-Regular',
    },
    webOverlay: {
      ...webStyle({ position: 'fixed', cursor: 'default' }),
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9998,
      backgroundColor: 'transparent',
    },
  });
