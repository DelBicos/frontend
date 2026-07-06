import { Assets as NavigationAssets } from '@react-navigation/elements';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { useFonts } from 'expo-font';
import { Navigation } from '@screens/NavigationStack';
import { navigationRef } from '@screens/navigationRef';
import { LocationProvider } from '@lib/hooks/LocationContext';
import { MenuProvider } from 'react-native-popup-menu';
import { ThemeProvider, useColors } from '@theme/ThemeProvider';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { initGAWeb } from './utils/ga-web';
import { initClarityWeb } from './utils/clarity';
import { GOOGLE_ANALYTICS_ID, CLARITY_ID } from './config/varEnvs';
import VLibrasSetup from '@components/features/Accessibility/VLibrasSetup';
import { registerTokenProvider } from '@lib/helpers/httpClient';
import { useUserStore } from '@stores/User';
import { useThemeStore } from '@stores/Theme';
import { ThemeMode } from '@stores/Theme/types';

import { AuthProvider } from '@lib/hooks/AuthContext';
import { ChatWidget } from '@components/features/ChatBot/ChatWidget';

// Pre-carrega assets de navegação com captura de erro resiliente
Asset.loadAsync([...NavigationAssets]).catch(() => {});

SplashScreen.preventAutoHideAsync().catch(() => {});

function NotificationManager() {
  return null;
}

registerTokenProvider(() => useUserStore.getState().token);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});

function AppContent() {
  const theme = useThemeStore((state) => state.theme);
  const colors = useColors();
  const { user } = useUserStore();
  const isDark = theme === ThemeMode.DARK;

  const navTheme = React.useMemo(
    () => ({
      dark: isDark,
      colors: {
        primary: colors.primaryOrange,
        background: colors.secondaryGray,
        card: colors.cardBackground,
        text: colors.primaryBlack,
        border: colors.borderColor,
        notification: colors.primaryOrange,
      },
      fonts: {
        regular: { fontFamily: 'Afacad-Regular', fontWeight: '400' as const },
        medium: { fontFamily: 'Afacad-SemiBold', fontWeight: '600' as const },
        bold: { fontFamily: 'Afacad-Bold', fontWeight: '700' as const },
        heavy: { fontFamily: 'Afacad-Bold', fontWeight: '900' as const },
      },
    }),
    [isDark, colors],
  );

  return (
    <View
      style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      {Platform.OS !== 'web' && (
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.cardBackground}
          translucent={false}
        />
      )}
      <SafeAreaView
        style={styles.safeArea}
        edges={Platform.OS !== 'web' ? ['top', 'bottom'] : []}>
        <LocationProvider>
          <VLibrasSetup />
          <NotificationManager />
          <View style={styles.safeArea}>
            <Navigation
              ref={navigationRef}
              theme={navTheme}
              linking={{
                enabled: 'auto',
                prefixes: ['delbicos://'],
              }}
              onReady={() => {
                SplashScreen.hideAsync().catch(() => {});
              }}
            />
            {!!user && (
              <ChatWidget
                bottomOffset={Platform.OS === 'web' ? 24 : 80}
              />
            )}
          </View>
        </LocationProvider>
      </SafeAreaView>
    </View>
  );
}

export function App() {
  const [loaded, error] = useFonts({
    'Afacad-Regular': require('@assets/fonts/Afacad/Afacad-Regular.otf'),
    'Afacad-SemiBold': require('@assets/fonts/Afacad/Afacad-SemiBold.otf'),
    'Afacad-Bold': require('@assets/fonts/Afacad/Afacad-Bold.otf'),
    'CenturyGothic-Regular': require('@assets/fonts/CenturyGothic/Century-Gothic.otf'),
    'CenturyGothic-Bold': require('@assets/fonts/CenturyGothic/Century-Gothic-Bold.otf'),
    'CenturyGothic-BoldItalic': require('@assets/fonts/CenturyGothic/Century-Gothic-Bold-Italic.otf'),
    'CenturyGothic-Italic': require('@assets/fonts/CenturyGothic/Century-Gothic-Italic.otf'),
  });

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      if (GOOGLE_ANALYTICS_ID) {
        initGAWeb(GOOGLE_ANALYTICS_ID);
      }
      if (CLARITY_ID) {
        initClarityWeb(CLARITY_ID);
      }
    }
  }, []);

  if (!loaded || error) {
    return null;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <MenuProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </MenuProvider>
    </SafeAreaProvider>
  );
}

export default App;
