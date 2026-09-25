import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
      marginBottom: 8,
    },
    selectButton: {
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: colors.inputBackground,
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
    },
    selectButtonText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      color: colors.primaryBlack,
      flex: 1,
    },
    placeholderText: {
      color: colors.textTertiary,
    },
    errorBorder: {
      borderColor: colors.errorText,
    },
    errorText: {
      color: colors.errorText,
      fontSize: 12,
      marginTop: 4,
      fontFamily: 'Afacad-Regular',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.cardBackground,
      width: '100%',
      maxWidth: 400,
      borderRadius: 16,
      padding: 24,
      maxHeight: '80%',
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
    modalTitle: {
      fontSize: 18,
      fontFamily: 'Afacad-Bold',
      marginBottom: 16,
      color: colors.primaryBlack,
      textAlign: 'center',
    },
    optionItem: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    optionText: {
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
      color: colors.primaryBlack,
    },
    closeButton: {
      marginTop: 16,
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    closeButtonText: {
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
    },
    webSelect: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0,
      width: '100%',
      height: '100%',
      zIndex: 2,
      ...Platform.select({
        web: { cursor: 'pointer' } as any,
      }),
    },
  });
