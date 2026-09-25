import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
        web: {
          boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
        },
      }),
      flex: 1,
      minWidth: 280,
      marginRight: 12,
    },
    ratingContainer: {
      marginBottom: 8,
      alignSelf: 'flex-start',
    },
    stars: {
      backgroundColor: 'transparent',
    },
    title: {
      fontSize: 16,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 4,
    },
    service: {
      fontSize: 14,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    reviewText: {
      fontSize: 14,
      fontFamily: 'Afacad-Regular',
      color: colors.primaryBlack,
      lineHeight: 20,
      marginBottom: 16,
      fontStyle: 'italic',
    },
    clientContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      paddingTop: 12,
      marginTop: 'auto',
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 12,
      backgroundColor: colors.inputBackground,
    },
    clientInfo: {
      flex: 1,
    },
    clientName: {
      fontSize: 13,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
      marginBottom: 2,
    },
    date: {
      fontSize: 11,
      fontFamily: 'Afacad-Regular',
      color: colors.textTertiary,
    },
  });
