import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  View,
  Platform,
  Text,
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
import { CONTENT_MAX_WIDTH, useBreakpoint } from '@lib/hooks/useBreakpoint';

/** Margem externa do ProfessionalCard (compensada no container para alinhar as bordas). */
const CARD_MARGIN = 8;

/** Colunas pela largura util do conteudo (vale para web e tablets). */
export function getProfessionalColumns(contentWidth: number) {
  if (contentWidth >= 1100) return 4;
  if (contentWidth >= 800) return 3;
  if (contentWidth >= 520) return 2;
  return 1;
}

interface ListProfessionalsProps {
  listHeader?: React.ReactElement;
  style?: StyleProp<ViewStyle>;
}

const ListProfessionals = ({ listHeader, style }: ListProfessionalsProps) => {
  const colors = useColors();
  const styles = createStyles(colors);
  const { fetchProfessionals } = useProfessionalStore();
  const { gutter, contentWidth } = useBreakpoint();
  const numColumns = getProfessionalColumns(contentWidth);
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
        contentContainerStyle={[
          styles.listContent,
          {
            // Conteudo centralizado com largura maxima em telas grandes.
            paddingHorizontal: gutter - CARD_MARGIN,
            maxWidth: CONTENT_MAX_WIDTH + gutter * 2,
          },
        ]}
        renderItem={renderItem}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          listHeader ? (
            <View style={{ paddingHorizontal: CARD_MARGIN }}>{listHeader}</View>
          ) : undefined
        }
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
