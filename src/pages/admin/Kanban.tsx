import { useEffect } from 'react';
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

  const handleStatusChange = (leadId: string, newStatus: string) => {
    moveLead(leadId, newStatus);
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

      {/* Versão mobile: no celular, o navegador costuma conflitar drag/drop com rolagem horizontal. */}
      <div className="md:hidden space-y-4 pb-4">
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          <strong>Uso no celular:</strong> altere o status pelo seletor dentro do card.
        </div>

        {KANBAN_COLUMNS.map((column) => {
          const columnLeads = leads.filter((lead) => lead.status === column);

          return (
            <section
              key={column}
              className="rounded-xl border border-[var(--medium-gray)] bg-white overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-[var(--medium-gray)] px-4 py-3">
                <h2 className="text-sm font-semibold text-[var(--graphite)]">
                  {column}
                </h2>
                <span className="text-sm font-bold text-[var(--deep-blue)] tabular-nums">
                  {columnLeads.length}
                </span>
              </div>

              <div className="space-y-3 p-3">
                {columnLeads.length === 0 ? (
                  <p className="py-5 text-center text-sm text-[var(--text-muted)]">
                    Nenhum lead.
                  </p>
                ) : (
                  columnLeads.map((lead) => (
                    <article
                      key={lead.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="space-y-1">
                        <h3 className="font-semibold text-[var(--graphite)]">
                          {lead.dados?.nome || 'Lead sem nome'}
                        </h3>
                        <p className="text-sm text-[var(--text-muted)]">
                          {[lead.dados?.cidade, lead.dados?.estado].filter(Boolean).join('/') || 'Cidade não informada'}
                        </p>
                        {lead.perfilPrincipal && (
                          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {lead.perfilPrincipal}
                          </span>
                        )}
                      </div>

                      <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                        Alterar status
                      </label>
                      <select
                        value={lead.status}
                        onChange={(event) => handleStatusChange(lead.id, event.target.value)}
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[var(--deep-blue)] focus:ring-2 focus:ring-[var(--deep-blue)]/10"
                      >
                        {KANBAN_COLUMNS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </article>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Versão desktop/tablet: mantém o Kanban com drag and drop. */}
      <div className="hidden overflow-x-auto pb-4 md:block">
        <div className="flex gap-4 min-w-max">
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column}
              title={column}
              leads={leads.filter((lead) => lead.status === column)}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
