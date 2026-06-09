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

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
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
