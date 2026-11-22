import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    container: {
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      width: '100%',
      maxHeight: '85%',
      padding: 20,
      shadowColor: colors.primaryBlack,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 15,
      elevation: 10,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    iconBadge: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.badgeBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primaryBlack,
      flex: 1,
    },
    closeButton: {
      padding: 6,
      borderRadius: 12,
      backgroundColor: colors.secondaryGray,
    },
    subtitleBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.badgeBackground,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      alignSelf: 'flex-start',
      marginBottom: 16,
    },
    subtitleText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primaryBlue,
      marginLeft: 6,
    },
    scrollArea: {
      marginBottom: 16,
    },
    paragraph: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 14,
    },
    boldText: {
      fontWeight: '700',
      color: colors.primaryBlack,
    },
    bulletBox: {
      backgroundColor: colors.secondaryGray,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      marginBottom: 14,
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 10,
    },
    bulletIcon: {
      marginTop: 2,
      marginRight: 8,
    },
    bulletText: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
      flex: 1,
    },
    legalNotice: {
      fontSize: 11,
      color: colors.textTertiary,
      lineHeight: 16,
      fontStyle: 'italic',
    },
    footer: {
      gap: 10,
    },
    btnAccept: {
      backgroundColor: colors.primaryOrange,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnDisabled: {
      opacity: 0.6,
    },
    btnAcceptText: {
      color: colors.textOnImage,
      fontSize: 16,
      fontWeight: '700',
    },
    btnDecline: {
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnDeclineText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
  });
