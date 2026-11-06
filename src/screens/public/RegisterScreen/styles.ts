import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType, isCompact: boolean) =>
  StyleSheet.create({
    sectionTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 20,
      color: colors.primaryBlack,
      marginTop: 8,
      marginBottom: 12,
    },
    // Dois campos por linha a partir do tablet.
    row: {
      flexDirection: isCompact ? 'column' : 'row',
      gap: isCompact ? 0 : 16,
    },
    col: {
      flex: isCompact ? undefined : 1,
      minWidth: 0,
    },
    address: {
      zIndex: 100,
      width: '100%',
    },
    termsBlock: {
      marginTop: 4,
      marginBottom: 20,
    },
    terms: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minHeight: 44,
      ...Platform.select({ web: { cursor: 'pointer' } as object }),
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.textSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxOn: {
      borderColor: colors.primaryOrange,
      backgroundColor: colors.primaryOrange,
    },
    termsText: {
      flex: 1,
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      lineHeight: 22,
      color: colors.primaryBlack,
    },
    errorText: {
      marginTop: 4,
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      color: colors.errorText,
    },
  });
