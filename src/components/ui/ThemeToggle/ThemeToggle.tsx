import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useThemeStore } from '@stores/Theme';
import { ThemeMode } from '@stores/Theme/types';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';

export const THEME_OPTIONS: {
  mode: ThemeMode;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
}[] = [
  { mode: ThemeMode.LIGHT, icon: 'sun-o', label: 'Claro' },
  { mode: ThemeMode.DARK, icon: 'moon-o', label: 'Escuro' },
  {
    mode: ThemeMode.LIGHT_HI_CONTRAST,
    icon: 'adjust',
    label: 'Alto contraste',
  },
];

/**
 * Escolha do tema: botoes com icone e nome (claro, escuro, alto contraste).
 * `fill`: ocupa a largura toda, com o icone sobre o nome (telas estreitas).
 */
export const ThemeToggle: React.FC<{ fill?: boolean }> = ({ fill = false }) => {
  const { theme, setTheme } = useThemeStore();
  const colors = useColors();
  const styles = createStyles(colors);
  const current = theme || ThemeMode.LIGHT;

  return (
    <View
      style={[styles.container, fill && styles.containerFill]}
      accessibilityRole="radiogroup"
      accessibilityLabel="Tema">
      {THEME_OPTIONS.map((option) => {
        const isActive = current === option.mode;
        return (
          <Pressable
            key={option.mode}
            style={({ pressed }) => [
              styles.button,
              fill && styles.buttonFill,
              isActive && styles.buttonActive,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => setTheme(option.mode)}
            accessibilityRole="radio"
            accessibilityState={{ checked: isActive }}
            accessibilityLabel={`Tema ${option.label}`}
            testID={`theme-${option.mode}-button`}>
            <FontAwesome
              name={option.icon}
              size={16}
              color={isActive ? '#000000' : colors.primaryBlack}
            />
            <Text
              style={[
                styles.label,
                fill && styles.labelFill,
                isActive && styles.labelActive,
              ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
