import AdminLayout from '@/components/layout/AdminLayout';
import { useLeadsStore } from '@/stores/leadsStore';
import { exportToCSV } from '@/lib/utils';
import { Download, BarChart3, PieChart, TrendingUp } from 'lucide-react';

export default function AdminReports() {
  const { leads } = useLeadsStore();

  const totalLeads = leads.length;
  const vendas = leads.filter((l) => l.status === 'Venda realizada').length;
  const perdidos = leads.filter((l) => l.status === 'Perdido').length;
  const conversao = totalLeads > 0 ? ((vendas / totalLeads) * 100).toFixed(1) : '0';

  const byMonth = leads.reduce((acc, l) => {
    const month = l.dataEntrada.slice(0, 7);
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byOrigemWithCost = leads.reduce((acc, l) => {
    if (!acc[l.origem]) acc[l.origem] = { total: 0, comissao: 0 };
    acc[l.origem].total += 1;
    if (['Parceiro imobiliária', 'Parceiro construtora', 'Corretor parceiro'].includes(l.origem)) {
      acc[l.origem].comissao = 30;
    } else if (l.origem === 'Tráfego pago') {
      acc[l.origem].comissao = 30;
    }
    return acc;
  }, {} as Record<string, { total: number; comissao: number }>);

  const handleFullExport = () => {
    const data = leads.map((l) => ({
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
    exportToCSV(data, `relatorio_completo_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--deep-blue)] font-sans">Relatórios</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Visão analítica dos dados</p>
        </div>
        <button
          onClick={handleFullExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--deep-blue)] text-white text-sm font-medium hover:bg-[var(--navy)]"
        >
          <Download className="size-4" />
          Exportar tudo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary */}
        <div className="bg-white rounded-xl p-5 border border-[var(--medium-gray)]">
          <h3 className="font-semibold text-[var(--graphite)] text-sm mb-4 flex items-center gap-2">
            <BarChart3 className="size-4" />
            Resumo geral
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-[var(--deep-blue)] tabular-nums">{totalLeads}</p>
              <p className="text-xs text-[var(--text-muted)]">Total de leads</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-[var(--green-accent)] tabular-nums">{vendas}</p>
              <p className="text-xs text-[var(--text-muted)]">Vendas</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-red-500 tabular-nums">{perdidos}</p>
              <p className="text-xs text-[var(--text-muted)]">Perdidos</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-[var(--deep-blue)] tabular-nums">{conversao}%</p>
              <p className="text-xs text-[var(--text-muted)]">Conversão</p>
            </div>
          </div>
        </div>

        {/* By Month */}
        <div className="bg-white rounded-xl p-5 border border-[var(--medium-gray)]">
          <h3 className="font-semibold text-[var(--graphite)] text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="size-4" />
            Leads por mês
          </h3>
          <div className="space-y-3">
            {Object.entries(byMonth).sort().map(([month, count]) => (
              <div key={month} className="flex items-center justify-between">
                <span className="text-sm text-[var(--graphite)]">{month}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
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

        {/* By Origin with Cost */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-[var(--medium-gray)]">
          <h3 className="font-semibold text-[var(--graphite)] text-sm mb-4 flex items-center gap-2">
            <PieChart className="size-4" />
            Origem e custo de aquisição
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--medium-gray)]">
                <tr>
                  <th className="text-left py-2 font-medium text-[var(--graphite)]">Origem</th>
                  <th className="text-center py-2 font-medium text-[var(--graphite)]">Leads</th>
                  <th className="text-center py-2 font-medium text-[var(--graphite)]">Reserva comissão</th>
                  <th className="text-center py-2 font-medium text-[var(--graphite)]">Regra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.entries(byOrigemWithCost).map(([origem, data]) => (
                  <tr key={origem}>
                    <td className="py-2 text-[var(--graphite)]">{origem}</td>
                    <td className="py-2 text-center font-semibold tabular-nums">{data.total}</td>
                    <td className="py-2 text-center">
                      {data.comissao > 0 ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{data.comissao}%</span>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                    <td className="py-2 text-center text-xs text-[var(--text-muted)]">
                      {['Parceiro imobiliária', 'Parceiro construtora', 'Corretor parceiro'].includes(origem)
                        ? 'Comissão/repasse'
                        : origem === 'Tráfego pago'
                        ? 'Custo de aquisição'
                        : 'Sem reserva'}
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
