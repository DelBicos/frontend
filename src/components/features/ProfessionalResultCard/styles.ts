import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    card: {
      flexGrow: 1,
      padding: 16,
      gap: 12,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' } as object,
        default: { elevation: 1 },
      }),
    },

    // --- Identidade ---
    top: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.inputBackground,
    },
    avatarFallback: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitials: {
      fontFamily: 'Afacad-Bold',
      fontSize: 20,
      color: colors.primaryBlack,
    },
    identity: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    name: {
      fontFamily: 'Afacad-Bold',
      fontSize: 19,
      lineHeight: 23,
      color: colors.primaryBlack,
    },
    service: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      color: colors.textSecondary,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      columnGap: 12,
      rowGap: 4,
      marginTop: 4,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaStrong: {
      fontFamily: 'Afacad-Bold',
      fontSize: 15,
      color: colors.primaryBlack,
    },
    metaText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    newBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor: colors.inputBackground,
    },
    newBadgeText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 13,
      color: colors.primaryBlack,
    },
    priceBox: {
      alignItems: 'flex-end',
    },
    price: {
      fontFamily: 'Afacad-Bold',
      fontSize: 20,
      color: colors.primaryBlack,
    },

    // --- Horarios ---
    timesTitle: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 15,
      color: colors.textSecondary,
    },
    times: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    time: {
      minWidth: 72,
      minHeight: 44,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.inputBackground,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({ web: { cursor: 'pointer' } as object }),
    },
    timeHover: {
      borderColor: colors.primaryBlack,
    },
    timeSelected: {
      backgroundColor: colors.primaryOrange,
      borderColor: colors.primaryOrange,
    },
    timeText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    timeTextOn: {
      fontFamily: 'Afacad-Bold',
      color: '#000000',
    },
    moreTimes: {
      minHeight: 44,
      paddingHorizontal: 12,
      justifyContent: 'center',
    },
    moreTimesText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.primaryBlack,
      textDecorationLine: 'underline',
    },

    // --- Acoes ---
    actions: {
      marginTop: 'auto',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    profileLink: {
      minHeight: 44,
      justifyContent: 'center',
    },
    profileLinkText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.primaryBlack,
      textDecorationLine: 'underline',
    },
    book: {
      flexShrink: 1,
      minHeight: 48,
      paddingHorizontal: 18,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryOrange,
    },
    bookHover: {
      backgroundColor: colors.primaryOrangeHover,
    },
    bookDisabled: {
      backgroundColor: colors.inputBackground,
    },
    bookText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
      color: '#000000',
    },
    bookTextOff: {
      fontFamily: 'Afacad-SemiBold',
      color: colors.textSecondary,
    },
  });
