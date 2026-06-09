import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { useLeadsStore } from '@/stores/leadsStore';
import { useMatrixStore } from '@/stores/matrixStore';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { exportToCSV, formatPhone } from '@/lib/utils';
import { ORIGENS } from '@/constants/config';
import { Search, Download, Filter, Eye } from 'lucide-react';

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

const tempColors: Record<string, string> = {
  quente: 'text-red-600',
  morno: 'text-amber-600',
  nutricao: 'text-blue-600',
  premium: 'text-emerald-600',
  risco: 'text-rose-600',
};

const statusColors: Record<string, string> = {
  'Novo diagnóstico': 'bg-blue-50 text-blue-700 border-blue-200',
  'Contato enviado': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Respondeu': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Não respondeu': 'bg-slate-50 text-slate-700 border-slate-200',
  Agendado: 'bg-violet-50 text-violet-700 border-violet-200',
  'Em atendimento': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Proposta apresentada': 'bg-amber-50 text-amber-700 border-amber-200',
  'Venda realizada': 'bg-green-50 text-green-700 border-green-200',
  'Venda perdida': 'bg-red-50 text-red-700 border-red-200',
  'Sem aderência': 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function AdminLeads() {
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
  const moveLead = access.isMasterAdmin ? matrixStore.moveLead : productStore.moveLead;
  const isLoading = access.isMasterAdmin ? matrixStore.isLoading : productStore.isLoading;
  const syncError = access.isMasterAdmin ? matrixStore.syncError : productStore.syncError;

  const [search, setSearch] = useState('');
  const [filterPerfil, setFilterPerfil] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterOrigem, setFilterOrigem] = useState('');
  const [filterTemperatura, setFilterTemperatura] = useState('');
  const [filterProduto, setFilterProduto] = useState('');
  const [filterFaixaImovel, setFilterFaixaImovel] = useState('');
  const [filterFaixaRenda, setFilterFaixaRenda] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = !search
        || lead.dados.nome.toLowerCase().includes(search.toLowerCase())
        || lead.dados.whatsapp.includes(search)
        || (lead.dados.email || '').toLowerCase().includes(search.toLowerCase());
      const matchesPerfil = !filterPerfil || lead.perfilPrincipal === filterPerfil;
      const matchesStatus = !filterStatus || lead.status === filterStatus;
      const matchesOrigem = !filterOrigem || lead.origem === filterOrigem;
      const matchesTemperatura = !filterTemperatura || lead.temperatura === filterTemperatura;
      const matchesProduto = !filterProduto || lead.produtoRecomendado === filterProduto;
      const matchesFaixaImovel = !filterFaixaImovel || lead.faixaImovel === filterFaixaImovel;
      const matchesFaixaRenda = !filterFaixaRenda || lead.faixaRenda === filterFaixaRenda;
      return matchesSearch && matchesPerfil && matchesStatus && matchesOrigem && matchesTemperatura && matchesProduto && matchesFaixaImovel && matchesFaixaRenda;
    });
  }, [leads, search, filterPerfil, filterStatus, filterOrigem, filterTemperatura, filterProduto, filterFaixaImovel, filterFaixaRenda]);

  const handleExport = () => {
    const data = filtered.map((l) => ({
      Produto: l.produtoRecomendado || 'MCI Consórcio Imobiliário',
      Nome: l.dados.nome,
      WhatsApp: l.dados.whatsapp,
      Cidade: l.dados.cidade,
      Estado: l.dados.estado,
      Email: l.dados.email || '',
      Perfil: profileLabels[l.perfilPrincipal] || l.perfilPrincipal,
      PerfilSecundario: l.perfilSecundario ? (profileLabels[l.perfilSecundario] || l.perfilSecundario) : '',
      Origem: l.origem,
      EmpresaParceira: l.parceiroNome || l.parceiro || '',
      Status: l.status,
      Temperatura: l.temperatura,
      FaixaImovel: l.faixaImovel || '',
      FaixaRenda: l.faixaRenda || '',
      DataEntrada: l.dataEntrada,
    }));
    exportToCSV(data, `${access.isMasterAdmin ? 'leads_matriz' : 'leads_mci_consorcio'}_${new Date().toISOString().split('T')[0]}`);
  };

  const statusCounts = STATUS_OPTIONS.reduce<Record<string, number>>((acc, status) => {
    acc[status] = leads.filter((lead) => lead.status === status).length;
    return acc;
  }, {});

  const produtosDisponiveis = Array.from(new Set(leads.map((l) => l.produtoRecomendado).filter(Boolean))) as string[];
  const faixasImovel = Array.from(new Set(leads.map((l) => l.faixaImovel).filter(Boolean))) as string[];
  const origensDisponiveis = Array.from(new Set([...ORIGENS, ...leads.map((l) => l.origem).filter(Boolean)]));
  const faixasRenda = Array.from(new Set(leads.map((l) => l.faixaRenda).filter(Boolean))) as string[];

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          {access.isMasterAdmin && (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C47A21]">
              Admin EPSA / Matriz
            </p>
          )}
          <h1 className="mt-1 text-2xl font-bold text-[var(--deep-blue)] font-sans">Leads</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {access.isMasterAdmin ? 'Leads consolidados de todos os produtos conectados.' : 'Leads do MCI Consórcio Imobiliário.'}
            {' '}<strong>{filtered.length}</strong> encontrado{filtered.length !== 1 ? 's' : ''}.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--medium-gray)] text-sm text-[var(--graphite)] hover:bg-gray-50"
          >
            <Filter className="size-4" />
            Filtros
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--deep-blue)] text-white text-sm hover:bg-[var(--navy)]"
          >
            <Download className="size-4" />
            CSV
          </button>
        </div>
      </div>

      {syncError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {syncError}
        </div>
      )}

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou WhatsApp..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--medium-gray)] text-sm focus:outline-none focus:ring-2 focus:ring-[#C47A21]/35"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilterStatus(filterStatus === status ? '' : status)}
            className={`rounded-xl border px-3 py-3 text-left transition hover:shadow-sm ${
              filterStatus === status
                ? statusColors[status] || 'bg-slate-50 text-slate-700 border-slate-200'
                : 'bg-white border-[var(--medium-gray)] text-[var(--graphite)]'
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide leading-tight">{status}</p>
            <p className="mt-1 text-2xl font-bold">{statusCounts[status] || 0}</p>
          </button>
        ))}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mb-4 p-4 bg-white rounded-xl border border-[var(--medium-gray)]">
          {access.isMasterAdmin && (
            <select value={filterProduto} onChange={(e) => setFilterProduto(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--medium-gray)] text-sm">
              <option value="">Todos os produtos</option>
              {produtosDisponiveis.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
          <select value={filterPerfil} onChange={(e) => setFilterPerfil(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--medium-gray)] text-sm">
            <option value="">Todos os perfis</option>
            <option value="financiamento">Consórcio Planejado</option>
            <option value="consorcio">Lance Estratégico</option>
            <option value="hibrida">Estratégia Patrimonial</option>
            <option value="reorganizacao">Troca ou Upgrade</option>
            <option value="investidor">Preparação</option>
            <option value="emocional">Análise de Aderência</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--medium-gray)] text-sm">
            <option value="">Todos os status</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterOrigem} onChange={(e) => setFilterOrigem(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--medium-gray)] text-sm">
            <option value="">Todas as origens</option>
            {origensDisponiveis.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={filterTemperatura} onChange={(e) => setFilterTemperatura(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--medium-gray)] text-sm">
            <option value="">Todas as temperaturas</option>
            <option value="quente">Quente</option>
            <option value="morno">Morno</option>
            <option value="nutricao">Nutrição</option>
            <option value="premium">Premium</option>
            <option value="risco">Risco</option>
          </select>
          <select value={filterFaixaImovel} onChange={(e) => setFilterFaixaImovel(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--medium-gray)] text-sm">
            <option value="">Todas as faixas de imóvel</option>
            {faixasImovel.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <select value={filterFaixaRenda} onChange={(e) => setFilterFaixaRenda(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--medium-gray)] text-sm">
            <option value="">Todas as faixas de renda</option>
            {faixasRenda.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[var(--medium-gray)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-[var(--medium-gray)]">
              <tr>
                {access.isMasterAdmin && <th className="text-left px-4 py-3 font-medium text-[var(--graphite)]">Produto</th>}
                <th className="text-left px-4 py-3 font-medium text-[var(--graphite)]">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--graphite)] hidden sm:table-cell">Cidade</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--graphite)]">Perfil</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--graphite)] hidden md:table-cell">Origem</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--graphite)] hidden lg:table-cell">Status</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--graphite)] hidden lg:table-cell">Temp.</th>
                <th className="text-center px-4 py-3 font-medium text-[var(--graphite)]">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--medium-gray)]">
              {filtered.map((lead) => {
                const isMatrixNonConsorcio = access.isMasterAdmin && !lead.id.startsWith('mci_consorcio_imobiliario__');

                return (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    {access.isMasterAdmin && (
                      <td className="px-4 py-3 text-xs font-semibold text-[var(--deep-blue)]">
                        {lead.produtoRecomendado || 'MCI Consórcio Imobiliário'}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-[var(--graphite)]">{lead.dados.nome}</p>
                        <p className="text-xs text-[var(--text-muted)]">{formatPhone(lead.dados.whatsapp)}</p>
                        <select
                          value={lead.status}
                          onChange={(event) => moveLead(lead.id, event.target.value)}
                          className={`mt-2 block w-full max-w-[190px] rounded-full border px-2 py-1 text-[11px] font-semibold outline-none lg:hidden ${statusColors[lead.status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}
                          aria-label={`Alterar status de ${lead.dados.nome}`}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-[var(--text-muted)]">
                      {lead.dados.cidade}/{lead.dados.estado}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${profileColors[lead.perfilPrincipal]}`}>
                        {profileLabels[lead.perfilPrincipal] || lead.perfilPrincipal}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-[var(--text-muted)] text-xs">{lead.origem}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <select
                        value={lead.status}
                        onChange={(event) => moveLead(lead.id, event.target.value)}
                        className={`min-w-[170px] rounded-full border px-2 py-1 text-xs font-semibold outline-none ${statusColors[lead.status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-xs font-semibold ${tempColors[lead.temperatura]}`}>
                        {lead.temperatura}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isMatrixNonConsorcio ? (
                        <span className="text-xs text-[var(--text-muted)]">Detalhe no produto</span>
                      ) : (
                        <Link
                          to={`/admin/leads/${access.isMasterAdmin ? lead.id.replace('mci_consorcio_imobiliario__', '') : lead.id}`}
                          className="inline-flex items-center gap-1 text-xs text-[var(--deep-blue)] hover:text-[#C47A21] font-medium"
                        >
                          <Eye className="size-3.5" />
                          Ver
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {isLoading && (
            <div className="text-center py-12 text-sm text-[var(--text-muted)]">
              Carregando leads...
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-[var(--text-muted)]">
              Nenhum lead encontrado com os filtros aplicados.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
