import { ProfileType, QuizAnswer } from '@/types';
import {
  getDownPaymentRange,
  getIncomeRange,
  getPropertyRange,
} from '@/lib/leadUtils';
import { SIMULATION_CONFIG } from '@/lib/simulationConfig';

export type SimulationCompatibility = 'compatível' | 'atenção' | 'acima_do_limite' | 'insuficiente';

export interface PurchaseSimulation {
  propertyValue: number | null;
  income: number | null;
  downPayment: number | null;
  downPaymentPercent: number | null;

  affordablePayment: number | null;

  financing: {
    financedAmount: number | null;
    estimatedPayment: number | null;
    termMonths: number;
    monthlyInterestRate: number;
    compatibility: SimulationCompatibility;
    reading: string;
  };

  consortium: {
    creditAmount: number | null;
    estimatedPaymentMin: number | null;
    estimatedPaymentMax: number | null;
    termMonths: number;
    adminFeeRate: number;
    reserveFundRate: number;
    reading: string;
  };

  warning: string;
}

function currency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'Não informado';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrency(value: number | null | undefined): string {
  return currency(value);
}

function getPropertyValueFromRange(range: string): number | null {
  if (range.includes('Até R$ 250')) return 250000;
  if (range.includes('250 mil a R$ 400')) return 325000;
  if (range.includes('400 mil a R$ 700')) return 550000;
  if (range.includes('700 mil a R$ 1 milhão')) return 850000;
  if (range.includes('Acima de R$ 1 milhão')) return 1200000;

  return null;
}

function getIncomeFromRange(range: string): number | null {
  if (range.includes('Até R$ 3')) return 3000;
  if (range.includes('3 mil a R$ 6')) return 4500;
  if (range.includes('6 mil a R$ 10')) return 8000;
  if (range.includes('10 mil a R$ 20')) return 15000;
  if (range.includes('Acima de R$ 20')) return 25000;

  return null;
}

function getDownPaymentPercentFromRange(range: string): number | null {
  if (range.includes('20% ou mais')) return 0.2;
  if (range.includes('entre 10% e 20%') || range.includes('Tenho entre 10% e 20%')) return 0.15;
  if (range.includes('menos de 10%')) return 0.07;
  if (range.includes('Ainda não tenho entrada')) return 0;
  if (range.includes('FGTS')) return 0.1;

  return null;
}

function calculatePricePayment(principal: number, monthlyRate: number, termMonths: number): number {
  if (principal <= 0) return 0;
  if (monthlyRate <= 0) return principal / termMonths;

  const factor = Math.pow(1 + monthlyRate, termMonths);

  return principal * ((monthlyRate * factor) / (factor - 1));
}

function getFinancingCompatibility(
  estimatedPayment: number | null,
  affordablePayment: number | null
): SimulationCompatibility {
  if (!estimatedPayment || !affordablePayment) return 'insuficiente';

  if (estimatedPayment <= affordablePayment) return 'compatível';
  if (estimatedPayment <= affordablePayment * 1.25) return 'atenção';

  return 'acima_do_limite';
}

function getFinancingReading(
  compatibility: SimulationCompatibility,
  profile: ProfileType
): string {
  if (compatibility === 'compatível') {
    if (profile === 'financiamento') {
      return 'A parcela estimada parece compatível com um limite conservador de renda. Ainda assim, a aprovação depende de análise documental, crédito, imóvel e regras da instituição financeira.';
    }

    return 'A parcela estimada cabe dentro de um limite conservador de renda, mas ainda vale comparar prazo, entrada, juros e alternativas antes de decidir.';
  }

  if (compatibility === 'atenção') {
    return 'A parcela estimada fica próxima ou um pouco acima do limite conservador. Pode ser necessário ajustar entrada, valor do imóvel, prazo ou estratégia.';
  }

  if (compatibility === 'acima_do_limite') {
    return 'A parcela estimada fica acima do limite conservador de renda. Isso indica necessidade de cautela, aumento de entrada, redução do valor do imóvel ou reorganização financeira.';
  }

  return 'Não há dados suficientes para estimar a compatibilidade do financiamento. Um especialista pode ajudar a organizar a simulação com dados mais precisos.';
}

function getConsortiumReading(profile: ProfileType): string {
  if (profile === 'consorcio') {
    return 'O consórcio pode fazer sentido para um planejamento de compra, especialmente se você não precisa da posse imediata do imóvel.';
  }

  if (profile === 'hibrida') {
    return 'O consórcio pode entrar como parte de uma estratégia comparativa, junto com análise de financiamento, entrada e prazo.';
  }

  if (profile === 'reorganizacao' || profile === 'emocional') {
    return 'O consórcio pode ser analisado com cautela, mas antes é importante entender se a parcela cabe no orçamento e se o prazo combina com sua realidade.';
  }

  if (profile === 'investidor') {
    return 'O consórcio pode ser avaliado como estratégia patrimonial, desde que prazo, carta, lance e fluxo mensal estejam alinhados ao objetivo.';
  }

  return 'O consórcio pode ser comparado como alternativa de planejamento, mas depende de prazo, administradora, taxa, grupo e estratégia de contemplação.';
}

export function calculatePurchaseSimulation(
  answers: QuizAnswer[],
  profile: ProfileType
): PurchaseSimulation {
  const propertyRange = getPropertyRange(answers);
  const incomeRange = getIncomeRange(answers);
  const downPaymentRange = getDownPaymentRange(answers);

  const propertyValue = getPropertyValueFromRange(propertyRange);
  const income = getIncomeFromRange(incomeRange);
  const downPaymentPercent = getDownPaymentPercentFromRange(downPaymentRange);

  const downPayment =
    propertyValue !== null && downPaymentPercent !== null
      ? Math.round(propertyValue * downPaymentPercent)
      : null;

  const affordablePayment =
    income !== null
      ? Math.round(income * SIMULATION_CONFIG.financing.maxIncomeCommitment)
      : null;

  const financedAmount =
    propertyValue !== null && downPayment !== null
      ? Math.max(propertyValue - downPayment, 0)
      : null;

  const estimatedFinancingPayment =
    financedAmount !== null
      ? Math.round(
          calculatePricePayment(
            financedAmount,
            SIMULATION_CONFIG.financing.monthlyInterestRate,
            SIMULATION_CONFIG.financing.defaultTermMonths
          )
        )
      : null;

  const financingCompatibility = getFinancingCompatibility(
    estimatedFinancingPayment,
    affordablePayment
  );

  const consortiumCreditAmount = propertyValue;

  const consortiumTotalRate =
    SIMULATION_CONFIG.consortium.adminFeeRate +
    SIMULATION_CONFIG.consortium.reserveFundRate +
    SIMULATION_CONFIG.consortium.insuranceRate;

  const consortiumBasePayment =
    consortiumCreditAmount !== null
      ? (consortiumCreditAmount * (1 + consortiumTotalRate)) /
        SIMULATION_CONFIG.consortium.defaultTermMonths
      : null;

  const consortiumPaymentMin =
    consortiumBasePayment !== null ? Math.round(consortiumBasePayment * 0.92) : null;

  const consortiumPaymentMax =
    consortiumBasePayment !== null ? Math.round(consortiumBasePayment * 1.08) : null;

  return {
    propertyValue,
    income,
    downPayment,
    downPaymentPercent,

    affordablePayment,

    financing: {
      financedAmount,
      estimatedPayment: estimatedFinancingPayment,
      termMonths: SIMULATION_CONFIG.financing.defaultTermMonths,
      monthlyInterestRate: SIMULATION_CONFIG.financing.monthlyInterestRate,
      compatibility: financingCompatibility,
      reading: getFinancingReading(financingCompatibility, profile),
    },

    consortium: {
      creditAmount: consortiumCreditAmount,
      estimatedPaymentMin: consortiumPaymentMin,
      estimatedPaymentMax: consortiumPaymentMax,
      termMonths: SIMULATION_CONFIG.consortium.defaultTermMonths,
      adminFeeRate: SIMULATION_CONFIG.consortium.adminFeeRate,
      reserveFundRate: SIMULATION_CONFIG.consortium.reserveFundRate,
      reading: getConsortiumReading(profile),
    },

    warning:
      'Esta estimativa é apenas orientativa. Não representa aprovação de crédito, proposta bancária, promessa de contemplação ou condição oficial de administradora.',
  };
}

export function getCompatibilityLabel(status: SimulationCompatibility): string {
  const labels: Record<SimulationCompatibility, string> = {
    compatível: 'Compatível em análise inicial',
    atenção: 'Exige atenção',
    acima_do_limite: 'Acima do limite conservador',
    insuficiente: 'Dados insuficientes',
  };

  return labels[status];
}

export function getCompatibilityClass(status: SimulationCompatibility): string {
  const classes: Record<SimulationCompatibility, string> = {
    compatível: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    atenção: 'bg-amber-50 text-amber-700 border-amber-200',
    acima_do_limite: 'bg-red-50 text-red-700 border-red-200',
    insuficiente: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return classes[status];
}