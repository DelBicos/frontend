import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    galleryList: {
      paddingBottom: 20,
    },
    imageContainer: {
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.inputBackground,
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
          boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
        },
      }),
    },
    imageThumbnail: {
      width: '100%',
      height: '100%',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      minHeight: 200,
      marginTop: 40,
    },
    emptyText: {
      marginTop: 16,
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
      color: colors.textTertiary,
      textAlign: 'center',
    },
    modalHeaderContainer: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 50 : 30,
      right: 20,
      zIndex: 10,
    },
    closeButton: {
      backgroundColor: 'rgba(0,0,0,0.6)',
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    indicatorContainer: {
      position: 'absolute',
      bottom: 40,
      alignSelf: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    indicatorText: {
      color: 'white',
      fontSize: 16,
      fontFamily: 'Afacad-Bold',
    },
  });
