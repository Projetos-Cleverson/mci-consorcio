import { ProfileType } from '@/types';

export interface QuestionOption {
  text: string;
  scores: Partial<Record<ProfileType, number>>;
}

export interface Question {
  pergunta: string;
  opcoes: QuestionOption[];
}

/**
 * Mapeamento interno dos perfis para reaproveitar a estrutura visual do MCI Imobiliário:
 * financiamento  -> Consórcio Planejado
 * consorcio       -> Lance Estratégico
 * hibrida         -> Estratégia Patrimonial
 * reorganizacao   -> Troca ou Upgrade Imobiliário
 * investidor      -> Preparação para Consórcio
 * emocional       -> Análise de Aderência Necessária
 */
export const QUESTIONS: Question[] = [
  {
    pergunta: 'Qual é o seu principal objetivo com o imóvel?',
    opcoes: [
      { text: 'Comprar para morar', scores: { financiamento: 3 } },
      { text: 'Sair do aluguel', scores: { financiamento: 3 } },
      { text: 'Investir em imóvel', scores: { hibrida: 4 } },
      { text: 'Comprar para um familiar', scores: { financiamento: 2, hibrida: 1 } },
      { text: 'Trocar ou melhorar de imóvel', scores: { reorganizacao: 4 } },
      { text: 'Ainda estou avaliando', scores: { investidor: 2, emocional: 1 } },
    ],
  },
  {
    pergunta: 'Você já tem uma faixa de valor de imóvel em mente?',
    opcoes: [
      { text: 'Até R$ 200 mil', scores: { investidor: 1 } },
      { text: 'De R$ 200 mil a R$ 350 mil', scores: { financiamento: 1 } },
      { text: 'De R$ 350 mil a R$ 500 mil', scores: { financiamento: 1, consorcio: 1 } },
      { text: 'De R$ 500 mil a R$ 800 mil', scores: { hibrida: 1, consorcio: 1 } },
      { text: 'Acima de R$ 800 mil', scores: { hibrida: 2, consorcio: 1 } },
      { text: 'Ainda não sei', scores: { investidor: 2 } },
    ],
  },
  {
    pergunta: 'Você já tem um imóvel específico em vista?',
    opcoes: [
      { text: 'Sim, já tenho imóvel escolhido', scores: { emocional: 2, financiamento: 1 } },
      { text: 'Tenho algumas opções em análise', scores: { financiamento: 2 } },
      { text: 'Ainda estou pesquisando', scores: { financiamento: 2 } },
      { text: 'Não tenho imóvel definido', scores: { financiamento: 1, investidor: 1 } },
      { text: 'Quero primeiro entender meu poder de compra', scores: { investidor: 2, financiamento: 1 } },
    ],
  },
  {
    pergunta: 'Em quanto tempo você gostaria de comprar?',
    opcoes: [
      { text: 'Até 3 meses', scores: { emocional: 5 } },
      { text: 'De 3 a 6 meses', scores: { emocional: 3, consorcio: 1 } },
      { text: 'De 6 a 12 meses', scores: { financiamento: 2, consorcio: 2 } },
      { text: 'De 1 a 2 anos', scores: { financiamento: 3, hibrida: 1 } },
      { text: 'Posso planejar com mais calma', scores: { financiamento: 3, hibrida: 2 } },
    ],
  },
  {
    pergunta: 'O quanto essa compra é urgente para você hoje?',
    opcoes: [
      { text: 'Muito urgente, preciso resolver logo', scores: { emocional: 5 } },
      { text: 'Tenho certa urgência, mas posso avaliar opções', scores: { emocional: 2, financiamento: 1 } },
      { text: 'Quero comprar, mas posso planejar', scores: { financiamento: 3 } },
      { text: 'Não tenho pressa', scores: { financiamento: 2, hibrida: 2 } },
      { text: 'Estou apenas estudando possibilidades', scores: { investidor: 2 } },
    ],
  },
  {
    pergunta: 'Se a melhor estratégia exigisse planejamento antes da compra, como você se sentiria?',
    opcoes: [
      { text: 'Eu não aceitaria esperar', scores: { emocional: 5 } },
      { text: 'Eu teria dificuldade, mas avaliaria', scores: { emocional: 2, financiamento: 1 } },
      { text: 'Eu aceitaria se fizesse sentido', scores: { financiamento: 3 } },
      { text: 'Eu prefiro planejar com segurança', scores: { financiamento: 3, hibrida: 2 } },
      { text: 'Ainda não sei', scores: { investidor: 2, emocional: 1 } },
    ],
  },
  {
    pergunta: 'Qual é a sua faixa de renda familiar mensal?',
    opcoes: [
      { text: 'Até R$ 3 mil', scores: { investidor: 2 } },
      { text: 'De R$ 3 mil a R$ 6 mil', scores: { financiamento: 1, investidor: 1 } },
      { text: 'De R$ 6 mil a R$ 10 mil', scores: { financiamento: 2, consorcio: 1 } },
      { text: 'De R$ 10 mil a R$ 15 mil', scores: { financiamento: 2, consorcio: 2, hibrida: 1 } },
      { text: 'Acima de R$ 15 mil', scores: { hibrida: 2, consorcio: 2 } },
      { text: 'Prefiro não informar agora', scores: { investidor: 1 } },
    ],
  },
  {
    pergunta: 'Qual parcela mensal você considera confortável para um plano imobiliário?',
    opcoes: [
      { text: 'Até R$ 800', scores: { investidor: 2 } },
      { text: 'De R$ 800 a R$ 1.500', scores: { financiamento: 1, investidor: 1 } },
      { text: 'De R$ 1.500 a R$ 2.500', scores: { financiamento: 2 } },
      { text: 'De R$ 2.500 a R$ 4.000', scores: { financiamento: 2, consorcio: 1 } },
      { text: 'Acima de R$ 4.000', scores: { hibrida: 2, consorcio: 1 } },
      { text: 'Ainda não sei', scores: { investidor: 2 } },
    ],
  },
  {
    pergunta: 'Como você avalia sua organização financeira hoje?',
    opcoes: [
      { text: 'Muito organizada', scores: { financiamento: 2, consorcio: 2, hibrida: 1 } },
      { text: 'Razoavelmente organizada', scores: { financiamento: 2 } },
      { text: 'Tenho renda, mas preciso organizar melhor', scores: { investidor: 3 } },
      { text: 'Tenho dívidas ou compromissos que pesam', scores: { investidor: 4, emocional: 1 } },
      { text: 'Ainda não tenho clareza sobre isso', scores: { investidor: 3, emocional: 1 } },
    ],
  },
  {
    pergunta: 'Você possui algum valor reservado para entrada, lance ou complemento?',
    opcoes: [
      { text: 'Não tenho valor reservado', scores: { investidor: 4 } },
      { text: 'Até R$ 10 mil', scores: { investidor: 2, financiamento: 1 } },
      { text: 'De R$ 10 mil a R$ 30 mil', scores: { consorcio: 2, financiamento: 1 } },
      { text: 'De R$ 30 mil a R$ 70 mil', scores: { consorcio: 4 } },
      { text: 'Acima de R$ 70 mil', scores: { consorcio: 5, hibrida: 1 } },
      { text: 'Tenho FGTS ou outro recurso que poderia avaliar', scores: { consorcio: 4, reorganizacao: 1 } },
    ],
  },
  {
    pergunta: 'Você já possui imóvel, veículo quitado, investimento ou patrimônio que poderia ajudar na estratégia?',
    opcoes: [
      { text: 'Sim, possuo imóvel', scores: { reorganizacao: 4, hibrida: 1 } },
      { text: 'Sim, possuo veículo ou outro bem', scores: { consorcio: 2, reorganizacao: 1 } },
      { text: 'Sim, possuo investimentos ou reserva', scores: { consorcio: 3, hibrida: 2 } },
      { text: 'Tenho FGTS', scores: { consorcio: 2, reorganizacao: 1 } },
      { text: 'Não possuo patrimônio relevante hoje', scores: { investidor: 2 } },
      { text: 'Prefiro não informar agora', scores: { investidor: 1 } },
    ],
  },
  {
    pergunta: 'Você teria interesse em usar uma estratégia de lance para tentar antecipar a contemplação?',
    opcoes: [
      { text: 'Sim, tenho interesse e tenho algum recurso', scores: { consorcio: 5 } },
      { text: 'Sim, mas preciso entender melhor', scores: { consorcio: 3, financiamento: 1 } },
      { text: 'Talvez, dependendo da orientação', scores: { consorcio: 2, financiamento: 1 } },
      { text: 'Não tenho recurso para lance agora', scores: { investidor: 2, financiamento: 1 } },
      { text: 'Não sei o que é lance', scores: { investidor: 2, emocional: 1 } },
    ],
  },
  {
    pergunta: 'O que você já sabe sobre consórcio imobiliário?',
    opcoes: [
      { text: 'Conheço bem e já considerei contratar', scores: { financiamento: 2, consorcio: 1 } },
      { text: 'Tenho uma noção básica', scores: { financiamento: 2 } },
      { text: 'Já ouvi falar, mas não entendo direito', scores: { investidor: 2 } },
      { text: 'Tenho dúvidas ou receio', scores: { investidor: 2, emocional: 1 } },
      { text: 'Não conheço praticamente nada', scores: { emocional: 2, investidor: 2 } },
    ],
  },
  {
    pergunta: 'Você entende que no consórcio a contemplação pode acontecer por sorteio ou lance, sem prazo garantido?',
    opcoes: [
      { text: 'Sim, entendo bem', scores: { financiamento: 3, consorcio: 1 } },
      { text: 'Tenho uma noção', scores: { financiamento: 2 } },
      { text: 'Não sabia disso', scores: { emocional: 3, investidor: 1 } },
      { text: 'Tenho dúvida sobre essa parte', scores: { investidor: 2, emocional: 1 } },
      { text: 'Achei que a contemplação fosse rápida ou garantida', scores: { emocional: 5 } },
    ],
  },
  {
    pergunta: 'O que mais te atrai no consórcio imobiliário?',
    opcoes: [
      { text: 'Comprar de forma planejada', scores: { financiamento: 3 } },
      { text: 'Evitar juros de financiamento', scores: { financiamento: 2 } },
      { text: 'Ter acesso a uma carta de crédito', scores: { financiamento: 2, consorcio: 1 } },
      { text: 'Possibilidade de lance', scores: { consorcio: 4 } },
      { text: 'Construir patrimônio no médio/longo prazo', scores: { hibrida: 4 } },
      { text: 'Ainda estou tentando entender', scores: { investidor: 2 } },
    ],
  },
  {
    pergunta: 'O que mais te preocupa em relação ao consórcio?',
    opcoes: [
      { text: 'Demora para contemplar', scores: { emocional: 2 } },
      { text: 'Não entender bem as regras', scores: { investidor: 2 } },
      { text: 'Valor da parcela', scores: { investidor: 2 } },
      { text: 'Medo de não conseguir pagar', scores: { investidor: 3, emocional: 1 } },
      { text: 'Segurança da administradora', scores: { financiamento: 1 } },
      { text: 'Não tenho grande preocupação', scores: { financiamento: 2, consorcio: 1 } },
    ],
  },
  {
    pergunta: 'Você já tentou financiar um imóvel antes?',
    opcoes: [
      { text: 'Sim, fui aprovado', scores: { emocional: 1, financiamento: 1 } },
      { text: 'Sim, fui reprovado', scores: { financiamento: 1, investidor: 1 } },
      { text: 'Sim, mas achei a parcela alta', scores: { financiamento: 2 } },
      { text: 'Não tentei', scores: { financiamento: 1 } },
      { text: 'Não tenho interesse em financiamento', scores: { financiamento: 2, hibrida: 1 } },
      { text: 'Ainda estou avaliando', scores: { investidor: 1 } },
    ],
  },
  {
    pergunta: 'Qual melhor descreve seu momento atual?',
    opcoes: [
      { text: 'Quero comprar logo e estou buscando uma solução rápida', scores: { emocional: 5 } },
      { text: 'Quero comprar, mas aceito planejar se fizer sentido', scores: { financiamento: 4 } },
      { text: 'Quero entender se o consórcio combina comigo', scores: { financiamento: 2, investidor: 1 } },
      { text: 'Quero construir patrimônio com estratégia', scores: { hibrida: 5 } },
      { text: 'Quero trocar ou melhorar meu imóvel', scores: { reorganizacao: 5 } },
      { text: 'Preciso me organizar antes de decidir', scores: { investidor: 5 } },
    ],
  },
];
