import DelBicosLogo from '@assets/DelBicos_LogoH.png';
import { Button } from '@components/ui/Button';
import { MapComponent } from '@components/ui/MapComponent/MapComponent';
import { ThemeToggle } from '@components/ui/ThemeToggle';
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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
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

// Logo, links, tema, local e botoes so cabem lado a lado a partir daqui.
const HEADER_FULL_MIN_WIDTH = 1200;

const HeaderWeb: React.FC<NativeStackHeaderProps> = () => {
  const { theme } = useThemeStore();
  const isDark = theme === ThemeMode.DARK;
  const colors = useColors();
  const styles = createStyles(colors);

  const logo = isDark ? DelBicosLogoDark : DelBicosLogo;
  const headerIconColor = isDark ? '#FFFFFF' : colors.primaryBlue;

  const { user, signOut, address: userAddress } = useUserStore();
  const {
    address: locationAddress,
    city,
    state,
    setLocation,
    lookupByCoordinates,
    loading: isLocationLoading,
  } = useLocation();

  const navigation = useNavigation();
  const { width, isCompact, gutter } = useBreakpoint();
  // Abaixo do desktop, links e acoes ficam em um menu recolhivel.
  const isCollapsed = width < HEADER_FULL_MIN_WIDTH;
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);

  const [tempMarker, setTempMarker] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [tempRegion, setTempRegion] = useState<Region | null>(null);

  const navigateTo = useCallback(
    (screen?: keyof NavigationParams) => {
      if (!screen) return;
      setMenuOpen(false);
      // @ts-ignore
      navigation.navigate(screen);
    },
    [navigation],
  );

  const handleSearchSubmit = useCallback(() => {
    const query = search.trim();
    if (!query) return;
    setMenuOpen(false);
    // @ts-ignore
    navigation.navigate('SearchResult', { query });
  }, [navigation, search]);

  const handleSignOut = useCallback(() => {
    signOut();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      }),
    );
  }, [signOut, navigation]);

  const openMapModal = useCallback(async () => {
    setIsMapModalVisible(true);
    if (locationAddress?.lat && locationAddress?.lon) {
      const savedCoords = {
        latitude: parseFloat(locationAddress.lat),
        longitude: parseFloat(locationAddress.lon),
      };
      setTempRegion({
        ...savedCoords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setTempMarker(savedCoords);
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos da sua localização.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const currentCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setTempRegion({
        ...currentCoords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setTempMarker(currentCoords);
    } catch (error) {
      console.warn('Usando fallback:', error);
      setTempRegion({
        latitude: -23.5505,
        longitude: -46.6333,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    }
  }, [locationAddress]);

  const handleMapPress = useCallback((event: any) => {
    const { coordinate } = event.nativeEvent;
    setTempMarker(coordinate);
  }, []);

  const handleConfirmLocation = useCallback(async () => {
    if (!tempMarker) {
      setIsMapModalVisible(false);
      return;
    }
    try {
      await lookupByCoordinates(tempMarker.latitude, tempMarker.longitude);
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
    } finally {
      setIsMapModalVisible(false);
    }
  }, [tempMarker, lookupByCoordinates]);

  useEffect(() => {
    if (user && userAddress?.city && !city) {
      setLocation(userAddress.city, userAddress.state);
    }
  }, [user, userAddress, city, setLocation]);

  const renderMapModal = useMemo(
    () => (
      <Modal
        animationType="fade"
        transparent={true}
        visible={isMapModalVisible}
        onRequestClose={() => setIsMapModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione sua localização</Text>
              <TouchableOpacity onPress={() => setIsMapModalVisible(false)}>
                <FontAwesome
                  name="close"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.mapWrapper}>
              {!tempRegion ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <ActivityIndicator size="large" color={colors.primaryBlue} />
                </View>
              ) : (
                <MapComponent
                  region={tempRegion}
                  markerCoords={tempMarker}
                  onMapPress={handleMapPress}
                />
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.modalButton,
                (isLocationLoading || !tempMarker) &&
                  styles.modalButtonDisabled,
              ]}
              onPress={handleConfirmLocation}
              disabled={isLocationLoading || !tempMarker}>
              {isLocationLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalButtonText}>
                  Confirmar Localização
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    ),
    [
      isMapModalVisible,
      tempRegion,
      tempMarker,
      isLocationLoading,
      colors,
      styles,
      handleMapPress,
      handleConfirmLocation,
    ],
  );

  const MenuItem: React.FC<{
    screen?: keyof NavigationParams;
    children: React.ReactNode;
  }> = ({ screen, children }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <Pressable
        onPress={() => navigateTo(screen)}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        accessibilityRole="link"
        style={[
          styles.menuItemPressable,
          isCollapsed && styles.menuItemStacked,
          isHovered && styles.menuItemHovered,
        ]}>
        <Text
          style={[
            styles.menuItemText,
            isHovered && styles.menuItemTextHovered,
          ]}>
          {children}
        </Text>
      </Pressable>
    );
  };

  const navLinks = (
    <>
      <MenuItem screen={'Feed'}>Página Inicial</MenuItem>
      <MenuItem screen={'Category'}>Categorias</MenuItem>
      <MenuItem screen={'AboutUs'}>Quem Somos</MenuItem>
      <MenuItem screen={'Help'}>FAQ</MenuItem>
      {!!user && (
        <>
          <MenuItem screen={'MySchedules'}>Meus Agendamentos</MenuItem>
          {user?.admin && (
            <MenuItem screen={'AdminAnalytics'}>Analytics</MenuItem>
          )}
        </>
      )}
    </>
  );

  const locationPicker = (
    <View style={styles.locationContainer}>
      <Text style={styles.locationLabel}>Estou em:</Text>
      <Button
        colorVariant="secondary"
        sizeVariant="smallPill"
        fontVariant="AfacadRegular15"
        onPress={() => {
          setMenuOpen(false);
          openMapModal();
        }}
        endIcon={
          <FontAwesome
            name="chevron-down"
            size={12}
            color={colors.primaryWhite}
          />
        }>
        {city && state ? `${city} - ${state}` : 'Definir Local'}
      </Button>
    </View>
  );

  const userMenu = (
    <Menu>
      <MenuTrigger>
        <View style={styles.userContainer}>
          <Image
            source={
              user?.avatar_uri
                ? { uri: user.avatar_uri }
                : require('@assets/logo.png')
            }
            style={styles.profileImage}
            accessibilityLabel="Menu da conta"
          />
        </View>
      </MenuTrigger>
      <MenuOptions
        customStyles={{
          optionsContainer: styles.menuOptionsContainer,
        }}>
        <MenuOption
          onSelect={() => navigation.navigate('ClientProfile' as never)}>
          <View style={styles.menuOption}>
            <FontAwesome
              name="user-circle-o"
              size={18}
              color={headerIconColor}
              style={styles.menuIcon}
            />
            <Text style={styles.menuOptionText}>Meu Perfil</Text>
          </View>
        </MenuOption>
        {user?.professional_id ? (
          <MenuOption
            onSelect={() => navigation.navigate('ProfessionalTabs' as never)}>
            <View style={styles.menuOption}>
              <FontAwesome
                name="briefcase"
                size={18}
                color={headerIconColor}
                style={styles.menuIcon}
              />
              <Text style={styles.menuOptionText}>Painel do colaborador</Text>
            </View>
          </MenuOption>
        ) : null}
        <View style={styles.menuDivider} />
        <MenuOption onSelect={handleSignOut}>
          <View style={styles.menuOption}>
            <FontAwesome
              name="sign-out"
              size={18}
              color={colors.errorText}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuOptionText, { color: colors.errorText }]}>
              Sair
            </Text>
          </View>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );

  const authButtons = (
    <View style={[styles.authButtons, isCompact && styles.authButtonsStacked]}>
      <Button
        colorVariant="primaryOrange"
        sizeVariant="default"
        fontVariant="AfacadBold16"
        variant="outlined"
        onPress={() => navigateTo('Login')}>
        Entrar
      </Button>
      <Button
        colorVariant="primaryOrange"
        sizeVariant="default"
        variant="contained"
        fontVariant="AfacadBold16"
        onPress={() => navigateTo('Register')}>
        Cadastre-se
      </Button>
    </View>
  );

  return (
    <View style={styles.headerContainer}>
      <View
        style={[
          styles.topBar,
          isCollapsed && { height: 64, paddingHorizontal: gutter },
        ]}>
        <TouchableOpacity
          onPress={() => navigateTo('Feed')}
          accessibilityRole="link"
          accessibilityLabel="DelBicos, página inicial">
          <Image
            source={logo}
            style={[styles.logoImage, isCollapsed && styles.logoImageSmall]}
          />
        </TouchableOpacity>

        {isCollapsed ? (
          <View style={styles.collapsedActions}>
            {!!user && userMenu}
            <Pressable
              onPress={() => setMenuOpen((open) => !open)}
              style={styles.menuToggle}
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
            <View style={styles.menu}>{navLinks}</View>
            <View style={styles.rightSection}>
              <ThemeToggle />
              {locationPicker}
              {user ? userMenu : authButtons}
            </View>
          </>
        )}
      </View>

      {isCollapsed && menuOpen && (
        <View style={[styles.collapsedPanel, { paddingHorizontal: gutter }]}>
          <View style={styles.collapsedNav}>{navLinks}</View>
          <View style={styles.collapsedDivider} />
          <View style={styles.collapsedRow}>
            <ThemeToggle />
            {locationPicker}
          </View>
          {!user && authButtons}
        </View>
      )}

      <View
        style={[
          styles.searchBar,
          isCollapsed && { paddingHorizontal: gutter },
        ]}>
        {user && !isCompact && (
          <Text style={styles.searchText}>
            Olá, {user.name.split(' ')[0]}! Como podemos te ajudar hoje?
          </Text>
        )}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="O que você precisa?"
            placeholderTextColor="#6B7280"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            accessibilityLabel="Buscar serviço"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearchSubmit}
            accessibilityRole="button"
            accessibilityLabel="Buscar">
            <FontAwesome name="search" size={16} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>
      {renderMapModal}
    </View>
  );
};

export default HeaderWeb;
