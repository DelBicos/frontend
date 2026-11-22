import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (
  colors: ColorsType,
  isMobile: boolean = false,
  isDark: boolean = false,
  isHighContrast: boolean = false,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark
        ? colors.secondaryGray
        : isHighContrast
          ? colors.primaryWhite
          : '#DDE6F0',
    },
    contentContainer: {
      paddingBottom: 40,
    },

    // Title
    pageTitle: {
      fontSize: isMobile ? 36 : 62,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryOrange,
      textAlign: 'center',
      paddingTop: isMobile ? 16 : 20,
    },

    missionWrapper: {
      marginHorizontal: isMobile ? 8 : 16,
      marginBottom: 24,
    },
    // Foto ao lado do texto no desktop, acima do texto no mobile.
    missionRow: {
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'stretch' : 'center',
      gap: isMobile ? 16 : 32,
      padding: isMobile ? 16 : 28,
    },
    // A proporcao fica no contêiner: o Image do RN web ignora aspectRatio e
    // usa a altura intrinseca do arquivo.
    missionPhotoCol: {
      // 70% do tamanho anterior (100% no mobile, 40% no desktop).
      width: isMobile ? '70%' : '28%',
      alignSelf: 'center',
      aspectRatio: 1024 / 768,
      borderRadius: 20,
      borderWidth: isHighContrast ? 4 : 3,
      borderColor: colors.primaryOrange,
      overflow: 'hidden',
    },
    teamPhoto: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    },

    // Mission Card
    missionCard: {
      flexDirection: 'column',
      width: '100%',
      flexShrink: 0,
      borderRadius: 25,
      backgroundColor: isDark ? colors.cardBackground : '#FFFFFF',
      marginTop: isMobile ? 15 : 10,
      borderWidth: isHighContrast ? 3 : isDark ? 0 : 1,
      borderColor: isHighContrast ? colors.primaryBlack : colors.borderColor,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        android: {
          elevation: 3,
        },
        web: {},
      }),
    },
    missionTextCol: {
      flex: 1,
      justifyContent: 'center',
      gap: isMobile ? 8 : 12,
    },
    missionText: {
      fontSize: isMobile ? 16 : 24,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      lineHeight: isMobile ? 22 : 28,
      textAlign: 'justify',
    },

    // Values ("No que acreditamos")
    valuesSection: {
      marginHorizontal: isMobile ? 8 : 16,
      marginBottom: 24,
    },
    valuesTitle: {
      fontSize: isMobile ? 28 : 40,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryOrange,
      textAlign: 'center',
      marginBottom: isMobile ? 10 : 14,
    },
    valuesRow: {
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? 10 : 12,
    },
    valueCard: {
      flex: isMobile ? undefined : 1,
      gap: 4,
      padding: isMobile ? 12 : 16,
      borderRadius: 12,
      borderWidth: isHighContrast ? 3 : 1,
      borderColor: isHighContrast ? colors.primaryBlack : colors.borderColor,
      backgroundColor: colors.cardBackground,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
        web: {},
      }),
    },
    valueIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryOrange,
    },
    valueTitle: {
      fontSize: isMobile ? 19 : 24,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
    },
    valueText: {
      fontSize: isMobile ? 14 : 17,
      fontFamily: 'Afacad-Regular',
      color: colors.primaryBlack,
      lineHeight: isMobile ? 20 : 23,
    },

    //  Developers Banner
    developersBanner: {
      backgroundColor: colors.primaryBlue,
      paddingVertical: 10,
      paddingHorizontal: 10,
      marginBottom: 10,
      alignItems: 'center',
    },
    developersBannerTitle: {
      fontSize: isMobile ? 36 : 60,
      fontFamily: 'Afacad-Bold',
      color: isDark ? colors.primaryBlack : colors.primaryWhite,
      letterSpacing: 0.5,
    },

    //  Developer Card
    developerCard: {
      flexDirection: isMobile ? 'column' : 'row',
      marginHorizontal: isMobile ? 8 : 16,
      marginBottom: 16,
      borderRadius: 12,
      borderWidth: isHighContrast ? 3 : 1,
      borderColor: isHighContrast ? colors.primaryBlack : colors.borderColor,
      backgroundColor:
        isDark || isHighContrast ? colors.cardBackground : 'transparent',
      padding: isMobile ? 12 : 16,
      gap: isMobile ? 10 : 14,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
        web: {},
      }),
    },
    developerCardReversed: {
      flexDirection: isMobile ? 'column' : 'row-reverse',
    },
    developerPhotoWrapper: {
      alignItems: 'center',
    },
    developerPhoto: {
      width: isMobile ? 250 : 350,
      height: isMobile ? 250 : 350,
      borderRadius: isMobile ? 60 : 0,
    },
    developerSocialIcons: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    socialIconButton: {
      padding: 2,
    },
    socialIcon: {
      width: isMobile ? 24 : 30,
      height: isMobile ? 24 : 30,
    },
    socialIconDisabled: {
      opacity: 0.3,
    },
    developerInfo: {
      flex: 1,
    },
    developerName: {
      fontSize: isMobile ? 22 : 40,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryOrange,
      marginBottom: 2,
    },
    developerNameReversed: {
      textAlign: isMobile ? 'left' : 'right',
    },
    developerRoleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isMobile ? 10 : 18,
      marginBottom: 8,
      flexWrap: 'wrap',
    },
    developerRoleRowReversed: {
      flexDirection: isMobile ? 'row' : 'row-reverse',
    },
    developerRole: {
      fontSize: isMobile ? 16 : 30,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
    },
    developerBio: {
      fontSize: isMobile ? 14 : 30,
      fontFamily: 'Afacad-Regular',
      color: colors.primaryBlack,
      lineHeight: isMobile ? 20 : 37,
      textAlign: 'justify',
    },

    // Separator line between developer cards
    separatorLine: {
      width: '100%',
      height: isMobile ? 40 : 70,
    },
    separatorLineReversed: {
      transform: [{ scaleX: -1 }],
    },

    // Footer
    footer: {
      padding: 20,
      textAlign: 'center',
      fontSize: 12,
      fontFamily: 'Afacad-Regular',
      color: colors.textTertiary,
      marginTop: 8,
    },
  });
