import AdminLayout from '@/components/layout/AdminLayout';
import { useLeadsStore } from '@/stores/leadsStore';
import KanbanColumn from '@/components/features/KanbanColumn';
import { KANBAN_COLUMNS } from '@/constants/config';

export default function AdminKanban() {
  const { leads, moveLead } = useLeadsStore();

  const handleDrop = (leadId: string, newStatus: string) => {
    moveLead(leadId, newStatus);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--deep-blue)] font-sans">Kanban Comercial</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Arraste os leads entre colunas para atualizar o status</p>
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
