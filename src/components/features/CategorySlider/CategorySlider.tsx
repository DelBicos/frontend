import { useNavigation } from '@react-navigation/native';
import { useCategoryStore } from '@stores/Category/Category';
import { Category } from '@stores/Category/types';
import { ThemeMode, useThemeStore } from '@stores/Theme';
import { useColors } from '@theme/ThemeProvider';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { getCategorySvg } from './categorySvgs';
import { createStyles } from './styles';

interface CategoryCardProps {
  category: Category;
  onPress: (category: Category) => void;
  /** Versao menor (celular): icone, titulo e cantos reduzidos. */
  compact?: boolean;
}

/**
 * Card de categoria: SVG + titulo; fundo branco e laranja no repouso; hover
 * azul (claro) ou laranja (escuro) com icone e titulo brancos.
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
  const isDark = theme === ThemeMode.DARK;
  const isHighContrast = theme === ThemeMode.LIGHT_HI_CONTRAST;

  const svg = getCategorySvg(category.id);
  const scale = compact ? 0.45 : 0.7;

  const cardColors = useMemo(() => {
    let backgroundColor = colors.cardBackground;
    let borderColor = colors.borderColor;
    let contentColor = colors.primaryOrange;

    if (isHighContrast) {
      contentColor = colors.primaryBlack;
    }

    if (isHovered) {
      if (isHighContrast) {
        backgroundColor = colors.primaryBlue;
        contentColor = colors.textOnImage;
        borderColor = colors.primaryBlue;
      } else if (isDark) {
        backgroundColor = colors.primaryOrange;
        contentColor = colors.textOnImage;
        borderColor = colors.primaryOrange;
      } else {
        backgroundColor = colors.primaryBlue;
        contentColor = colors.textOnImage;
        borderColor = colors.primaryBlue;
      }
    }

    return { backgroundColor, borderColor, contentColor };
  }, [isHovered, isDark, isHighContrast, colors]);

  const borderWidth = isHighContrast ? 3 : 1;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        {
          backgroundColor: cardColors.backgroundColor,
          borderColor: cardColors.borderColor,
          borderWidth,
        },
        (isHovered || pressed) && styles.cardActive,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress(category)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      accessibilityRole="button"
      accessibilityLabel={`Categoria ${category.title}`}>
      <View style={[styles.iconBox, compact && styles.iconBoxCompact]}>
        <svg.IconComponent
          width={svg.width * scale}
          height={svg.height * scale}
          color={cardColors.contentColor}
        />
      </View>
      <Text
        style={[
          styles.cardTitle,
          compact && styles.cardTitleCompact,
          { color: cardColors.contentColor },
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
