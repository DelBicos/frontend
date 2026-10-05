import { StyleSheet } from 'react-native';
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
      backgroundColor: colors.primaryWhite,
      minHeight: 0,
    },
    flex: {
      flex: 1,
      minHeight: 0,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
      backgroundColor: colors.primaryWhite,
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
      backgroundColor: colors.secondaryGray,
      borderBottomLeftRadius: 4,
    },
    bubbleTextMine: {
      fontSize: 15,
      fontFamily: 'Afacad-Regular',
      // Texto escuro sobre laranja (contraste AA).
      color: '#000000',
    },
    bubbleTextTheirs: {
      fontSize: 15,
      fontFamily: 'Afacad-Regular',
      color: colors.primaryBlack,
    },
    bubbleTime: {
      fontSize: 11,
      fontFamily: 'Afacad-Regular',
      marginTop: 3,
      alignSelf: 'flex-end',
    },
    bubbleTimeMine: {
      color: 'rgba(0,0,0,0.65)',
    },
    bubbleTimeTheirs: {
      color: colors.textTertiary,
    },
    footerLoader: {
      paddingVertical: 12,
    },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.divider,
      backgroundColor: colors.primaryWhite,
    },
    input: {
      flex: 1,
      maxHeight: 120,
      minHeight: 44,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 22,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
      fontSize: 15,
      fontFamily: 'Afacad-Regular',
      color: colors.primaryBlack,
      marginRight: 8,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primaryOrange,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.5,
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
