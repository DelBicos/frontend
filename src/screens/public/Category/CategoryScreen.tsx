import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { useThemeStore, ThemeMode } from '@stores/Theme';
import CategoryList from '@components/features/CategoryList';
import { createStyles } from './styles';

function CategoryScreen() {
  const colors = useColors();
  const { theme } = useThemeStore();
  const isDark = theme === ThemeMode.DARK;
  const isHighContrast = theme === ThemeMode.LIGHT_HI_CONTRAST;
  const styles = createStyles(colors, isDark, isHighContrast);

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Categorias</Text>
      <View style={styles.listContainer}>
        <CategoryList />
      </View>
    </View>
  );
}

export default CategoryScreen;
