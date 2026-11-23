import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      // Fallback while the gradient mounts; the gradient covers it.
      backgroundColor: colors.chat.backgroundMid,
      borderWidth: 1,
      borderColor: colors.chat.glassBorder,
      overflow: 'hidden',
    },
    // ── Header ────────────────────────────────────────────────────────────
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 12,
    },
    headerMobile: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 8,
      paddingTop: 10,
      paddingBottom: 10,
    },
    headerDivider: {
      height: 1,
      marginHorizontal: 16,
      backgroundColor: colors.chat.glassBorder,
    },
    botInfo: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      flexShrink: 1,
      minWidth: 0,
    },
    botAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.chat.accent,
    },
    botText: {
      flex: 1,
      minWidth: 0,
    },
    botName: {
      fontSize: 14,
      lineHeight: 18,
      fontFamily: 'CenturyGothic-Bold',
      color: colors.chat.textPrimary,
    },
    botStatus: {
      fontSize: 11,
      lineHeight: 15,
      fontFamily: 'CenturyGothic-Regular',
      color: colors.chat.textSecondary,
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
      borderColor: colors.chat.accentText,
    },
    headerActionDisabled: {
      opacity: 0.45,
    },
    restartText: {
      color: colors.chat.accentText,
      fontFamily: 'CenturyGothic-Bold',
      fontSize: 13,
    },
    closeButton: {
      backgroundColor: colors.chat.glassFill,
      borderWidth: 1,
      borderColor: colors.chat.glassBorder,
    },
    closeText: {
      color: colors.chat.textPrimary,
      fontFamily: 'CenturyGothic-Bold',
      fontSize: 13,
    },
    // ── Messages ──────────────────────────────────────────────────────────
    messagesList: {
      paddingTop: 16,
      paddingBottom: 8,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 60,
      gap: 12,
      paddingHorizontal: 32,
    },
    emptyText: {
      fontSize: 14,
      lineHeight: 21,
      textAlign: 'center',
      fontFamily: 'CenturyGothic-Regular',
      color: colors.chat.textSecondary,
    },
    bubbleRow: {
      marginVertical: 4,
    },
    // User messages start ~24 px in and run to the 16 px gutter on the right.
    bubbleRowUser: {
      alignItems: 'flex-end',
      paddingLeft: 24,
      paddingRight: 16,
    },
    bubbleRowBot: {
      alignItems: 'flex-start',
      paddingLeft: 16,
      paddingRight: 24,
    },
    bubble: {
      maxWidth: '100%' as const,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 14,
    },
    bubbleUser: {
      backgroundColor: colors.chat.accent,
    },
    bubbleBot: {
      backgroundColor: colors.chat.surface,
      borderWidth: 1,
      borderColor: colors.chat.glassBorder,
    },
    bubbleText: {
      fontSize: 15,
      lineHeight: 21,
      fontFamily: 'CenturyGothic-Regular',
    },
    bubbleTextUser: {
      color: colors.chat.textOnAccent,
    },
    bubbleTextBot: {
      color: colors.chat.textPrimary,
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
    // ── Footer ────────────────────────────────────────────────────────────
    footer: {
      marginTop: 12,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 12,
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: colors.chat.glassBorder,
    },
    voiceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    micButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.chat.micSurface,
    },
    micButtonRecording: {
      backgroundColor: colors.chat.accent,
    },
    voiceHint: {
      flex: 1,
      fontSize: 12,
      lineHeight: 16,
      fontFamily: 'CenturyGothic-Regular',
      color: colors.chat.textPrimary,
    },
    voiceCancel: {
      paddingHorizontal: 10,
      minHeight: 32,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: colors.chat.glassBorder,
    },
    voiceCancelText: {
      fontSize: 12,
      fontFamily: 'CenturyGothic-Bold',
      color: colors.chat.textPrimary,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    input: {
      flex: 1,
      height: 44,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.chat.glassBorder,
      backgroundColor: colors.chat.glassFill,
      paddingHorizontal: 14,
      fontSize: 14,
      fontFamily: 'CenturyGothic-Regular',
      color: colors.chat.textPrimary,
      ...Platform.select({
        web: { outlineStyle: 'none' } as object,
      }),
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.chat.accent,
    },
    sendButtonDisabled: {
      backgroundColor: colors.chat.glassFill,
      borderWidth: 1,
      borderColor: colors.chat.glassBorder,
    },
  });
