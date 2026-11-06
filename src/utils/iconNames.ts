import type { ComponentProps } from 'react';
import type { FontAwesome, MaterialIcons } from '@expo/vector-icons';

/** Nomes validos de cada familia de icones (evita `as any` ao passar strings). */
export type FontAwesomeName = ComponentProps<typeof FontAwesome>['name'];
export type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];
