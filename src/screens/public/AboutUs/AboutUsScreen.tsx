import React, { useMemo, useState } from 'react';
import { Image, Linking, Pressable, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import PageContainer from '@components/layout/PageContainer';
import SectionHeader from '@components/ui/SectionHeader';
import { Developer, developers } from './aboutUsData';
import { createStyles } from './styles';

const teamPhoto = require('@assets/aboutus/TeamDelbicos-profile.png');
// Proporcao da imagem original (631 x 520).
const TEAM_PHOTO_RATIO = 631 / 520;

const VALUES = [
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
] as const;

/** Largura a partir da qual os desenvolvedores ficam em 4 colunas. */
const WIDE_TEAM_MIN_WIDTH = 1100;

function AboutUsScreen() {
  const colors = useColors();
  const { isCompact, isExpanded, contentWidth } = useBreakpoint();
  const styles = useMemo(
    () => createStyles(colors, isCompact, isExpanded),
    [colors, isCompact, isExpanded],
  );

  // A altura da foto e calculada a partir da largura medida: altura e
  // aspect-ratio em % se comportavam diferente entre navegadores.
  const [photoWidth, setPhotoWidth] = useState(0);

  const teamColumns = isCompact
    ? 1
    : contentWidth >= WIDE_TEAM_MIN_WIDTH
      ? 4
      : isExpanded
        ? 3
        : 2;

  return (
    <PageContainer>
      {/* Apresentacao */}
      <View style={styles.hero}>
        <View style={styles.heroTexts}>
          <Text style={styles.eyebrow}>Quem Somos</Text>
          <Text
            style={styles.heroTitle}
            accessibilityRole="header"
            {...({ 'aria-level': 1 } as object)}>
            Tecnologia que aproxima vizinhos
          </Text>
          <Text style={styles.paragraph}>
            Somos uma empresa de tecnologia focada em desenvolver soluções
            digitais que geram impacto social real e transformam a dinâmica das
            cidades. Nosso propósito é utilizar a inovação para encurtar
            distâncias, fomentar a economia local e promover a sustentabilidade.
          </Text>
          <Text style={styles.paragraph}>
            O DelBicos é a materialização dessa visão: uma plataforma que une
            clientes e trabalhadores informais da mesma vizinhança,
            transformando a dificuldade de captação de clientes e a insegurança
            na contratação em uma rede local eficiente, confiável e acessível.
          </Text>
        </View>
        <View
          style={styles.heroPhotoWrapper}
          onLayout={(e) => setPhotoWidth(e.nativeEvent.layout.width)}>
          <Image
            source={teamPhoto}
            style={
              photoWidth
                ? { width: photoWidth, height: photoWidth / TEAM_PHOTO_RATIO }
                : // Antes da primeira medicao.
                  { width: '100%', aspectRatio: TEAM_PHOTO_RATIO }
            }
            resizeMode="contain"
            accessibilityLabel="Foto da equipe DelBicos, oito pessoas com camisetas pretas do projeto"
          />
        </View>
      </View>

      {/* Valores */}
      <View style={styles.section}>
        <SectionHeader title="No que acreditamos" />
        <View style={styles.valuesRow}>
          {VALUES.map((value) => (
            <View key={value.title} style={styles.valueCard}>
              <View style={styles.valueIcon}>
                <FontAwesome name={value.icon} size={20} color="#000000" />
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

      {/* Equipe */}
      <View style={styles.section}>
        <SectionHeader
          title="Quem faz o DelBicos"
          subtitle={`${developers.length} pessoas desenvolvendo o projeto de ponta a ponta: design, frontend, backend e dados.`}
        />
        <View style={styles.teamGrid}>
          {developers.map((dev) => (
            <View
              key={dev.id}
              style={[styles.teamCell, { width: `${100 / teamColumns}%` }]}>
              <DeveloperCard dev={dev} styles={styles} />
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.footer}>
        © DelBicos {new Date().getFullYear()}. Todos os direitos reservados.
      </Text>
    </PageContainer>
  );
}

interface DeveloperCardProps {
  dev: Developer;
  styles: ReturnType<typeof createStyles>;
}

function DeveloperCard({ dev, styles }: DeveloperCardProps) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  const links = [
    { url: dev.linkedin, icon: 'linkedin', label: 'LinkedIn' },
    { url: dev.github, icon: 'github', label: 'GitHub' },
    { url: dev.portfolio, icon: 'globe', label: 'Portfólio' },
  ].filter((link) => !!link.url);

  return (
    <View style={styles.devCard}>
      <Image
        source={dev.photo}
        style={styles.devPhoto}
        accessibilityLabel={`Foto de ${dev.name}`}
      />
      <Text
        style={styles.devName}
        accessibilityRole="header"
        {...({ 'aria-level': 3 } as object)}>
        {dev.name}
      </Text>
      <Text style={styles.devRole}>{dev.role}</Text>
      <Text style={styles.devBio} numberOfLines={expanded ? undefined : 4}>
        {dev.bio}
      </Text>
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={styles.readMore}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${expanded ? 'Ler menos' : 'Ler mais'} sobre ${dev.name}`}>
        <Text style={styles.readMoreText}>
          {expanded ? 'Ler menos' : 'Ler mais'}
        </Text>
      </Pressable>
      <View style={styles.devLinks}>
        {links.map((link) => (
          <Pressable
            key={link.label}
            onPress={() => Linking.openURL(link.url!)}
            style={({ pressed, hovered }: any) => [
              styles.devLink,
              (pressed || hovered) && styles.devLinkActive,
            ]}
            accessibilityRole="link"
            accessibilityLabel={`${link.label} de ${dev.name}`}>
            <FontAwesome
              name={link.icon as any}
              size={20}
              color={colors.primaryBlack}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default AboutUsScreen;
