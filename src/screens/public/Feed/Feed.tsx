import React, { useRef, useState, useEffect } from 'react';
import {
  Text,
  ScrollView,
  View,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createStyles } from './styles';
import { useColors } from '@theme/ThemeProvider';
import { useThemeStore, ThemeMode } from '@stores/Theme';
import CategorySlider from '@components/features/CategorySlider';
import ListProfessionals from '@components/features/ListProfessionals';
import ListServices from '@components/features/ListServices';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { HighlightCard, HighlightItem } from '@components/ui/HighlightCard';
import { useServiceSearch } from './useServiceSearch';
import { useCategoryStore } from '@stores/Category';
import { SubCategory } from '@stores/SubCategory/types';
import { getCategoryIconName } from '@lib/constants/categoryIcons';

const HIGHLIGHT_DATA: HighlightItem[] = [
  {
    id: '1',
    title: 'Reformas de Fim de Ano',
    description: 'Pintores e eletricistas com agenda aberta.',
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&h=800&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Prepare-se para o Verão',
    description: 'Instalação de piscina e ar-condicionado.',
    image:
      'https://images.unsplash.com/photo-1574610758891-5b809b6e6e2e?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Beleza & Estética',
    description: 'Manicures e cabeleireiros para as festas.',
    image:
      'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1200&h=800&auto=format&fit=crop',
  },
  {
    id: '4',
    title: 'Cuidados Pet',
    description: 'Dog walkers e pet sitters perto de você.',
    image:
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800&auto=format&fit=crop',
  },
];

const FeedScreen: React.FC = () => {
  const scrollRef = useRef<ScrollView | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigation = useNavigation();

  const colors = useColors();
  const { theme } = useThemeStore();
  const isDark = theme === ThemeMode.DARK;
  const isHighContrast = theme === ThemeMode.LIGHT_HI_CONTRAST;
  const styles = createStyles(colors, isDark, isHighContrast);
  const { width } = useWindowDimensions();

  const { results, search: fetchSearch } = useServiceSearch();
  const { categories } = useCategoryStore();

  useEffect(() => {
    fetchSearch(search);
    if (search.trim().length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [search]);

  const handleScrollLeft = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    if (newIndex !== currentIndex) {
      scrollRef.current?.scrollTo({ x: newIndex * width, animated: true });
      setCurrentIndex(newIndex);
    }
  };

  const handleScrollRight = () => {
    const newIndex = Math.min(HIGHLIGHT_DATA.length - 1, currentIndex + 1);
    if (newIndex !== currentIndex) {
      scrollRef.current?.scrollTo({ x: newIndex * width, animated: true });
      setCurrentIndex(newIndex);
    }
  };

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(scrollX / width);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex =
          prevIndex === HIGHLIGHT_DATA.length - 1 ? 0 : prevIndex + 1;
        scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
        return nextIndex;
      });
    }, 5000); // Roda a cada 5 segundos
    return () => clearInterval(timer);
  }, [width]);

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

  return (
    <View style={styles.container}>
      <ListProfessionals
        style={styles.list}
        listHeader={
          <>
            {/* Mobile Search Bar */}
            {Platform.OS !== 'web' && (
              <View style={[styles.mobileSearchSection, { zIndex: 100 }]}>
                <View style={styles.mobileSearchContainer}>
                  <TextInput
                    style={styles.mobileSearchInput}
                    placeholder="Busque por um serviço (ex: Chaveiro)"
                    placeholderTextColor={colors.textTertiary}
                    value={search}
                    onChangeText={setSearch}
                    onSubmitEditing={handleSearchSubmit}
                    onFocus={() => {
                      if (search.trim().length > 0) setShowDropdown(true);
                    }}
                  />
                  <TouchableOpacity
                    style={styles.mobileSearchButton}
                    onPress={handleSearchSubmit}>
                    <FontAwesome
                      name="search"
                      size={18}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Autocomplete Dropdown */}
                {showDropdown && search.trim().length > 0 && (
                  <View style={styles.dropdownContainer}>
                    {results.length > 0 ? (
                      results.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.dropdownItem}
                          onPress={() => handleSelectService(item)}>
                          <View style={styles.dropdownIcon}>
                            <FontAwesome5
                              name={getCategoryIconName(item.category_id)}
                              size={16}
                              color={colors.primaryBlue}
                            />
                          </View>
                          <View style={styles.dropdownTextContainer}>
                            <Text style={styles.dropdownName} numberOfLines={1}>
                              {item.title}
                            </Text>
                          </View>
                          <FontAwesome
                            name="angle-right"
                            size={16}
                            color={colors.textTertiary}
                          />
                        </TouchableOpacity>
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
            {/* Seção Carrossel Destaques */}
            <View style={styles.carouselSection}>
              <View style={styles.carouselContainer}>
                {Platform.OS === 'web' && currentIndex > 0 && (
                  <TouchableOpacity
                    style={[styles.scrollButton, styles.scrollButtonLeft]}
                    onPress={handleScrollLeft}
                    activeOpacity={0.8}>
                    <FontAwesome
                      name="chevron-left"
                      size={16}
                      color={colors.primaryBlue}
                    />
                  </TouchableOpacity>
                )}

                <ScrollView
                  ref={scrollRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.carouselListContainer}
                  onMomentumScrollEnd={onMomentumScrollEnd}
                  scrollEventThrottle={16}
                  decelerationRate="fast"
                  snapToInterval={width}>
                  {HIGHLIGHT_DATA.map((item) => (
                    <HighlightCard key={item.id} item={item} />
                  ))}
                </ScrollView>

                {Platform.OS === 'web' &&
                  currentIndex < HIGHLIGHT_DATA.length - 1 && (
                    <TouchableOpacity
                      style={[styles.scrollButton, styles.scrollButtonRight]}
                      onPress={handleScrollRight}
                      activeOpacity={0.8}>
                      <FontAwesome
                        name="chevron-right"
                        size={16}
                        color={colors.primaryBlue}
                      />
                    </TouchableOpacity>
                  )}

                {/* Paginação (Dots) */}
                <View style={styles.paginationContainer}>
                  {HIGHLIGHT_DATA.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        currentIndex === index && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* Seção Categorias */}
            <View style={styles.categorySection}>
              <Text style={styles.title}>Selecione por Categorias</Text>
              <CategorySlider />
            </View>

            {/* Seção Serviços */}
            <View style={styles.categorySection}>
              <Text style={styles.title}>Serviços disponíveis</Text>
              <ListServices />
            </View>

            {/* Título da seção de profissionais */}
            <Text style={styles.title}>Profissionais próximos a você</Text>
          </>
        }
      />
    </View>
  );
};

export default FeedScreen;
