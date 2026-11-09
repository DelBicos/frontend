import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCategoryStore } from '@stores/Category/Category';
import { Category } from '@stores/Category/types';
import { ThemeMode, useThemeStore } from '@stores/Theme';
import { useColors } from '@theme/ThemeProvider';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { createStyles } from './styles';

interface CategoryCardProps {
  category: Category;
  onPress: (category: Category) => void;
  /** Versao menor (celular): icone, titulo e cantos reduzidos. */
  compact?: boolean;
}

/**
 * Card de categoria, igual em todos os tamanhos de tela: fundo do card com
 * o icone e o titulo em laranja; ao passar o mouse, fundo azul e icone e
 * titulo brancos. Todas as cores vem do tema.
 */
function CategoryCard({
  category,
  onPress,
  compact = false,
}: CategoryCardProps) {
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);
  const styles = createStyles(colors);
  const [isHovered, setIsHovered] = useState(false);
  const isHighContrast = theme === ThemeMode.LIGHT_HI_CONTRAST;

  const contentColor = isHovered
    ? colors.textOnImage
    : isHighContrast
      ? colors.primaryBlack
      : colors.primaryOrange;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        {
          backgroundColor: isHovered
            ? colors.primaryBlue
            : colors.cardBackground,
          borderColor: isHovered ? colors.primaryBlue : colors.primaryBlack,
          borderWidth: isHighContrast ? 3 : 0,
        },
        isHovered && styles.cardHovered,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress(category)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      accessibilityRole="button"
      accessibilityLabel={`Categoria ${category.title}`}>
      <View style={[styles.iconBox, compact && styles.iconBoxCompact]}>
        <FontAwesome5
          name={category.iconName}
          size={compact ? 26 : 44}
          color={contentColor}
          solid
        />
      </View>
      <Text
        style={[
          styles.cardTitle,
          compact && styles.cardTitleCompact,
          { color: contentColor },
        ]}
        numberOfLines={3}>
        {category.title}
      </Text>
    </Pressable>
  );
}

const GAP = 24;
const GAP_COMPACT = 12;

function CategorySlider() {
  const [isLoading, setIsLoading] = useState(true);
  const { categories, fetchCategories } = useCategoryStore();
  const navigation = useNavigation();
  const colors = useColors();
  const styles = createStyles(colors);
  const { isCompact } = useBreakpoint();

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

  // 3 colunas no tablet e no web, 2 no celular. Larguras percentuais (e nao
  // em pixels) para a grade se ajustar sozinha a barra de rolagem e a
  // qualquer container.
  const columns = isCompact ? 2 : 3;
  const gap = isCompact ? GAP_COMPACT : GAP;

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
