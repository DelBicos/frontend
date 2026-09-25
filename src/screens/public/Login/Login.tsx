import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  Image,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useLocation } from '@lib/hooks/LocationContext';
import CustomTextInput from '@components/ui/CustomTextInput';
import LogoV3 from '@assets/LogoV3.png';
import { createStyles } from './styles';
import { useColors } from '@theme/ThemeProvider';

function LoginScreen() {
  const navigation = useNavigation();
  const { setLocation } = useLocation();
  const [cep, setCep] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const colors = useColors();
  const styles = createStyles(colors);

  const handleUseLocation = async () => {
    setIsLoadingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão negada',
          'Não foi possível acessar sua localização.',
        );
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = locationData.coords;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            'User-Agent': 'DelBicosApp/1.0',
          },
        },
      );

      if (!response.ok) throw new Error('Falha na requisição');

      const data = await response.json();

      if (data && data.address) {
        const { city, state, town, village, county } = data.address;
        const cityName = city || town || village || county || 'Localização';
        const stateName = state || '';

        setLocation(cityName, stateName);
        // @ts-ignore
        navigation.navigate('Feed');
      } else {
        throw new Error('Endereço não encontrado');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Ocorreu um problema ao buscar sua localização.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleCepSearch = async () => {
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      Alert.alert('CEP Inválido', 'Por favor, digite um CEP com 8 dígitos.');
      return;
    }

    setIsLoadingCep(true);
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
      );
      const data = await response.json();

      if (data.erro) {
        Alert.alert('Erro', 'CEP não encontrado.');
      } else {
        setLocation(data.localidade, data.uf);
        // @ts-ignore
        navigation.navigate('Feed');
      }
    } catch {
      Alert.alert(
        'Erro',
        'Não foi possível buscar o CEP. Verifique sua conexão.',
      );
    } finally {
      setIsLoadingCep(false);
    }
  };

  const onLoginPress = () => {
    // @ts-ignore
    navigation.navigate('LoginPassword');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home' as never)}
          activeOpacity={0.8}>
          <Image source={LogoV3} style={styles.logo} />
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>Onde você está?</Text>
          <Text style={styles.subtitle}>
            Use sua localização ou CEP para encontrarmos os melhores serviços
            perto de você.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleUseLocation}
            disabled={isLoadingLocation}
            activeOpacity={0.8}>
            {isLoadingLocation ? (
              <ActivityIndicator color={colors.primaryWhite} />
            ) : (
              <Text style={styles.buttonText}>Usar minha localização</Text>
            )}
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <CustomTextInput
              label="Ou digite seu CEP"
              placeholder="00000-000"
              value={cep}
              onChangeText={(text) => {
                const masked = text
                  .replace(/\D/g, '')
                  .replace(/^(\d{5})(\d)/, '$1-$2')
                  .slice(0, 9);
                setCep(masked);
              }}
              keyboardType="numeric"
              maxLength={9}
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleCepSearch}
            disabled={isLoadingCep}
            activeOpacity={0.8}>
            {isLoadingCep ? (
              <ActivityIndicator color={colors.primaryWhite} />
            ) : (
              <Text style={styles.buttonText}>Buscar CEP</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>já tem conta?</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={onLoginPress}
            activeOpacity={0.8}>
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
              Fazer Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Text style={styles.footer}>
        © DelBicos - {new Date().getFullYear()} – Todos os direitos reservados.
      </Text>
    </View>
  );
}

export default LoginScreen;
