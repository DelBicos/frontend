import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCategoryStore } from '@stores/Category/Category';
import { Category } from '@stores/Category/types';
import { ThemeMode, useThemeStore } from '@stores/Theme';
import { useColors } from '@theme/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { createStyles } from './styles';

// Mantemos os ícones mapeados por enquanto, até que decida trazê-los do banco também!
const CATEGORY_ICONS: Record<number, string> = {
  1: 'heartbeat',
  2: 'cut',
  3: 'tools',
  4: 'lightbulb',
  5: 'home',
  6: 'paw',
};

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop';

function getCategoryIconName(id: number) {
  return CATEGORY_ICONS[id] || 'shapes';
}

interface CategoryCardProps {
  category: Category;
  onPress: (category: Category) => void;
  isWebLayout: boolean;
}

function CategoryCard({ category, onPress, isWebLayout }: CategoryCardProps) {
  const iconName = getCategoryIconName(category.id);

  // Consome diretamente a propriedade vinda do backend, caindo no placeholder se necessário
  const imageUrl = category.imageUrl || PLACEHOLDER_IMAGE;

  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useThemeStore();
  const colors = useColors();
  const styles = createStyles(colors);
  const isDark = theme === ThemeMode.DARK;

  // --- RENDERING WEB IMAGE CARD ---
  if (isWebLayout) {
    return (
      <Pressable
        style={[styles.webCard, isHovered && styles.webCardHovered]}
        onPress={() => onPress(category)}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        accessibilityRole="button">
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.webCardImage}
          imageStyle={{ borderRadius: 16 }}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.webCardGradient}>
            <Text style={styles.webCardTitle} numberOfLines={1}>
              {category.title}
            </Text>
          </LinearGradient>
        </ImageBackground>
      </Pressable>
    );
  }

  // --- RENDERING MOBILE BUBBLE ---
  const bubbleBgColor = isDark ? '#2C2C2C' : colors.primaryOrange + '15';

  return (
    <Pressable
      style={styles.bubbleCard}
      onPress={() => onPress(category)}
      accessibilityRole="button">
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isHovered
              ? colors.primaryOrange + '30'
              : bubbleBgColor,
          },
        ]}>
        <FontAwesome5
          name={iconName}
          size={26}
          color={isDark ? colors.primaryBlack : colors.primaryOrange}
          solid
        />
      </View>
      <Text
        style={[
          styles.bubbleTitle,
          { color: isDark ? colors.primaryBlack : colors.primaryBlack },
        ]}
        numberOfLines={2}>
        {category.title}
      </Text>
    </Pressable>
  );
}

function CategorySlider() {
  const [isLoading, setIsLoading] = useState(true);
  const { categories, fetchCategories } = useCategoryStore();
  const navigation = useNavigation();
  const colors = useColors();
  const styles = createStyles(colors);
  const { width } = useWindowDimensions();

  const isWebLayout = Platform.OS === 'web' && width > 768;

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

  const ITEM_WIDTH = isWebLayout ? 236 : 96;
  const contentWidth = categories?.length ? categories.length * ITEM_WIDTH : 0;
  const shouldCenter = contentWidth < width && contentWidth > 0;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>Nenhuma categoria disponível</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sliderWrapper}>
        {isWebLayout ? (
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            windowSize={5}
            renderItem={({ item }) => (
              <CategoryCard
                category={item}
                onPress={handleCategoryPress}
                isWebLayout={isWebLayout}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              { justifyContent: shouldCenter ? 'center' : 'flex-start' },
            ]}
          />
        ) : (
          <View style={styles.gridContainer}>
            {categories.map((item) => (
              <CategoryCard
                key={item.id.toString()}
                category={item}
                onPress={handleCategoryPress}
                isWebLayout={isWebLayout}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export default CategorySlider;
