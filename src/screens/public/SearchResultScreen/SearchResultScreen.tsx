import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import ProfessionalResultCard, {
  ProfessionalResult,
} from '@components/features/ProfessionalResultCard';
import ServiceCard from '@components/features/ListServices/ServiceCard';
import BookingSteps from '@components/features/BookingSteps';
import PageContainer, { PageHeader } from '@components/layout/PageContainer';
import Chip, { ChipGroup } from '@components/ui/Chip';
import { useProfessionalStore } from '@stores/Professional';
import { useServicesStore, type ServiceItem } from '@stores/Services/Services';
import { useLocation } from '@lib/hooks/LocationContext';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import {
  formatLongDate,
  isSlotBookable,
  ResultSort,
  sortResults,
} from '@lib/booking';
import { createStyles } from './styles';

type SearchResultParams = {
  subCategoryId?: number;
  subCategoryTitle?: string;
  date?: string;
  query?: string;
  professionalId?: number;
  professionalName?: string;
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

/** Busca por texto livre (cabecalho): lista de servicos relevantes. */
function SemanticResults({ query }: { query: string }) {
  const colors = useColors();
  const { isCompact } = useBreakpoint();
  const styles = createStyles(colors, isCompact);
  const { searchServicesSemantically } = useServicesStore();
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [limited, setLimited] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    searchServicesSemantically(query)
      .then((result) => {
        if (cancelled) return;
        setServices(result.services);
        setTotal(result.total);
        setLimited(result.resultsLimited);
      })
      .catch((err) => {
        if (cancelled) return;
        setServices([]);
        setTotal(0);
        setError(resolveSemanticSearchError(err));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, searchServicesSemantically]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Busca"
        title={`“${query}”`}
        subtitle={
          isLoading
            ? 'Procurando serviços…'
            : `${total} resultado${total === 1 ? '' : 's'}${limited ? ' · exibindo os mais relevantes' : ''}`
        }
      />
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.primaryBlack}
          style={styles.loading}
        />
      ) : services.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {error ??
              'Nenhum serviço relevante foi encontrado. Tente descrever o que você precisa de outra forma.'}
          </Text>
        </View>
      ) : (
        <View style={styles.serviceList}>
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </View>
      )}
    </PageContainer>
  );
}

/** Etapa 2 do agendamento: profissionais com horario livre no dia. */
function AvailabilityResults({
  subCategoryId,
  subCategoryTitle,
  date,
  professionalId,
  professionalName,
}: SearchResultParams) {
  const navigation = useNavigation<any>();
  const colors = useColors();
  const { isCompact, isExpanded } = useBreakpoint();
  const styles = createStyles(colors, isCompact);
  const { fetchProfessionalsByAvailability } = useProfessionalStore();
  const { address } = useLocation();

  const lat = address?.lat ? parseFloat(String(address.lat)) : undefined;
  const lng = address?.lng ? parseFloat(String(address.lng)) : undefined;
  const hasLocation = lat !== undefined && lng !== undefined;

  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<ProfessionalResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Vindo do perfil de um profissional, mostra so ele (com opcao de ver todos).
  const [showAll, setShowAll] = useState(false);
  const [sort, setSort] = useState<ResultSort>(
    hasLocation ? 'distance' : 'rating',
  );
  const isSingleProfessional = !!professionalId && !showAll;

  useEffect(() => {
    if (!subCategoryId || !date) {
      setResults([]);
      setError('Informe um serviço e um dia para encontrar profissionais.');
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchProfessionalsByAvailability(Number(subCategoryId), date, lat, lng)
      .then((data) => {
        if (!cancelled) setResults(data ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setResults([]);
          setError(
            'Não foi possível buscar profissionais agora. Tente novamente.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [subCategoryId, date, lat, lng, fetchProfessionalsByAvailability]);

  // So entra quem tem pelo menos um horario com a antecedencia minima.
  const bookable = useMemo(() => {
    if (!date) return [];
    const now = Date.now();
    return results
      .map((r) => ({
        professional: r,
        times: r.availableTimes.filter((t) => isSlotBookable(date, t, now)),
      }))
      .filter((r) => r.times.length > 0);
  }, [results, date]);

  const visible = useMemo(() => {
    const list = isSingleProfessional
      ? // Parametros vindos da URL (web) chegam como texto.
        bookable.filter((r) => r.professional.id === Number(professionalId))
      : bookable;
    const order = sortResults(
      list.map((r) => r.professional),
      sort,
    ).map((p) => p.id);
    return [...list].sort(
      (a, b) =>
        order.indexOf(a.professional.id) - order.indexOf(b.professional.id),
    );
  }, [bookable, isSingleProfessional, professionalId, sort]);

  const serviceName =
    subCategoryTitle ?? results[0]?.serviceName ?? 'Serviço escolhido';
  const columns = isCompact ? 1 : isExpanded ? 3 : 2;

  const goBackToChoice = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Category');
  };

  const sortOptions: { value: ResultSort; label: string }[] = [
    ...(hasLocation
      ? [{ value: 'distance' as const, label: 'Mais próximos' }]
      : []),
    { value: 'rating', label: 'Melhor avaliados' },
    { value: 'price', label: 'Menor preço' },
  ];

  return (
    <PageContainer>
      <BookingSteps current={2} />
      <PageHeader
        title={
          isSingleProfessional
            ? `Horários de ${professionalName ?? 'profissional'}`
            : 'Escolha profissional e horário'
        }
        subtitle={`${serviceName} · ${date ? formatLongDate(date) : ''}`}>
        <View style={styles.headerLinks}>
          <Pressable
            onPress={goBackToChoice}
            style={({ pressed }) => [styles.link, pressed && { opacity: 0.7 }]}
            accessibilityRole="link">
            <FontAwesome name="pencil" size={14} color={colors.primaryBlack} />
            <Text style={styles.linkText}>Trocar serviço ou dia</Text>
          </Pressable>
          {isSingleProfessional ? (
            <Pressable
              onPress={() => setShowAll(true)}
              style={({ pressed }) => [
                styles.link,
                pressed && { opacity: 0.7 },
              ]}
              accessibilityRole="button">
              <FontAwesome name="users" size={14} color={colors.primaryBlack} />
              <Text style={styles.linkText}>Ver outros profissionais</Text>
            </Pressable>
          ) : null}
        </View>
      </PageHeader>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.primaryBlack}
          style={styles.loading}
        />
      ) : visible.length === 0 ? (
        <View style={styles.empty}>
          <FontAwesome
            name={error ? 'exclamation-circle' : 'calendar-times-o'}
            size={40}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>
            {error ? 'Algo deu errado' : 'Nenhum horário livre neste dia'}
          </Text>
          <Text style={styles.emptyText}>
            {error ??
              (isSingleProfessional
                ? `${professionalName ?? 'Este profissional'} não tem horários livres neste dia. Escolha outro dia ou veja outros profissionais.`
                : 'Nenhum profissional tem horário livre para este serviço neste dia. Tente outro dia.')}
          </Text>
          <Pressable
            onPress={goBackToChoice}
            style={({ pressed }) => [
              styles.emptyButton,
              pressed && { opacity: 0.85 },
            ]}
            accessibilityRole="button">
            <Text style={styles.emptyButtonText}>Escolher outro dia</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.toolbar}>
            <Text style={styles.count} accessibilityLiveRegion="polite">
              {visible.length}{' '}
              {visible.length === 1
                ? 'profissional com horário livre'
                : 'profissionais com horário livre'}
            </Text>
            {!isSingleProfessional && visible.length > 1 ? (
              <ChipGroup accessibilityLabel="Ordenar por">
                {sortOptions.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    selected={sort === option.value}
                    onPress={() => setSort(option.value)}
                  />
                ))}
              </ChipGroup>
            ) : null}
          </View>
          <View style={styles.grid}>
            {visible.map(({ professional, times }) => (
              <View
                key={professional.id}
                style={[styles.gridItem, { width: `${100 / columns}%` }]}>
                <ProfessionalResultCard
                  professional={professional}
                  selectedDate={date ?? ''}
                  times={times}
                  showDistance={hasLocation}
                />
              </View>
            ))}
          </View>
        </>
      )}
    </PageContainer>
  );
}

function SearchResultScreen() {
  const route = useRoute();
  const params = (route.params ?? {}) as SearchResultParams;
  const query = params.query?.trim() ?? '';

  if (query.length >= 2) {
    return <SemanticResults query={query} />;
  }
  return <AvailabilityResults {...params} />;
}

export default SearchResultScreen;
