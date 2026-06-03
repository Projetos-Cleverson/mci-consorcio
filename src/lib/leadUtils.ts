import { LeadTemperature, ProfileType, QuizAnswer } from '@/types';
import { QUESTIONS } from '@/constants/questions';

export function getAnswerText(answers: QuizAnswer[], questionIndex: number): string {
  const answer = answers.find((item) => item.questionIndex === questionIndex);
  if (!answer) return '';
  return QUESTIONS[questionIndex]?.opcoes[answer.answerIndex]?.text || '';
}

export function getPropertyRange(answers: QuizAnswer[]): string {
  return getAnswerText(answers, 1);
}

export function getDownPaymentRange(answers: QuizAnswer[]): string {
  return getAnswerText(answers, 9);
}

export function getUrgency(answers: QuizAnswer[]): string {
  return getAnswerText(answers, 3);
}

export function getObjective(answers: QuizAnswer[]): string {
  return getAnswerText(answers, 0);
}

export function getIncomeRange(answers: QuizAnswer[]): string {
  return getAnswerText(answers, 6);
}

const profileTagMap: Record<ProfileType, string> = {
  financiamento: 'perfil_consorcio_planejado',
  consorcio: 'perfil_lance_estrategico',
  hibrida: 'perfil_estrategia_patrimonial',
  reorganizacao: 'perfil_troca_upgrade_imobiliario',
  investidor: 'perfil_preparacao_consorcio',
  emocional: 'perfil_analise_aderencia_necessaria',
};

export function classifyTemperature(profile: ProfileType, answers: QuizAnswer[]): LeadTemperature {
  const urgency = getUrgency(answers);
  const renda = getIncomeRange(answers);
  const lance = getDownPaymentRange(answers);
  const organizacao = getAnswerText(answers, 8);

  if (profile === 'emocional') return 'risco';
  if (profile === 'hibrida') return 'premium';
  if (profile === 'investidor') return 'nutricao';
  if (profile === 'consorcio' && (lance.includes('R$ 30') || lance.includes('Acima') || lance.includes('FGTS'))) return 'quente';
  if (profile === 'financiamento' && !urgency.includes('Até 3 meses') && !organizacao.includes('dívidas')) return 'morno';
  if (renda.includes('Acima de R$ 15')) return 'quente';
  return 'morno';
}

export function generateLeadTags(profile: ProfileType, temperature: LeadTemperature, answers: QuizAnswer[]): string[] {
  const tags = new Set<string>([profileTagMap[profile], `lead_${temperature}`, 'mci_consorcio_imobiliario']);
  const lance = getDownPaymentRange(answers);
  const urgencia = getUrgency(answers);
  if (lance.includes('FGTS')) tags.add('possui_fgts');
  if (lance.includes('Não tenho')) tags.add('sem_reserva_lance');
  if (urgencia.includes('Até 3 meses')) tags.add('urgencia_alta');
  if (urgencia.includes('Posso planejar')) tags.add('planejamento_longo');
  return Array.from(tags);
}

export function getRecommendedProduct(profile: ProfileType): string {
  const map: Record<ProfileType, string> = {
    financiamento: 'Consórcio planejado',
    consorcio: 'Estratégia de lance',
    hibrida: 'Estratégia patrimonial por consórcio',
    reorganizacao: 'Troca ou upgrade imobiliário',
    investidor: 'Preparação para consórcio',
    emocional: 'Análise de aderência ao consórcio',
  };
  return map[profile];
}
