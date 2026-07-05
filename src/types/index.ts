export type ProfileType =
  | 'financiamento'
  | 'consorcio'
  | 'hibrida'
  | 'reorganizacao'
  | 'investidor'
  | 'emocional';

export interface QuizAnswer {
  questionIndex: number;
  answerIndex: number;
}

export interface ProfileScores {
  financiamento: number;
  consorcio: number;
  hibrida: number;
  reorganizacao: number;
  investidor: number;
  emocional: number;
}

export interface LeadData {
  nome: string;
  whatsapp: string;
  cidade: string;
  estado: string;
  email?: string;
  horarioContato?: string;
  aceiteContato: boolean;
}

export interface LeadTrackingContext {
  partner_slug: string;
  landing_url: string;
  referrer: string;
  captured_at: string;
  last_url: string;
  device_category: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  user_agent: string;
  params: Record<string, string | undefined>;
}

export interface LeadConsentContext {
  version: string;
  accepted_at: string;
  partner_slug: string;
  partner_name: string;
  privacy_policy_path: string;
  terms_path: string;
  text_snapshot: string;
}

export type LeadTemperature = 'morno' | 'quente' | 'nutricao' | 'premium' | 'risco';

export interface Lead {
  id: string;
  dados: LeadData;
  respostas: QuizAnswer[];
  scores: ProfileScores;
  perfilPrincipal: ProfileType;
  perfilSecundario?: ProfileType;
  origem: string;
  parceiro?: string;
  parceiroNome?: string;
  parceiroWhatsapp?: string;
  temperatura: LeadTemperature;
  status: string;
  responsavel?: string;
  assignedToUserId?: string;
  assignedAt?: string;
  assignedByUserId?: string;
  tags: string[];
  observacoes: string;
  proximaAcao?: string;
  historico: HistoricoItem[];
  dataEntrada: string;
  faixaImovel?: string;
  faixaRenda?: string;
  entradaDisponivel?: string;
  urgencia?: string;
  objetivo?: string;
  produtoRecomendado?: string;
  tracking?: LeadTrackingContext;
  consent?: LeadConsentContext;
}


export interface HistoricoItem {
  data: string;
  acao: string;
  responsavel?: string;
  assignedToUserId?: string;
  assignedAt?: string;
  assignedByUserId?: string;
}

export interface PartnerCompany {
  id: string;
  name: string;
  slug: string;
  display_name?: string | null;
  logo_url?: string | null;
  commercial_whatsapp?: string | null;
  city?: string | null;
  state?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  status?: 'active' | 'inactive' | 'pilot' | string;
}

export interface Partner {
  id: string;
  nome: string;
  tipo: string;
  responsavel: string;
  whatsapp: string;
  email: string;
  cidade: string;
  estado: string;
  comissaoPadrao: number;
  codigoOrigem: string;
  status: 'ativo' | 'inativo';
  observacoes: string;
}

export interface ProfileResult {
  id: ProfileType;
  nome: string;
  fraseIdentificacao: string;
  explicacao: string;
  pontosFavoraveis: string[];
  pontosAtencao: string[];
  proximoPasso: string;
  cta: string;
  ctaMensagem: string;
}


export interface PartnerCompanyUser {
  id: string;
  company_id: string;
  user_id?: string | null;
  role: 'company_admin' | 'company_manager' | 'company_consultant' | string;
  status: 'pending_auth' | 'active' | 'inactive' | 'suspended' | string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
}
