import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
import { useThemeStore, ThemeMode } from '@stores/Theme';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import LogoV3 from '@assets/LogoV3.png';
import LogoLight from '@assets/DelBicos_LogoH.png';
import LogoDark from '../../../../assets/DelBicos_git.png';

interface AuthLayoutProps {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  /** Largura maxima do formulario (o cadastro usa mais). */
  maxWidth?: number;
  /** Acao do "Voltar" (padrao: tela anterior ou inicio). */
  onBack?: () => void;
}

const BENEFITS: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  text: string;
}[] = [
  { icon: 'search', text: 'Encontre profissionais perto de você' },
  { icon: 'calendar-check-o', text: 'Agende e pague pelo app, com segurança' },
  { icon: 'comments-o', text: 'Converse direto com quem vai te atender' },
];

/**
 * Moldura das telas de entrar, cadastro, verificacao e senha: painel da
 * marca ao lado no desktop, formulario centralizado no celular.
 */
function AuthLayout({
  title,
  subtitle,
  children,
  maxWidth = 440,
  onBack,
}: AuthLayoutProps) {
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);
  const navigation = useNavigation<any>();
  const { isExpanded, isCompact, gutter } = useBreakpoint();
  const styles = createStyles(colors, isCompact);

  const goBack =
    onBack ??
    (() => {
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    });

  const backButton = (
    <Pressable
      onPress={goBack}
      style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      hitSlop={8}>
      <FontAwesome
        name="arrow-left"
        size={16}
        color={isExpanded ? '#000000' : colors.primaryBlack}
      />
      <Text style={[styles.backText, isExpanded && styles.backTextOnBrand]}>
        Voltar
      </Text>
    </Pressable>
  );

  const form = (
    <View style={[styles.form, { maxWidth }]}>
      {!isExpanded ? (
        <Image
          source={theme === ThemeMode.DARK ? LogoDark : LogoLight}
          style={styles.logoSmall}
          resizeMode="contain"
          accessibilityLabel="DelBicos"
        />
      ) : null}
      <Text
        style={styles.title}
        accessibilityRole="header"
        {...({ 'aria-level': 1 } as object)}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.body}>{children}</View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {isExpanded ? (
        <View style={styles.brand}>
          {backButton}
          <View style={styles.brandContent}>
            <Image
              source={LogoV3}
              style={styles.logoLarge}
              resizeMode="contain"
              accessibilityLabel="DelBicos"
            />
            <Text style={styles.brandTitle}>
              Serviços de confiança, perto de você.
            </Text>
            <View style={styles.benefits}>
              {BENEFITS.map((b) => (
                <View key={b.text} style={styles.benefit}>
                  <View style={styles.benefitIcon}>
                    <FontAwesome name={b.icon} size={18} color="#000000" />
                  </View>
                  <Text style={styles.benefitText}>{b.text}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ) : null}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: gutter },
        ]}
        keyboardShouldPersistTaps="handled">
        {!isExpanded ? <View style={styles.topBar}>{backButton}</View> : null}
        {form}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ColorsType, isCompact: boolean) =>
  StyleSheet.create({
    root: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: colors.secondaryGray,
    },

    // --- Painel da marca (desktop) ---
    brand: {
      width: '42%',
      maxWidth: 620,
      backgroundColor: colors.primaryOrange,
      padding: 40,
    },
    brandContent: {
      flex: 1,
      justifyContent: 'center',
      gap: 28,
      maxWidth: 440,
    },
    logoLarge: {
      width: 160,
      height: 170,
    },
    brandTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 36,
      lineHeight: 42,
      color: '#000000',
    },
    benefits: {
      gap: 16,
    },
    benefit: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    benefitIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.45)',
    },
    benefitText: {
      flex: 1,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 19,
      color: '#000000',
    },

    // --- Formulario ---
    scroll: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingVertical: isCompact ? 16 : 40,
    },
    topBar: {
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
      marginBottom: 8,
    },
    back: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 8,
      minHeight: 44,
    },
    backText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 17,
      color: colors.primaryBlack,
    },
    backTextOnBrand: {
      color: '#000000',
    },
    form: {
      width: '100%',
      alignSelf: 'center',
    },
    logoSmall: {
      width: 170,
      height: 52,
      alignSelf: 'center',
      marginBottom: isCompact ? 20 : 28,
    },
    title: {
      fontFamily: 'Afacad-Bold',
      fontSize: isCompact ? 30 : 36,
      lineHeight: isCompact ? 36 : 42,
      color: colors.primaryBlack,
    },
    subtitle: {
      marginTop: 6,
      fontFamily: 'Afacad-Regular',
      fontSize: 17,
      lineHeight: 24,
      color: colors.textSecondary,
    },
    body: {
      marginTop: 24,
    },
  });

export default AuthLayout;
