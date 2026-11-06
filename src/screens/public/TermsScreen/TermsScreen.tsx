import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PageContainer, { PageHeader } from '@components/layout/PageContainer';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
import { CANCELLATION_TIERS, TERMS_SECTIONS } from './termsData';

function TermsScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <PageContainer maxWidth={760}>
      <PageHeader
        title="Termos de uso"
        subtitle="Como funcionam agendamento, pagamento, cancelamento e disputas no DelBicos."
      />
      {TERMS_SECTIONS.map((section) => (
        <View key={section.id} style={styles.section}>
          <Text
            style={styles.heading}
            accessibilityRole="header"
            {...({ 'aria-level': 2 } as object)}>
            {section.title}
          </Text>
          {section.paragraphs?.map((text) => (
            <Text key={text} style={styles.paragraph}>
              {text}
            </Text>
          ))}
          {section.items?.map((text) => (
            <View key={text} style={styles.item}>
              <Text style={styles.bullet}>•</Text>
              <Text style={[styles.paragraph, styles.itemText]}>{text}</Text>
            </View>
          ))}
          {section.id === 'cancelamento-cliente' ? (
            <View
              style={styles.table}
              accessibilityRole="summary"
              accessibilityLabel="Tabela de cancelamento pelo cliente">
              {CANCELLATION_TIERS.map((tier) => (
                <View key={tier.when} style={styles.row}>
                  <Text style={styles.when}>{tier.when}</Text>
                  <Text style={styles.result}>{tier.result}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ))}
    </PageContainer>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    section: { marginBottom: 24, gap: 8 },
    heading: {
      fontFamily: 'Afacad-Bold',
      fontSize: 22,
      color: colors.primaryBlack,
    },
    paragraph: {
      fontFamily: 'Afacad-Regular',
      fontSize: 17,
      lineHeight: 25,
      color: colors.primaryBlack,
    },
    item: { flexDirection: 'row', gap: 8 },
    itemText: { flex: 1 },
    bullet: {
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
      lineHeight: 25,
      color: colors.primaryOrange,
    },
    table: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      overflow: 'hidden',
      marginTop: 4,
    },
    row: {
      padding: 14,
      gap: 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
    },
    when: {
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    result: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      lineHeight: 22,
      color: colors.textSecondary,
    },
  });

export default TermsScreen;
