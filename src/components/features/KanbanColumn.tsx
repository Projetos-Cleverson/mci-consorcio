import { Lead } from '@/types';
import { useLeadsStore } from '@/stores/leadsStore';
import { GripVertical } from 'lucide-react';

interface KanbanColumnProps {
  title: string;
  leads: Lead[];
  onDrop: (leadId: string, newStatus: string) => void;
}

export default function KanbanColumn({ title, leads, onDrop }: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-[var(--green-accent)]/5');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-[var(--green-accent)]/5');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-[var(--green-accent)]/5');
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) onDrop(leadId, title);
  };

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

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="min-w-[280px] max-w-[280px] flex flex-col bg-gray-50 rounded-xl border border-[var(--medium-gray)] transition-colors"
    >
      <div className="p-3 border-b border-[var(--medium-gray)]">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-[var(--graphite)] truncate">{title}</h3>
          <span className="size-5 rounded-full bg-[var(--deep-blue)]/10 text-[var(--deep-blue)] text-xs font-bold flex items-center justify-center">
            {leads.length}
          </span>
        </div>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-240px)]">
        {leads.map((lead) => (
          <div
            key={lead.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('leadId', lead.id)}
            className="bg-white rounded-lg p-3 border border-[var(--medium-gray)] cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start gap-2">
              <GripVertical className="size-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--graphite)] truncate">{lead.dados.nome}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{lead.dados.cidade}/{lead.dados.estado}</p>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${profileColors[lead.perfilPrincipal] || 'bg-gray-100 text-gray-700'}`}>
                    {profileLabels[lead.perfilPrincipal] || lead.perfilPrincipal}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {leads.length === 0 && (
          <p className="text-xs text-center text-[var(--text-muted)] py-4">Nenhum lead</p>
        )}
      </div>
    </div>
  );
}
