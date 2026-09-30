import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { createStyles } from './styles';
import { useColors } from '@theme/ThemeProvider';
import { useThemeStore, ThemeMode } from '@stores/Theme';
import { FontAwesome } from '@expo/vector-icons';
import ProfessionalResultCard, {
  ProfessionalResult,
} from '@components/features/ProfessionalResultCard';
import { useProfessionalStore } from '@stores/Professional';
import { useLocation } from '@lib/hooks/LocationContext';
import { useServicesStore, type ServiceItem } from '@stores/Services/Services';
import ServiceCard from '@components/features/ListServices/ServiceCard';
// radius filters removed (RF04 reverted)

type SearchResultParams = {
  subCategoryId?: number;
  date?: string;
  query?: string;
};

function resolveSemanticSearchError(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const status = (error as { response?: { status?: number } }).response
      ?.status;
    if (status === 429) {
      return 'Muitas buscas realizadas. Aguarde alguns minutos e tente novamente.';
    }
    if (status === 503) {
      return 'A busca semântica está temporariamente indisponível. Tente novamente.';
    }
  }
  return 'Não foi possível buscar os serviços agora. Tente novamente.';
}

function SearchResultScreen() {
  const route = useRoute();
  const { subCategoryId, date, query } = route.params as SearchResultParams;
  const semanticQuery = query?.trim() ?? '';
  const isSemanticSearch = semanticQuery.length >= 2;

  const { fetchProfessionalsByAvailability } = useProfessionalStore();
  const { searchServicesSemantically } = useServicesStore();
  const { address } = useLocation();
  const { width } = useWindowDimensions();

  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<ProfessionalResult[]>([]);
  const [semanticServices, setSemanticServices] = useState<ServiceItem[]>([]);
  const [semanticTotal, setSemanticTotal] = useState(0);
  const [semanticResultsLimited, setSemanticResultsLimited] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  // radius filter removed

  const numColumns = width > 1100 ? 3 : width > 768 ? 2 : 1;

  useEffect(() => {
    const loadResults = async () => {
      setIsLoading(true);
      setSearchError(null);

      if (isSemanticSearch) {
        try {
          const semanticResult =
            await searchServicesSemantically(semanticQuery);
          setSemanticServices(semanticResult.services);
          setSemanticTotal(semanticResult.total);
          setSemanticResultsLimited(semanticResult.resultsLimited);
        } catch (error) {
          setSemanticServices([]);
          setSemanticTotal(0);
          setSearchError(resolveSemanticSearchError(error));
        } finally {
          setIsLoading(false);
        }
        return;
      }

      if (!subCategoryId || !date) {
        setResults([]);
        setSearchError(
          'Informe um serviço e uma data para encontrar profissionais.',
        );
        setIsLoading(false);
        return;
      }

      const lat = address?.lat ? parseFloat(String(address.lat)) : undefined;
      const lng = address?.lng ? parseFloat(String(address.lng)) : undefined;

      try {
        const data = await fetchProfessionalsByAvailability(
          subCategoryId,
          date,
          lat,
          lng,
        );
        setResults(data || []);
      } catch (error) {
        console.error('Erro ao buscar profissionais:', error);
        setSearchError(
          'Não foi possível buscar profissionais agora. Tente novamente.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [
    address,
    date,
    fetchProfessionalsByAvailability,
    isSemanticSearch,
    searchServicesSemantically,
    semanticQuery,
    subCategoryId,
  ]);

  const colors = useColors();
  const { theme } = useThemeStore();
  const isDark = theme === ThemeMode.DARK;
  const isHighContrast = theme === ThemeMode.LIGHT_HI_CONTRAST;
  const styles = createStyles(colors, isDark, isHighContrast);

  const renderFilterBar = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterBarContainer}
      contentContainerStyle={styles.filterBar}>
      <TouchableOpacity style={styles.filterButton}>
        <FontAwesome
          name="filter"
          size={14}
          color={colors.textSecondary}
          style={{ marginRight: 8 }}
        />
        <Text style={styles.filterButtonText}>Filtros</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.filterButton}>
        <Text style={styles.filterButtonText}>Ordenar Por</Text>
        <FontAwesome
          name="chevron-down"
          size={12}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.filterButton}>
        <Text style={styles.filterButtonText}>Distância</Text>
        <FontAwesome
          name="chevron-down"
          size={12}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.filterButton}>
        <Text style={styles.filterButtonText}>Atendimento em Domicílio</Text>
        <FontAwesome
          name="chevron-down"
          size={12}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    </ScrollView>
  );

  if (isSemanticSearch) {
    return (
      <View style={styles.container}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.primaryBlue}
            style={{ flex: 1 }}
          />
        ) : (
          <FlatList
            style={styles.list}
            contentContainerStyle={styles.contentContainer}
            data={semanticServices}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <ServiceCard service={item} />}
            ListHeaderComponent={
              <>
                <Text style={styles.title}>
                  {semanticTotal} resultado{semanticTotal === 1 ? '' : 's'} para
                  “{semanticQuery}”
                </Text>
                {semanticResultsLimited && (
                  <Text style={styles.searchInfo}>
                    Exibindo os resultados mais relevantes para sua busca.
                  </Text>
                )}
              </>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchError ??
                    'Nenhum serviço relevante foi encontrado. Tente descrever o que você precisa de outra forma.'}
                </Text>
              </View>
            }
            ListFooterComponent={
              <Text style={styles.footer}>
                © DelBicos - {new Date().getFullYear()} - Todos os direitos
                reservados.
              </Text>
            }
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.primaryBlue}
          style={{ flex: 1 }}
        />
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.contentContainer}
          data={results}
          keyExtractor={(item) => item.id.toString()}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={Platform.OS !== 'web'}
          numColumns={numColumns}
          key={`grid-${numColumns}`}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
          ListHeaderComponent={
            <>
              <Text style={styles.title}>
                {results.length} Resultados Encontrados
              </Text>
              {searchError && (
                <Text style={styles.searchInfo}>{searchError}</Text>
              )}
              {renderFilterBar()}
            </>
          }
          renderItem={({ item }) => (
            <View
              style={[styles.cardWrapper, { width: `${100 / numColumns}%` }]}>
              <ProfessionalResultCard
                professional={item}
                selectedDate={date ?? ''}
              />
            </View>
          )}
          ListFooterComponent={
            <Text style={styles.footer}>
              © DelBicos - {new Date().getFullYear()} - Todos os direitos
              reservados.
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchError ??
                  'Nenhum profissional encontrado para esta data ou serviço.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

export default SearchResultScreen;
