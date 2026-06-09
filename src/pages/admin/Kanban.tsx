import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useLeadsStore } from '@/stores/leadsStore';
import { useMatrixStore } from '@/stores/matrixStore';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import KanbanColumn from '@/components/features/KanbanColumn';
import { Search, X } from 'lucide-react';

const KANBAN_COLUMNS = [
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

const MOBILE_FILTERS = [
  { label: 'Todos', value: 'Todos' },
  { label: 'Novo', value: 'Novo diagnóstico' },
  { label: 'Contato', value: 'Contato enviado' },
  { label: 'Respondeu', value: 'Respondeu' },
  { label: 'Não respondeu', value: 'Não respondeu' },
  { label: 'Agendado', value: 'Agendado' },
  { label: 'Atendimento', value: 'Em atendimento' },
  { label: 'Proposta', value: 'Proposta apresentada' },
  { label: 'Venda', value: 'Venda realizada' },
  { label: 'Perdida', value: 'Venda perdida' },
  { label: 'Sem aderência', value: 'Sem aderência' },
];

export default function AdminKanban() {
  const access = useAdminAccess();
  const productStore = useLeadsStore();
  const matrixStore = useMatrixStore();

  const [mobileStatusFilter, setMobileStatusFilter] = useState('Todos');
  const [mobileSearch, setMobileSearch] = useState('');
  const [statusModalLeadId, setStatusModalLeadId] = useState<string | null>(null);

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
  const syncError = access.isMasterAdmin ? matrixStore.syncError : productStore.syncError;

  const handleDrop = (leadId: string, newStatus: string) => {
    moveLead(leadId, newStatus);
  };

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === statusModalLeadId) || null,
    [leads, statusModalLeadId]
  );

  const filteredMobileLeads = useMemo(() => {
    const term = mobileSearch.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesStatus =
        mobileStatusFilter === 'Todos' || lead.status === mobileStatusFilter;

      const searchableText = [
        lead.dados.nome,
        lead.dados.email,
        lead.dados.whatsapp,
        lead.dados.cidade,
        lead.dados.estado,
        lead.status,
        lead.perfilPrincipal,
        lead.responsavel,
        lead.parceiroNome,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !term || searchableText.includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [leads, mobileSearch, mobileStatusFilter]);

  const handleMobileStatusChange = (leadId: string, newStatus: string) => {
    moveLead(leadId, newStatus);
    setStatusModalLeadId(null);
  };

  const statusCount = (status: string) => {
    if (status === 'Todos') return leads.length;
    return leads.filter((lead) => lead.status === status).length;
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        {access.isMasterAdmin && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C47A21]">
            Admin EPSA / Matriz
          </p>
        )}
        <h1 className="mt-1 text-2xl font-bold text-[var(--deep-blue)] font-sans">
          Kanban Comercial
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {access.isMasterAdmin
            ? 'Funil consolidado de todos os produtos MCI conectados.'
            : 'Funil operacional do MCI Consórcio Imobiliário.'}
        </p>
      </div>

      {syncError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {syncError}
        </div>
      )}

      <div className="mb-4 rounded-xl border border-[var(--medium-gray)] bg-white p-4 text-sm text-[var(--text-muted)]">
        <strong className="text-[var(--graphite)]">Fluxo recomendado:</strong>{' '}
        Novo diagnóstico → Contato enviado → Respondeu → Agendado → Em atendimento → Proposta apresentada → Venda realizada.
      </div>

      {/* Mobile: lista operacional com filtros por status */}
      <div className="space-y-4 md:hidden">
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <strong>Uso no celular:</strong> filtre por etapa e altere o status pelo botão do card.
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-max gap-2">
            {MOBILE_FILTERS.map((filter) => {
              const active = mobileStatusFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setMobileStatusFilter(filter.value)}
                  className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? 'border-[var(--deep-blue)] bg-[var(--deep-blue)] text-white'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  {filter.label}
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {statusCount(filter.value)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={mobileSearch}
            onChange={(event) => setMobileSearch(event.target.value)}
            placeholder="Buscar por nome, cidade, e-mail ou responsável..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-[var(--deep-blue)] focus:ring-2 focus:ring-[var(--deep-blue)]/10"
          />
        </div>

        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-semibold text-[var(--deep-blue)]">
            {mobileStatusFilter === 'Todos' ? 'Todos os leads' : mobileStatusFilter}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {filteredMobileLeads.length} lead{filteredMobileLeads.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="space-y-3">
          {filteredMobileLeads.length === 0 ? (
            <div className="rounded-xl border border-[var(--medium-gray)] bg-white p-6 text-center text-sm text-[var(--text-muted)]">
              Nenhum lead encontrado para este filtro.
            </div>
          ) : (
            filteredMobileLeads.map((lead) => (
              <article
                key={lead.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-[var(--graphite)]">
                      {lead.dados.nome}
                    </h3>
                    <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                      {[lead.dados.cidade, lead.dados.estado].filter(Boolean).join('/')}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {lead.status}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {lead.perfilPrincipal && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {lead.perfilPrincipal}
                    </span>
                  )}

                  {lead.responsavel && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {lead.responsavel}
                    </span>
                  )}

                  {lead.parceiroNome && (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      {lead.parceiroNome}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setStatusModalLeadId(lead.id)}
                  className="mt-4 w-full rounded-lg bg-[var(--deep-blue)] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Alterar status
                </button>
              </article>
            ))
          )}
        </div>

        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/40 px-3 pb-3">
            <div className="max-h-[82vh] w-full overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Alterar status
                  </p>
                  <h3 className="mt-1 truncate text-lg font-bold text-[var(--deep-blue)]">
                    {selectedLead.dados.nome}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Status atual: <strong>{selectedLead.status}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStatusModalLeadId(null)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"
                  aria-label="Fechar"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="max-h-[62vh] space-y-2 overflow-y-auto p-4">
                {KANBAN_COLUMNS.map((status) => {
                  const active = selectedLead.status === status;

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleMobileStatusChange(selectedLead.id, status)}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold ${
                        active
                          ? 'border-[var(--deep-blue)] bg-[var(--deep-blue)] text-white'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <span>{status}</span>
                      {active && <span className="text-xs font-medium opacity-80">Atual</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop/tablet: mantém Kanban com arrastar e soltar */}
      <div className="hidden overflow-x-auto pb-4 md:block">
        <div className="flex min-w-max gap-4">
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column}
              title={column}
              leads={leads.filter((l) => l.status === column)}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
