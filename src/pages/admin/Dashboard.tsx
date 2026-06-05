import { useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useLeadsStore } from '@/stores/leadsStore';
import { useMatrixStore } from '@/stores/matrixStore';
import { useAdminAccess } from '@/hooks/useAdminAccess';
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
  BarChart3,
  Layers3,
} from 'lucide-react';

const profileLabels: Record<string, string> = {
  financiamento: 'Consórcio Planejado',
  consorcio: 'Lance Estratégico',
  hibrida: 'Estratégia Patrimonial',
  reorganizacao: 'Troca ou Upgrade',
  investidor: 'Preparação para Consórcio',
  emocional: 'Análise de Aderência',
};

export default function Dashboard() {
  const access = useAdminAccess();
  const productStore = useLeadsStore();
  const matrixStore = useMatrixStore();

  useEffect(() => {
  if (access.isLoading) return;

  if (access.isMasterAdmin) {
    void matrixStore.loadData();
  } else {
    void productStore.loadData();
  }
}, [access.isLoading, access.isMasterAdmin]);

  const leads = access.isMasterAdmin ? matrixStore.leads : productStore.leads;
  const isLoading = access.isMasterAdmin ? matrixStore.isLoading : productStore.isLoading;
  const syncError = access.isMasterAdmin ? matrixStore.syncError : productStore.syncError;

  const totalLeads = leads.length;
  const novos = leads.filter((l) => l.status === 'Novo diagnóstico').length;
  const contatoEnviado = leads.filter((l) => l.status === 'Contato enviado').length;
  const responderam = leads.filter((l) => l.status === 'Respondeu').length;
  const agendados = leads.filter((l) => l.status === 'Agendado').length;
  const emAtendimento = leads.filter((l) => l.status === 'Em atendimento').length;
  const propostas = leads.filter((l) => l.status === 'Proposta apresentada').length;
  const vendas = leads.filter((l) => l.status === 'Venda realizada').length;
  const perdidos = leads.filter((l) => ['Não respondeu', 'Venda perdida', 'Sem aderência'].includes(l.status)).length;
  const conversao = totalLeads > 0 ? ((vendas / totalLeads) * 100).toFixed(1) : '0';

  const perfilCount = leads.reduce((acc, l) => {
    acc[l.perfilPrincipal] = (acc[l.perfilPrincipal] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const origemCount = leads.reduce((acc, l) => {
    acc[l.origem] = (acc[l.origem] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const produtoCount = leads.reduce((acc, l) => {
    const product = l.produtoRecomendado || 'MCI Consórcio Imobiliário';
    acc[product] = (acc[product] || 0) + 1;
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

  return (
    <AdminLayout>
      <div className="mb-6">
        {access.isMasterAdmin && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C47A21]">
            Admin EPSA / Matriz
          </p>
        )}
        <h1 className="mt-1 text-2xl font-bold text-[var(--deep-blue)] font-sans">
          Dashboard
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {access.isMasterAdmin
            ? 'Visão consolidada dos produtos MCI no Supabase.'
            : 'Visão operacional do MCI Consórcio Imobiliário.'}
        </p>
      </div>

      {syncError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {syncError}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-[var(--medium-gray)] bg-white p-8 text-center text-sm text-[var(--text-muted)]">
          Carregando dados...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatsCard icon={<Users className="size-5" />} label="Total de leads" value={totalLeads} />
            <StatsCard icon={<UserPlus className="size-5" />} label="Novos diagnósticos" value={novos} color="bg-blue-600" />
            <StatsCard icon={<MessageCircle className="size-5" />} label="Contato enviado" value={contatoEnviado} color="bg-cyan-600" />
            <StatsCard icon={<Flame className="size-5" />} label="Responderam" value={responderam} color="bg-orange-500" />
            <StatsCard icon={<Users className="size-5" />} label="Agendados" value={agendados} color="bg-violet-600" />
            <StatsCard icon={<MessageCircle className="size-5" />} label="Em atendimento" value={emAtendimento} color="bg-purple-600" />
            <StatsCard icon={<BarChart3 className="size-5" />} label="Propostas" value={propostas} color="bg-amber-600" />
            <StatsCard icon={<CheckCircle2 className="size-5" />} label="Vendas realizadas" value={vendas} color="bg-emerald-600" />
            <StatsCard icon={<Flame className="size-5" />} label="Perdas / sem aderência" value={perdidos} color="bg-red-500" />
            <StatsCard icon={<TrendingUp className="size-5" />} label="Taxa de conversão" value={`${conversao}%`} color="bg-emerald-700" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {access.isMasterAdmin && (
              <BreakdownCard
                title="Leads por produto"
                icon={<Layers3 className="size-4" />}
                data={produtoCount}
                total={totalLeads}
              />
            )}

            <BreakdownCard
              title="Leads por perfil"
              icon={<Building className="size-4" />}
              data={Object.fromEntries(Object.entries(perfilCount).map(([key, value]) => [profileLabels[key] || key, value]))}
              total={totalLeads}
            />

            <BreakdownCard
              title="Leads por origem"
              icon={<TrendingUp className="size-4" />}
              data={origemCount}
              total={totalLeads}
            />

            <BreakdownCard
              title="Leads por faixa de imóvel"
              icon={<DollarSign className="size-4" />}
              data={faixaImovelCount}
              total={totalLeads}
              simple
            />

            <BreakdownCard
              title="Leads por faixa de renda"
              icon={<Users className="size-4" />}
              data={faixaRendaCount}
              total={totalLeads}
              simple
            />
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function BreakdownCard({
  title,
  icon,
  data,
  total,
  simple = false,
}: {
  title: string;
  icon: React.ReactNode;
  data: Record<string, number>;
  total: number;
  simple?: boolean;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white rounded-xl p-5 border border-[var(--medium-gray)]">
      <h3 className="font-semibold text-[var(--graphite)] text-sm mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="space-y-3">
        {entries.map(([key, count]) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <span className="text-sm text-[var(--graphite)] line-clamp-1">{key}</span>
            {simple ? (
              <span className="text-sm font-semibold text-[var(--deep-blue)] tabular-nums">{count}</span>
            ) : (
              <div className="flex items-center gap-2 min-w-[120px]">
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--deep-blue)] rounded-full"
                    style={{ width: total > 0 ? `${Math.max((count / total) * 100, 6)}%` : '0%' }}
                  />
                </div>
                <span className="text-sm font-semibold text-[var(--deep-blue)] tabular-nums w-6 text-right">{count}</span>
              </div>
            )}
          </div>
        ))}

        {entries.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">Sem dados para exibir.</p>
        )}
      </div>
    </div>
  );
}
