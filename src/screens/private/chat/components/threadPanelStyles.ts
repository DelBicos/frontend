import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createThreadPanelStyles = (colors: ColorsType) =>
  StyleSheet.create({
    daySeparator: {
      alignSelf: 'center',
      marginVertical: 10,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: colors.inputBackground,
    },
    daySeparatorText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 13,
      color: colors.textSecondary,
    },
    container: {
      flex: 1,
      backgroundColor: colors.pageBackground,
      minHeight: 0,
    },
    flex: {
      flex: 1,
      minHeight: 0,
      backgroundColor: colors.pageBackground,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.pageBackground,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
      backgroundColor: colors.cardBackground,
    },
    backButton: {
      padding: 8,
      marginRight: 4,
    },
    headerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.inputBackground,
      marginRight: 10,
    },
    headerAvatarFallback: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primaryOrange,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    headerTextBlock: {
      flex: 1,
      minWidth: 0,
    },
    headerName: {
      fontSize: 17,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
    },
    headerSubtitle: {
      fontSize: 13,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      marginTop: 2,
    },
    listContent: {
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    bubbleRow: {
      flexDirection: 'row',
      marginVertical: 3,
    },
    bubbleRowMine: {
      justifyContent: 'flex-end',
    },
    bubbleRowTheirs: {
      justifyContent: 'flex-start',
    },
    bubble: {
      maxWidth: '78%',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
    },
    bubbleMine: {
      backgroundColor: colors.primaryOrange,
      borderBottomRightRadius: 4,
    },
    bubbleTheirs: {
      backgroundColor: colors.primaryBlue,
      borderBottomLeftRadius: 4,
    },
    bubbleTextMine: {
      fontSize: 15,
      fontFamily: 'Afacad-Regular',
      color: colors.textOnAccent,
    },
    bubbleTextTheirs: {
      fontSize: 15,
      fontFamily: 'Afacad-Regular',
      color: colors.textOnImage,
    },
    bubbleTime: {
      fontSize: 11,
      fontFamily: 'Afacad-Regular',
      marginTop: 3,
      alignSelf: 'flex-end',
    },
    bubbleTimeMine: {
      color: colors.textOnAccent,
      opacity: 0.7,
    },
    bubbleTimeTheirs: {
      color: colors.textOnImage,
      opacity: 0.85,
    },
    footerLoader: {
      paddingVertical: 12,
    },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.divider,
      backgroundColor: colors.pageBackground,
    },
    input: {
      flex: 1,
      maxHeight: 80,
      minHeight: 28,
      paddingHorizontal: 10,
      paddingVertical: Platform.OS === 'ios' ? 5 : 2,
      borderRadius: 14,
      backgroundColor: colors.inputBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderColor,
      fontSize: 14,
      lineHeight: Platform.OS === 'ios' ? 18 : undefined,
      fontFamily: 'Afacad-Regular',
      color: colors.primaryBlack,
      marginRight: 8,
      ...Platform.select({
        web: { outlineStyle: 'none' } as object,
      }),
    },
    sendButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.primaryOrange,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
    historyErrorBar: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
      backgroundColor: colors.secondaryGray,
    },
    historyErrorText: {
      fontSize: 13,
      fontFamily: 'Afacad-SemiBold',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    archivedBar: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.divider,
      backgroundColor: colors.secondaryGray,
    },
    archivedBarText: {
      fontSize: 13,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
