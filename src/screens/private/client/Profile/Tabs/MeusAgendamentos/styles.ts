import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: 'transparent',
    },
    pageTitle: {
      fontSize: 24,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 24,
    },
    section: {
      marginBottom: 32,
    },
    sectionHeader: {
      backgroundColor: colors.primaryBlue,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryWhite,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    gridItem: {
      width: '100%',
    },
    emptyContainer: {
      padding: 32,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderStyle: 'dashed',
    },
    emptyText: {
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    filterContainer: {
      flexDirection: 'row',
      marginBottom: 20,
      gap: 10,
    },
    filterChip: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    filterChipActive: {
      backgroundColor: colors.primaryBlue,
      borderColor: colors.primaryBlue,
    },
    filterText: {
      fontSize: 14,
      fontFamily: 'Afacad-Medium',
      color: colors.textSecondary,
    },
    filterTextActive: {
      color: colors.primaryWhite,
    },
  });
