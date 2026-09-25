import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useProfessionalStore } from '@stores/Professional';
import { useFavoriteStore } from '@stores/Favorite';
import { useUserStore } from '@stores/User';
import { useColors } from '@theme/ThemeProvider';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import PageContainer from '@components/layout/PageContainer';
import { SobreContent } from './SobreContent';
import { ServicosContent } from './ServicosContent';
import { GaleriaContent } from './GaleriaContent';
import { AvaliacoesContent } from './AvaliacoesContent';
import Stars from './components/Stars';
import { createStyles } from './styles';

type TabType = 'sobre' | 'servicos' | 'galeria' | 'avaliacoes';

const TAB_LABELS: Record<TabType, string> = {
  sobre: 'Sobre',
  servicos: 'Serviços',
  galeria: 'Galeria',
  avaliacoes: 'Avaliações',
};

function PartnerProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const id = Number((route.params as { id: number | string }).id);

  const colors = useColors();
  const { isCompact } = useBreakpoint();
  const styles = useMemo(
    () => createStyles(colors, isCompact),
    [colors, isCompact],
  );

  const { selectedProfessional, fetchProfessionalById } =
    useProfessionalStore();
  const user = useUserStore((s) => s.user);
  const { isFavorite, addFavorite, removeFavorite } = useFavoriteStore();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('servicos');

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    fetchProfessionalById(id).finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [id, fetchProfessionalById]);

  const parceiro =
    selectedProfessional?.id === id ? selectedProfessional : null;

  // Fotos da galeria e dos servicos, sem repetir.
  const galleryImages = useMemo(() => {
    if (!parceiro) return [];
    const items = [
      ...(parceiro.Gallery ?? []).map((g) => ({
        url: g.url,
        descricao: g.description,
      })),
      ...(parceiro.Services ?? [])
        .filter((s) => s.active && s.banner_uri)
        .map((s) => ({ url: s.banner_uri as string, descricao: s.title })),
    ];
    const seen = new Set<string>();
    return items
      .filter((img) => img.url && !seen.has(img.url) && seen.add(img.url))
      .map((img, index) => ({ ...img, id: String(index) }));
  }, [parceiro]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryOrange} />
      </View>
    );
  }

  if (!parceiro) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFound}>Profissional não encontrado.</Text>
        <Pressable
          onPress={() =>
            navigation.canGoBack()
              ? navigation.goBack()
              : navigation.navigate('Home')
          }
          style={styles.secondaryButton}
          accessibilityRole="button">
          <Text style={styles.secondaryButtonText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const name = parceiro.User.name;
  const isOwner = user?.professional_id === parceiro.id;
  const canFavorite = !!user && !isOwner;
  const favorited = isFavorite(parceiro.id);
  const activeServices = (parceiro.Services ?? []).filter((s) => s.active);
  const reviews = (parceiro.Appointments ?? []).filter((a) => a.rating);
  const location = parceiro.MainAddress
    ? [parceiro.MainAddress.neighborhood, parceiro.MainAddress.city]
        .filter(Boolean)
        .join(', ')
    : null;

  const counts: Record<TabType, number | null> = {
    sobre: null,
    servicos: activeServices.length,
    galeria: galleryImages.length,
    avaliacoes: reviews.length,
  };

  const toggleFavorite = () => {
    if (favorited) {
      removeFavorite(parceiro.id);
      return;
    }
    addFavorite({
      professionalId: parceiro.id,
      professionalName: name,
      professionalAvatar: parceiro.User.avatar_uri || undefined,
      serviceTitle: activeServices[0]?.title,
      addedAt: new Date().toISOString(),
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'sobre':
        return (
          <SobreContent
            nome={name}
            descricao={parceiro.description}
            endereco={parceiro.MainAddress}
            raioKm={parceiro.service_radius_km}
            desde={parceiro.createdAt}
            totalServicos={activeServices.length}
            totalAvaliacoes={reviews.length}
          />
        );
      case 'servicos':
        return (
          <ServicosContent
            servicos={parceiro.Services ?? []}
            professionalId={parceiro.id}
            professionalName={name}
            isOwner={isOwner}
          />
        );
      case 'galeria':
        return <GaleriaContent imagens={galleryImages} />;
      default:
        return <AvaliacoesContent avaliacoes={parceiro.Appointments ?? []} />;
    }
  };

  const cover = parceiro.User.banner_uri;
  const coverContent = (
    <LinearGradient
      colors={['rgba(0,0,0,0.35)', 'transparent']}
      style={styles.coverOverlay}>
      {/* No app nao ha cabecalho: botao de voltar sobre a capa. */}
      {Platform.OS !== 'web' && navigation.canGoBack() ? (
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.coverButton}
          accessibilityRole="button"
          accessibilityLabel="Voltar">
          <FontAwesome name="arrow-left" size={18} color="#FFFFFF" />
        </Pressable>
      ) : (
        <View />
      )}
      {canFavorite ? (
        <Pressable
          onPress={toggleFavorite}
          style={styles.coverButton}
          accessibilityRole="button"
          accessibilityState={{ selected: favorited }}
          accessibilityLabel={
            favorited ? `Remover ${name} dos favoritos` : `Favoritar ${name}`
          }>
          <FontAwesome
            name={favorited ? 'heart' : 'heart-o'}
            size={18}
            color={favorited ? '#FF6B6B' : '#FFFFFF'}
          />
        </Pressable>
      ) : null}
    </LinearGradient>
  );

  return (
    <PageContainer maxWidth={960}>
      {isOwner ? (
        <View style={styles.ownerBanner}>
          <FontAwesome name="eye" size={16} color={colors.primaryBlack} />
          <Text style={styles.ownerText}>
            Este é o seu perfil, como os clientes veem.
          </Text>
          <Pressable
            onPress={() =>
              navigation.navigate('ProfessionalTabs', {
                screen: 'ProfessionalServicesTab',
              })
            }
            accessibilityRole="link">
            <Text style={styles.ownerLink}>Editar serviços</Text>
          </Pressable>
        </View>
      ) : null}

      {cover ? (
        <ImageBackground
          source={{ uri: cover }}
          style={styles.cover}
          imageStyle={styles.coverImage}
          accessibilityIgnoresInvertColors>
          {coverContent}
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={['#005A93', '#0B7FC4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.cover, styles.coverImage]}>
          {coverContent}
        </LinearGradient>
      )}

      <View style={styles.identity}>
        {parceiro.User.avatar_uri ? (
          <Image
            source={{ uri: parceiro.User.avatar_uri }}
            style={styles.avatar}
            accessibilityLabel={`Foto de ${name}`}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitial}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.identityTexts}>
          <Text
            style={styles.name}
            accessibilityRole="header"
            {...({ 'aria-level': 1 } as object)}>
            {name}
          </Text>
          <View style={styles.metaRow}>
            {parceiro.rating ? (
              <View
                style={styles.metaItem}
                accessible
                accessibilityLabel={`Nota ${parceiro.rating.toFixed(1)} de 5, ${parceiro.ratings_count} avaliações`}>
                <Stars value={parceiro.rating} size={14} />
                <Text style={styles.metaStrong}>
                  {parceiro.rating.toFixed(1).replace('.', ',')}
                </Text>
                <Text style={styles.metaText}>({parceiro.ratings_count})</Text>
              </View>
            ) : (
              <View style={[styles.badge]}>
                <Text style={styles.badgeText}>Novo no DelBicos</Text>
              </View>
            )}
            {location ? (
              <View style={styles.metaItem}>
                <FontAwesome
                  name="map-marker"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.metaText}>{location}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View
        style={styles.tabs}
        accessibilityRole="tablist"
        accessibilityLabel="Seções do perfil">
        {(Object.keys(TAB_LABELS) as TabType[]).map((tab) => {
          const selected = activeTab === tab;
          const count = counts[tab];
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={({ hovered }: any) => [
                styles.tab,
                selected && styles.tabSelected,
                hovered && !selected && styles.tabHovered,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={
                count != null ? `${TAB_LABELS[tab]}, ${count}` : TAB_LABELS[tab]
              }>
              <Text
                style={[styles.tabText, selected && styles.tabTextSelected]}>
                {TAB_LABELS[tab]}
                {/* No celular so o nome cabe; a contagem fica no rotulo acessivel. */}
                {count && !isCompact ? ` (${count})` : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </PageContainer>
  );
}

export default PartnerProfileScreen;
