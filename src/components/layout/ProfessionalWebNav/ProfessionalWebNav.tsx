import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
import { CONTENT_MAX_WIDTH, useBreakpoint } from '@lib/hooks/useBreakpoint';
import { PROFESSIONAL_ITEMS } from '../BottomNav/bottomNavState';

/**
 * Navegacao entre as secoes do painel do colaborador no web (no app isso e
 * feito pela barra inferior). Fica logo abaixo do cabecalho do site.
 */
function ProfessionalWebNav({ state, navigation }: BottomTabBarProps) {
  const colors = useColors();
  const { gutter, isCompact } = useBreakpoint();
  const styles = createStyles(colors);
  const activeRoute = state.routes[state.index]?.name;

  return (
    <View style={styles.bar}>
      <View
        style={[styles.inner, { paddingHorizontal: gutter }]}
        accessibilityRole="tablist"
        accessibilityLabel="Seções do painel do colaborador">
        {PROFESSIONAL_ITEMS.map((item) => {
          const selected = item.tab === activeRoute;
          return (
            <Pressable
              key={item.tab}
              onPress={() => navigation.navigate(item.tab)}
              style={({ hovered }: any) => [
                styles.tab,
                selected && styles.tabSelected,
                hovered && !selected && styles.tabHovered,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={item.label}>
              <FontAwesome
                name={item.icon as any}
                size={16}
                color={selected ? colors.primaryBlack : colors.textSecondary}
              />
              {!isCompact || selected ? (
                <Text style={[styles.label, selected && styles.labelSelected]}>
                  {item.label}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    bar: {
      backgroundColor: colors.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    inner: {
      flexDirection: 'row',
      gap: 4,
      width: '100%',
      maxWidth: CONTENT_MAX_WIDTH + 64,
      alignSelf: 'center',
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minHeight: 48,
      paddingHorizontal: 14,
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    tabSelected: {
      borderBottomColor: colors.primaryOrange,
    },
    tabHovered: {
      backgroundColor: colors.inputBackground,
    },
    label: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.textSecondary,
    },
    labelSelected: {
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
    },
  });

export default ProfessionalWebNav;
