import { create } from 'zustand';
import { Lead, Partner, ProfileScores, ProfileType } from '@/types';
import { supabase } from '@/lib/supabase';
import { getProductPermission } from '@/lib/productAccess';

interface LeadsState {
  leads: Lead[];
  partners: Partner[];
  isAuthenticated: boolean;
  isLoading: boolean;
  syncError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadData: () => Promise<void>;
  addLead: (lead: Lead) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  moveLead: (id: string, newStatus: string) => void;
  addPartner: (partner: Partner) => void;
  updatePartner: (id: string, updates: Partial<Partner>) => void;
}

const PRODUCT_KEY = 'mci_consorcio_imobiliario';
const AUTH_STORAGE_KEY = 'mci_consorcio_admin_auth';

function clearAuthStorage() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem('admin_auth');
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
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  gclid?: string | null;
  gbraid?: string | null;
  wbraid?: string | null;
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
  'Contato enviado': 'contato_enviado',
  'Respondeu': 'respondeu',
  'Não respondeu': 'nao_respondeu',
  'Agendado': 'agendado',
  'Em atendimento': 'em_atendimento',
  'Proposta apresentada': 'proposta_apresentada',
  'Venda realizada': 'venda_realizada',
  'Venda perdida': 'venda_perdida',
  'Sem aderência': 'sem_aderencia',

  // Compatibilidade com nomes antigos da interface
  'Aguardando qualificação': 'novo_diagnostico',
  'Em contato': 'em_atendimento',
  'Qualificado': 'em_atendimento',
  'Em análise/simulação': 'proposta_apresentada',
  'Proposta enviada': 'proposta_apresentada',
  'Em negociação': 'proposta_apresentada',
  'Nutrição': 'novo_diagnostico',
  'Perdido': 'venda_perdida',
  'Retorno futuro': 'novo_diagnostico',
  'Sem resposta': 'nao_respondeu',
  'Dados incompletos': 'novo_diagnostico',
};

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

  // Compatibilidade com status antigos que possam existir em localStorage/legado
  primeiro_contato_enviado: 'Contato enviado',
  respondido: 'Respondeu',
  nao_respondido: 'Não respondeu',
  simulacao_solicitada: 'Proposta apresentada',
  proposta_enviada: 'Proposta apresentada',
  preparacao_futura: 'Novo diagnóstico',
  perdido: 'Venda perdida',
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
  } catch {
    // Falhas de armazenamento local não devem interromper a sessão.
  }
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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function safeScores(value: unknown): ProfileScores {
  const source = asRecord(value);
  return {
    financiamento: Number(source.financiamento || source.consorcio_planejado || 0),
    consorcio: Number(source.consorcio || source.lance_estrategico || 0),
    hibrida: Number(source.hibrida || source.estrategia_patrimonial || 0),
    reorganizacao: Number(source.reorganizacao || source.troca_upgrade || 0),
    investidor: Number(source.investidor || source.preparacao_consorcio || 0),
    emocional: Number(source.emocional || source.analise_aderencia_necessaria || 0),
  };
}

function getDbAttribution(dbLead: DbLead): Lead['attribution'] {
  const attribution = {
    utm_source: dbLead.utm_source || undefined,
    utm_medium: dbLead.utm_medium || undefined,
    utm_campaign: dbLead.utm_campaign || undefined,
    utm_content: dbLead.utm_content || undefined,
    utm_term: dbLead.utm_term || undefined,
    gclid: dbLead.gclid || undefined,
    gbraid: dbLead.gbraid || undefined,
    wbraid: dbLead.wbraid || undefined,
  };

  return Object.values(attribution).some(Boolean) ? attribution : undefined;
}

function getStoredSecondaryProfile(value: unknown): ProfileType | undefined {
  const result = asRecord(asRecord(value)._result);
  const stored = result.secondary_profile;

  if (typeof stored !== 'string' || !stored) return undefined;
  if (stored in DB_TO_INTERNAL_PROFILE) return getInternalProfile(stored);
  if (stored in INTERNAL_TO_DB_PROFILE) return stored as ProfileType;

  return undefined;
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
    score_json: {
      ...(lead.scores || {}),
      _tracking: lead.tracking || null,
      _consent: lead.consent || null,
      _result: {
        primary_profile: getDbProfile(lead.perfilPrincipal),
        secondary_profile: lead.perfilSecundario
          ? getDbProfile(lead.perfilSecundario)
          : null,
      },
      _context: {
        origem: lead.origem,
        temperatura: lead.temperatura,
        tags: lead.tags,
        faixa_imovel: lead.faixaImovel || null,
        faixa_renda: lead.faixaRenda || null,
        entrada_disponivel: lead.entradaDisponivel || null,
        urgencia: lead.urgencia || null,
        objetivo: lead.objetivo || null,
        produto_recomendado: lead.produtoRecomendado || null,
      },
    },
    status: getDbStatus(lead.status),
    assigned_to_user_id: lead.assignedToUserId || null,
    assigned_to_name: lead.responsavel || null,
    assigned_at: lead.assignedAt || null,
    assigned_by_user_id: lead.assignedByUserId || null,
    notes: lead.observacoes || null,
    next_action: lead.proximaAcao || null,
    utm_source: lead.attribution?.utm_source || null,
    utm_medium: lead.attribution?.utm_medium || null,
    utm_campaign: lead.attribution?.utm_campaign || null,
    utm_content: lead.attribution?.utm_content || null,
    utm_term: lead.attribution?.utm_term || null,
    gclid: lead.attribution?.gclid || null,
    gbraid: lead.attribution?.gbraid || null,
    wbraid: lead.attribution?.wbraid || null,
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
    perfilSecundario: getStoredSecondaryProfile(dbLead.score_json),
    origem: partnerName ? `Empresa parceira: ${partnerName}` : 'MCI Consórcio Imobiliário',
    parceiro: partner !== 'direto' ? partner : undefined,
    parceiroNome: partnerName || undefined,
    parceiroWhatsapp: dbLead.partner_whatsapp || undefined,
    attribution: getDbAttribution(dbLead),
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
  leads: [],
  partners: loadFromStorage<Partner[]>('mci_consorcio_admin_partners', []),
  isAuthenticated: loadFromStorage<boolean>(AUTH_STORAGE_KEY, loadFromStorage<boolean>('admin_auth', false)),
  isLoading: false,
  syncError: null,

  login: async (email, password) => {
    set({ isLoading: true, syncError: null });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      if (!data.session) throw new Error('Sessão não criada.');

      const permission = await getProductPermission(PRODUCT_KEY);

      if (!permission) {
        await supabase.auth.signOut();
        clearAuthStorage();
        throw new Error('Usuário sem permissão para acessar o MCI Consórcio.');
      }

      set({ isAuthenticated: true, isLoading: false });
      saveToStorage(AUTH_STORAGE_KEY, true);
      localStorage.removeItem('admin_auth');

      await get().loadData();

      return true;
    } catch (error) {
      set({
        isAuthenticated: false,
        isLoading: false,
        syncError: error instanceof Error ? error.message : 'Erro ao fazer login.',
      });

      clearAuthStorage();

      return false;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, leads: [] });
    clearAuthStorage();
  },

  loadData: async () => {
    set({ isLoading: true, syncError: null });
    try {
      const permission = await getProductPermission(PRODUCT_KEY);

      if (!permission) {
        await supabase.auth.signOut();
        clearAuthStorage();
        set({ isAuthenticated: false, leads: [], isLoading: false });
        throw new Error('Usuário sem permissão para acessar o MCI Consórcio.');
      }

      let query = supabase
        .from('mci_consorcio_leads')
        .select('*')
        .order('created_at', { ascending: false });

      const isGlobalAccess =
        permission.role === 'master_admin' || permission.role === 'admin_produto';

      if (!isGlobalAccess) {
        if (!permission.company_id) {
          query = query.eq('partner_slug', '__sem_empresa__');
        } else {
          const { data: company, error: companyError } = await supabase
            .from('partner_companies')
            .select('slug')
            .eq('id', permission.company_id)
            .maybeSingle();

          if (companyError) throw companyError;

          if (company?.slug) {
            query = query.eq('partner_slug', company.slug);
          } else {
            query = query.eq('partner_slug', '__empresa_nao_encontrada__');
          }

          if (permission.role === 'consultor') {
            query = query.eq('assigned_to_user_id', permission.user_id);
          }
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      const mapped = (data || []).map((lead) => mapDbToLead(lead as DbLead));
      set({ leads: mapped, isLoading: false, syncError: null });
    } catch (error) {
      set({ isLoading: false, syncError: error instanceof Error ? error.message : 'Erro ao carregar dados.' });
    }
  },

  addLead: async (lead) => {
    const safeLead = { ...lead, id: lead.id };
    set({ syncError: null });

    const { error } = await supabase
      .from('mci_consorcio_leads')
      .insert(mapLeadToDb(safeLead));

    if (error && error.code !== '23505') {
      const message = error.message || 'Erro ao salvar lead.';
      set({ syncError: message });
      throw new Error(message);
    }

    // Em uma nova tentativa com o mesmo ID, chave duplicada indica que a primeira gravação foi concluída.
    if (error?.code === '23505') {
      set({ syncError: null });
    }
  },

  updateLead: (id, updates) => {
    set((state) => {
      const newLeads = state.leads.map((lead) => (lead.id === id ? { ...lead, ...updates } : lead));
      return { leads: newLeads };
    });

    void (async () => {
      try {
        const updatedLead = get().leads.find((lead) => lead.id === id);
        if (!updatedLead) return;
        const payload = mapLeadToDb(updatedLead);

        const { error } = await supabase
          .from('mci_consorcio_leads')
          .update(payload)
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
