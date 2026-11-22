import { Platform } from 'react-native';
import type { PressableStateCallbackType, ViewStyle } from 'react-native';

/** Estado do Pressable no web: o react-native-web acrescenta `hovered`/`focused`. */
export type WebPressableState = PressableStateCallbackType & {
  hovered?: boolean;
  focused?: boolean;
};

/**
 * Estilo valido so no web (cursor, boxShadow em CSS, scrollbarGutter...). O
 * tipo `ViewStyle` do React Native nao conhece essas propriedades.
 */
export function webStyle(style: Record<string, unknown>): ViewStyle {
  return Platform.OS === 'web' ? (style as ViewStyle) : {};
}
