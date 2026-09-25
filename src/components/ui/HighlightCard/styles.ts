import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    card: {
      height: 200,
      backgroundColor: colors.inputBackground,
      overflow: 'hidden',
    },
    image: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    imageStyle: {},
    gradient: {
      height: '100%',
      justifyContent: 'flex-end',
      padding: 20,
      paddingBottom: 40,
    },
    textContainer: {
      gap: 4,
      maxWidth: '90%',
    },
    title: {
      fontFamily: 'Afacad-Bold',
      fontSize: 24,
      color: '#FFFFFF',
      textShadowColor: 'rgba(0, 0, 0, 0.9)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 4,
    },
    description: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      color: '#F0F0F0',
      textShadowColor: 'rgba(0, 0, 0, 0.9)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 4,
    },
  });
