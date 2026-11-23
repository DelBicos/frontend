import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

const DOT_SIZE = 6;

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      alignItems: 'flex-start',
      paddingHorizontal: 16,
      marginVertical: 6,
      gap: 6,
    },
    bubble: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: 60,
      height: 30,
      borderRadius: 10,
      backgroundColor: colors.chat.surface,
      borderWidth: 1,
      borderColor: colors.chat.glassBorder,
      gap: 6,
    },
    dot: {
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: DOT_SIZE / 2,
      backgroundColor: colors.chat.typingDot,
    },
    caption: {
      fontSize: 11,
      lineHeight: 15,
      fontFamily: 'CenturyGothic-Regular',
      color: colors.chat.textSecondary,
      alignSelf: 'stretch',
    },
  });
