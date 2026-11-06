import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    button: {
      backgroundColor: colors.primaryBlue,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      marginBottom: 10,
    },
    buttonText: {
      color: colors.primaryWhite,
      fontSize: 16,
      fontFamily: 'Afacad-SemiBold',
      textAlign: 'center',
      marginLeft: 8,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.overlay,
    },
    modalContent: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 20,
      width: '90%',
      maxWidth: 400,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        },
        android: {
          elevation: 5,
        },
      }),
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      textAlign: 'left',
    },
    closeButton: {
      padding: 4,
    },
    mapContainer: {
      height: 300,
      width: '100%',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    confirmButton: {
      backgroundColor: colors.primaryBlue,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    confirmButtonText: {
      color: colors.primaryWhite,
      fontSize: 16,
      fontFamily: 'Afacad-Bold',
    },
  });
