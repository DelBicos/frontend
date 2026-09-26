import DelBicosLogo from '@assets/DelBicos_LogoH.png';
import Avatar from '@components/ui/Avatar';
import { MapComponent } from '@components/ui/MapComponent/MapComponent';
import { ThemeToggle, THEME_OPTIONS } from '@components/ui/ThemeToggle';
import { FontAwesome } from '@expo/vector-icons';
import { useLocation } from '@lib/hooks/LocationContext';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import { Region } from '@lib/hooks/types';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { NavigationParams } from '@screens/types';
import { useThemeStore } from '@stores/Theme';
import { ThemeMode } from '@stores/Theme/types';
import { useUserStore } from '@stores/User';
import { useColors } from '@theme/ThemeProvider';
import * as Location from 'expo-location';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import DelBicosLogoDark from '../../../../assets/DelBicos_git.png';
import { createStyles } from './styles';

// Logo, links, tema e conta so cabem lado a lado a partir daqui.
const HEADER_FULL_MIN_WIDTH = 1200;

type Screen = keyof NavigationParams;

/** Secao do menu que fica marcada para cada rota. */
const ROUTE_SECTION: Partial<Record<string, Screen>> = {
  Home: 'Feed',
  Feed: 'Feed',
  Category: 'Category',
  SubCategoryScreen: 'Category',
  SearchResult: 'Category',
  AboutUs: 'AboutUs',
  Help: 'Help',
  MySchedules: 'MySchedules',
  AdminAnalytics: 'AdminAnalytics',
};

const HeaderWeb: React.FC<NativeStackHeaderProps> = ({ route }) => {
  const { theme } = useThemeStore();
  const colors = useColors();
  const styles = createStyles(colors);
  const logo = theme === ThemeMode.DARK ? DelBicosLogoDark : DelBicosLogo;

  const { user, signOut, avatarBase64 } = useUserStore();
  const {
    address: locationAddress,
    city,
    state,
    lookupByCoordinates,
    loading: isLocationLoading,
  } = useLocation();

  const navigation = useNavigation<any>();
  const { width, isCompact, sideInset } = useBreakpoint();
  // Abaixo do desktop, links e acoes ficam em um menu recolhivel.
  const isCollapsed = width < HEADER_FULL_MIN_WIDTH;
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [mapMessage, setMapMessage] = useState<string | null>(null);
  const [tempMarker, setTempMarker] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [tempRegion, setTempRegion] = useState<Region | null>(null);

  const activeSection = ROUTE_SECTION[route?.name ?? ''];
  const firstName = user?.name?.split(' ')[0] ?? '';
  const locationLabel = city && state ? `${city} - ${state}` : 'Definir local';

  const navigateTo = useCallback(
    (screen: Screen, params?: object) => {
      setMenuOpen(false);
      navigation.navigate(screen, params);
    },
    [navigation],
  );

  const handleSearchSubmit = useCallback(() => {
    const query = search.trim();
    if (!query) return;
    setMenuOpen(false);
    navigation.navigate('SearchResult', { query });
  }, [navigation, search]);

  const handleSignOut = useCallback(() => {
    setMenuOpen(false);
    signOut();
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Home' }] }),
    );
  }, [signOut, navigation]);

  // --- Local (mapa) ---
  const openMapModal = useCallback(async () => {
    setMenuOpen(false);
    setMapMessage(null);
    setIsMapModalVisible(true);
    if (locationAddress?.lat && locationAddress?.lon) {
      const saved = {
        latitude: parseFloat(locationAddress.lat),
        longitude: parseFloat(locationAddress.lon),
      };
      setTempRegion({ ...saved, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      setTempMarker(saved);
      return;
    }
    const fallback = () =>
      setTempRegion({
        latitude: -23.5505,
        longitude: -46.6333,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setMapMessage(
          'Sem permissão de localização. Toque no mapa para marcar onde você está.',
        );
        fallback();
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setTempRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      setTempMarker(coords);
    } catch {
      setMapMessage('Toque no mapa para marcar onde você está.');
      fallback();
    }
  }, [locationAddress]);

  const handleConfirmLocation = useCallback(async () => {
    if (!tempMarker) return;
    try {
      await lookupByCoordinates(tempMarker.latitude, tempMarker.longitude);
      setIsMapModalVisible(false);
    } catch {
      setMapMessage('Não foi possível identificar este local. Tente de novo.');
    }
  }, [tempMarker, lookupByCoordinates]);

  // --- Pecas ---
  const navItems: { screen: Screen; label: string; show: boolean }[] = [
    { screen: 'Feed', label: 'Início', show: true },
    { screen: 'Category', label: 'Categorias', show: true },
    { screen: 'MySchedules', label: 'Agendamentos', show: !!user },
    { screen: 'AboutUs', label: 'Quem somos', show: true },
    { screen: 'Help', label: 'Ajuda', show: true },
    { screen: 'AdminAnalytics', label: 'Analytics', show: !!user?.admin },
  ];

  const navLinks = navItems
    .filter((item) => item.show)
    .map((item) => {
      const isActive = activeSection === item.screen;
      return (
        <Pressable
          key={item.screen}
          onPress={() => navigateTo(item.screen)}
          accessibilityRole="link"
          {...({ 'aria-current': isActive ? 'page' : undefined } as object)}
          style={({ hovered }: any) => [
            styles.navLink,
            isCollapsed && styles.navLinkStacked,
            hovered && styles.navLinkHovered,
            isActive && isCollapsed && styles.navLinkStackedActive,
          ]}>
          <Text style={[styles.navText, isActive && styles.navTextActive]}>
            {item.label}
          </Text>
          {isActive && !isCollapsed ? (
            <View style={styles.navIndicator} />
          ) : null}
        </Pressable>
      );
    });

  const themeMenu = (
    <Menu>
      <MenuTrigger>
        <View
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Tema do site">
          <FontAwesome
            name={THEME_OPTIONS.find((o) => o.mode === theme)?.icon ?? 'sun-o'}
            size={18}
            color={colors.primaryBlack}
          />
        </View>
      </MenuTrigger>
      <MenuOptions customStyles={{ optionsContainer: styles.dropdown }}>
        <Text style={styles.dropdownCaption}>Tema</Text>
        {THEME_OPTIONS.map((option) => {
          const isActive = option.mode === theme;
          return (
            <MenuOption
              key={option.mode}
              onSelect={() => useThemeStore.getState().setTheme(option.mode)}>
              <View style={styles.dropdownItem}>
                <FontAwesome
                  name={option.icon}
                  size={16}
                  color={colors.primaryBlack}
                  style={styles.dropdownIcon}
                />
                <Text style={styles.dropdownText}>{option.label}</Text>
                {isActive ? (
                  <FontAwesome
                    name="check"
                    size={14}
                    color={colors.primaryBlack}
                  />
                ) : null}
              </View>
            </MenuOption>
          );
        })}
      </MenuOptions>
    </Menu>
  );

  const accountItem = (
    icon: React.ComponentProps<typeof FontAwesome>['name'],
    label: string,
    onSelect: () => void,
    danger = false,
  ) => (
    <MenuOption onSelect={onSelect}>
      <View style={styles.dropdownItem}>
        <FontAwesome
          name={icon}
          size={16}
          color={danger ? colors.errorText : colors.primaryBlack}
          style={styles.dropdownIcon}
        />
        <Text
          style={[styles.dropdownText, danger && { color: colors.errorText }]}>
          {label}
        </Text>
      </View>
    </MenuOption>
  );

  const userMenu = user ? (
    <Menu>
      <MenuTrigger>
        <View
          style={styles.accountTrigger}
          accessibilityRole="button"
          accessibilityLabel={`Conta de ${firstName}`}>
          <Avatar
            uri={avatarBase64 || user.avatar_uri}
            name={user.name}
            size={36}
          />
          {!isCompact ? (
            <>
              <Text style={styles.accountName} numberOfLines={1}>
                {firstName}
              </Text>
              <FontAwesome
                name="chevron-down"
                size={11}
                color={colors.primaryBlack}
              />
            </>
          ) : null}
        </View>
      </MenuTrigger>
      <MenuOptions
        customStyles={{
          optionsContainer: [styles.dropdown, styles.accountDropdown],
        }}>
        <View style={styles.accountHeader}>
          <Text style={styles.accountHeaderName} numberOfLines={1}>
            {user.name}
          </Text>
          {user.email ? (
            <Text style={styles.accountHeaderEmail} numberOfLines={1}>
              {user.email}
            </Text>
          ) : null}
        </View>
        {accountItem('user-o', 'Meu perfil', () => navigateTo('ClientProfile'))}
        {accountItem('calendar', 'Meus agendamentos', () =>
          navigateTo('MySchedules'),
        )}
        {accountItem('comments-o', 'Conversas', () =>
          navigateTo('ClientProfile', { subroute: 'Conversas' }),
        )}
        {user.professional_id
          ? accountItem('briefcase', 'Painel do colaborador', () =>
              navigateTo('ProfessionalTabs'),
            )
          : null}
        <View style={styles.dropdownDivider} />
        {accountItem('sign-out', 'Sair', handleSignOut, true)}
      </MenuOptions>
    </Menu>
  ) : null;

  const authButtons = (
    <View
      style={[styles.authButtons, isCollapsed && styles.authButtonsStacked]}>
      <Pressable
        onPress={() => navigateTo('Login')}
        style={({ hovered }: any) => [
          styles.outlineButton,
          hovered && styles.outlineButtonHovered,
        ]}
        accessibilityRole="button">
        <Text style={styles.outlineButtonText}>Entrar</Text>
      </Pressable>
      <Pressable
        onPress={() => navigateTo('Register')}
        style={({ hovered }: any) => [
          styles.solidButton,
          hovered && styles.solidButtonHovered,
        ]}
        accessibilityRole="button">
        <Text style={styles.solidButtonText}>Criar conta</Text>
      </Pressable>
    </View>
  );

  const locationButton = (
    <Pressable
      onPress={openMapModal}
      style={({ hovered }: any) => [
        styles.locationButton,
        hovered && styles.locationButtonHovered,
      ]}
      accessibilityRole="button"
      accessibilityLabel={
        city ? `Local: ${locationLabel}. Alterar local` : 'Definir local'
      }>
      <FontAwesome name="map-marker" size={16} color={colors.primaryBlack} />
      {!isCompact ? (
        <Text style={styles.locationText} numberOfLines={1}>
          {locationLabel}
        </Text>
      ) : null}
      {!isCompact ? (
        <FontAwesome
          name="chevron-down"
          size={11}
          color={colors.primaryBlack}
        />
      ) : null}
    </Pressable>
  );

  const mapModal = (
    <Modal
      animationType="fade"
      transparent
      visible={isMapModalVisible}
      onRequestClose={() => setIsMapModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text
              style={styles.modalTitle}
              accessibilityRole="header"
              {...({ 'aria-level': 2 } as object)}>
              Onde você está?
            </Text>
            <Pressable
              onPress={() => setIsMapModalVisible(false)}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Fechar">
              <FontAwesome name="close" size={20} color={colors.primaryBlack} />
            </Pressable>
          </View>
          <Text style={styles.modalText}>
            {mapMessage ??
              'Mostramos primeiro os profissionais perto deste local. Toque no mapa para ajustar.'}
          </Text>
          <View style={styles.mapWrapper}>
            {!tempRegion ? (
              <View style={styles.mapLoading}>
                <ActivityIndicator size="large" color={colors.primaryBlack} />
              </View>
            ) : (
              <MapComponent
                region={tempRegion}
                markerCoords={tempMarker}
                onMapPress={(event: any) =>
                  setTempMarker(event.nativeEvent.coordinate)
                }
              />
            )}
          </View>
          <Pressable
            style={[
              styles.solidButton,
              styles.modalButton,
              (isLocationLoading || !tempMarker) && styles.buttonDisabled,
            ]}
            onPress={handleConfirmLocation}
            disabled={isLocationLoading || !tempMarker}
            accessibilityRole="button">
            {isLocationLoading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.solidButtonText}>Usar este local</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.headerContainer} {...({ role: 'banner' } as object)}>
      {/* Linha 1: marca, navegacao e conta */}
      <View
        style={[
          styles.topBar,
          { paddingHorizontal: sideInset },
          isCollapsed && styles.topBarCollapsed,
        ]}>
        <Pressable
          onPress={() => navigateTo('Feed')}
          accessibilityRole="link"
          accessibilityLabel="DelBicos, página inicial">
          <Image
            source={logo}
            style={[styles.logoImage, isCollapsed && styles.logoImageSmall]}
            resizeMode="contain"
          />
        </Pressable>

        {isCollapsed ? (
          <View style={styles.rightSection}>
            {userMenu}
            <Pressable
              onPress={() => setMenuOpen((open) => !open)}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              accessibilityState={{ expanded: menuOpen }}>
              <FontAwesome
                name={menuOpen ? 'close' : 'bars'}
                size={22}
                color={colors.primaryBlack}
              />
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.nav} {...({ role: 'navigation' } as object)}>
              {navLinks}
            </View>
            <View style={styles.rightSection}>
              {themeMenu}
              {user ? userMenu : authButtons}
            </View>
          </>
        )}
      </View>

      {isCollapsed && menuOpen ? (
        <View style={[styles.collapsedPanel, { paddingHorizontal: sideInset }]}>
          <View {...({ role: 'navigation' } as object)}>{navLinks}</View>
          <View style={styles.collapsedDivider} />
          <Text style={styles.collapsedCaption}>Tema</Text>
          <ThemeToggle fill={isCompact} />
          {!user ? (
            <>
              <View style={styles.collapsedDivider} />
              {authButtons}
            </>
          ) : null}
        </View>
      ) : null}

      {/* Linha 2: busca e local, alinhados ao conteudo */}
      <View style={[styles.searchRow, { paddingHorizontal: sideInset }]}>
        <View style={styles.searchField}>
          <FontAwesome
            name="search"
            size={16}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="O que você precisa? Ex.: pintor, diarista…"
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            accessibilityLabel="Buscar serviço"
            {...({ type: 'search', enterKeyHint: 'search' } as object)}
          />
          {search ? (
            <Pressable
              onPress={() => setSearch('')}
              style={styles.searchClear}
              accessibilityRole="button"
              accessibilityLabel="Limpar busca">
              <FontAwesome
                name="times-circle"
                size={16}
                color={colors.textSecondary}
              />
            </Pressable>
          ) : null}
          <Pressable
            onPress={handleSearchSubmit}
            style={({ hovered }: any) => [
              styles.searchButton,
              hovered && styles.solidButtonHovered,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Buscar">
            {isCompact ? (
              <FontAwesome name="search" size={16} color="#000000" />
            ) : (
              <Text style={styles.solidButtonText}>Buscar</Text>
            )}
          </Pressable>
        </View>
        {locationButton}
      </View>
      {mapModal}
    </View>
  );
};

export default HeaderWeb;
