import { FAQ_TOPICS } from '../../HelpScreen/faqData';
import { CANCELLATION_TIERS, TERMS_SECTIONS } from '../termsData';

const allTerms = [
  ...TERMS_SECTIONS.flatMap((s) => [
    ...(s.paragraphs ?? []),
    ...(s.items ?? []),
  ]),
  ...CANCELLATION_TIERS.flatMap((t) => [t.when, t.result]),
].join(' ');
const allFaq = FAQ_TOPICS.flatMap((t) => t.questions.map((q) => q.a)).join(' ');

describe('texto da politica de cancelamento', () => {
  it('os termos trazem os percentuais e prazos definidos', () => {
    expect(allTerms).toMatch(/24 horas ou mais/);
    expect(allTerms).toMatch(/retém 20%/);
    expect(allTerms).toMatch(/retém 30%/);
    expect(allTerms).toMatch(/12 horas de antecedência/);
    expect(allTerms).toMatch(/15 minutos/);
    expect(allTerms).toMatch(/7 dias/);
  });

  it('o FAQ conta a mesma politica dos termos', () => {
    expect(allFaq).toMatch(/20%/);
    expect(allFaq).toMatch(/30%/);
    expect(allFaq).toMatch(/12 horas de antecedência/);
    expect(allFaq).toMatch(/Abrir disputa/);
    expect(allFaq).not.toMatch(/Ainda não é possível cancelar/);
  });

  it('nenhum texto ficou com a regra antiga de 48 horas', () => {
    expect(allTerms + allFaq).not.toMatch(/48 horas|2 dias/);
  });

  it('as perguntas do FAQ tem ids unicos', () => {
    const ids = FAQ_TOPICS.flatMap((t) => t.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
