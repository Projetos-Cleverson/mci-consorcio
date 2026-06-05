import { useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useLeadsStore } from '@/stores/leadsStore';
import { useMatrixStore } from '@/stores/matrixStore';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { exportToCSV } from '@/lib/utils';
import { Download, BarChart3, PieChart, TrendingUp, Layers3 } from 'lucide-react';

export default function AdminReports() {
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
  const syncError = access.isMasterAdmin ? matrixStore.syncError : productStore.syncError;

  const totalLeads = leads.length;

  const today = new Date();

  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  const startOf7Days = new Date(today);
  startOf7Days.setDate(today.getDate() - 6);
  startOf7Days.setHours(0, 0, 0, 0);

  const startOf15Days = new Date(today);
  startOf15Days.setDate(today.getDate() - 14);
  startOf15Days.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const getLeadDate = (date: string) => {
    const parsed = new Date(`${date}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const leadsHoje = leads.filter((l) => {
    const date = getLeadDate(l.dataEntrada);
    return date && date >= startOfToday;
  }).length;

  const leadsSemana = leads.filter((l) => {
    const date = getLeadDate(l.dataEntrada);
    return date && date >= startOf7Days;
  }).length;

  const leadsQuinzena = leads.filter((l) => {
    const date = getLeadDate(l.dataEntrada);
    return date && date >= startOf15Days;
  }).length;

  const leadsMes = leads.filter((l) => {
    const date = getLeadDate(l.dataEntrada);
    return date && date >= startOfMonth;
  }).length;

  const volumeLeads = {
    Hoje: leadsHoje,
    'Últimos 7 dias': leadsSemana,
    'Últimos 15 dias': leadsQuinzena,
    'Mês atual': leadsMes,
  };
  const vendas = leads.filter((l) => l.status === 'Venda realizada').length;
  const perdidos = leads.filter((l) => ['Não respondeu', 'Venda perdida', 'Sem aderência'].includes(l.status)).length;
  const propostas = leads.filter((l) => l.status === 'Proposta apresentada').length;
  const responderam = leads.filter((l) => l.status === 'Respondeu').length;
  const agendados = leads.filter((l) => l.status === 'Agendado').length;
  const conversao = totalLeads > 0 ? ((vendas / totalLeads) * 100).toFixed(1) : '0';
  const taxaResposta = totalLeads > 0 ? ((responderam / totalLeads) * 100).toFixed(1) : '0';
  const taxaAgendamento = totalLeads > 0 ? ((agendados / totalLeads) * 100).toFixed(1) : '0';
  const taxaProposta = totalLeads > 0 ? ((propostas / totalLeads) * 100).toFixed(1) : '0';

  const byMonth = leads.reduce((acc, l) => {
    const month = l.dataEntrada.slice(0, 7);
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byStatus = leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byProduct = leads.reduce((acc, l) => {
    const product = l.produtoRecomendado || 'MCI Consórcio Imobiliário';
    acc[product] = (acc[product] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byOrigem = leads.reduce((acc, l) => {
    if (!acc[l.origem]) acc[l.origem] = 0;
    acc[l.origem] += 1;
    return acc;
  }, {} as Record<string, number>);

  const handleFullExport = () => {
    const data = leads.map((l) => ({
      Produto: l.produtoRecomendado || 'MCI Consórcio Imobiliário',
      Nome: l.dados.nome,
      WhatsApp: l.dados.whatsapp,
      Email: l.dados.email || '',
      Cidade: l.dados.cidade,
      Estado: l.dados.estado,
      Perfil: l.perfilPrincipal,
      PerfilSecundario: l.perfilSecundario || '',
      Origem: l.origem,
      Parceiro: l.parceiro || '',
      Status: l.status,
      Temperatura: l.temperatura,
      Responsavel: l.responsavel || '',
      FaixaImovel: l.faixaImovel || '',
      FaixaRenda: l.faixaRenda || '',
      Tags: l.tags.join('; '),
      Observacoes: l.observacoes,
      ProximaAcao: l.proximaAcao || '',
      DataEntrada: l.dataEntrada,
    }));
    exportToCSV(data, `${access.isMasterAdmin ? 'relatorio_matriz' : 'relatorio_mci_consorcio'}_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          {access.isMasterAdmin && (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C47A21]">
              Admin EPSA / Matriz
            </p>
          )}
          <h1 className="mt-1 text-2xl font-bold text-[var(--deep-blue)] font-sans">Relatórios</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {access.isMasterAdmin
              ? 'Indicadores consolidados dos produtos MCI conectados.'
              : 'Indicadores operacionais do MCI Consórcio Imobiliário.'}
          </p>
        </div>
        <button
          onClick={handleFullExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--deep-blue)] text-white text-sm font-medium hover:bg-[var(--navy)]"
        >
          <Download className="size-4" />
          Exportar tudo
        </button>
      </div>

      {syncError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {syncError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-[var(--medium-gray)]">
          <h3 className="font-semibold text-[var(--graphite)] text-sm mb-4 flex items-center gap-2">
            <BarChart3 className="size-4" />
            Resumo geral
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Metric label="Total de leads" value={totalLeads} />
            <Metric label="Responderam" value={responderam} className="text-orange-500" />
            <Metric label="Agendados" value={agendados} className="text-violet-600" />
            <Metric label="Propostas" value={propostas} className="text-amber-600" />
            <Metric label="Vendas" value={vendas} className="text-emerald-600" />
            <Metric label="Perdas / sem aderência" value={perdidos} className="text-red-500" />
            <Metric label="Taxa de resposta" value={`${taxaResposta}%`} />
            <Metric label="Taxa de venda" value={`${conversao}%`} />
            <Metric label="Taxa de agendamento" value={`${taxaAgendamento}%`} />
            <Metric label="Taxa de proposta" value={`${taxaProposta}%`} />
          </div>
        </div>

        <Breakdown
          title="Volume de leads"
          icon={<TrendingUp className="size-4" />}
          data={volumeLeads}
          total={Math.max(leadsMes, totalLeads, 1)}
        />

        {access.isMasterAdmin && (
          <Breakdown title="Leads por produto" icon={<Layers3 className="size-4" />} data={byProduct} total={totalLeads} />
        )}

        <Breakdown title="Leads por status comercial" icon={<BarChart3 className="size-4" />} data={byStatus} total={totalLeads} />

        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-[var(--medium-gray)]">
          <h3 className="font-semibold text-[var(--graphite)] text-sm mb-4 flex items-center gap-2">
            <PieChart className="size-4" />
            Origem e regra operacional
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--medium-gray)]">
                <tr>
                  <th className="text-left py-2 font-medium text-[var(--graphite)]">Origem</th>
                  <th className="text-center py-2 font-medium text-[var(--graphite)]">Leads</th>
                  <th className="text-center py-2 font-medium text-[var(--graphite)]">Regra operacional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.entries(byOrigem).map(([origem, total]) => (
                  <tr key={origem}>
                    <td className="py-2 text-[var(--graphite)]">{origem}</td>
                    <td className="py-2 text-center font-semibold tabular-nums">{total}</td>
                    <td className="py-2 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                        Empresa contratante
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function Metric({ label, value, className = 'text-[var(--deep-blue)]' }: { label: string; value: string | number; className?: string }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <p className={`text-2xl font-bold tabular-nums ${className}`}>{value}</p>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

function Breakdown({ title, icon, data, total }: { title: string; icon: React.ReactNode; data: Record<string, number>; total: number }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-[var(--medium-gray)]">
      <h3 className="font-semibold text-[var(--graphite)] text-sm mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="space-y-3">
        {Object.entries(data).sort((a, b) => b[1] - a[1]).map(([key, count]) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <span className="text-sm text-[var(--graphite)] line-clamp-1">{key}</span>
            <div className="flex items-center gap-2 min-w-[130px]">
              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--deep-blue)] rounded-full"
                  style={{ width: total > 0 ? `${Math.max((count / total) * 100, 6)}%` : '0%' }}
                />
              </div>
              <span className="text-sm font-semibold text-[var(--deep-blue)] tabular-nums w-6 text-right">{count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
