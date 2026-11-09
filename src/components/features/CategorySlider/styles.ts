import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

import { webStyle } from '@utils/webStyle';
export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },

    card: {
      flex: 1,
      minHeight: 96,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 16,
      overflow: 'hidden',
      ...Platform.select({
        web: webStyle({
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
          cursor: 'pointer',
          transition:
            'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, border-color 0.2s ease',
        }),
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        android: { elevation: 3 },
      }),
    },
    cardActive: {
      transform: [{ scale: 1.03 }],
      ...Platform.select({
        web: webStyle({ boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.12)' }),
        default: {},
      }),
    },
    cardPressed: {
      opacity: 0.85,
    },
    iconBox: {
      width: 56,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTitle: {
      flexShrink: 1,
      fontSize: 20,
      lineHeight: 24,
      fontFamily: 'Afacad-Bold',
      textAlign: 'center',
    },

    cardCompact: {
      minHeight: 72,
      gap: 10,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 12,
    },
    iconBoxCompact: {
      width: 36,
    },
    cardTitleCompact: {
      fontSize: 15,
      lineHeight: 18,
    },

    loadingContainer: {
      height: 130,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    emptyText: {
      color: colors.textSecondary,
      fontFamily: 'Afacad-Regular',
    },
  });
