import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { createStyles } from './styles';
import { useColors } from '@theme/ThemeProvider';
import useServicesStore from '@stores/Services/Services';
import ServiceCard from './ServiceCard';
import { isServiceAvailableNow } from '@lib/helpers/availability';
import { useCategoryStore } from '@stores/Category';
import { useSubCategoryStore } from '@stores/SubCategory';
import { useIsFocused } from '@react-navigation/native';
import { initSSE } from '@lib/sse';

const ListServices: React.FC = () => {
  const colors = useColors();
  const styles = createStyles(colors);

  const { services, loading, fetchServices } = useServicesStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { subCategories, fetchSubCategoriesByCategoryId } =
    useSubCategoryStore();

  const [onlyToday, setOnlyToday] = useState(false);
  const [onlyNow, setOnlyNow] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(
    null,
  );

  // Carrega categorias uma vez
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Quando muda a categoria selecionada, carrega subcategorias
  useEffect(() => {
    if (selectedCategory) {
      fetchSubCategoriesByCategoryId(selectedCategory);
    }
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

  // Polling automático (15s) quando a tela estiver em foco
  const isFocused = useIsFocused();
  useEffect(() => {
    if (!isFocused) return;
    const id = setInterval(() => {
      loadServices();
    }, 15000);
    return () => clearInterval(id);
  }, [isFocused, loadServices]);

  // SSE: escuta novos serviços criados e força refetch quando receber evento 'new_service'
  useEffect(() => {
    const es = initSSE();
    if (!es) return;

    const handler = (ev: MessageEvent) => {
      try {
        const payload = JSON.parse(ev.data);
        // payload contains minimal service info; fetch full list/details as needed
        loadServices();
      } catch (e) {
        console.warn('[SSE] erro ao parsear evento new_service', e);
        loadServices();
      }
    };

    es.addEventListener('new_service', handler as any);
    return () => {
      try {
        es.removeEventListener('new_service', handler as any);
      } catch (e) {
        // ignore
      }
    };
  }, [loadServices]);

  const handleSelectCategory = (id: number) => {
    if (selectedCategory === id) {
      // deselect
      setSelectedCategory(null);
      setSelectedSubCategory(null);
    } else {
      setSelectedCategory(id);
      setSelectedSubCategory(null);
    }
  };

  const handleSelectSubCategory = (id: number) => {
    setSelectedSubCategory(selectedSubCategory === id ? null : id);
  };

  const displayed = useMemo(() => {
    const list = services || [];
    const withAvailability = list.filter(
      (s) => s.availabilities && s.availabilities.length > 0,
    );
    if (!onlyNow) return withAvailability;
    return withAvailability.filter((s) => isServiceAvailableNow(s));
  }, [services, onlyNow]);

  const subCategoriesForSelected = selectedCategory
    ? subCategories.filter((s) => s.category_id === selectedCategory)
    : [];

  return (
    <View>
      {/* Filtro por Categoria */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          gap: 8,
        }}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => handleSelectCategory(cat.id)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              borderWidth: 1,
              borderColor:
                selectedCategory === cat.id
                  ? colors.primaryOrange
                  : colors.borderColor,
              backgroundColor:
                selectedCategory === cat.id
                  ? colors.primaryOrange
                  : colors.cardBackground,
              marginRight: 4,
            }}>
            <Text
              style={{
                fontFamily: 'Afacad-SemiBold',
                fontSize: 13,
                color:
                  selectedCategory === cat.id ? '#fff' : colors.textSecondary,
              }}>
              {cat.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filtro por Subcategoria (aparece quando categoria está selecionada) */}
      {selectedCategory && subCategoriesForSelected.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 8,
            gap: 8,
          }}>
          {subCategoriesForSelected.map((sub) => (
            <TouchableOpacity
              key={sub.id}
              onPress={() => handleSelectSubCategory(sub.id)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 16,
                borderWidth: 1,
                borderColor:
                  selectedSubCategory === sub.id
                    ? colors.primaryBlue
                    : colors.borderColor,
                backgroundColor:
                  selectedSubCategory === sub.id
                    ? colors.primaryBlue
                    : colors.inputBackground,
                marginRight: 4,
              }}>
              <Text
                style={{
                  fontFamily: 'Afacad-Regular',
                  fontSize: 12,
                  color:
                    selectedSubCategory === sub.id
                      ? '#fff'
                      : colors.textSecondary,
                }}>
                {sub.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Filtros hoje / agora */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingBottom: 4,
        }}>
        <TouchableOpacity onPress={() => setOnlyToday(!onlyToday)}>
          <Text
            style={{
              color: colors.primaryOrange,
              fontFamily: 'Afacad-SemiBold',
              fontSize: 13,
            }}>
            {onlyToday ? 'Mostrar todos' : 'Disponíveis hoje'}
          </Text>
        </TouchableOpacity>
        <View style={{ width: 16 }} />
        <TouchableOpacity onPress={() => setOnlyNow(!onlyNow)}>
          <Text
            style={{
              color: colors.primaryOrange,
              fontFamily: 'Afacad-SemiBold',
              fontSize: 13,
            }}>
            {onlyNow ? 'Mostrar todos' : 'Disponíveis agora'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryOrange} />
        </View>
      ) : !displayed || displayed.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {selectedCategory
              ? 'Nenhum serviço encontrado nesta categoria.'
              : 'Nenhum serviço disponível no momento.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ServiceCard service={item} />}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};

export default ListServices;
