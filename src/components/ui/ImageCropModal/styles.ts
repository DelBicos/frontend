import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType, viewport: number) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.overlay,
      padding: 16,
    },
    content: {
      width: '100%',
      maxWidth: viewport + 48,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      gap: 16,
    },
    title: {
      fontSize: 20,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      textAlign: 'center',
    },
    hint: {
      fontSize: 14,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    viewport: {
      width: viewport,
      height: viewport,
      overflow: 'hidden',
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      position: 'absolute',
    },
    // Anel que escurece o que fica fora do círculo do avatar.
    mask: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: viewport,
      height: viewport,
      borderRadius: viewport / 2,
      borderWidth: 2,
      borderColor: colors.primaryWhite,
    },
    zoomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'stretch',
      gap: 12,
    },
    zoomButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignSelf: 'stretch',
      gap: 8,
    },
  });
