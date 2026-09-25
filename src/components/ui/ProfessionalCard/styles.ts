import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    card: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      margin: 8,
      minHeight: 110,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
        web: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          cursor: 'pointer',
        } as any,
      }),
    },
    image: {
      width: 100,
      height: '100%',
      backgroundColor: colors.inputBackground,
    },
    content: {
      flex: 1,
      padding: 12,
      justifyContent: 'space-between',
    },
    name: {
      fontSize: 16,
      fontFamily: 'Afacad-Bold',
      marginBottom: 4,
    },
    services: {
      fontSize: 13,
      fontFamily: 'Afacad-Regular',
      marginBottom: 6,
      lineHeight: 18,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    rating: {
      fontSize: 13,
      fontFamily: 'Afacad-Bold',
      marginLeft: 4,
    },
    ratingCount: {
      fontSize: 13,
      fontFamily: 'Afacad-Regular',
      fontWeight: 'normal',
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 'auto',
    },
    location: {
      fontSize: 12,
      fontFamily: 'Afacad-Regular',
      flex: 1,
      marginRight: 8,
    },
    distanceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryBlue,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
    },
    distanceText: {
      color: colors.primaryWhite,
      fontSize: 11,
      fontFamily: 'Afacad-Bold',
      marginLeft: 4,
    },
  });
