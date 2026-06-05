import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { useLeadsStore } from '@/stores/leadsStore';
import { useToast } from '@/hooks/use-toast';
import { QUESTIONS } from '@/constants/questions';
import { PROFILES } from '@/constants/profiles';
import { formatPhone } from '@/lib/utils';
import { LeadTemperature, ProfileType } from '@/types';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Tag,
  MessageCircle,
  FileText,
  ClipboardList,
  ListTodo,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminAccess } from '@/hooks/useAdminAccess';

const STATUS_OPTIONS = [
  'Novo diagnóstico',
  'Contato enviado',
  'Respondeu',
  'Não respondeu',
  'Agendado',
  'Em atendimento',
  'Proposta apresentada',
  'Venda realizada',
  'Venda perdida',
  'Sem aderência',
];

const OBSERVATION_OPTIONS = [
  'Cliente pediu mais informações',
  'Cliente demonstrou interesse',
  'Cliente tem dúvida sobre prazo',
  'Cliente tem dúvida sobre lance',
  'Cliente precisa organizar renda',
  'Cliente precisa alinhar valor da carta',
  'Cliente não respondeu',
  'Cliente pediu retorno depois',
  'Cliente não tem aderência no momento',
  'Outro',
];

const NEXT_ACTION_OPTIONS = [
  'Enviar mensagem no WhatsApp',
  'Ligar para o cliente',
  'Agendar reunião',
  'Enviar simulação',
  'Solicitar documentos',
  'Explicar regras do consórcio',
  'Avaliar possibilidade de lance',
  'Aguardar retorno',
  'Marcar como sem aderência',
  'Encerrar atendimento',
  'Outro',
];

type AssignableMember = {
  id: string;
  user_id: string | null;
  name: string | null;
  email: string | null;
  role: string;
  status: string;
};

export default function AdminLeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { leads, updateLead } = useLeadsStore();
  const access = useAdminAccess();
  const lead = leads.find((l) => l.id === id);

  const [observacaoPadrao, setObservacaoPadrao] = useState('');
  const [proximaAcaoPadrao, setProximaAcaoPadrao] = useState('');
  const [observacaoLivre, setObservacaoLivre] = useState(lead?.observacoes || '');
  const [proximaAcao, setProximaAcao] = useState(lead?.proximaAcao || '');
  const [teamMembers, setTeamMembers] = useState<AssignableMember[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);

  useEffect(() => {
    async function loadAssignableMembers() {
      if (!lead?.parceiro && !access.companyId) return;

      setIsLoadingTeam(true);

      try {
        let companyId = access.companyId;

        if (!companyId && lead.parceiro) {
          const { data: company } = await supabase
            .from('partner_companies')
            .select('id')
            .eq('slug', lead.parceiro)
            .maybeSingle();

          companyId = company?.id || null;
        }

        if (!companyId) return;

        const { data, error } = await supabase
          .from('partner_company_users')
          .select('id,user_id,name,email,role,status')
          .eq('company_id', companyId)
          .in('role', ['company_admin', 'company_manager', 'company_consultant'])
          .in('status', ['active', 'pending_auth'])
          .order('name', { ascending: true });

        if (error) throw error;

        setTeamMembers((data || []) as AssignableMember[]);
      } catch (error) {
        console.error('Erro ao carregar equipe para atribuição:', error);
      } finally {
        setIsLoadingTeam(false);
      }
    }

    void loadAssignableMembers();
  }, [lead?.parceiro, access.companyId]);

  useEffect(() => {
    if (!lead) return;

    const existingObservation = lead.observacoes || '';
    const matchedObservation = OBSERVATION_OPTIONS.find((option) => option === existingObservation);

    if (matchedObservation) {
      setObservacaoPadrao(matchedObservation);
      setObservacaoLivre('');
    } else {
      setObservacaoPadrao('');
      setObservacaoLivre(existingObservation);
    }

    const existingNextAction = lead.proximaAcao || '';
    const matchedNextAction = NEXT_ACTION_OPTIONS.find((option) => option === existingNextAction);

    if (matchedNextAction) {
      setProximaAcaoPadrao(matchedNextAction);
      setProximaAcao('');
    } else {
      setProximaAcaoPadrao('');
      setProximaAcao(existingNextAction);
    }
  }, [lead?.id, lead?.observacoes, lead?.proximaAcao]);

  if (!lead) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-[var(--text-muted)]">Lead não encontrado.</p>
          <button onClick={() => navigate('/admin/leads')} className="mt-4 text-sm text-[var(--deep-blue)] underline">
            Voltar para lista
          </button>
        </div>
      </AdminLayout>
    );
  }

  const profile = PROFILES.find((p) => p.id === lead.perfilPrincipal);

  const profileColors: Record<string, string> = {
    financiamento: 'bg-emerald-100 text-emerald-700',
    consorcio: 'bg-amber-100 text-amber-700',
    hibrida: 'bg-indigo-100 text-indigo-700',
    reorganizacao: 'bg-cyan-100 text-cyan-700',
    investidor: 'bg-orange-100 text-orange-700',
    emocional: 'bg-amber-100 text-amber-800',
  };

  const profileLabels: Record<string, string> = {
    financiamento: 'Consórcio Planejado',
    consorcio: 'Lance Estratégico',
    hibrida: 'Estratégia Patrimonial',
    reorganizacao: 'Troca ou Upgrade',
    investidor: 'Preparação para Consórcio',
    emocional: 'Análise de Aderência',
  };

  const canAssignLead =
    access.isMasterAdmin ||
    access.isCompanyAdmin ||
    access.isCompanyManager;

  const assignedMember = teamMembers.find(
    (member) => member.user_id && member.user_id === lead.assignedToUserId
  );

  const responsibleLabel =
    assignedMember?.name ||
    assignedMember?.email ||
    lead.responsavel ||
    'Sem responsável definido';

  const handleStatusChange = (newStatus: string) => {
    updateLead(lead.id, { status: newStatus });
    toast({ title: 'Status atualizado', description: `Lead movido para: ${newStatus}` });
  };

  const handleSaveNotes = () => {
    const observacaoFinal = [
      observacaoPadrao,
      observacaoLivre.trim(),
    ].filter(Boolean).join(' — ');

    const proximaAcaoFinal = [
      proximaAcaoPadrao,
      proximaAcao.trim(),
    ].filter(Boolean).join(' — ');

    updateLead(lead.id, {
      observacoes: observacaoFinal,
      proximaAcao: proximaAcaoFinal,
    });

    toast({ title: 'Salvo', description: 'Observações e próxima ação atualizadas com sucesso.' });
  };

  const handleTempChange = (temp: LeadTemperature) => {
    updateLead(lead.id, { temperatura: temp });
  };

  const handleAssigneeChange = (memberId: string) => {
    if (!memberId) {
      updateLead(lead.id, {
        responsavel: undefined,
        assignedToUserId: undefined,
        assignedAt: undefined,
        assignedByUserId: undefined,
      });
      toast({ title: 'Responsável removido', description: 'O lead ficou sem consultor responsável.' });
      return;
    }

    const member = teamMembers.find((item) => item.id === memberId);
    if (!member) return;

    updateLead(lead.id, {
      responsavel: member.name || member.email || 'Responsável sem nome',
      assignedToUserId: member.user_id || undefined,
      assignedAt: new Date().toISOString(),
      assignedByUserId: access.userId || undefined,
    });

    toast({
      title: 'Responsável atualizado',
      description: `${member.name || member.email} foi vinculado a este lead.`,
    });
  };

  return (
    <AdminLayout>
      <button onClick={() => navigate('/admin/leads')} className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--graphite)] mb-4">
        <ArrowLeft className="size-4" />
        Voltar para leads
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Personal Data */}
          <div className="bg-white rounded-xl p-5 border border-[var(--medium-gray)]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-[var(--deep-blue)] font-sans">{lead.dados.nome}</h1>
                <p className="text-sm text-[var(--text-muted)] mt-0.5">{lead.dados.cidade}/{lead.dados.estado}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${profileColors[lead.perfilPrincipal]}`}>
                {profile?.nome || lead.perfilPrincipal}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-[var(--graphite)]">
                <Phone className="size-4 text-[var(--text-muted)]" />
                {formatPhone(lead.dados.whatsapp)}
              </div>
              {lead.dados.email && (
                <div className="flex items-center gap-2 text-sm text-[var(--graphite)]">
                  <Mail className="size-4 text-[var(--text-muted)]" />
                  {lead.dados.email}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-[var(--graphite)]">
                <MapPin className="size-4 text-[var(--text-muted)]" />
                {lead.dados.cidade}/{lead.dados.estado}
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--graphite)]">
                <Calendar className="size-4 text-[var(--text-muted)]" />
                {lead.dataEntrada}
              </div>
            </div>
            {lead.tags.length > 0 && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <Tag className="size-3.5 text-[var(--text-muted)]" />
                {lead.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-[var(--graphite)] px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Scores */}
          <div className="bg-white rounded-xl p-5 border border-[var(--medium-gray)]">
            <h3 className="font-semibold text-[var(--graphite)] text-sm mb-3">Pontuação por perfil</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.entries(lead.scores) as [ProfileType, number][]).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs text-[var(--graphite)] capitalize">{key}</span>
                  <span className="text-sm font-bold text-[var(--deep-blue)] tabular-nums">{value}</span>
                </div>
              ))}
            </div>
            {lead.perfilSecundario && (
              <p className="mt-3 text-xs text-[var(--text-muted)]">
                Tendência secundária: <span className="font-medium text-[var(--graphite)]">{lead.perfilSecundario}</span>
              </p>
            )}
          </div>


          {/* Quiz Answers */}
          <div className="bg-white rounded-xl p-5 border border-[var(--medium-gray)]">
            <h3 className="font-semibold text-[var(--graphite)] text-sm mb-3">Respostas do diagnóstico</h3>
            {lead.respostas.length > 0 ? (
              <div className="space-y-3">
                {lead.respostas
                  .sort((a, b) => a.questionIndex - b.questionIndex)
                  .map((answer) => {
                    const question = QUESTIONS[answer.questionIndex];
                    const option = question?.opcoes[answer.answerIndex];
                    if (!question || !option) return null;
                    return (
                      <div key={answer.questionIndex} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <p className="text-xs font-medium text-[var(--deep-blue)]">{answer.questionIndex + 1}. {question.pergunta}</p>
                        <p className="mt-1 text-sm text-[var(--graphite)]">{option.text}</p>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">Este lead de demonstração não possui respostas registradas.</p>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl p-5 border border-[var(--medium-gray)]">
            <h3 className="font-semibold text-[var(--graphite)] text-sm mb-3">Observações e próxima ação</h3>

            <label className="block mb-3">
              <span className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase text-[var(--text-muted)]">
                <ClipboardList className="size-3.5" />
                Observação padronizada
              </span>
              <select
                value={observacaoPadrao}
                onChange={(e) => setObservacaoPadrao(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--medium-gray)] text-sm focus:outline-none focus:ring-2 focus:ring-[#C47A21]/35"
              >
                <option value="">Selecione uma observação</option>
                {OBSERVATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="block mb-3">
              <span className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase text-[var(--text-muted)]">
                <ListTodo className="size-3.5" />
                Próxima ação padronizada
              </span>
              <select
                value={proximaAcaoPadrao}
                onChange={(e) => setProximaAcaoPadrao(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--medium-gray)] text-sm focus:outline-none focus:ring-2 focus:ring-[#C47A21]/35"
              >
                <option value="">Selecione a próxima ação</option>
                {NEXT_ACTION_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="block mb-3">
              <span className="mb-1 block text-xs font-semibold uppercase text-[var(--text-muted)]">
                Detalhe complementar opcional
              </span>
              <textarea
                value={observacaoLivre}
                onChange={(e) => setObservacaoLivre(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-[var(--medium-gray)] text-sm focus:outline-none focus:ring-2 focus:ring-[#C47A21]/35"
                placeholder="Ex.: cliente pediu retorno amanhã às 14h; pediu comparação entre carta de 350 mil e 450 mil..."
              />
            </label>

            <label className="block mb-3">
              <span className="mb-1 block text-xs font-semibold uppercase text-[var(--text-muted)]">
                Detalhe da próxima ação opcional
              </span>
              <input
                type="text"
                value={proximaAcao}
                onChange={(e) => setProximaAcao(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--medium-gray)] text-sm focus:outline-none focus:ring-2 focus:ring-[#C47A21]/35"
                placeholder="Ex.: retorno em 05/06 às 10h; enviar simulação da carta de 450 mil..."
              />
            </label>

            <button
              onClick={handleSaveNotes}
              className="px-4 py-2 rounded-lg bg-[var(--deep-blue)] text-white text-sm font-medium hover:bg-[var(--navy)]"
            >
              Salvar
            </button>
          </div>

          {/* History */}
          <div className="bg-white rounded-xl p-5 border border-[var(--medium-gray)]">
            <h3 className="font-semibold text-[var(--graphite)] text-sm mb-3">Histórico</h3>
            <div className="space-y-2">
              {lead.historico.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-xs text-[var(--text-muted)] whitespace-nowrap tabular-nums">{item.data}</span>
                  <span className="text-[var(--graphite)]">{item.acao}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-white rounded-xl p-5 border border-[var(--medium-gray)]">
            <h3 className="font-semibold text-[var(--graphite)] text-sm mb-3">Status</h3>
            <select
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--medium-gray)] text-sm focus:outline-none focus:ring-2 focus:ring-[#C47A21]/35"
            >
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Responsible */}
          <div className="bg-white rounded-xl p-5 border border-[var(--medium-gray)]">
            <h3 className="font-semibold text-[var(--graphite)] text-sm mb-3">Responsável pelo lead</h3>
            {canAssignLead ? (
              <>
                <select
                  value={assignedMember?.id || ''}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  disabled={isLoadingTeam}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--medium-gray)] text-sm focus:outline-none focus:ring-2 focus:ring-[#C47A21]/35 disabled:opacity-60"
                >
                  <option value="">Sem responsável</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {(member.name || member.email || 'Usuário sem nome')} · {member.role === 'company_manager' ? 'Gestor' : member.role === 'company_admin' ? 'Contratante' : 'Consultor'}{!member.user_id ? ' · pendente de login' : ''}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Atual: {responsibleLabel}
                </p>
              </>
            ) : (
              <div className="rounded-lg border border-[var(--medium-gray)] bg-slate-50 px-3 py-2 text-sm text-[var(--graphite)]">
                {responsibleLabel}
              </div>
            )}
          </div>

          {/* Temperature */}
          <div className="bg-white rounded-xl p-5 border border-[var(--medium-gray)]">
            <h3 className="font-semibold text-[var(--graphite)] text-sm mb-3">Temperatura</h3>
            <div className="flex gap-2">
              {(['quente', 'morno', 'nutricao', 'premium', 'risco'] as const).map((temp) => (
                <button
                  key={temp}
                  onClick={() => handleTempChange(temp)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                    lead.temperatura === temp
                      ? temp === 'quente' ? 'bg-red-100 text-red-700' : temp === 'morno' ? 'bg-amber-100 text-amber-700' : temp === 'premium' ? 'bg-emerald-100 text-emerald-700' : temp === 'risco' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {temp}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-xl p-5 border border-[var(--medium-gray)]">
            <h3 className="font-semibold text-[var(--graphite)] text-sm mb-3">Informações</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Origem</span>
                <span className="text-[var(--graphite)] font-medium">{lead.origem}</span>
              </div>
              {lead.parceiro && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Parceiro</span>
                  <span className="text-[var(--graphite)] font-medium">{lead.parceiro}</span>
                </div>
              )}
              {lead.responsavel && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Responsável</span>
                  <span className="text-[var(--graphite)] font-medium">{lead.responsavel}</span>
                </div>
              )}
              {lead.faixaImovel && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Faixa imóvel</span>
                  <span className="text-[var(--graphite)] font-medium">{lead.faixaImovel}</span>
                </div>
              )}
              {lead.faixaRenda && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Faixa renda</span>
                  <span className="text-[var(--graphite)] font-medium">{lead.faixaRenda}</span>
                </div>
              )}
              {lead.entradaDisponivel && (
                <div className="flex justify-between gap-3">
                  <span className="text-[var(--text-muted)]">Entrada</span>
                  <span className="text-[var(--graphite)] font-medium text-right">{lead.entradaDisponivel}</span>
                </div>
              )}
              {lead.produtoRecomendado && (
                <div className="flex justify-between gap-3">
                  <span className="text-[var(--text-muted)]">Produto</span>
                  <span className="text-[var(--graphite)] font-medium text-right">{lead.produtoRecomendado}</span>
                </div>
              )}
            </div>
          </div>

          <button
          onClick={() => navigate(`/admin/leads/${lead.id}/relatorio`)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--deep-blue)] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--navy)]"
          >
          <FileText className="size-4" />
          Gerar relatório
          </button>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/55${lead.dados.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-[var(--green-accent)] text-white text-sm font-medium hover:bg-[var(--green-light)] transition-colors"
          >
            <MessageCircle className="size-4" />
            Abrir WhatsApp
          </a>
        </div>
      </div>
    </AdminLayout>
  );
}
