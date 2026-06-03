import { create } from 'zustand';
import { QuizAnswer, ProfileScores, ProfileType } from '@/types';
import { QUESTIONS } from '@/constants/questions';

interface QuizState {
  currentStep: number;
  answers: QuizAnswer[];
  scores: ProfileScores;
  perfilPrincipal: ProfileType | null;
  perfilSecundario: ProfileType | null;
  setAnswer: (questionIndex: number, answerIndex: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  calculateResult: () => void;
  reset: () => void;
}

const initialScores: ProfileScores = {
  financiamento: 0,
  consorcio: 0,
  hibrida: 0,
  reorganizacao: 0,
  investidor: 0,
  emocional: 0,
};

function answerIndex(answers: QuizAnswer[], questionIndex: number): number | undefined {
  return answers.find((item) => item.questionIndex === questionIndex)?.answerIndex;
}

function hasAnswer(answers: QuizAnswer[], questionIndex: number, indexes: number[]): boolean {
  const selected = answerIndex(answers, questionIndex);
  return selected !== undefined && indexes.includes(selected);
}

function topProfile(scores: ProfileScores): ProfileType {
  return (Object.entries(scores) as [ProfileType, number][]).sort((a, b) => b[1] - a[1])[0][0];
}

function adjustedScoresWithSignals(scores: ProfileScores, answers: QuizAnswer[]): ProfileScores {
  const adjusted: ProfileScores = { ...scores };

  const urgentNow = hasAnswer(answers, 3, [0]) || hasAnswer(answers, 4, [0]) || hasAnswer(answers, 5, [0]) || hasAnswer(answers, 17, [0]);
  const acceptsPlanning = hasAnswer(answers, 3, [2, 3, 4]) || hasAnswer(answers, 4, [2, 3, 4]) || hasAnswer(answers, 5, [2, 3]);
  const hasLanceResource = hasAnswer(answers, 9, [3, 4, 5]) || hasAnswer(answers, 10, [0, 1, 2, 3]) || hasAnswer(answers, 11, [0, 1, 2]);
  const investmentGoal = hasAnswer(answers, 0, [2]) || hasAnswer(answers, 14, [4]) || hasAnswer(answers, 17, [3]);
  const upgradeGoal = hasAnswer(answers, 0, [4]) || hasAnswer(answers, 17, [4]);
  const lowOrganization = hasAnswer(answers, 8, [2, 3, 4]) || hasAnswer(answers, 7, [5]) || hasAnswer(answers, 9, [0, 1]);
  const wrongExpectation = hasAnswer(answers, 13, [2, 3, 4]) || hasAnswer(answers, 12, [3, 4]) || hasAnswer(answers, 15, [0, 1, 3]);

  if (urgentNow && wrongExpectation) adjusted.emocional += 8;
  if (hasLanceResource && !urgentNow) adjusted.consorcio += 7;
  if (investmentGoal) adjusted.hibrida += 7;
  if (upgradeGoal) adjusted.reorganizacao += 7;
  if (lowOrganization && !hasLanceResource) adjusted.investidor += 6;
  if (acceptsPlanning && !urgentNow) adjusted.financiamento += 5;

  return adjusted;
}

function resolveTie(scores: ProfileScores, answers: QuizAnswer[]): ProfileType {
  const adjusted = adjustedScoresWithSignals(scores, answers);
  const sorted = (Object.entries(adjusted) as [ProfileType, number][]).sort((a, b) => b[1] - a[1]);
  const [first, second] = sorted;

  if (!second || first[1] !== second[1]) return first[0];

  if (hasAnswer(answers, 3, [0]) && hasAnswer(answers, 13, [2, 3, 4])) return 'emocional';
  if (hasAnswer(answers, 9, [3, 4, 5]) || hasAnswer(answers, 11, [0, 1, 2])) return 'consorcio';
  if (hasAnswer(answers, 0, [2]) || hasAnswer(answers, 17, [3])) return 'hibrida';
  if (hasAnswer(answers, 0, [4]) || hasAnswer(answers, 17, [4])) return 'reorganizacao';
  if (hasAnswer(answers, 8, [2, 3, 4])) return 'investidor';
  return 'financiamento';
}

function secondaryProfile(scores: ProfileScores, principal: ProfileType): ProfileType | null {
  const sorted = (Object.entries(scores) as [ProfileType, number][])
    .filter(([profile]) => profile !== principal)
    .sort((a, b) => b[1] - a[1]);

  const principalScore = scores[principal] || 0;
  const candidate = sorted[0];
  if (!candidate || principalScore === 0 || candidate[1] <= 0) return null;
  return candidate[1] >= principalScore * 0.7 || principalScore - candidate[1] <= 6 ? candidate[0] : null;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  currentStep: 0,
  answers: [],
  scores: { ...initialScores },
  perfilPrincipal: null,
  perfilSecundario: null,

  setAnswer: (questionIndex, answerIndex) => {
    set((state) => {
      const newAnswers = state.answers.filter((a) => a.questionIndex !== questionIndex);
      newAnswers.push({ questionIndex, answerIndex });
      return { answers: newAnswers };
    });
  },

  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, QUESTIONS.length - 1) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),

  calculateResult: () => {
    const { answers } = get();
    const scores = { ...initialScores };

    answers.forEach(({ questionIndex, answerIndex }) => {
      const question = QUESTIONS[questionIndex];
      const option = question?.opcoes[answerIndex];
      if (!option) return;
      (Object.keys(option.scores) as ProfileType[]).forEach((profile) => {
        scores[profile] += option.scores[profile] || 0;
      });
    });

    const adjustedScores = adjustedScoresWithSignals(scores, answers);
    const principal = resolveTie(adjustedScores, answers);
    const secundario = secondaryProfile(adjustedScores, principal);

    set({ scores: adjustedScores, perfilPrincipal: principal, perfilSecundario: secundario });

    localStorage.setItem('quiz_scores', JSON.stringify(adjustedScores));
    localStorage.setItem('quiz_principal', principal);
    if (secundario) localStorage.setItem('quiz_secundario', secundario);
    else localStorage.removeItem('quiz_secundario');
    localStorage.setItem('quiz_answers', JSON.stringify(answers));
  },

  reset: () => {
    localStorage.removeItem('quiz_scores');
    localStorage.removeItem('quiz_principal');
    localStorage.removeItem('quiz_secundario');
    localStorage.removeItem('quiz_answers');
    localStorage.removeItem('lead_data');
    set({ currentStep: 0, answers: [], scores: { ...initialScores }, perfilPrincipal: null, perfilSecundario: null });
  },
}));
