import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCategoryStore } from '@stores/Category/Category';
import { Category } from '@stores/Category/types';
import { useColors } from '@theme/ThemeProvider';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import { getCategoryGradient, getCategoryIconName } from '@lib/categoryVisuals';
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

interface CategoryCardProps {
  category: Category;
  onPress: (category: Category) => void;
  /** Versao menor (celular): icone, titulo e cantos reduzidos. */
  compact?: boolean;
}

/**
 * Card de categoria usado em todos os tamanhos de tela: imagem com legenda
 * sobre gradiente, ou gradiente colorido + icone quando nao ha imagem.
 */
function CategoryCard({
  category,
  onPress,
  compact = false,
}: CategoryCardProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const [isHovered, setIsHovered] = useState(false);
  const [imageFailed, setImageFailed] = useState(!category.imageUrl);
  const iconName = getCategoryIconName(category.id);
  const gradient = getCategoryGradient(category.id);

  const label = (
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.8)']}
      style={[styles.cardGradient, compact && styles.cardGradientCompact]}>
      <Text
        style={[styles.cardTitle, compact && styles.cardTitleCompact]}
        numberOfLines={2}>
        {category.title}
      </Text>
    </LinearGradient>
  );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        isHovered && styles.cardHovered,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress(category)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      accessibilityRole="button"
      accessibilityLabel={`Categoria ${category.title}`}>
      {imageFailed ? (
        <LinearGradient colors={gradient} style={styles.cardImage}>
          <View style={[styles.cardIcon, compact && styles.cardIconCompact]}>
            <FontAwesome5
              name={iconName}
              size={compact ? 20 : 28}
              color="#FFFFFF"
              solid
            />
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
  // equilibradas), evitando cards pequenos com o titulo sobre o icone. No
  // celular, 2 colunas com o mesmo card em versao compacta.
  const columns =
    !isCompact && contentWidth >= WIDE_GRID_MIN_WIDTH
      ? Math.min(6, categories.length)
      : isCompact
        ? 2
        : 3;
  const gap = isCompact ? 12 : GAP;

  return (
    <View style={[styles.grid, { marginHorizontal: -gap / 2, rowGap: gap }]}>
      {categories.map((item) => (
        <View
          key={item.id}
          style={{ width: `${100 / columns}%`, paddingHorizontal: gap / 2 }}>
          <CategoryCard
            category={item}
            onPress={handleCategoryPress}
            compact={isCompact}
          />
        </View>
      ))}
    </View>
  );
}

export default CategorySlider;
