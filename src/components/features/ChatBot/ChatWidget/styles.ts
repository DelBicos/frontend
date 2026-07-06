import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    fab: {
      position: 'absolute',
      right: 20,
      zIndex: 999,
    },
    fabButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
      paddingHorizontal: 4,
    },
    badgeText: {
      color: '#fff',
      fontSize: 11,
      fontFamily: 'Afacad-SemiBold',
    },
    webPanel: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      zIndex: 998,
      shadowColor: '#000',
      shadowOffset: { width: -4, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 16,
    },
    modalContainer: {
      flex: 1,
    },
  });
