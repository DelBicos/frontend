import { Linking, Platform, Alert } from 'react-native';

export function formatAddressForQuery(address: string): string {
  let cleanAddress = address.trim();
  if (
    !cleanAddress.toLowerCase().includes('brasil') &&
    !cleanAddress.toLowerCase().includes('brazil')
  ) {
    cleanAddress += ', Brasil';
  }
  return encodeURIComponent(cleanAddress);
}

export async function openGoogleMaps(address: string): Promise<void> {
  const query = formatAddressForQuery(address);
  // No Android, geo:0,0?q= exibe o pino direto no endereço no Brasil (mesmo no emulador)
  const url = Platform.select({
    ios: `comgooglemaps://?q=${query}`,
    android: `geo:0,0?q=${query}`,
    default: `https://www.google.com/maps/search/?api=1&query=${query}`,
  });

  const webUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      await Linking.openURL(webUrl);
    }
  } catch (error) {
    await Linking.openURL(webUrl);
  }
}

export async function openWaze(address: string): Promise<void> {
  const query = formatAddressForQuery(address);
  const url = `https://waze.com/ul?q=${query}&navigate=yes`;

  try {
    await Linking.openURL(url);
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível abrir o aplicativo Waze.');
  }
}
