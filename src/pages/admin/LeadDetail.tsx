import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { useLeadsStore } from '@/stores/leadsStore';
import { useToast } from '@/hooks/use-toast';
import { STATUS_OPTIONS } from '@/constants/config';
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
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { leads, updateLead } = useLeadsStore();
  const lead = leads.find((l) => l.id === id);

  const [obs, setObs] = useState(lead?.observacoes || '');
  const [proximaAcao, setProximaAcao] = useState(lead?.proximaAcao || '');

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
    emocional: 'bg-red-100 text-red-700',
  };

  const profileLabels: Record<string, string> = {
    financiamento: 'Consórcio Planejado',
    consorcio: 'Lance Estratégico',
    hibrida: 'Estratégia Patrimonial',
    reorganizacao: 'Troca ou Upgrade',
    investidor: 'Preparação para Consórcio',
    emocional: 'Análise de Aderência',
  };

  const handleStatusChange = (newStatus: string) => {
    updateLead(lead.id, { status: newStatus });
    toast({ title: 'Status atualizado', description: `Lead movido para: ${newStatus}` });
  };

  const handleSaveNotes = () => {
    updateLead(lead.id, { observacoes: obs, proximaAcao });
    toast({ title: 'Salvo', description: 'Observações atualizadas com sucesso.' });
  };

  const handleTempChange = (temp: LeadTemperature) => {
    updateLead(lead.id, { temperatura: temp });
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
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--medium-gray)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--green-accent)]/50 mb-3"
              placeholder="Observações sobre o lead..."
            />
            <input
              type="text"
              value={proximaAcao}
              onChange={(e) => setProximaAcao(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--medium-gray)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--green-accent)]/50 mb-3"
              placeholder="Próxima ação..."
            />
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
              className="w-full px-3 py-2 rounded-lg border border-[var(--medium-gray)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--green-accent)]/50"
            >
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
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
