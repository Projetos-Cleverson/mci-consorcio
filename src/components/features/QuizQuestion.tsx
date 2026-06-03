import { motion } from 'framer-motion';
import { QuestionOption } from '@/constants/questions';

interface QuizQuestionProps {
  pergunta: string;
  opcoes: QuestionOption[];
  selectedAnswer: number | undefined;
  onSelect: (index: number) => void;
}

export default function QuizQuestion({ pergunta, opcoes, selectedAnswer, onSelect }: QuizQuestionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <h2 className="font-display text-xl sm:text-2xl font-semibold text-[var(--deep-blue)] mb-6 text-balance leading-tight">
        {pergunta}
      </h2>
      <div className="space-y-3">
        {opcoes.map((opcao, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 text-sm sm:text-base ${
              selectedAnswer === index
                ? 'border-[var(--green-accent)] bg-[var(--green-accent)]/5 shadow-sm'
                : 'border-[var(--medium-gray)] bg-white hover:border-[var(--deep-blue)]/30 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 size-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  selectedAnswer === index
                    ? 'border-[var(--green-accent)] bg-[var(--green-accent)]'
                    : 'border-gray-300'
                }`}
              >
                {selectedAnswer === index && (
                  <div className="size-2 rounded-full bg-white" />
                )}
              </div>
              <span className={selectedAnswer === index ? 'text-[var(--deep-blue)] font-medium' : 'text-[var(--graphite)]'}>
                {opcao.text}
              </span>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
