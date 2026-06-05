import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { supabase } from '@/lib/supabase';
import {
  BarChart3,
  Building2,
  Database,
  Filter,
  Layers3,
  RefreshCw,
  Users,
} from 'lucide-react';

type EpsaProduct = {
  id: string;
  product_key: string;
  product_name: string;
  description: string | null;
  status: string | null;
  public_url: string | null;
  admin_url: string | null;
};

type EpsaLead = {
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
};

const statusLabels: Record<string, string> = {
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
};

const statusAliases: Record<string, string> = {
  'Novo diagnóstico': 'novo_diagnostico',
  'Aguardando qualificação': 'novo_diagnostico',
  'Em contato': 'em_atendimento',
  'Qualificado': 'em_atendimento',
  'Em análise/simulação': 'proposta_apresentada',
  'Proposta enviada': 'proposta_apresentada',
  'Em negociação': 'proposta_apresentada',
  'Perdido': 'venda_perdida',
  'Venda realizada': 'venda_realizada',
};

const productLabels: Record<string, string> = {
  mci_imobiliario: 'MCI Imobiliário',
  mci_consorcio_imobiliario: 'MCI Consórcio Imobiliário',
  mci_consorcio_auto: 'MCI Consórcio Auto',
};

function normalizeStatus(status?: string | null) {
  if (!status) return 'sem_status';
  return statusAliases[status] || status;
}

function labelStatus(status?: string | null) {
  const normalized = normalizeStatus(status);
  if (normalized === 'sem_status') return 'Sem status';
  return statusLabels[normalized] || normalized;
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('pt-BR');
}

export default function MatrizDashboard() {
  const [products, setProducts] = useState<EpsaProduct[]>([]);
  const [leads, setLeads] = useState<EpsaLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [productFilter, setProductFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  async function loadMatrizData() {
    setIsLoading(true);
    setSyncError(null);

    try {
      const [productsResponse, leadsResponse] = await Promise.all([
        supabase.from('epsa_products').select('*').order('product_name', { ascending: true }),
        supabase.from('epsa_all_leads').select('*').order('created_at', { ascending: false }),
      ]);

      if (productsResponse.error) throw productsResponse.error;
      if (leadsResponse.error) throw leadsResponse.error;

      setProducts((productsResponse.data || []) as EpsaProduct[]);
      setLeads((leadsResponse.data || []) as EpsaLead[]);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Erro ao carregar visão matriz.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadMatrizData();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesProduct = !productFilter || lead.product_key === productFilter;
      const matchesStatus = !statusFilter || normalizeStatus(lead.status) === statusFilter;
      return matchesProduct && matchesStatus;
    });
  }, [leads, productFilter, statusFilter]);

  const productsCount = products.length;
  const activeProducts = products.filter((product) => product.status === 'active').length;
  const totalLeads = filteredLeads.length;
  const totalPartners = new Set(filteredLeads.map((lead) => lead.partner_slug).filter(Boolean)).size;
  const sales = filteredLeads.filter((lead) => normalizeStatus(lead.status) === 'venda_realizada').length;
  const conversion = totalLeads > 0 ? ((sales / totalLeads) * 100).toFixed(1) : '0.0';

  const leadsByProduct = useMemo(() => {
    return filteredLeads.reduce<Record<string, number>>((acc, lead) => {
      const label = productLabels[lead.product_key] || lead.product_name || lead.product_key;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
  }, [filteredLeads]);

  const leadsByStatus = useMemo(() => {
    return filteredLeads.reduce<Record<string, number>>((acc, lead) => {
      const label = labelStatus(lead.status);
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
  }, [filteredLeads]);

  const leadsByPartner = useMemo(() => {
    return filteredLeads.reduce<Record<string, number>>((acc, lead) => {
      const label = lead.partner_name || lead.partner_slug || 'Direto / sem parceiro';
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
  }, [filteredLeads]);

  const productOptions = products.length
    ? products
    : Array.from(new Set(leads.map((lead) => lead.product_key))).map((productKey) => ({
        id: productKey,
        product_key: productKey,
        product_name: productLabels[productKey] || productKey,
        description: null,
        status: 'active',
        public_url: null,
        admin_url: null,
      }));

  const statusOptions = useMemo(() => {
    return Array.from(new Set(leads.map((lead) => normalizeStatus(lead.status)).filter((status) => status !== 'sem_status')));
  }, [leads]);

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C47A21]">
            Admin EPSA / Matriz
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--deep-blue)] font-sans">
            Visão Geral do Ecossistema
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Consolidação inicial de produtos, leads, parceiros e indicadores da operação MCI.
          </p>
        </div>

        <button
          onClick={() => void loadMatrizData()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--medium-gray)] bg-white px-4 py-2 text-sm font-medium text-[var(--graphite)] hover:bg-gray-50"
        >
          <RefreshCw className="size-4" />
          Atualizar
        </button>
      </div>

      {syncError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {syncError}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-[var(--medium-gray)] bg-white p-4 md:grid-cols-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--graphite)]">
          <Filter className="size-4 text-[#C47A21]" />
          Filtros da matriz
        </div>

        <select
          value={productFilter}
          onChange={(event) => setProductFilter(event.target.value)}
          className="rounded-lg border border-[var(--medium-gray)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C47A21]/30"
        >
          <option value="">Todos os produtos</option>
          {productOptions.map((product) => (
            <option key={product.product_key} value={product.product_key}>
              {product.product_name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-[var(--medium-gray)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C47A21]/30"
        >
          <option value="">Todos os status</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {labelStatus(status)}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-[var(--medium-gray)] bg-white p-8 text-center text-sm text-[var(--text-muted)]">
          Carregando visão matriz...
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-6">
            <MatrizCard icon={<Layers3 className="size-5" />} label="Produtos cadastrados" value={productsCount} />
            <MatrizCard icon={<Database className="size-5" />} label="Produtos ativos" value={activeProducts} color="bg-blue-600" />
            <MatrizCard icon={<Users className="size-5" />} label="Leads consolidados" value={totalLeads} color="bg-[var(--deep-blue)]" />
            <MatrizCard icon={<Building2 className="size-5" />} label="Parceiros com leads" value={totalPartners} color="bg-[#C47A21]" />
            <MatrizCard icon={<BarChart3 className="size-5" />} label="Vendas registradas" value={sales} color="bg-emerald-600" />
            <MatrizCard icon={<BarChart3 className="size-5" />} label="Conversão geral" value={`${conversion}%`} color="bg-violet-600" />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <BreakdownCard title="Leads por produto" data={leadsByProduct} total={totalLeads} />
            <BreakdownCard title="Leads por status" data={leadsByStatus} total={totalLeads} />
            <BreakdownCard title="Leads por parceiro" data={leadsByPartner} total={totalLeads} />
          </div>

          <div className="mt-6 rounded-xl border border-[var(--medium-gray)] bg-white">
            <div className="border-b border-[var(--medium-gray)] p-5">
              <h2 className="font-semibold text-[var(--graphite)]">
                Últimos leads consolidados
              </h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Primeira visão global. Nesta fase, os dados vêm do MCI Consórcio e do MCI Imobiliário no mesmo Supabase.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-[var(--graphite)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Produto</th>
                    <th className="px-4 py-3 font-medium">Lead</th>
                    <th className="px-4 py-3 font-medium">Parceiro</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--medium-gray)]">
                  {filteredLeads.slice(0, 12).map((lead) => (
                    <tr key={`${lead.product_key}-${lead.lead_id}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-[var(--deep-blue)]">
                        {productLabels[lead.product_key] || lead.product_name}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--graphite)]">{lead.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{lead.phone || lead.email || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">
                        {lead.partner_name || lead.partner_slug || 'Direto'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                          {labelStatus(lead.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">
                        {formatDate(lead.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLeads.length === 0 && (
                <div className="p-8 text-center text-sm text-[var(--text-muted)]">
                  Nenhum lead encontrado para os filtros selecionados.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function MatrizCard({
  icon,
  label,
  value,
  color = 'bg-[var(--deep-blue)]',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--medium-gray)] bg-white p-4">
      <div className={`mb-4 flex size-10 items-center justify-center rounded-xl text-white ${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-[var(--deep-blue)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

function BreakdownCard({
  title,
  data,
  total,
}: {
  title: string;
  data: Record<string, number>;
  total: number;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="rounded-xl border border-[var(--medium-gray)] bg-white p-5">
      <h3 className="mb-4 font-semibold text-[var(--graphite)]">{title}</h3>
      <div className="space-y-3">
        {entries.map(([label, count]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="line-clamp-1 text-sm text-[var(--graphite)]">{label}</span>
            <div className="flex min-w-[110px] items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[var(--deep-blue)]"
                  style={{ width: total > 0 ? `${Math.max((count / total) * 100, 6)}%` : '0%' }}
                />
              </div>
              <span className="w-7 text-right text-sm font-bold text-[var(--deep-blue)]">{count}</span>
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">Sem dados para exibir.</p>
        )}
      </div>
    </div>
  );
}
