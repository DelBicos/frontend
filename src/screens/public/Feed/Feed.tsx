import React, { useEffect, useMemo, useState } from 'react';
import { Text, View, Pressable, Platform, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { createStyles } from './styles';
import { useColors } from '@theme/ThemeProvider';
import { useThemeStore, ThemeMode } from '@stores/Theme';
import CategorySlider from '@components/features/CategorySlider';
import ListProfessionals from '@components/features/ListProfessionals';
import ListServices from '@components/features/ListServices';
import { HighlightItem } from '@components/ui/HighlightCard';
import { useServiceSearch } from '@lib/hooks/useServiceSearch';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import { useLocation } from '@lib/hooks/LocationContext';
import { useCategoryStore } from '@stores/Category';
import { SubCategory } from '@stores/SubCategory/types';
import { getIconForSubCategory } from '@utils/icons';
import { HeroCarousel } from './components/HeroCarousel';
import { SectionHeader } from './components/SectionHeader';

/** Destaques da pagina inicial; cada um leva a uma categoria. */
const HIGHLIGHTS: (Omit<HighlightItem, 'link'> & { categoryTitle: string })[] =
  [
    {
      id: '1',
      title: 'Reformas de Fim de Ano',
      description: 'Pintores e eletricistas com agenda aberta.',
      image:
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1600&h=900&auto=format&fit=crop',
      ctaLabel: 'Ver reformas',
      categoryTitle: 'Reformas & Reparos',
    },
    {
      id: '2',
      title: 'Prepare-se para o Verão',
      description: 'Instalação de piscina e ar-condicionado.',
      image:
        'https://images.unsplash.com/photo-1574610758891-5b809b6e6e2e?q=80&w=1600&h=900&auto=format&fit=crop',
      ctaLabel: 'Ver serviços gerais',
      categoryTitle: 'Serviços Gerais',
    },
    {
      id: '3',
      title: 'Beleza & Estética',
      description: 'Manicures e cabeleireiros para as festas.',
      image:
        'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1600&h=900&auto=format&fit=crop',
      ctaLabel: 'Ver beleza',
      categoryTitle: 'Beleza & Estética',
    },
    {
      id: '4',
      title: 'Cuidados Pet',
      description: 'Dog walkers e pet sitters perto de você.',
      image:
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1600&h=900&auto=format&fit=crop',
      ctaLabel: 'Ver serviços pet',
      categoryTitle: 'Pet',
    },
  ];

const FeedScreen: React.FC = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const colors = useColors();
  const { theme } = useThemeStore();
  const isHighContrast = theme === ThemeMode.LIGHT_HI_CONTRAST;
  const { isCompact, isExpanded } = useBreakpoint();
  const styles = createStyles(colors, { isHighContrast, isCompact });

  const { results, search: fetchSearch } = useServiceSearch();
  const { categories } = useCategoryStore();
  const { city } = useLocation();

  useEffect(() => {
    fetchSearch(search);
    setShowDropdown(search.trim().length > 0);
  }, [search, fetchSearch]);

  const highlights: HighlightItem[] = useMemo(
    () =>
      HIGHLIGHTS.map(({ categoryTitle, ...item }) => ({
        ...item,
        link: () => {
          const category = categories.find((c) => c.title === categoryTitle);
          if (category) {
            // @ts-ignore
            navigation.navigate('SubCategoryScreen', {
              categoryId: category.id,
              categoryTitle: category.title,
            });
          } else {
            // @ts-ignore
            navigation.navigate('Category');
          }
        },
      })),
    [categories, navigation],
  );

  const heroHeight = isExpanded ? 380 : isCompact ? 240 : 300;

  const handleSearchSubmit = () => {
    if (search.trim()) {
      setShowDropdown(false);
      // @ts-ignore
      navigation.navigate('SearchResult', { query: search.trim() });
    }
  };

  const handleSelectService = (item: SubCategory) => {
    setShowDropdown(false);
    setSearch('');
    const category = categories.find((c) => c.id === item.category_id);
    // @ts-ignore
    navigation.navigate('SubCategoryScreen', {
      categoryId: item.category_id,
      categoryTitle: category ? category.title : 'Serviços',
      serviceId: item.id,
    });
  };

  const header = (
    <View style={styles.header}>
      {/* Titulo principal da pagina para leitores de tela (visualmente oculto). */}
      <Text
        style={styles.visuallyHidden}
        accessibilityRole="header"
        {...({ 'aria-level': 1 } as object)}>
        DelBicos: encontre profissionais de confiança perto de você
      </Text>
      {/* Busca (no web a busca fica no cabecalho do site) */}
      {Platform.OS !== 'web' && (
        <View style={[styles.searchSection, { zIndex: 100 }]}>
          <View style={styles.searchContainer}>
            <FontAwesome name="search" size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Busque por um serviço (ex: Chaveiro)"
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
              accessibilityLabel="Buscar serviço"
              onFocus={() => {
                if (search.trim().length > 0) setShowDropdown(true);
              }}
            />
            {search.length > 0 ? (
              <Pressable
                onPress={() => setSearch('')}
                style={styles.searchClear}
                accessibilityRole="button"
                accessibilityLabel="Limpar busca"
                hitSlop={8}>
                <FontAwesome
                  name="times-circle"
                  size={18}
                  color={colors.textSecondary}
                />
              </Pressable>
            ) : null}
          </View>

          {showDropdown && search.trim().length > 0 && (
            <View style={styles.dropdownContainer}>
              {results.length > 0 ? (
                results.map((item) => (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => handleSelectService(item)}
                    accessibilityRole="button">
                    <View style={styles.dropdownIcon}>
                      <FontAwesome5
                        name={getIconForSubCategory(item.title)}
                        size={16}
                        color={colors.primaryOrange}
                      />
                    </View>
                    <Text style={styles.dropdownName} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <FontAwesome
                      name="angle-right"
                      size={16}
                      color={colors.textSecondary}
                    />
                  </Pressable>
                ))
              ) : (
                <View style={styles.dropdownEmpty}>
                  <Text style={styles.dropdownEmptyText}>
                    Nenhum serviço encontrado com &quot;{search}&quot;.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      <HeroCarousel
        items={highlights}
        height={heroHeight}
        size={isExpanded ? 'large' : 'compact'}
        showArrows={Platform.OS === 'web' && !isCompact}
      />

      <View style={styles.section}>
        <SectionHeader
          title="Categorias"
          subtitle="Encontre o profissional certo para cada necessidade."
          action={{
            label: 'Ver todas',
            // @ts-ignore
            onPress: () => navigation.navigate('Category'),
          }}
        />
        <CategorySlider />
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Serviços disponíveis"
          subtitle="Filtre por categoria e veja quem pode atender hoje."
        />
        <ListServices />
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Profissionais perto de você"
          subtitle={
            city
              ? `Mais próximos de ${city} primeiro.`
              : 'Defina sua localização no topo da página para ver quem está mais perto.'
          }
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ListProfessionals style={styles.list} listHeader={header} />
    </View>
  );
};

export default FeedScreen;
