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

interface CategoryCardProps {
  category: Category;
  onPress: (category: Category) => void;
  /** Versao menor (celular): icone, titulo e cantos reduzidos. */
  compact?: boolean;
}

/**
 * Card de categoria usado em todos os tamanhos de tela: imagem com legenda
 * sobre faixa escura, ou, quando nao ha imagem, card do tema com o icone da
 * categoria (mesmas cores em todas as categorias).
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
  const [imageFailed, setImageFailed] = useState(!category.imageUrl);
  const isDark = theme === ThemeMode.DARK;
  const isHighContrast = theme === ThemeMode.LIGHT_HI_CONTRAST;

  // Cores do card sem imagem: sempre vindas do tema.
  const cardBackground = isHovered
    ? isDark
      ? colors.primaryOrange
      : colors.primaryBlue
    : isDark
      ? colors.backgroundElevated
      : colors.cardBackground;
  const titleColor = isHovered
    ? isDark
      ? colors.textOnAccent
      : colors.primaryWhite
    : colors.primaryBlack;
  const iconColor = isHighContrast ? colors.primaryBlack : colors.primaryOrange;
  const iconBackground = isHovered
    ? colors.primaryWhite
    : colors.pageBackground;

  const imageLabel = (
    <LinearGradient
      colors={['transparent', colors.overlay]}
      style={[styles.cardGradient, compact && styles.cardGradientCompact]}>
      <Text
        style={[
          styles.cardTitle,
          styles.cardTitleOnImage,
          compact && styles.cardTitleCompact,
        ]}
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
        imageFailed
          ? [styles.cardPlain, compact && styles.cardPlainCompact]
          : [styles.cardMedia, compact && styles.cardMediaCompact],
        imageFailed && {
          backgroundColor: cardBackground,
          borderColor: isHovered ? cardBackground : colors.borderColor,
          borderWidth: isHighContrast ? 3 : 1,
        },
        isHovered && styles.cardHovered,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress(category)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      accessibilityRole="button"
      accessibilityLabel={`Categoria ${category.title}`}>
      {imageFailed ? (
        <View
          style={[styles.plainContent, compact && styles.plainContentCompact]}>
          <View
            style={[
              styles.plainIcon,
              compact && styles.plainIconCompact,
              { backgroundColor: iconBackground },
            ]}>
            <FontAwesome5
              name={category.iconName}
              size={compact ? 16 : 22}
              color={iconColor}
              solid
            />
          </View>
          <Text
            style={[
              styles.cardTitle,
              compact && styles.cardTitleCompact,
              { color: titleColor },
            ]}
            numberOfLines={2}>
            {category.title}
          </Text>
        </View>
      ) : (
        <ImageBackground
          source={{ uri: category.imageUrl }}
          style={styles.cardImage}
          onError={() => setImageFailed(true)}
          accessibilityIgnoresInvertColors>
          {imageLabel}
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
