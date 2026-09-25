import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  View,
  Platform,
  Text,
  useWindowDimensions,
  ListRenderItem,
  StyleProp,
  ViewStyle,
} from 'react-native';
import ProfessionalCard from '@components/ui/ProfessionalCard';
import { useProfessionalStore } from '@stores/Professional';
// Importamos 'ListedProfessional' que é o tipo que o Card espera e o Store retorna
import { ListedProfessional } from '@stores/Professional/types';
import { usePagination } from '@lib/hooks/usePagination';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';
import { useLocation } from '@lib/hooks/LocationContext';

const useResponsiveColumns = () => {
  const { width } = useWindowDimensions();

  if (Platform.OS === 'web') {
    if (width > 1200) return 4;
    if (width > 900) return 3;
    if (width > 600) return 2;
  }
  return 1;
};

interface ListProfessionalsProps {
  listHeader?: React.ReactElement;
  style?: StyleProp<ViewStyle>;
}

const ListProfessionals = ({ listHeader, style }: ListProfessionalsProps) => {
  const colors = useColors();
  const styles = createStyles(colors);
  const { fetchProfessionals } = useProfessionalStore();
  const numColumns = useResponsiveColumns();
  const { address } = useLocation();

  const fetcher = useCallback(
    (page: number, limit: number) => {
      const lat = address?.lat ? Number(address.lat) : undefined;
      const lng = address?.lon ? Number(address.lon) : undefined;

      // O fetchProfessionals deve retornar Promise<ListedProfessional[]>
      return fetchProfessionals('', page, limit, lat, lng);
    },
    [fetchProfessionals, address],
  );

  // Aqui garantimos que o hook saiba que está lidando com ListedProfessional
  const {
    data: professionals,
    loadingInitial,
    loadingMore,
    hasMore,
    onEndReached,
  } = usePagination<ListedProfessional>({ fetchData: fetcher, limit: 12 });

  // Corrigimos a tipagem do RenderItem para ListedProfessional
  const renderItem: ListRenderItem<ListedProfessional> = useCallback(
    ({ item }) => {
      const itemWidth = numColumns > 1 ? `${100 / numColumns}%` : '100%';

      return (
        <View style={[styles.cardWrapper, { width: itemWidth as any }]}>
          <ProfessionalCard professional={item} />
        </View>
      );
    },
    [numColumns, styles.cardWrapper],
  );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerContainer}>
          <ActivityIndicator color={colors.primaryOrange} />
        </View>
      );
    }
    if (!hasMore && professionals.length > 0) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Isso é tudo por enquanto.</Text>
        </View>
      );
    }
    return <View style={{ height: 20 }} />;
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nenhum profissional encontrado.</Text>
      <Text style={styles.emptySubtext}>
        Tente mudar sua localização ou buscar por outra categoria.
      </Text>
    </View>
  );

  if (loadingInitial) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={professionals}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        key={`cols-${numColumns}`}
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={listHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        removeClippedSubviews={Platform.OS !== 'web'}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
      />
    </View>
  );
};

export default ListProfessionals;
