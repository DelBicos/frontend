import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '@theme/ThemeProvider';
import { useUserStore } from '@stores/User';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import { normalizeSearchText } from '@lib/hooks/useServiceSearch';
import AccordionItem from '@components/ui/AccordionItem';
import Chip, { ChipGroup } from '@components/ui/Chip';
import SearchField from '@components/ui/SearchField';
import PageContainer, { PageHeader } from '@components/layout/PageContainer';
import { FAQ_TOPICS } from './faqData';
import { createStyles } from './styles';

const CONTENT_WIDTH = 880;

function HelpScreen() {
  const colors = useColors();
  const navigation = useNavigation();
  const user = useUserStore((s) => s.user);
  const { isCompact } = useBreakpoint();
  const styles = useMemo(
    () => createStyles(colors, isCompact),
    [colors, isCompact],
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [topicId, setTopicId] = useState<string | null>(null);

  const term = normalizeSearchText(searchTerm);

  const topics = useMemo(
    () =>
      FAQ_TOPICS.filter((topic) => !topicId || topic.id === topicId)
        .map((topic) => ({
          ...topic,
          questions: term
            ? topic.questions.filter((item) =>
                normalizeSearchText(`${item.q} ${item.a}`).includes(term),
              )
            : topic.questions,
        }))
        .filter((topic) => topic.questions.length > 0),
    [term, topicId],
  );

  const resultCount = topics.reduce((sum, t) => sum + t.questions.length, 0);

  const openAssistant = () => {
    // @ts-ignore
    navigation.navigate(user ? 'ChatBot' : 'Login');
  };

  return (
    <PageContainer maxWidth={CONTENT_WIDTH}>
      <PageHeader
        eyebrow="FAQ"
        title="Central de Ajuda"
        subtitle="Respostas rápidas sobre agendamentos, pagamentos, sua conta e como oferecer seus serviços.">
        <SearchField
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Sobre o que você precisa de ajuda?"
          accessibilityLabel="Buscar nas perguntas frequentes"
        />
      </PageHeader>

      <ChipGroup
        accessibilityLabel="Filtrar por assunto"
        style={styles.chipsGroup}>
        <Chip
          label="Todos"
          selected={topicId == null}
          onPress={() => setTopicId(null)}
        />
        {FAQ_TOPICS.map((topic) => (
          <Chip
            key={topic.id}
            label={topic.title}
            icon={topic.icon as any}
            selected={topicId === topic.id}
            onPress={() =>
              setTopicId((current) => (current === topic.id ? null : topic.id))
            }
          />
        ))}
      </ChipGroup>

      {term ? (
        <Text style={styles.resultCount} accessibilityLiveRegion="polite">
          {resultCount === 0
            ? `Nenhuma pergunta encontrada para “${searchTerm.trim()}”`
            : `${resultCount} ${resultCount === 1 ? 'resposta encontrada' : 'respostas encontradas'}`}
        </Text>
      ) : null}

      {topics.map((topic) => (
        <View key={topic.id} style={styles.topic}>
          <View style={styles.topicHeader}>
            <View style={styles.topicIcon}>
              <FontAwesome
                name={topic.icon as any}
                size={18}
                color={'#000000'}
              />
            </View>
            <Text
              style={styles.topicTitle}
              accessibilityRole="header"
              {...({ 'aria-level': 2 } as object)}>
              {topic.title}
            </Text>
          </View>
          {topic.questions.map((item) => (
            // A chave muda com a busca para abrir as respostas encontradas.
            <AccordionItem
              key={`${item.id}-${term ? 'open' : 'closed'}`}
              title={item.q}
              defaultOpen={!!term}>
              {item.a}
            </AccordionItem>
          ))}
        </View>
      ))}

      <View style={styles.contactCard}>
        <View style={styles.contactTexts}>
          <Text
            style={styles.contactTitle}
            accessibilityRole="header"
            {...({ 'aria-level': 2 } as object)}>
            Ainda precisa de ajuda?
          </Text>
          <Text style={styles.contactText}>
            {user
              ? 'Converse com o assistente virtual do DelBicos: ele tira dúvidas e ajuda a agendar serviços.'
              : 'Entre na sua conta para conversar com o assistente virtual do DelBicos.'}
          </Text>
        </View>
        <Pressable
          onPress={openAssistant}
          style={({ pressed }) => [
            styles.contactButton,
            pressed && { opacity: 0.8 },
          ]}
          accessibilityRole="button">
          <FontAwesome name="comments-o" size={18} color="#000000" />
          <Text style={styles.contactButtonText}>
            {user ? 'Falar com o assistente' : 'Entrar'}
          </Text>
        </Pressable>
      </View>
    </PageContainer>
  );
}

export default HelpScreen;
