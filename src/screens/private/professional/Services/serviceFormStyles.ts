import { StyleSheet } from 'react-native';
import type { ColorsType } from '@theme/types';
import { webStyle } from '@lib/types/web';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.secondaryGray },
    content: { padding: 20, paddingBottom: 40, gap: 16 },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    header: {
      flex: 1,
      fontFamily: 'Afacad-Bold',
      fontSize: 26,
      color: colors.primaryBlack,
    },
    closeBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.cardBackground,
      ...webStyle({ cursor: 'pointer' }),
    },
    card: {
      padding: 18,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    sectionHeader: {
      marginBottom: 8,
      gap: 2,
    },
    sectionTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 18,
      color: colors.primaryBlack,
    },
    sectionHint: {
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    rowItem: {
      flexGrow: 1,
      flexBasis: 200,
    },
    imagePlaceholder: {
      height: 140,
      gap: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderColor,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.inputBackground,
      ...webStyle({ cursor: 'pointer' }),
    },
    imagePlaceholderText: {
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
      fontSize: 15,
    },
    bannerPreview: {
      width: '100%',
      height: 180,
      borderRadius: 12,
      resizeMode: 'cover',
    },
    changePhotoText: {
      textAlign: 'center',
      color: colors.primaryBlack,
      fontFamily: 'Afacad-SemiBold',
      textDecorationLine: 'underline',
      marginTop: 8,
      fontSize: 15,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
    },
    toggleTexts: {
      flex: 1,
      gap: 2,
    },
    errorBox: {
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.errorBackground,
    },
    errorText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 15,
      color: colors.errorText,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    cancelBtn: {
      flex: 1,
      minHeight: 48,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: colors.primaryBlack,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    saveBtnWrapper: {
      flex: 1,
    },
    saveBtn: {
      minHeight: 48,
      borderRadius: 999,
      backgroundColor: colors.primaryOrange,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Texto escuro sobre laranja (contraste AA).
    saveText: { fontFamily: 'Afacad-Bold', fontSize: 16, color: '#000000' },
  });
