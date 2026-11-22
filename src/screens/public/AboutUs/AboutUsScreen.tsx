import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ImageBackground,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { createStyles } from './styles';
import { developers } from './aboutUsData';
import { useColors } from '@theme/ThemeProvider';
import { useThemeStore, ThemeMode } from '@stores/Theme';

import type { FontAwesomeName } from '@utils/iconNames';

const teamPhoto = require('@assets/aboutus/TeamDelbicos-profile.png');
const hexBackImage = require('@assets/aboutus/hex-back2.png');
const lineDelbicos = require('@assets/aboutus/line-delbicos.png');
const gitIcon = require('@assets/aboutus/git-icon.png');
const linkIcon = require('@assets/aboutus/link-icon.png');
const portIcon = require('@assets/aboutus/port-icon.png');

const TEAM_PHOTO_LABEL =
  'Logo DelBicos e foto dos três integrantes da equipe com as camisetas do projeto';

const VALUES: { icon: FontAwesomeName; title: string; text: string }[] = [
  {
    icon: 'map-marker',
    title: 'Economia local',
    text: 'Conectamos clientes e trabalhadores informais da mesma vizinhança, fortalecendo quem está perto.',
  },
  {
    icon: 'shield',
    title: 'Confiança',
    text: 'Pagamento seguro, avaliações e conversa direta para contratar sem insegurança.',
  },
  {
    icon: 'universal-access',
    title: 'Acessibilidade',
    text: 'Tecnologia para todos: temas de alto contraste, Libras e navegação por leitores de tela.',
  },
];

function AboutUsScreen() {
  const colors = useColors();
  const { theme } = useThemeStore();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isDark = theme === ThemeMode.DARK;
  const isHighContrast = theme === ThemeMode.LIGHT_HI_CONTRAST;
  const styles = createStyles(colors, isMobile, isDark, isHighContrast);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}>
      {/* Mission section */}
      <View style={styles.missionWrapper}>
        {/* Card with title inside */}
        <ImageBackground
          source={hexBackImage}
          style={styles.missionCard}
          imageStyle={{ resizeMode: 'cover', top: -60 }}>
          <Text
            style={styles.pageTitle}
            accessibilityRole="header"
            {...({ 'aria-level': 1 } as object)}>
            Quem Somos
          </Text>
          <View style={styles.missionRow}>
            <View style={styles.missionPhotoCol}>
              <Image
                source={teamPhoto}
                style={styles.teamPhoto}
                resizeMode="cover"
                accessibilityLabel={TEAM_PHOTO_LABEL}
              />
            </View>
            <View style={styles.missionTextCol}>
              <Text style={styles.missionText}>
                Somos uma empresa de tecnologia focada em desenvolver soluções
                digitais que geram impacto social real e transformam a dinâmica
                das cidades. Nosso propósito é utilizar a inovação para encurtar
                distâncias, fomentar a economia local e promover a
                sustentabilidade.
              </Text>
              <Text style={styles.missionText}>
                O DelBicos é a materialização dessa visão: uma plataforma que
                une clientes e trabalhadores informais da mesma vizinhança,
                transformando a dificuldade de captação de clientes e a
                insegurança na contratação em uma rede local eficiente,
                confiável e acessível.
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Values */}
      <View style={styles.valuesSection}>
        <Text
          style={styles.valuesTitle}
          accessibilityRole="header"
          {...({ 'aria-level': 2 } as object)}>
          No que acreditamos
        </Text>
        <View style={styles.valuesRow}>
          {VALUES.map((value) => (
            <View key={value.title} style={styles.valueCard}>
              <View style={styles.valueIcon}>
                <FontAwesome
                  name={value.icon}
                  size={18}
                  color={isDark ? colors.primaryWhite : colors.primaryBlack}
                />
              </View>
              <Text
                style={styles.valueTitle}
                accessibilityRole="header"
                {...({ 'aria-level': 3 } as object)}>
                {value.title}
              </Text>
              <Text style={styles.valueText}>{value.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Developers Banner */}
      <View style={styles.developersBanner}>
        <Text
          style={styles.developersBannerTitle}
          accessibilityRole="header"
          {...({ 'aria-level': 2 } as object)}>
          Desenvolvedores
        </Text>
      </View>

      {/* Developer Cards */}
      {developers.map((dev, index) => (
        <React.Fragment key={dev.id}>
          <View
            style={[
              styles.developerCard,
              !isMobile && index % 2 !== 0 && styles.developerCardReversed,
            ]}>
            <View style={styles.developerPhotoWrapper}>
              <Image
                source={dev.photo}
                style={styles.developerPhoto}
                accessibilityLabel={`Foto de ${dev.name}`}
              />
            </View>

            <View style={styles.developerInfo}>
              <Text
                style={[
                  styles.developerName,
                  !isMobile && index % 2 !== 0 && styles.developerNameReversed,
                ]}
                accessibilityRole="header"
                {...({ 'aria-level': 3 } as object)}>
                {dev.name}
              </Text>
              <View
                style={[
                  styles.developerRoleRow,
                  !isMobile &&
                    index % 2 !== 0 &&
                    styles.developerRoleRowReversed,
                ]}>
                <Text style={styles.developerRole}>{dev.role}</Text>
                <View style={styles.developerSocialIcons}>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`LinkedIn de ${dev.name}`}
                    onPress={() =>
                      dev.linkedin ? Linking.openURL(dev.linkedin) : undefined
                    }
                    disabled={!dev.linkedin}
                    style={[
                      styles.socialIconButton,
                      !dev.linkedin && styles.socialIconDisabled,
                    ]}>
                    <Image source={linkIcon} style={styles.socialIcon} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`GitHub de ${dev.name}`}
                    onPress={() =>
                      dev.github ? Linking.openURL(dev.github) : undefined
                    }
                    disabled={!dev.github}
                    style={[
                      styles.socialIconButton,
                      !dev.github && styles.socialIconDisabled,
                    ]}>
                    <Image source={gitIcon} style={styles.socialIcon} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Portfólio de ${dev.name}`}
                    onPress={() =>
                      dev.portfolio ? Linking.openURL(dev.portfolio) : undefined
                    }
                    disabled={!dev.portfolio}
                    style={[
                      styles.socialIconButton,
                      !dev.portfolio && styles.socialIconDisabled,
                    ]}>
                    <Image source={portIcon} style={styles.socialIcon} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.developerBio}>{dev.bio}</Text>
            </View>
          </View>
          {index < developers.length - 1 && (
            <Image
              source={lineDelbicos}
              style={[
                styles.separatorLine,
                index % 2 !== 0 && styles.separatorLineReversed,
              ]}
              resizeMode="contain"
              accessible={false}
            />
          )}
        </React.Fragment>
      ))}

      <Text style={styles.footer}>
        © DelBicos - {new Date().getFullYear()} – Todos os direitos reservados.
      </Text>
    </ScrollView>
  );
}

export default AboutUsScreen;
