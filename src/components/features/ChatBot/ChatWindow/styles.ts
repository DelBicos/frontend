import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundElevated,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    headerMobile: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 8,
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 10,
    },
    botInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flexShrink: 1,
      minWidth: 0,
    },
    botAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    botText: {
      flex: 1,
      minWidth: 0,
    },
    botName: {
      fontSize: 15,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
    },
    botSubtitle: {
      fontSize: 12,
      color: colors.textTertiary,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerActionsMobile: {
      justifyContent: 'flex-end',
    },
    headerActionButton: {
      minHeight: 44,
      paddingHorizontal: 13,
      borderRadius: 22,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
    },
    restartButton: {
      borderWidth: 1,
      borderColor: colors.primaryOrange,
    },
    headerActionDisabled: {
      opacity: 0.45,
    },
    restartText: {
      color: colors.primaryOrange,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 14,
    },
    closeButton: {
      backgroundColor: colors.inputBackground,
    },
    closeText: {
      color: colors.textSecondary,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 14,
    },
    messagesList: {
      paddingVertical: 12,
      paddingBottom: 4,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 60,
      gap: 12,
      paddingHorizontal: 32,
    },
    emptyText: {
      fontSize: 15,
      textAlign: 'center',
      lineHeight: 22,
    },
    bubbleRow: {
      paddingHorizontal: 12,
      marginVertical: 2,
    },
    bubbleRowUser: {
      alignItems: 'flex-end',
    },
    bubbleRowBot: {
      alignItems: 'flex-start',
    },
    bubble: {
      maxWidth: '80%' as const,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 18,
    },
    bubbleUser: {
      borderBottomRightRadius: 4,
    },
    bubbleBot: {
      borderBottomLeftRadius: 4,
      borderWidth: 1,
    },
    bubbleText: {
      fontSize: 15,
      lineHeight: 21,
    },
    errorBanner: {
      marginHorizontal: 12,
      marginVertical: 4,
      borderRadius: 8,
      padding: 10,
    },
    errorText: {
      fontSize: 13,
      lineHeight: 18,
      textAlign: 'center',
    },
    retryText: {
      fontSize: 13,
      fontFamily: 'Afacad-SemiBold',
      marginTop: 4,
      textAlign: 'center',
    },
    hintBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginHorizontal: 12,
      marginVertical: 4,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    hintText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderTopWidth: 1,
      backgroundColor: colors.cardBackground,
      gap: 8,
    },
    input: {
      flex: 1,
      height: 42,
      borderRadius: 21,
      borderWidth: 1,
      paddingHorizontal: 16,
      fontSize: 15,
      fontFamily: 'Afacad-Regular',
    },
    sendButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
