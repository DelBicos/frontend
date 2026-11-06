import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
import { Address } from '@stores/Professional/types';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';

export type SobreContentProps = {
  nome: string;
  descricao?: string;
  endereco?: Address;
  raioKm?: number | null;
  desde?: string;
  totalServicos: number;
  totalAvaliacoes: number;
};

type IconName = React.ComponentProps<typeof FontAwesome>['name'];

export function SobreContent({
  nome,
  descricao,
  endereco,
  raioKm,
  desde,
  totalServicos,
  totalAvaliacoes,
}: SobreContentProps) {
  const colors = useColors();
  const { isCompact } = useBreakpoint();
  const styles = createStyles(colors, isCompact);

  const local = endereco
    ? [endereco.neighborhood, `${endereco.city} - ${endereco.state}`]
        .filter(Boolean)
        .join(', ')
    : null;
  const anoDesde = desde ? new Date(desde).getFullYear() : null;

  const facts: { icon: IconName; label: string; value: string }[] = [
    local ? { icon: 'map-marker', label: 'Região', value: local } : null,
    {
      icon: 'road',
      label: 'Atendimento',
      value: raioKm
        ? `Até ${raioKm} km de distância`
        : 'Sem limite de distância',
    },
    anoDesde
      ? {
          icon: 'calendar',
          label: 'No DelBicos desde',
          value: String(anoDesde),
        }
      : null,
    {
      icon: 'wrench',
      label: 'Serviços oferecidos',
      value: String(totalServicos),
    },
    {
      icon: 'star-o',
      label: 'Avaliações',
      value: String(totalAvaliacoes),
    },
  ].filter(Boolean) as { icon: IconName; label: string; value: string }[];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text
          style={styles.title}
          accessibilityRole="header"
          {...({ 'aria-level': 2 } as object)}>
          Apresentação
        </Text>
        <Text style={descricao ? styles.text : styles.muted}>
          {descricao ||
            `${nome.split(' ')[0]} ainda não escreveu uma apresentação.`}
        </Text>
      </View>

      <View style={styles.facts}>
        {facts.map((fact) => (
          <View key={fact.label} style={styles.factCell}>
            <View style={styles.fact}>
              <FontAwesome
                name={fact.icon}
                size={18}
                color={colors.textSecondary}
              />
              <View style={styles.factTexts}>
                <Text style={styles.factLabel}>{fact.label}</Text>
                <Text style={styles.factValue}>{fact.value}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const GAP = 12;

const createStyles = (colors: ColorsType, isCompact: boolean) =>
  StyleSheet.create({
    container: {
      gap: 16,
    },
    card: {
      gap: 8,
      padding: 20,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    title: {
      fontFamily: 'Afacad-Bold',
      fontSize: 20,
      color: colors.primaryBlack,
    },
    text: {
      fontFamily: 'Afacad-Regular',
      fontSize: 17,
      lineHeight: 26,
      color: colors.primaryBlack,
    },
    muted: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      color: colors.textSecondary,
    },
    facts: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -GAP / 2,
      rowGap: GAP,
    },
    factCell: {
      width: isCompact ? '100%' : '50%',
      paddingHorizontal: GAP / 2,
    },
    fact: {
      flexGrow: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 16,
      borderRadius: 14,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    factTexts: {
      flex: 1,
    },
    factLabel: {
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      color: colors.textSecondary,
    },
    factValue: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 17,
      color: colors.primaryBlack,
    },
  });
