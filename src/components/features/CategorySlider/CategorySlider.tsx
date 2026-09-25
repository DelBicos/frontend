import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCategoryStore } from '@stores/Category/Category';
import { Category } from '@stores/Category/types';
import { ThemeMode, useThemeStore } from '@stores/Theme';
import { useColors } from '@theme/ThemeProvider';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  Text,
  View,
} from 'react-native';
import { createStyles } from './styles';

// Icones por categoria ate que venham do backend.
const CATEGORY_ICONS: Record<number, string> = {
  1: 'heartbeat',
  2: 'cut',
  3: 'tools',
  4: 'lightbulb',
  5: 'home',
  6: 'paw',
};

// Cores de fundo quando a imagem nao existe ou falha ao carregar.
const FALLBACK_GRADIENTS: [string, string][] = [
  ['#005A93', '#0B7FC4'],
  ['#C75B00', '#FC8200'],
  ['#1F6F54', '#2E9E74'],
  ['#5B3A99', '#7F5AC8'],
  ['#8A2E4B', '#C0476B'],
  ['#34495E', '#52708D'],
];

function getCategoryIconName(id: number) {
  return CATEGORY_ICONS[id] || 'shapes';
}

interface CategoryCardProps {
  category: Category;
  onPress: (category: Category) => void;
}

/** Card com imagem (tablet/desktop), com fallback de gradiente + icone. */
function CategoryImageCard({ category, onPress }: CategoryCardProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const [isHovered, setIsHovered] = useState(false);
  const [imageFailed, setImageFailed] = useState(!category.imageUrl);
  const iconName = getCategoryIconName(category.id);
  const gradient =
    FALLBACK_GRADIENTS[(category.id - 1) % FALLBACK_GRADIENTS.length];

  const label = (
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.8)']}
      style={styles.cardGradient}>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {category.title}
      </Text>
    </LinearGradient>
  );

  return (
    <Pressable
      style={[styles.card, isHovered && styles.cardHovered]}
      onPress={() => onPress(category)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      accessibilityRole="button"
      accessibilityLabel={`Categoria ${category.title}`}>
      {imageFailed ? (
        <LinearGradient colors={gradient} style={styles.cardImage}>
          <View style={styles.cardIcon}>
            <FontAwesome5 name={iconName} size={28} color="#FFFFFF" solid />
          </View>
          {label}
        </LinearGradient>
      ) : (
        <ImageBackground
          source={{ uri: category.imageUrl }}
          style={styles.cardImage}
          onError={() => setImageFailed(true)}
          accessibilityIgnoresInvertColors>
          {label}
        </ImageBackground>
      )}
    </Pressable>
  );
}

/** Bolha com icone (celular). */
function CategoryBubble({ category, onPress }: CategoryCardProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const { theme } = useThemeStore();
  const isDark = theme === ThemeMode.DARK;

  return (
    <Pressable
      style={({ pressed }) => [styles.bubbleCard, pressed && { opacity: 0.7 }]}
      onPress={() => onPress(category)}
      accessibilityRole="button"
      accessibilityLabel={`Categoria ${category.title}`}>
      <View
        style={[
          styles.bubble,
          { backgroundColor: isDark ? '#2C2C2C' : colors.primaryOrange + '1A' },
        ]}>
        <FontAwesome5
          name={getCategoryIconName(category.id)}
          size={26}
          color={isDark ? colors.primaryBlack : colors.primaryOrange}
          solid
        />
      </View>
      <Text style={styles.bubbleTitle} numberOfLines={2}>
        {category.title}
      </Text>
    </Pressable>
  );
}

const GAP = 16;
/** Largura de conteudo a partir da qual cabem 6 cards lado a lado. */
const WIDE_GRID_MIN_WIDTH = 1100;

function CategorySlider() {
  const [isLoading, setIsLoading] = useState(true);
  const { categories, fetchCategories } = useCategoryStore();
  const navigation = useNavigation();
  const colors = useColors();
  const styles = createStyles(colors);
  const { isCompact, contentWidth } = useBreakpoint();

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories().finally(() => setIsLoading(false));
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
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>Nenhuma categoria disponível</Text>
      </View>
    );
  }

  // Colunas por tamanho de tela. Larguras percentuais (e nao em pixels) para
  // a grade se ajustar sozinha a barra de rolagem e a qualquer container.
  // 6 colunas so quando cada card tem ao menos ~170px; senao 3 (duas linhas
  // equilibradas), evitando cards pequenos com o titulo sobre o icone.
  const columns =
    !isCompact && contentWidth >= WIDE_GRID_MIN_WIDTH
      ? Math.min(6, categories.length)
      : 3;
  const gap = isCompact ? 8 : GAP;
  const Card = isCompact ? CategoryBubble : CategoryImageCard;

  return (
    <View
      style={[
        styles.grid,
        { marginHorizontal: -gap / 2, rowGap: isCompact ? 20 : GAP },
      ]}>
      {categories.map((item) => (
        <View
          key={item.id}
          style={{ width: `${100 / columns}%`, paddingHorizontal: gap / 2 }}>
          <Card category={item} onPress={handleCategoryPress} />
        </View>
      ))}
    </View>
  );
}

export default CategorySlider;
