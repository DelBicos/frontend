import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  Pressable,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCategoryStore } from '@stores/Category/Category';
import { Category } from '@stores/Category/types';
import { useThemeStore, ThemeMode } from '@stores/Theme';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';
import { FontAwesome5 } from '@expo/vector-icons';

const CATEGORY_ICONS: Record<number, string> = {
  1: 'heartbeat',
  2: 'cut',
  3: 'tools',
  4: 'lightbulb',
  5: 'home',
  6: 'paw',
};

function getCategoryIconName(id: number) {
  return CATEGORY_ICONS[id] || 'shapes';
}

interface CategoryCardProps {
  category: Category;
  onPress: (category: Category) => void;
}

function CategoryCard({ category, onPress }: CategoryCardProps) {
  const iconName = getCategoryIconName(category.id);
  const [isHovered, setIsHovered] = useState(false);

  const { theme } = useThemeStore();
  const colors = useColors();
  const styles = createStyles(colors);

  const isDark = theme === ThemeMode.DARK;
  const isHighContrast = theme === ThemeMode.LIGHT_HI_CONTRAST;

  const colorProps = useMemo(() => {
    let bgColor = colors.cardBackground;
    let borderColor = colors.borderColor;
    let contentColor = colors.primaryOrange;

    if (isDark) {
      bgColor = colors.backgroundElevated;
      borderColor = colors.borderColor;
      contentColor = colors.primaryBlack;
    }

    if (isHighContrast) {
      bgColor = colors.primaryWhite;
      borderColor = colors.primaryBlack;
      contentColor = colors.primaryBlack;
    }

    if (isHovered) {
      bgColor = isDark ? colors.primaryOrange : colors.primaryBlue;
      contentColor = isDark ? colors.primaryBlack : colors.primaryWhite;
      borderColor = bgColor;
    }

    return { bgColor, borderColor, contentColor };
  }, [isHovered, isDark, isHighContrast, colors]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.categoryCard,
        {
          backgroundColor: colorProps.bgColor,
          borderColor: colorProps.borderColor,
          transform: [{ scale: pressed || isHovered ? 1.03 : 1 }],
        },
        isHighContrast && { borderWidth: 3 },
      ]}
      onPress={() => onPress(category)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      accessibilityRole="button">
      <FontAwesome5
        name={iconName}
        size={48}
        color={colorProps.contentColor}
        style={{ marginBottom: 16 }}
      />
      <Text
        style={[styles.categoryTitle, { color: colorProps.contentColor }]}
        numberOfLines={2}>
        {category.title}
      </Text>
    </Pressable>
  );
}

function CategoryList() {
  const [isLoading, setIsLoading] = useState(true);
  const { categories, fetchCategories } = useCategoryStore();
  const hasFetchedRef = useRef(false);
  const navigation = useNavigation();
  const colors = useColors();
  const styles = createStyles(colors);

  const { width } = useWindowDimensions();

  // Ajuste de colunas para telas full-screen
  let numColumns = 2;
  if (width > 1600)
    numColumns = 5; // Telas ultra-wide
  else if (width > 1200) numColumns = 4;
  else if (width > 768) numColumns = 3;

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories().finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [fetchCategories, categories.length]);

  const handleCategoryPress = (category: Category) => {
    // @ts-ignore
    navigation.navigate('SubCategoryScreen', {
      categoryId: category.id,
      categoryTitle: category.title,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryOrange} />
      </View>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhuma categoria disponível</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        key={numColumns}
        contentContainerStyle={styles.listContainer}
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS !== 'web'}
        renderItem={({ item }) => (
          // Padding de 12px para dar espaçamento entre os cards
          <View style={{ flex: 1 / numColumns, padding: 12 }}>
            <CategoryCard category={item} onPress={handleCategoryPress} />
          </View>
        )}
        numColumns={numColumns}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

export default CategoryList;
