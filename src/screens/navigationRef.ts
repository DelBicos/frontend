import { createNavigationContainerRef } from '@react-navigation/native';
import { NavigationParams } from './types';

export const navigationRef = createNavigationContainerRef<NavigationParams>();

export function navigate(name: keyof NavigationParams | string, params?: any) {
  if (navigationRef.isReady()) {
    // @ts-ignore
    navigationRef.navigate(name, params);
  }
}

