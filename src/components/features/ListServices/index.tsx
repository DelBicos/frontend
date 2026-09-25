import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { createStyles } from './styles';
import { useColors } from '@theme/ThemeProvider';
import useServicesStore from '@stores/Services/Services';
import ServiceCard from './ServiceCard';
import { isServiceAvailableNow } from '@lib/utils/availability';
import { useCategoryStore } from '@stores/Category';
import { useSubCategoryStore } from '@stores/SubCategory';
import { useIsFocused } from '@react-navigation/native';
import { initSSE } from '@lib/sse';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';

const POLLING_INTERVAL_MS = 15000;
/** Quantos cards aparecem antes do "Mostrar mais" (tablet/desktop). */
const INITIAL_VISIBLE_ROWS = 2;
const GRID_GAP = 16;

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
  tone?: 'primary' | 'secondary';
}

function Chip({ label, selected, onPress, icon, tone = 'primary' }: ChipProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const selectedStyle =
    tone === 'primary' ? styles.chipSelected : styles.chipSecondarySelected;
  const selectedText =
    tone === 'primary'
      ? styles.chipTextSelected
      : styles.chipTextSecondarySelected;
  const textColor = selected
    ? (selectedText.color as string)
    : colors.primaryBlack;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && selectedStyle,
        pressed && { opacity: 0.75 },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}>
      {icon ? <FontAwesome name={icon} size={14} color={textColor} /> : null}
      <Text style={[styles.chipText, selected && selectedText]}>{label}</Text>
    </Pressable>
  );
}

const ListServices: React.FC = () => {
  const colors = useColors();
  const styles = createStyles(colors);
  const { isCompact, isExpanded, contentWidth } = useBreakpoint();

  const { services, loading, fetchServices } = useServicesStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { subCategories, fetchSubCategoriesByCategoryId } =
    useSubCategoryStore();

  const [onlyToday, setOnlyToday] = useState(false);
  const [onlyNow, setOnlyNow] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(
    null,
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (selectedCategory) fetchSubCategoriesByCategoryId(selectedCategory);
  }, [selectedCategory, fetchSubCategoriesByCategoryId]);

  const loadServices = useCallback(() => {
    const day = onlyToday || onlyNow ? new Date().getDay() : undefined;
    fetchServices({
      ...(day !== undefined ? { day } : {}),
      ...(selectedSubCategory
        ? { subcategory_id: selectedSubCategory }
        : selectedCategory
          ? { category_id: selectedCategory }
          : {}),
    });
  }, [
    onlyToday,
    onlyNow,
    selectedCategory,
    selectedSubCategory,
    fetchServices,
  ]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Atualizacao periodica enquanto a tela esta em foco.
  const isFocused = useIsFocused();
  useEffect(() => {
    if (!isFocused) return;
    const id = setInterval(loadServices, POLLING_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isFocused, loadServices]);

  // SSE: novos servicos criados disparam atualizacao.
  useEffect(() => {
    const es = initSSE();
    if (!es) return;
    const handler = () => loadServices();
    es.addEventListener('new_service', handler as any);
    return () => {
      try {
        es.removeEventListener('new_service', handler as any);
      } catch {
        // ignore
      }
    };
  }, [loadServices]);

  // Ao mudar filtros, volta a mostrar so as primeiras linhas.
  useEffect(() => {
    setExpanded(false);
  }, [selectedCategory, selectedSubCategory, onlyToday, onlyNow]);

  const handleSelectCategory = (id: number | null) => {
    setSelectedCategory(selectedCategory === id ? null : id);
    setSelectedSubCategory(null);
  };

  const displayed = useMemo(() => {
    const withAvailability = (services || []).filter(
      (s) => s.availabilities && s.availabilities.length > 0,
    );
    return onlyNow
      ? withAvailability.filter((s) => isServiceAvailableNow(s))
      : withAvailability;
  }, [services, onlyNow]);

  const subCategoriesForSelected = selectedCategory
    ? subCategories.filter((s) => s.category_id === selectedCategory)
    : [];

  const columns = isCompact ? 1 : isExpanded ? 3 : 2;
  // Carrossel no celular (largura fixa por card); grade percentual nas
  // telas maiores, que se ajusta sozinha a barra de rolagem.
  const tileWidth = Math.min(300, Math.round(contentWidth * 0.82));
  const visibleLimit = columns * INITIAL_VISIBLE_ROWS;
  const visible =
    isCompact || expanded ? displayed : displayed.slice(0, visibleLimit);
  const hiddenCount = displayed.length - visible.length;

  // So mostra o indicador na primeira carga: as atualizacoes periodicas
  // mantem a lista na tela (antes ela sumia a cada 15 s).
  const showSpinner = loading && displayed.length === 0;

  const renderResults = () => {
    if (showSpinner) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryOrange} />
        </View>
      );
    }
    if (displayed.length === 0) {
      const hasFilters = selectedCategory || onlyToday || onlyNow;
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {hasFilters
              ? 'Nenhum serviço encontrado com esses filtros.'
              : 'Nenhum serviço disponível no momento.'}
          </Text>
          {hasFilters ? (
            <Pressable
              style={styles.showMore}
              accessibilityRole="button"
              onPress={() => {
                setSelectedCategory(null);
                setSelectedSubCategory(null);
                setOnlyToday(false);
                setOnlyNow(false);
              }}>
              <Text style={styles.showMoreText}>Limpar filtros</Text>
            </Pressable>
          ) : null}
        </View>
      );
    }

    if (isCompact) {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={tileWidth + 12}
          snapToAlignment="start"
          contentContainerStyle={styles.carousel}
          accessibilityLabel="Serviços disponíveis">
          {visible.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              variant="tile"
              style={{ width: tileWidth }}
            />
          ))}
        </ScrollView>
      );
    }

    return (
      <>
        <View
          style={[
            styles.grid,
            { marginHorizontal: -GRID_GAP / 2, rowGap: GRID_GAP },
          ]}>
          {visible.map((service) => (
            <View
              key={service.id}
              style={{
                width: `${100 / columns}%`,
                paddingHorizontal: GRID_GAP / 2,
              }}>
              <ServiceCard
                service={service}
                variant="tile"
                style={styles.tileFill}
              />
            </View>
          ))}
        </View>
        {hiddenCount > 0 || expanded ? (
          <Pressable
            style={({ pressed }) => [
              styles.showMore,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => setExpanded((value) => !value)}
            accessibilityRole="button"
            accessibilityState={{ expanded }}>
            <Text style={styles.showMoreText}>
              {expanded
                ? 'Mostrar menos'
                : `Mostrar mais ${hiddenCount} ${hiddenCount === 1 ? 'serviço' : 'serviços'}`}
            </Text>
          </Pressable>
        ) : null}
      </>
    );
  };

  return (
    <View>
      <View style={styles.filterGroup}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          accessibilityLabel="Filtrar por categoria">
          <Chip
            label="Todas"
            selected={selectedCategory === null}
            onPress={() => handleSelectCategory(null)}
          />
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.title}
              selected={selectedCategory === cat.id}
              onPress={() => handleSelectCategory(cat.id)}
            />
          ))}
        </ScrollView>

        {selectedCategory && subCategoriesForSelected.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
            accessibilityLabel="Filtrar por subcategoria">
            {subCategoriesForSelected.map((sub) => (
              <Chip
                key={sub.id}
                label={sub.title}
                tone="secondary"
                selected={selectedSubCategory === sub.id}
                onPress={() =>
                  setSelectedSubCategory(
                    selectedSubCategory === sub.id ? null : sub.id,
                  )
                }
              />
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.toggleRow}>
          <Chip
            label="Disponível hoje"
            icon="calendar-check-o"
            tone="secondary"
            selected={onlyToday}
            onPress={() => setOnlyToday((value) => !value)}
          />
          <Chip
            label="Disponível agora"
            icon="clock-o"
            tone="secondary"
            selected={onlyNow}
            onPress={() => setOnlyNow((value) => !value)}
          />
        </View>
      </View>

      {renderResults()}
    </View>
  );
};

export default ListServices;
