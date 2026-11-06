import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.overlay,
    },
    modal: {
      width: '100%',
      maxWidth: 480,
      padding: 20,
      gap: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontFamily: 'Afacad-Bold',
      fontSize: 22,
      color: colors.primaryBlack,
    },
    close: {
      width: 44,
      height: 44,
      marginRight: -10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subtitle: {
      fontFamily: 'Afacad-Regular',
      fontSize: 17,
      lineHeight: 24,
      color: colors.textSecondary,
    },
    strong: {
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
    },
    stars: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 4,
      marginTop: 8,
    },
    star: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({ web: { cursor: 'pointer' } as object }),
    },
    ratingLabel: {
      marginBottom: 8,
      textAlign: 'center',
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
      color: colors.primaryBlack,
    },
    label: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    input: {
      minHeight: 110,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.inputBackground,
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    counter: {
      alignSelf: 'flex-end',
      fontFamily: 'Afacad-Regular',
      fontSize: 13,
      color: colors.textSecondary,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
      marginTop: 4,
    },
    doneIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 8,
      backgroundColor: colors.successBackground,
    },
  });
