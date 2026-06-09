import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useLeadsStore } from '@/stores/leadsStore';
import { useMatrixStore } from '@/stores/matrixStore';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import KanbanColumn from '@/components/features/KanbanColumn';

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

export default function AdminKanban() {
  const access = useAdminAccess();
  const productStore = useLeadsStore();
  const matrixStore = useMatrixStore();
  const [openStatusLeadId, setOpenStatusLeadId] = useState<string | null>(null);

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

  const handleMobileStatusChange = (leadId: string, newStatus: string) => {
    moveLead(leadId, newStatus);
    setOpenStatusLeadId(null);
  };

  const getNextStatus = (currentStatus: string) => {
    const currentIndex = KANBAN_COLUMNS.indexOf(currentStatus);
    if (currentIndex < 0 || currentIndex >= KANBAN_COLUMNS.length - 1) return null;
    return KANBAN_COLUMNS[currentIndex + 1];
  };

  const getPreviousStatus = (currentStatus: string) => {
    const currentIndex = KANBAN_COLUMNS.indexOf(currentStatus);
    if (currentIndex <= 0) return null;
    return KANBAN_COLUMNS[currentIndex - 1];
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

      {/* Versão mobile: não usa select nativo, para evitar popup gigante no celular */}
      <div className="space-y-3 md:hidden">
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <strong>Uso no celular:</strong> use os botões do card para avançar, voltar ou escolher uma etapa.
        </div>

        {KANBAN_COLUMNS.map((column) => {
          const columnLeads = leads.filter((lead) => lead.status === column);

          return (
            <section
              key={column}
              className="overflow-hidden rounded-xl border border-[var(--medium-gray)] bg-white"
            >
              <div className="flex items-center justify-between border-b border-[var(--medium-gray)] px-4 py-3">
                <h2 className="text-sm font-semibold text-[var(--deep-blue)]">{column}</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-[var(--deep-blue)]">
                  {columnLeads.length}
                </span>
              </div>

              <div className="space-y-3 p-3">
                {columnLeads.length === 0 ? (
                  <p className="py-4 text-center text-xs text-[var(--text-muted)]">
                    Nenhum lead nesta etapa.
                  </p>
                ) : (
                  columnLeads.map((lead) => {
                    const previousStatus = getPreviousStatus(lead.status);
                    const nextStatus = getNextStatus(lead.status);
                    const isOpen = openStatusLeadId === lead.id;

                    return (
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
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={!previousStatus}
                            onClick={() => previousStatus && handleMobileStatusChange(lead.id, previousStatus)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Voltar
                          </button>

                          <button
                            type="button"
                            disabled={!nextStatus}
                            onClick={() => nextStatus && handleMobileStatusChange(lead.id, nextStatus)}
                            className="rounded-lg bg-[var(--deep-blue)] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Avançar
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setOpenStatusLeadId(isOpen ? null : lead.id)}
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
                        >
                          {isOpen ? 'Fechar etapas' : 'Escolher outra etapa'}
                        </button>

                        {isOpen && (
                          <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                            {KANBAN_COLUMNS.map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => handleMobileStatusChange(lead.id, status)}
                                className={`rounded-lg px-3 py-2 text-left text-sm font-medium ${
                                  lead.status === status
                                    ? 'bg-[var(--deep-blue)] text-white'
                                    : 'bg-white text-slate-700'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        )}
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Versão desktop/tablet: mantém o Kanban com drag and drop */}
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
