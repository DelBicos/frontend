import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';
// Reutilizando o estilo base de input para consistência
import { createInputBaseStyle } from '@components/ui/CustomTextInput/styles';

export const createStyles = (
  colors: ColorsType,
  isDark: boolean = false,
  isHighContrast: boolean = false,
) => {
  const inputBaseStyle = createInputBaseStyle(colors);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark
        ? colors.secondaryGray
        : isHighContrast
          ? colors.primaryWhite
          : '#DDE6F0',
    },
    contentContainer: {
      alignItems: 'center',
      paddingVertical: 32,
      paddingHorizontal: 24,
    },
    mainContent: {
      width: '100%',
      maxWidth: 900,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 24,
      textAlign: 'center',
    },
    searchBarContainer: {
      flexDirection: 'row',
      marginBottom: 32,
      gap: 12,
      width: '100%',
      maxWidth: 600,
      alignSelf: 'center',
    },
    searchInput: {
      ...inputBaseStyle.input,
      flex: 1,
      height: 50,
      backgroundColor: colors.cardBackground,
      ...Platform.select({
        web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' },
        default: { elevation: 2 },
      }),
    },
    searchButton: {
      backgroundColor: colors.primaryOrange,
      borderRadius: 12,
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        web: { cursor: 'pointer' } as any,
      }),
    },
    faqSection: {
      width: '100%',
      marginBottom: 32,
    },
    categoryTitle: {
      fontSize: 22,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginBottom: 16,
      borderBottomWidth: 2,
      borderColor: colors.primaryOrange,
      paddingBottom: 8,
      alignSelf: 'flex-start',
    },
    notFoundText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 40,
    },
  });
};
