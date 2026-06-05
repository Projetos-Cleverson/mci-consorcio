import { create } from 'zustand';
import { Lead, ProfileScores, ProfileType } from '@/types';
import { supabase } from '@/lib/supabase';

type MatrixDbLead = {
  lead_id: string;
  product_key: string;
  product_name: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  partner_slug: string | null;
  partner_name: string | null;
  diagnostic_result: string | null;
  status: string | null;
  created_at: string | null;
  temperature?: string | null;
  source?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
};

interface MatrixLeadsState {
  leads: Lead[];
  isLoading: boolean;
  syncError: string | null;
  loadData: () => Promise<void>;
  moveLead: (id: string, newStatus: string) => void;
}

const DB_TO_STATUS: Record<string, string> = {
  novo_diagnostico: 'Novo diagnóstico',
  contato_enviado: 'Contato enviado',
  respondeu: 'Respondeu',
  nao_respondeu: 'Não respondeu',
  agendado: 'Agendado',
  em_atendimento: 'Em atendimento',
  proposta_apresentada: 'Proposta apresentada',
  venda_realizada: 'Venda realizada',
  venda_perdida: 'Venda perdida',
  sem_aderencia: 'Sem aderência',

  // Compatibilidade com status antigos
  'Novo diagnóstico': 'Novo diagnóstico',
  'Aguardando qualificação': 'Novo diagnóstico',
  'Em contato': 'Em atendimento',
  'Qualificado': 'Em atendimento',
  'Em análise/simulação': 'Proposta apresentada',
  'Proposta enviada': 'Proposta apresentada',
  'Em negociação': 'Proposta apresentada',
  'Perdido': 'Venda perdida',
  'Venda realizada': 'Venda realizada',
};

const STATUS_TO_DB: Record<string, string> = {
  'Novo diagnóstico': 'novo_diagnostico',
  'Contato enviado': 'contato_enviado',
  'Respondeu': 'respondeu',
  'Não respondeu': 'nao_respondeu',
  'Agendado': 'agendado',
  'Em atendimento': 'em_atendimento',
  'Proposta apresentada': 'proposta_apresentada',
  'Venda realizada': 'venda_realizada',
  'Venda perdida': 'venda_perdida',
  'Sem aderência': 'sem_aderencia',
};

const DB_TO_INTERNAL_PROFILE: Record<string, ProfileType> = {
  consorcio_planejado: 'financiamento',
  lance_estrategico: 'consorcio',
  estrategia_patrimonial: 'hibrida',
  troca_upgrade: 'reorganizacao',
  preparacao_consorcio: 'investidor',
  analise_aderencia_necessaria: 'emocional',

  financiamento: 'financiamento',
  consorcio: 'consorcio',
  hibrida: 'hibrida',
  reorganizacao: 'reorganizacao',
  investidor: 'investidor',
  emocional: 'emocional',

  financiamento_imediato: 'financiamento',
  estrategia_hibrida: 'hibrida',
  reorganizacao_financeira: 'reorganizacao',
};

function getUiStatus(status?: string | null) {
  if (!status) return 'Novo diagnóstico';
  return DB_TO_STATUS[status] || status;
}

function getDbStatus(status?: string | null) {
  if (!status) return 'novo_diagnostico';
  return STATUS_TO_DB[status] || status;
}

function getInternalProfile(profile?: string | null): ProfileType {
  if (!profile) return 'financiamento';
  return DB_TO_INTERNAL_PROFILE[profile] || 'financiamento';
}

function getTemperature(profile: ProfileType): Lead['temperatura'] {
  if (profile === 'emocional') return 'risco';
  if (profile === 'hibrida') return 'premium';
  if (profile === 'investidor') return 'nutricao';
  return 'morno';
}

function emptyScores(profile: ProfileType): ProfileScores {
  return {
    financiamento: profile === 'financiamento' ? 1 : 0,
    consorcio: profile === 'consorcio' ? 1 : 0,
    hibrida: profile === 'hibrida' ? 1 : 0,
    reorganizacao: profile === 'reorganizacao' ? 1 : 0,
    investidor: profile === 'investidor' ? 1 : 0,
    emocional: profile === 'emocional' ? 1 : 0,
  };
}

function matrixId(productKey: string, leadId: string) {
  return `${productKey}__${leadId}`;
}

function splitMatrixId(id: string) {
  const [productKey, ...rest] = id.split('__');
  return { productKey, leadId: rest.join('__') };
}

function mapDbToLead(row: MatrixDbLead): Lead {
  const profile = getInternalProfile(row.diagnostic_result);
  const productName = row.product_name || row.product_key;
  const origem = row.partner_name
    ? `${productName} · Empresa parceira: ${row.partner_name}`
    : `${productName} · ${row.partner_slug || row.source || 'Direto'}`;

  return {
    id: matrixId(row.product_key, row.lead_id),
    dados: {
      nome: row.name || 'Lead sem nome',
      whatsapp: row.phone || '',
      email: row.email || undefined,
      cidade: row.city || '',
      estado: row.state || '',
      aceiteContato: true,
    },
    respostas: [],
    scores: emptyScores(profile),
    perfilPrincipal: profile,
    origem,
    parceiro: row.partner_slug || undefined,
    parceiroNome: row.partner_name || undefined,
    temperatura: getTemperature(profile),
    status: getUiStatus(row.status),
    tags: [row.product_key, row.diagnostic_result || 'sem_diagnostico'],
    observacoes: '',
    historico: [{ data: (row.created_at || '').slice(0, 10), acao: `Lead criado via ${productName}` }],
    dataEntrada: (row.created_at || new Date().toISOString()).slice(0, 10),
    produtoRecomendado: productName,
  };
}

async function updateUnderlyingLeadStatus(matrixLeadId: string, newStatus: string) {
  const { productKey, leadId } = splitMatrixId(matrixLeadId);
  const dbStatus = getDbStatus(newStatus);

  if (productKey === 'mci_consorcio_imobiliario') {
    const { error } = await supabase
      .from('mci_consorcio_leads')
      .update({ status: dbStatus, updated_at: new Date().toISOString() })
      .eq('id', leadId);

    if (error) throw error;
    return;
  }

  if (productKey === 'mci_imobiliario') {
    const { error } = await supabase
      .from('leads')
      .update({ status: dbStatus, updated_at: new Date().toISOString() })
      .eq('id', leadId);

    if (error) throw error;
    return;
  }

  throw new Error(`Produto ainda não suporta atualização de status: ${productKey}`);
}

export const useMatrixStore = create<MatrixLeadsState>((set, get) => ({
  leads: [],
  isLoading: false,
  syncError: null,

  loadData: async () => {
    set({ isLoading: true, syncError: null });

    try {
      const { data, error } = await supabase
        .from('epsa_all_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({
        leads: (data || []).map((row) => mapDbToLead(row as MatrixDbLead)),
        isLoading: false,
        syncError: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        syncError: error instanceof Error ? error.message : 'Erro ao carregar leads consolidados.',
      });
    }
  },

  moveLead: (id, newStatus) => {
    set((state) => ({
      leads: state.leads.map((lead) => (lead.id === id ? { ...lead, status: newStatus } : lead)),
    }));

    void (async () => {
      try {
        await updateUnderlyingLeadStatus(id, newStatus);
        await get().loadData();
      } catch (error) {
        set({ syncError: error instanceof Error ? error.message : 'Erro ao atualizar status consolidado.' });
        await get().loadData();
      }
    })();
  },
}));
