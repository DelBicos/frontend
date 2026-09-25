import { FontAwesome } from '@expo/vector-icons';
import type { NavigationState } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import { navigationRef } from '@screens/navigationRef';
import { useUserStore } from '@stores/User';
import { useColors } from '@theme/ThemeProvider';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Keyboard, Platform, Pressable, Text, View } from 'react-native';
import {
  BottomNavItem,
  HIDDEN_ROUTES,
  getBottomNavState,
  getFocusedRouteName,
} from './bottomNavState';
import { createStyles } from './styles';

interface BottomNavProps {
  /** Estado do stack raiz, atualizado pelo NavigationContainer. */
  state: NavigationState | undefined;
}

/**
 * Barra inferior dos apps nativos. Fica fora dos navegadores para continuar
 * visivel quando uma tela e empilhada sobre as abas (perfil do parceiro,
 * resultados de busca, categorias...), que antes escondia o menu.
 */
const BottomNav: React.FC<BottomNavProps> = ({ state }) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const user = useUserStore((s) => s.user);
  const keyboardVisible = useKeyboardVisible();

  const nav = useMemo(
    () => getBottomNavState(state, !!user?.professional_id),
    [state, user?.professional_id],
  );

  const focusedRoute = getFocusedRouteName(state);
  if (
    !state ||
    keyboardVisible ||
    (focusedRoute && HIDDEN_ROUTES.has(focusedRoute))
  ) {
    return null;
  }

  const handlePress = (item: BottomNavItem) => {
    if (!navigationRef.isReady()) return;
    const root = navigationRef.getRootState();
    if (!root) return;
    const containerIndex = root.routes
      .map((r) => r.name)
      .lastIndexOf(nav.container);
    // Volta ate as abas (fechando telas empilhadas) e troca para a aba tocada.
    if (containerIndex >= 0 && containerIndex < root.index) {
      navigationRef.dispatch(StackActions.popTo(nav.container));
    }
    // @ts-ignore - navegacao aninhada para a aba
    navigationRef.navigate(nav.container, { screen: item.tab });
  };

  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {nav.items.map((item) => {
        const selected = item.tab === nav.activeTab;
        const color = selected ? colors.primaryOrange : colors.textTertiary;
        const showAvatar = item.section === 'profile' && !!user?.avatar_uri;
        return (
          <Pressable
            key={item.tab}
            onPress={() => handlePress(item)}
            style={[styles.item, selected && styles.indicatorActive]}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected }}
            android_ripple={{ color: colors.borderColor, borderless: true }}>
            <View style={styles.indicator}>
              {showAvatar ? (
                <Image
                  source={{ uri: user!.avatar_uri! }}
                  style={[styles.avatar, { borderColor: color }]}
                />
              ) : (
                <FontAwesome name={item.icon as any} size={22} color={color} />
              )}
            </View>
            <Text
              style={[styles.label, { color }, selected && styles.labelActive]}
              numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

/** No Android a barra subiria junto com o teclado; escondemos enquanto ele aparece. */
function useKeyboardVisible() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setVisible(true),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
}

export default BottomNav;
