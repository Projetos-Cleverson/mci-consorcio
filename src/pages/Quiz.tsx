import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuizStore } from '@/stores/quizStore';
import { QUESTIONS } from '@/constants/questions';
import ProgressBar from '@/components/features/ProgressBar';
import { ArrowLeft, ArrowRight, Building2, Circle, CheckCircle2 } from 'lucide-react';
import { getPartnerDisplayName, usePartnerCompany } from '@/hooks/usePartnerCompany';

export default function Quiz() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const partner = searchParams.get('partner');
  const { partnerCompany } = usePartnerCompany(partner);
  const partnerDisplayName = getPartnerDisplayName(partnerCompany);

  const withPartner = (path: string) =>
    partner ? `${path}?partner=${encodeURIComponent(partner)}` : path;

  const {
    currentStep,
    answers,
    setAnswer,
    nextStep,
    prevStep,
    calculateResult,
  } = useQuizStore();

  const question = QUESTIONS[currentStep];
  const currentAnswer = answers.find((a) => a.questionIndex === currentStep)?.answerIndex;
  const isLastStep = currentStep === QUESTIONS.length - 1;

  const handleSelect = (index: number) => {
    setAnswer(currentStep, index);
  };

  const handleNext = () => {
    const savedAnswer = answers.find((a) => a.questionIndex === currentStep)?.answerIndex;

    if (savedAnswer === undefined) {
      return;
    }

    if (isLastStep) {
      calculateResult();
      navigate(withPartner('/dados'));
      return;
    }

    nextStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    if (currentStep === 0) {
      navigate(partner ? `/?partner=${encodeURIComponent(partner)}` : '/');
      return;
    }

    prevStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--light-gray)]">
      <header className="bg-white border-b border-[var(--medium-gray)] px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--deep-blue)]">
            <Building2 className="size-4 text-white" />
          </div>

          <div className="leading-tight">
            <span className="font-sans text-sm font-semibold text-[var(--deep-blue)]">
              Diagnóstico de Compra Planejada
            </span>

            {partnerDisplayName && (
              <p className="text-[12px] font-semibold text-[var(--deep-blue)]">
                {partnerDisplayName} · Parceiro autorizado
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-[var(--medium-gray)] px-4 py-3">
        <div className="mx-auto max-w-2xl">
          <ProgressBar current={currentStep} total={QUESTIONS.length} />
        </div>
      </div>

      <main className="flex flex-1 items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="mb-7">
            <h1 className="font-display text-[1.7rem] font-bold leading-tight tracking-tight text-[var(--deep-blue)] sm:text-3xl">
              {question.pergunta}
            </h1>
          </div>

          <div className="space-y-3">
            {question.opcoes.map((option, index) => {
              const selected = currentAnswer === index;

              return (
                <button
                  key={`${currentStep}-${index}`}
                  type="button"
                  onClick={() => handleSelect(index)}
                  aria-pressed={selected}
                  className={[
                    'flex w-full items-center gap-4 rounded-2xl border bg-white px-4 py-4 text-left transition-all duration-150',
                    'hover:border-[var(--deep-blue)] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--deep-blue)]/20',
                    selected
                      ? 'border-[var(--deep-blue)] bg-white shadow-sm ring-1 ring-[var(--deep-blue)]'
                      : 'border-[var(--medium-gray)]',
                  ].join(' ')}
                >
                  <span className="flex size-5 shrink-0 items-center justify-center text-[var(--deep-blue)]">
                    {selected ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <Circle className="size-5 text-slate-300" />
                    )}
                  </span>

                  <span className="text-base font-medium leading-relaxed text-[var(--deep-blue)]">
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <div className="sticky bottom-0 border-t border-[var(--medium-gray)] bg-white px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--graphite)] transition-colors hover:bg-gray-100"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentAnswer === undefined}
            className="flex items-center gap-2 rounded-lg bg-[#C47A21] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#E0A84B] hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLastStep ? 'Ver resultado' : 'Próxima'}
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
