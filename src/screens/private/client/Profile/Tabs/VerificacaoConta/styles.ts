import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    rowGap: { gap: 8 },
    body: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      lineHeight: 23,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    form: { gap: 14 },
    label: {
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    hint: {
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      color: colors.textSecondary,
    },
    chips: { flexDirection: 'row', gap: 8 },
    slot: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    slotTexts: { flex: 1, gap: 4 },
    slotButtons: { flexDirection: 'row', gap: 8, marginTop: 6 },
    pickButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.borderColor,
      minHeight: 40,
    },
    pickText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 14,
      color: colors.primaryBlack,
    },
    preview: { width: 72, height: 72, borderRadius: 10 },
    previewEmpty: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 8,
    },
    stepTexts: { flex: 1 },
    stepTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
      color: colors.primaryBlack,
    },
    stepText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    mfaBox: { gap: 12, marginTop: 8 },
  });
