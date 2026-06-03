import AdminLayout from '@/components/layout/AdminLayout';
import { useLeadsStore } from '@/stores/leadsStore';
import StatsCard from '@/components/features/StatsCard';
import {
  Users,
  UserPlus,
  Flame,
  MessageCircle,
  CheckCircle2,
  TrendingUp,
  Building,
  DollarSign,
} from 'lucide-react';

export default function Dashboard() {
  const { leads } = useLeadsStore();

  const totalLeads = leads.length;
  const novos = leads.filter((l) => l.status === 'Novo diagnóstico').length;
  const quentes = leads.filter((l) => l.temperatura === 'quente').length;
  const emAtendimento = leads.filter((l) => ['Em contato', 'Qualificado', 'Encaminhado para especialista', 'Em análise/simulação'].includes(l.status)).length;
  const vendas = leads.filter((l) => l.status === 'Venda realizada').length;
  const conversao = totalLeads > 0 ? ((vendas / totalLeads) * 100).toFixed(1) : '0';

  const perfilCount = leads.reduce((acc, l) => {
    acc[l.perfilPrincipal] = (acc[l.perfilPrincipal] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const origemCount = leads.reduce((acc, l) => {
    acc[l.origem] = (acc[l.origem] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const faixaImovelCount = leads.reduce((acc, l) => {
    if (l.faixaImovel) acc[l.faixaImovel] = (acc[l.faixaImovel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const faixaRendaCount = leads.reduce((acc, l) => {
    if (l.faixaRenda) acc[l.faixaRenda] = (acc[l.faixaRenda] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const profileLabels: Record<string, string> = {
    financiamento: 'Consórcio Planejado',
    consorcio: 'Lance Estratégico',
    hibrida: 'Estratégia Patrimonial',
    reorganizacao: 'Troca ou Upgrade',
    investidor: 'Preparação para Consórcio',
    emocional: 'Análise de Aderência',
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--deep-blue)] font-sans">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Visão geral dos diagnósticos e leads</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={<Users className="size-5" />} label="Total de leads" value={totalLeads} />
        <StatsCard icon={<UserPlus className="size-5" />} label="Leads novos" value={novos} color="bg-blue-600" />
        <StatsCard icon={<Flame className="size-5" />} label="Leads quentes" value={quentes} color="bg-orange-500" />
        <StatsCard icon={<MessageCircle className="size-5" />} label="Em atendimento" value={emAtendimento} color="bg-purple-600" />
        <StatsCard icon={<CheckCircle2 className="size-5" />} label="Vendas realizadas" value={vendas} color="bg-[var(--green-accent)]" />
        <StatsCard icon={<TrendingUp className="size-5" />} label="Taxa de conversão" value={`${conversao}%`} color="bg-emerald-600" />
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per Profile */}
        <div className="bg-white rounded-xl p-5 border border-[var(--medium-gray)]">
          <h3 className="font-semibold text-[var(--graphite)] text-sm mb-4 flex items-center gap-2">
            <Building className="size-4" />
            Leads por perfil
          </h3>
          <div className="space-y-3">
            {Object.entries(perfilCount).sort((a, b) => b[1] - a[1]).map(([key, count]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-[var(--graphite)]">{profileLabels[key] || key}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--deep-blue)] rounded-full"
                      style={{ width: `${(count / totalLeads) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-[var(--deep-blue)] tabular-nums w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Per Origin */}
        <div className="bg-white rounded-xl p-5 border border-[var(--medium-gray)]">
          <h3 className="font-semibold text-[var(--graphite)] text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="size-4" />
            Leads por origem
          </h3>
          <div className="space-y-3">
            {Object.entries(origemCount).sort((a, b) => b[1] - a[1]).map(([key, count]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-[var(--graphite)]">{key}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--green-accent)] rounded-full"
                      style={{ width: `${(count / totalLeads) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-[var(--deep-blue)] tabular-nums w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Per Property Range */}
        <div className="bg-white rounded-xl p-5 border border-[var(--medium-gray)]">
          <h3 className="font-semibold text-[var(--graphite)] text-sm mb-4 flex items-center gap-2">
            <DollarSign className="size-4" />
            Leads por faixa de imóvel
          </h3>
          <div className="space-y-3">
            {Object.entries(faixaImovelCount).sort((a, b) => b[1] - a[1]).map(([key, count]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-[var(--graphite)]">{key}</span>
                <span className="text-sm font-semibold text-[var(--deep-blue)] tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Per Income */}
        <div className="bg-white rounded-xl p-5 border border-[var(--medium-gray)]">
          <h3 className="font-semibold text-[var(--graphite)] text-sm mb-4 flex items-center gap-2">
            <Users className="size-4" />
            Leads por faixa de renda
          </h3>
          <div className="space-y-3">
            {Object.entries(faixaRendaCount).sort((a, b) => b[1] - a[1]).map(([key, count]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-[var(--graphite)]">{key}</span>
                <span className="text-sm font-semibold text-[var(--deep-blue)] tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
