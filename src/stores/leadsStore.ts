import { create } from 'zustand';
import { Lead, Partner, ProfileScores, ProfileType } from '@/types';
import { supabase } from '@/lib/supabase';

interface LeadsState {
  leads: Lead[];
  partners: Partner[];
  isAuthenticated: boolean;
  isLoading: boolean;
  syncError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadData: () => Promise<void>;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  moveLead: (id: string, newStatus: string) => void;
  addPartner: (partner: Partner) => void;
  updatePartner: (id: string, updates: Partial<Partner>) => void;
}

type DbLead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string | null;
  state: string | null;
  contact_time: string | null;
  partner_slug: string | null;
  partner_name?: string | null;
  partner_whatsapp?: string | null;
  source_system: string | null;
  diagnostic_model: string | null;
  diagnostic_result: string;
  answers_json: unknown;
  score_json: unknown;
  status: string;
  created_at: string;
  updated_at: string | null;
  assigned_to_user_id?: string | null;
  assigned_to_name?: string | null;
  assigned_at?: string | null;
  assigned_by_user_id?: string | null;
  notes?: string | null;
  next_action?: string | null;
};

const INTERNAL_TO_DB_PROFILE: Record<ProfileType, string> = {
  financiamento: 'consorcio_planejado',
  consorcio: 'lance_estrategico',
  hibrida: 'estrategia_patrimonial',
  reorganizacao: 'troca_upgrade',
  investidor: 'preparacao_consorcio',
  emocional: 'analise_aderencia_necessaria',
};

const DB_TO_INTERNAL_PROFILE: Record<string, ProfileType> = {
  consorcio_planejado: 'financiamento',
  lance_estrategico: 'consorcio',
  estrategia_patrimonial: 'hibrida',
  troca_upgrade: 'reorganizacao',
  preparacao_consorcio: 'investidor',
  analise_aderencia_necessaria: 'emocional',
};

const STATUS_TO_DB: Record<string, string> = {
  'Novo diagnóstico': 'novo_diagnostico',
  'Contato enviado': 'primeiro_contato_enviado',
  'Respondeu': 'respondido',
  'Não respondeu': 'nao_respondido',
  'Agendado': 'agendado',
  'Em atendimento': 'em_atendimento',
  'Proposta apresentada': 'proposta_apresentada',
  'Venda perdida': 'venda_perdida',
  'Sem aderência': 'sem_aderencia',
  'Aguardando qualificação': 'novo_diagnostico',
  'Em contato': 'em_atendimento',
  'Qualificado': 'em_atendimento',
  'Em análise/simulação': 'simulacao_solicitada',
  'Proposta enviada': 'proposta_enviada',
  'Em negociação': 'proposta_enviada',
  'Venda realizada': 'convertido',
  'Nutrição': 'preparacao_futura',
  'Perdido': 'perdido',
  'Retorno futuro': 'preparacao_futura',
  'Sem resposta': 'perdido',
  'Dados incompletos': 'preparacao_futura',
};

const DB_TO_STATUS: Record<string, string> = {
  novo_diagnostico: 'Novo diagnóstico',
  primeiro_contato_enviado: 'Contato enviado',
  respondido: 'Respondeu',
  nao_respondido: 'Não respondeu',
  agendado: 'Agendado',
  em_atendimento: 'Em atendimento',
  simulacao_solicitada: 'Em análise/simulação',
  proposta_enviada: 'Proposta enviada',
  proposta_apresentada: 'Proposta apresentada',
  preparacao_futura: 'Retorno futuro',
  perdido: 'Perdido',
  venda_perdida: 'Venda perdida',
  sem_aderencia: 'Sem aderência',
  convertido: 'Venda realizada',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved) as T;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function getDbProfile(profile: ProfileType) {
  return INTERNAL_TO_DB_PROFILE[profile] || 'consorcio_planejado';
}

function getInternalProfile(profile: string): ProfileType {
  return DB_TO_INTERNAL_PROFILE[profile] || 'financiamento';
}

function getDbStatus(status?: string) {
  return STATUS_TO_DB[status || 'Novo diagnóstico'] || 'novo_diagnostico';
}

function getUiStatus(status?: string) {
  return DB_TO_STATUS[status || 'novo_diagnostico'] || 'Novo diagnóstico';
}

function safeScores(value: unknown): ProfileScores {
  const source = (value && typeof value === 'object') ? value as Record<string, number> : {};
  return {
    financiamento: Number(source.financiamento || source.consorcio_planejado || 0),
    consorcio: Number(source.consorcio || source.lance_estrategico || 0),
    hibrida: Number(source.hibrida || source.estrategia_patrimonial || 0),
    reorganizacao: Number(source.reorganizacao || source.troca_upgrade || 0),
    investidor: Number(source.investidor || source.preparacao_consorcio || 0),
    emocional: Number(source.emocional || source.analise_aderencia_necessaria || 0),
  };
}

function mapLeadToDb(lead: Lead) {
  return {
    id: lead.id,
    name: lead.dados?.nome || '',
    email: lead.dados?.email || '',
    phone: lead.dados?.whatsapp || '',
    city: lead.dados?.cidade || null,
    state: lead.dados?.estado || null,
    contact_time: lead.dados?.horarioContato || null,
    partner_slug: lead.parceiro || 'direto',
    partner_name: lead.parceiroNome || null,
    partner_whatsapp: lead.parceiroWhatsapp || null,
    source_system: 'mci_consorcio_imobiliario',
    diagnostic_model: 'mci_consorcio_imobiliario',
    diagnostic_result: getDbProfile(lead.perfilPrincipal),
    answers_json: lead.respostas || [],
    score_json: lead.scores || {},
    status: getDbStatus(lead.status),
    assigned_to_user_id: lead.assignedToUserId || null,
    assigned_to_name: lead.responsavel || null,
    assigned_at: lead.assignedAt || null,
    assigned_by_user_id: lead.assignedByUserId || null,
    notes: lead.observacoes || null,
    next_action: lead.proximaAcao || null,
    updated_at: new Date().toISOString(),
  };
}

function mapDbToLead(dbLead: DbLead): Lead {
  const profile = getInternalProfile(dbLead.diagnostic_result);
  const answers = Array.isArray(dbLead.answers_json) ? dbLead.answers_json as Lead['respostas'] : [];
  const scores = safeScores(dbLead.score_json);
  const partner = dbLead.partner_slug || 'direto';
  const partnerName = dbLead.partner_name || (partner !== 'direto' ? partner : '');

  return {
    id: dbLead.id,
    dados: {
      nome: dbLead.name,
      whatsapp: dbLead.phone,
      email: dbLead.email || undefined,
      cidade: dbLead.city || '',
      estado: dbLead.state || '',
      horarioContato: dbLead.contact_time || undefined,
      aceiteContato: true,
    },
    respostas: answers,
    scores,
    perfilPrincipal: profile,
    origem: partnerName ? `Empresa parceira: ${partnerName}` : 'MCI Consórcio Imobiliário',
    parceiro: partner !== 'direto' ? partner : undefined,
    parceiroNome: partnerName || undefined,
    parceiroWhatsapp: dbLead.partner_whatsapp || undefined,
    temperatura: profile === 'emocional' ? 'risco' : profile === 'hibrida' ? 'premium' : profile === 'investidor' ? 'nutricao' : 'morno',
    status: getUiStatus(dbLead.status),
    responsavel: dbLead.assigned_to_name || undefined,
    assignedToUserId: dbLead.assigned_to_user_id || undefined,
    assignedAt: dbLead.assigned_at || undefined,
    assignedByUserId: dbLead.assigned_by_user_id || undefined,
    tags: ['mci_consorcio_imobiliario', `perfil_${dbLead.diagnostic_result}`],
    observacoes: dbLead.notes || '',
    proximaAcao: dbLead.next_action || '',
    historico: [{ data: (dbLead.created_at || '').slice(0, 10), acao: 'Lead criado via MCI Consórcio' }],
    dataEntrada: (dbLead.created_at || new Date().toISOString()).slice(0, 10),
  };
}

export const useLeadsStore = create<LeadsState>((set, get) => ({
  leads: loadFromStorage<Lead[]>('mci_consorcio_admin_leads', []),
  partners: loadFromStorage<Partner[]>('mci_consorcio_admin_partners', []),
  isAuthenticated: loadFromStorage<boolean>('admin_auth', false),
  isLoading: false,
  syncError: null,

  login: async (email, password) => {
    set({ isLoading: true, syncError: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.session) throw new Error('Sessão não criada.');
      set({ isAuthenticated: true, isLoading: false });
      saveToStorage('admin_auth', true);
      await get().loadData();
      return true;
    } catch (error) {
      set({ isAuthenticated: false, isLoading: false, syncError: error instanceof Error ? error.message : 'Erro ao fazer login.' });
      localStorage.removeItem('admin_auth');
      return false;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false });
    localStorage.removeItem('admin_auth');
  },

  loadData: async () => {
    set({ isLoading: true, syncError: null });
    try {
      let query = supabase
        .from('mci_consorcio_leads')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (userId) {
        const { data: masterAdmin } = await supabase
          .from('mci_admin_users')
          .select('role,status')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle();

        if (!masterAdmin) {
          const { data: companyUser } = await supabase
            .from('partner_company_users')
            .select('role,status,company_id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .maybeSingle();

          if (companyUser) {
            const { data: company } = await supabase
              .from('partner_companies')
              .select('slug')
              .eq('id', companyUser.company_id)
              .maybeSingle();

            if (company?.slug) {
              query = query.eq('partner_slug', company.slug);
            }

            if (companyUser.role === 'company_consultant') {
              query = query.eq('assigned_to_user_id', userId);
            }
          }
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      const mapped = (data || []).map((lead) => mapDbToLead(lead as DbLead));
      saveToStorage('mci_consorcio_admin_leads', mapped);
      set({ leads: mapped, isLoading: false, syncError: null });
    } catch (error) {
      set({ isLoading: false, syncError: error instanceof Error ? error.message : 'Erro ao carregar dados.' });
    }
  },

  addLead: (lead) => {
    const safeLead = { ...lead, id: lead.id };
    set((state) => {
      const newLeads = [safeLead, ...state.leads];
      saveToStorage('mci_consorcio_admin_leads', newLeads);
      return { leads: newLeads };
    });

    void (async () => {
      try {
        const { error } = await supabase.from('mci_consorcio_leads').insert(mapLeadToDb(safeLead));
        if (error) throw error;
      } catch (error) {
        set({ syncError: error instanceof Error ? error.message : 'Erro ao salvar lead.' });
      }
    })();
  },

  updateLead: (id, updates) => {
    set((state) => {
      const newLeads = state.leads.map((lead) => (lead.id === id ? { ...lead, ...updates } : lead));
      saveToStorage('mci_consorcio_admin_leads', newLeads);
      return { leads: newLeads };
    });

    void (async () => {
      try {
        const updatedLead = get().leads.find((lead) => lead.id === id);
        if (!updatedLead) return;
        const { error } = await supabase
          .from('mci_consorcio_leads')
          .update(mapLeadToDb(updatedLead))
          .eq('id', id);
        if (error) throw error;
      } catch (error) {
        set({ syncError: error instanceof Error ? error.message : 'Erro ao atualizar lead.' });
      }
    })();
  },

  moveLead: (id, newStatus) => get().updateLead(id, { status: newStatus }),

  addPartner: (partner) => {
    set((state) => {
      const partners = [partner, ...state.partners];
      saveToStorage('mci_consorcio_admin_partners', partners);
      return { partners };
    });
  },

  updatePartner: (id, updates) => {
    set((state) => {
      const partners = state.partners.map((p) => (p.id === id ? { ...p, ...updates } : p));
      saveToStorage('mci_consorcio_admin_partners', partners);
      return { partners };
    });
  },
}));
