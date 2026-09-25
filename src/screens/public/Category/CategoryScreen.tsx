import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '@theme/ThemeProvider';
import { useCategoryStore } from '@stores/Category/Category';
import { Category } from '@stores/Category/types';
import { SubCategory } from '@stores/SubCategory/types';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import {
  loadAllSubCategories,
  normalizeSearchText,
} from '@lib/hooks/useServiceSearch';
import { getCategoryGradient, getCategoryIconName } from '@lib/categoryVisuals';
import { getIconForSubCategory } from '@utils/icons';
import PageContainer, { PageHeader } from '@components/layout/PageContainer';
import SearchField from '@components/ui/SearchField';
import Chip, { ChipGroup } from '@components/ui/Chip';
import { createStyles } from './styles';

type Status = 'loading' | 'ready' | 'error';

/**
 * Explorar servicos: busca instantanea (sem acento) em todos os servicos,
 * filtro por categoria e a lista de servicos de cada categoria. Tocar em um
 * servico abre a escolha de data com ele ja selecionado.
 */
function CategoryScreen() {
  const colors = useColors();
  const navigation = useNavigation();
  const { isCompact, isExpanded } = useBreakpoint();
  const styles = useMemo(
    () => createStyles(colors, isCompact),
    [colors, isCompact],
  );
  const { categories, fetchCategories } = useCategoryStore();

  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const load = useCallback(() => {
    setStatus('loading');
    Promise.all([
      categories.length ? Promise.resolve() : fetchCategories(),
      loadAllSubCategories(),
    ])
      .then(([, subs]) => {
        setSubCategories(subs);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCategories]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = isExpanded ? 4 : isCompact ? 2 : 3;
  const term = normalizeSearchText(query);

  const byCategory = useMemo(() => {
    const map = new Map<number, SubCategory[]>();
    subCategories
      .slice()
      .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
      .forEach((sub) => {
        const list = map.get(sub.category_id) ?? [];
        list.push(sub);
        map.set(sub.category_id, list);
      });
    return map;
  }, [subCategories]);

  // Busca pelo nome do servico ou da categoria ("beleza" traz a categoria toda).
  const results = useMemo(() => {
    if (!term) return [];
    const matchingCategories = new Set(
      categories
        .filter((c) => normalizeSearchText(c.title).includes(term))
        .map((c) => c.id),
    );
    return subCategories
      .filter(
        (sub) =>
          normalizeSearchText(sub.title).includes(term) ||
          matchingCategories.has(sub.category_id),
      )
      .filter(
        (sub) =>
          selectedCategory == null || sub.category_id === selectedCategory,
      )
      .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  }, [term, categories, subCategories, selectedCategory]);

  const visibleCategories = categories.filter(
    (c) =>
      (selectedCategory == null || c.id === selectedCategory) &&
      (byCategory.get(c.id)?.length ?? 0) > 0,
  );

  const categoryTitle = (id: number) =>
    categories.find((c) => c.id === id)?.title ?? 'Serviços';

  const openService = (sub: SubCategory) => {
    // @ts-ignore
    navigation.navigate('SubCategoryScreen', {
      categoryId: sub.category_id,
      categoryTitle: categoryTitle(sub.category_id),
      serviceId: sub.id,
    });
  };

  const openCategory = (category: Category) => {
    // @ts-ignore
    navigation.navigate('SubCategoryScreen', {
      categoryId: category.id,
      categoryTitle: category.title,
    });
  };

  const openSmartSearch = () => {
    const text = query.trim();
    if (!text) return;
    // @ts-ignore
    navigation.navigate('SearchResult', { query: text });
  };

  const renderGrid = (items: SubCategory[], showCategory: boolean) => (
    <View style={styles.grid}>
      {items.map((sub) => (
        <View
          key={sub.id}
          style={[styles.gridCell, { width: `${100 / columns}%` }]}>
          <ServiceTile
            sub={sub}
            subtitle={showCategory ? categoryTitle(sub.category_id) : undefined}
            onPress={() => openService(sub)}
            styles={styles}
          />
        </View>
      ))}
    </View>
  );

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Explorar"
        title="Encontre o serviço certo"
        subtitle={
          subCategories.length
            ? `${subCategories.length} serviços em ${categories.length} categorias. Escolha um para ver datas e profissionais perto de você.`
            : 'Escolha um serviço para ver datas e profissionais perto de você.'
        }>
        <SearchField
          value={query}
          onChangeText={setQuery}
          onSubmit={results.length === 0 ? openSmartSearch : undefined}
          placeholder="Ex.: eletricista, manicure, faxina"
          accessibilityLabel="Buscar serviço"
        />
      </PageHeader>

      {status === 'loading' && (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={colors.primaryOrange} />
        </View>
      )}

      {status === 'error' && (
        <View style={styles.state}>
          <Text style={styles.stateText}>
            Não foi possível carregar os serviços.
          </Text>
          <Pressable
            onPress={load}
            style={styles.primaryButton}
            accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Tentar novamente</Text>
          </Pressable>
        </View>
      )}

      {status === 'ready' && (
        <>
          <ChipGroup
            accessibilityLabel="Filtrar por categoria"
            style={styles.chipsGroup}>
            <Chip
              label="Todas"
              selected={selectedCategory == null}
              onPress={() => setSelectedCategory(null)}
            />
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={category.title}
                selected={selectedCategory === category.id}
                onPress={() =>
                  setSelectedCategory((current) =>
                    current === category.id ? null : category.id,
                  )
                }
              />
            ))}
          </ChipGroup>

          {term ? (
            <View>
              <Text style={styles.resultCount} accessibilityLiveRegion="polite">
                {results.length === 0
                  ? `Nenhum serviço encontrado para “${query.trim()}”`
                  : `${results.length} ${results.length === 1 ? 'serviço encontrado' : 'serviços encontrados'}`}
              </Text>
              {results.length > 0 && renderGrid(results, true)}
            </View>
          ) : (
            visibleCategories.map((category) => {
              const items = byCategory.get(category.id) ?? [];
              return (
                <View key={category.id} style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <LinearGradient
                      colors={getCategoryGradient(category.id)}
                      style={styles.sectionBadge}>
                      <FontAwesome5
                        name={getCategoryIconName(category.id)}
                        size={20}
                        color="#FFFFFF"
                        solid
                      />
                    </LinearGradient>
                    <View style={styles.sectionTexts}>
                      <Text
                        style={styles.sectionTitle}
                        accessibilityRole="header"
                        {...({ 'aria-level': 2 } as object)}>
                        {category.title}
                      </Text>
                      <Text style={styles.sectionCount}>
                        {items.length} serviços
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => openCategory(category)}
                      style={styles.sectionAction}
                      accessibilityRole="link"
                      accessibilityLabel={`Agendar em ${category.title}`}>
                      <Text style={styles.sectionActionText}>
                        {isCompact ? 'Agendar' : 'Agendar nesta categoria'}
                      </Text>
                      <FontAwesome
                        name="angle-right"
                        size={16}
                        color={colors.primaryBlack}
                      />
                    </Pressable>
                  </View>
                  {renderGrid(items, false)}
                </View>
              );
            })
          )}

          <View style={styles.helpCard}>
            <View style={styles.helpIcon}>
              <FontAwesome name="comments-o" size={22} color={'#000000'} />
            </View>
            <View style={styles.helpTexts}>
              <Text style={styles.helpTitle}>
                Não sabe qual serviço escolher?
              </Text>
              <Text style={styles.helpText}>
                Descreva o problema no campo de busca, como “vazamento na pia”
                ou “festa infantil”, e use a busca inteligente para receber
                sugestões de profissionais.
              </Text>
            </View>
            {query.trim() ? (
              <Pressable
                onPress={openSmartSearch}
                style={[styles.primaryButton, isCompact && styles.fullWidth]}
                accessibilityRole="button">
                <Text style={styles.primaryButtonText} numberOfLines={1}>
                  {`Busca inteligente: “${query.trim()}”`}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </>
      )}
    </PageContainer>
  );
}

interface ServiceTileProps {
  sub: SubCategory;
  subtitle?: string;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
}

function ServiceTile({ sub, subtitle, onPress, styles }: ServiceTileProps) {
  const colors = useColors();
  const { isCompact: compact } = useBreakpoint();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        styles.tile,
        (hovered || pressed) && styles.tileActive,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${sub.title}${subtitle ? `, ${subtitle}` : ''}. Escolher data`}>
      <View style={styles.tileIcon}>
        <FontAwesome5
          name={getIconForSubCategory(sub.title)}
          size={16}
          color={colors.primaryBlack}
        />
      </View>
      <View style={styles.tileTexts}>
        <Text style={styles.tileTitle} numberOfLines={2}>
          {sub.title}
        </Text>
        {subtitle ? (
          <Text style={styles.tileSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {Platform.OS === 'web' && !compact && (
        <FontAwesome
          name="angle-right"
          size={16}
          color={colors.textSecondary}
        />
      )}
    </Pressable>
  );
}

export default CategoryScreen;
