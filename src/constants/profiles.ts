import { ProfileResult } from '@/types';

export const PROFILES: ProfileResult[] = [
  {
    id: 'financiamento',
    nome: 'Consórcio Planejado',
    fraseIdentificacao:
      'Seu perfil indica boa aderência ao consórcio imobiliário como estratégia de compra planejada.',
    explicacao:
      'Considerando suas respostas, pode fazer sentido avaliar uma carta de crédito compatível com seu objetivo, sua capacidade mensal e seu prazo. O consórcio pode ser uma alternativa interessante quando existe planejamento, disciplina e clareza sobre contemplação.',
    pontosFavoraveis: [
      'Você demonstra abertura para planejamento.',
      'Seu perfil pode combinar com compra organizada.',
      'O consórcio pode ajudar a transformar intenção de compra em compromisso patrimonial.',
      'Pode fazer sentido avaliar carta, prazo e parcela com calma.',
    ],
    pontosAtencao: [
      'Contemplação não tem prazo garantido.',
      'É importante entender sorteio, lance e regras do grupo.',
      'A parcela precisa caber com segurança na sua renda.',
      'A carta de crédito deve ser compatível com o imóvel desejado.',
    ],
    proximoPasso:
      'Avaliar carta de crédito, parcela, prazo, administradora e possibilidade de lance.',
    cta: 'Quero falar com um consultor',
    ctaMensagem:
      'Olá! Fiz o Diagnóstico de Compra Planejada do MCI Consórcio e meu perfil foi Consórcio Planejado. Gostaria de entender a carta, parcela, prazo e possibilidade de lance.',
  },
  {
    id: 'consorcio',
    nome: 'Lance Estratégico',
    fraseIdentificacao:
      'Seu perfil indica potencial para avaliar uma estratégia de lance dentro do consórcio imobiliário.',
    explicacao:
      'Você demonstrou sinais de que pode ter algum recurso, entrada, FGTS, reserva ou patrimônio que poderia ser usado de forma estratégica para tentar antecipar a contemplação. Isso não significa contemplação garantida, mas permite uma análise mais planejada.',
    pontosFavoraveis: [
      'Existe possibilidade de avaliar recurso para lance.',
      'O lance pode aumentar as chances de contemplação, sem garantia.',
      'Você pode montar uma estratégia mais ativa dentro do grupo.',
      'Pode ser possível combinar carta, prazo e lance de forma planejada.',
    ],
    pontosAtencao: [
      'Lance não garante contemplação.',
      'O resultado depende da concorrência no grupo.',
      'É importante não comprometer toda sua reserva.',
      'As regras variam conforme administradora e grupo.',
    ],
    proximoPasso:
      'Analisar valor disponível, modalidades de lance, carta compatível e regras da administradora.',
    cta: 'Quero analisar uma estratégia de lance',
    ctaMensagem:
      'Olá! Fiz o Diagnóstico de Compra Planejada do MCI Consórcio e meu perfil foi Lance Estratégico. Gostaria de entender como uma estratégia de lance poderia funcionar no meu caso.',
  },
  {
    id: 'hibrida',
    nome: 'Estratégia Patrimonial',
    fraseIdentificacao:
      'Seu perfil indica uma visão patrimonial para a compra do imóvel.',
    explicacao:
      'Nesse caso, o consórcio pode ser analisado como ferramenta de aquisição planejada, construção de patrimônio ou diversificação. A decisão não deve considerar apenas a parcela, mas também objetivo, prazo, liquidez, valorização e uso futuro da carta de crédito.',
    pontosFavoraveis: [
      'Você demonstra interesse em patrimônio.',
      'Pode haver visão de médio ou longo prazo.',
      'O consórcio pode ser avaliado como instrumento de planejamento.',
      'A análise pode ir além da compra imediata.',
    ],
    pontosAtencao: [
      'O imóvel precisa estar alinhado ao objetivo patrimonial.',
      'É necessário analisar prazo e liquidez.',
      'A carta de crédito deve fazer sentido dentro da estratégia.',
      'Consórcio não substitui uma análise patrimonial completa.',
    ],
    proximoPasso:
      'Analisar objetivo patrimonial, valor de carta, prazo, liquidez e estratégia de uso da carta.',
    cta: 'Quero avaliar minha estratégia patrimonial',
    ctaMensagem:
      'Olá! Fiz o Diagnóstico de Compra Planejada do MCI Consórcio e meu perfil foi Estratégia Patrimonial. Gostaria de avaliar o consórcio como parte de uma estratégia patrimonial.',
  },
  {
    id: 'reorganizacao',
    nome: 'Troca ou Upgrade Imobiliário',
    fraseIdentificacao:
      'Seu perfil indica interesse em evoluir de imóvel, trocar de moradia ou ampliar patrimônio.',
    explicacao:
      'O consórcio pode ser analisado como uma estratégia para planejar a troca de imóvel, melhorar sua moradia ou organizar uma aquisição futura com mais previsibilidade. Esse perfil pode envolver carta de crédito, complemento financeiro, bem atual, FGTS ou patrimônio existente.',
    pontosFavoraveis: [
      'Você demonstra objetivo de evolução imobiliária.',
      'Pode haver patrimônio atual para compor estratégia.',
      'O consórcio pode ajudar a planejar uma aquisição maior.',
      'Há espaço para avaliar carta, prazo e complemento.',
    ],
    pontosAtencao: [
      'É importante entender o valor do imóvel desejado.',
      'O bem atual pode ou não entrar na estratégia.',
      'A carta precisa ser compatível com o upgrade desejado.',
      'Contemplação não tem prazo garantido.',
    ],
    proximoPasso:
      'Avaliar bem atual, objetivo de troca, carta de crédito, complemento financeiro e prazo.',
    cta: 'Quero planejar meu upgrade imobiliário',
    ctaMensagem:
      'Olá! Fiz o Diagnóstico de Compra Planejada do MCI Consórcio e meu perfil foi Troca ou Upgrade Imobiliário. Gostaria de entender como planejar essa evolução.',
  },
  {
    id: 'investidor',
    nome: 'Preparação para Consórcio',
    fraseIdentificacao:
      'Seu perfil indica interesse em consórcio, mas talvez seja importante organizar alguns pontos antes de avançar.',
    explicacao:
      'O consórcio pode fazer sentido no futuro, mas suas respostas indicam que renda, parcela, reserva, expectativa ou entendimento do produto talvez precisem ser melhor alinhados antes de uma contratação.',
    pontosFavoraveis: [
      'Existe interesse em compra planejada.',
      'Você está buscando entender melhor o caminho.',
      'A preparação pode evitar decisão precipitada.',
      'Com ajustes, o consórcio pode se tornar mais adequado no futuro.',
    ],
    pontosAtencao: [
      'A parcela precisa caber com segurança.',
      'É importante entender bem contemplação, lance e prazo.',
      'Talvez seja necessário organizar reserva ou entrada.',
      'O valor da carta deve estar alinhado à realidade financeira.',
    ],
    proximoPasso:
      'Receber orientação inicial e montar uma rota de preparação antes da contratação.',
    cta: 'Quero entender como me preparar',
    ctaMensagem:
      'Olá! Fiz o Diagnóstico de Compra Planejada do MCI Consórcio e meu perfil foi Preparação para Consórcio. Gostaria de entender como me preparar melhor.',
  },
  {
    id: 'emocional',
    nome: 'Análise de Aderência Necessária',
    fraseIdentificacao:
      'Seu diagnóstico indica que é necessário avaliar com cuidado se o consórcio é adequado para o seu momento atual.',
    explicacao:
      'Isso não significa que o consórcio não possa fazer sentido. Significa que alguns pontos precisam ser esclarecidos antes de qualquer decisão, especialmente prazo, urgência, expectativa de contemplação, parcela e entendimento das regras do grupo.',
    pontosFavoraveis: [
      'Você está buscando uma alternativa para comprar imóvel.',
      'O diagnóstico ajuda a evitar decisão por impulso.',
      'Ainda pode haver caminhos possíveis com orientação.',
      'Entender melhor o produto já é um primeiro passo importante.',
    ],
    pontosAtencao: [
      'Consórcio não é solução imediata.',
      'Contemplação não tem prazo garantido.',
      'É essencial alinhar expectativa antes de contratar.',
      'A compra precisa caber no orçamento com segurança.',
    ],
    proximoPasso:
      'Alinhar expectativa sobre prazo, contemplação, parcela e regras antes de falar em contratação.',
    cta: 'Quero entender se consórcio serve para mim',
    ctaMensagem:
      'Olá! Fiz o Diagnóstico de Compra Planejada do MCI Consórcio e meu perfil foi Análise de Aderência Necessária. Gostaria de entender se o consórcio faz sentido para o meu momento.',
  },
];
