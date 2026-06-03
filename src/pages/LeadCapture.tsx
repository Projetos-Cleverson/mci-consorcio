import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuizStore } from '@/stores/quizStore';
import { useLeadsStore } from '@/stores/leadsStore';
import { useToast } from '@/hooks/use-toast';
import { LeadData, Lead } from '@/types';
import { generateId } from '@/lib/utils';
import { ESTADOS_BR } from '@/constants/config';
import { classifyTemperature, generateLeadTags, getDownPaymentRange, getIncomeRange, getObjective, getPropertyRange, getRecommendedProduct, getUrgency } from '@/lib/leadUtils';
import { Building2, ShieldCheck } from 'lucide-react';
import { getPartnerDisplayName, getPartnerWhatsapp, usePartnerCompany } from '@/hooks/usePartnerCompany';

export default function LeadCapture() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const partner = searchParams.get('partner') || 'direto';
  const { partnerCompany } = usePartnerCompany(partner);
  const partnerDisplayName = getPartnerDisplayName(partnerCompany);
  const partnerWhatsapp = getPartnerWhatsapp(partnerCompany);
  const { toast } = useToast();
  const { scores, perfilPrincipal, perfilSecundario, answers, calculateResult } = useQuizStore();
  const { addLead } = useLeadsStore();

  const [form, setForm] = useState<LeadData>({
    nome: '',
    whatsapp: '',
    cidade: '',
    estado: '',
    email: '',
    horarioContato: '',
    aceiteContato: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!form.whatsapp.trim()) newErrors.whatsapp = 'WhatsApp é obrigatório';
    else if (form.whatsapp.replace(/\D/g, '').length < 10) newErrors.whatsapp = 'WhatsApp inválido';
    if (!form.cidade.trim()) newErrors.cidade = 'Cidade é obrigatória';
    if (!form.estado) newErrors.estado = 'Estado é obrigatório';
    if (!form.email?.trim()) newErrors.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'E-mail inválido';
    if (!form.aceiteContato) newErrors.aceiteContato = 'Aceite é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Preencha todos os campos obrigatórios.' });
      return;
    }
    let perfilFinal = perfilPrincipal;

    if (!perfilFinal && answers.length > 0) {
      calculateResult();
      perfilFinal = useQuizStore.getState().perfilPrincipal;
    }

    if (!perfilFinal) {
      navigate(partner !== 'direto' ? `/diagnostico?partner=${encodeURIComponent(partner)}` : '/diagnostico');
      return;
    }

    const temperatura = classifyTemperature(perfilFinal, answers);
    const tags = generateLeadTags(perfilFinal, temperatura, answers);
    const faixaImovel = getPropertyRange(answers);
    const faixaRenda = getIncomeRange(answers);
    const entradaDisponivel = getDownPaymentRange(answers);
    const urgencia = getUrgency(answers);
    const objetivo = getObjective(answers);

    const lead: Lead = {
      id: generateId(),
      dados: form,
      respostas: answers,
      scores,
      perfilPrincipal: perfilFinal,
      perfilSecundario: perfilSecundario || undefined,
      origem: partnerDisplayName ? `Empresa parceira: ${partnerDisplayName}` : (partner !== 'direto' ? `Empresa parceira: ${partner}` : 'MCI Consórcio Imobiliário'),
      parceiro: partner !== 'direto' ? partner : undefined,
      parceiroNome: partnerDisplayName || undefined,
      parceiroWhatsapp: partnerWhatsapp || undefined,
      temperatura,
      status: 'Novo diagnóstico',
      tags,
      observacoes: '',
      historico: [{ data: new Date().toISOString().split('T')[0], acao: `Lead criado via MCI Consórcio (${temperatura})` }],
      dataEntrada: new Date().toISOString().split('T')[0],
      faixaImovel,
      faixaRenda,
      entradaDisponivel,
      urgencia,
      objetivo,
      produtoRecomendado: getRecommendedProduct(perfilFinal),
    };

    addLead(lead);
    localStorage.setItem('lead_data', JSON.stringify(form));
    localStorage.setItem('mci_partner_context', JSON.stringify({
      slug: partner,
      display_name: partnerDisplayName,
      commercial_whatsapp: partnerWhatsapp,
    }));
    navigate(partner !== 'direto' ? `/resultado?partner=${encodeURIComponent(partner)}` : '/resultado');
  };

  const updateField = (field: keyof LeadData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-[var(--light-gray)] flex flex-col">
      <header className="bg-white border-b border-[var(--medium-gray)] px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="size-8 rounded-lg bg-[var(--deep-blue)] flex items-center justify-center">
            <Building2 className="size-4 text-white" />
          </div>
          <div className="leading-tight">
            <span className="font-sans font-semibold text-[var(--deep-blue)] text-sm">
              MCI Consórcio Imobiliário
            </span>
            {partnerDisplayName && (
              <p className="text-[12px] font-semibold text-[var(--deep-blue)]">
                {partnerDisplayName} · Parceiro autorizado
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-lg mx-auto">
          <h1 className="font-display text-2xl font-bold text-[var(--deep-blue)] text-balance">
            Seu diagnóstico está pronto
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Para liberar seu resultado e permitir que um consultor entenda melhor seu perfil de aderência ao consórcio, informe seus dados abaixo.
            {partnerDisplayName && (
              <span className="mt-2 block rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-[#0F2B4C]">
                {partnerDisplayName} · Parceiro autorizado
              </span>
            )}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--graphite)] mb-1">Nome completo *</label>
              <input type="text" value={form.nome} onChange={(e) => updateField('nome', e.target.value)} className={`w-full px-4 py-3 rounded-lg border ${errors.nome ? 'border-red-400' : 'border-[var(--medium-gray)]'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C47A21]/35 focus:border-[#C47A21]`} placeholder="Seu nome" />
              {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--graphite)] mb-1">WhatsApp *</label>
              <input type="tel" value={form.whatsapp} onChange={(e) => updateField('whatsapp', e.target.value)} className={`w-full px-4 py-3 rounded-lg border ${errors.whatsapp ? 'border-red-400' : 'border-[var(--medium-gray)]'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C47A21]/35 focus:border-[#C47A21]`} placeholder="(00) 00000-0000" />
              {errors.whatsapp && <p className="text-xs text-red-500 mt-1">{errors.whatsapp}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--graphite)] mb-1">E-mail *</label>
              <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-400' : 'border-[var(--medium-gray)]'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C47A21]/35 focus:border-[#C47A21]`} placeholder="seu@email.com" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[var(--graphite)] mb-1">Cidade *</label>
                <input type="text" value={form.cidade} onChange={(e) => updateField('cidade', e.target.value)} className={`w-full px-4 py-3 rounded-lg border ${errors.cidade ? 'border-red-400' : 'border-[var(--medium-gray)]'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C47A21]/35 focus:border-[#C47A21]`} placeholder="Sua cidade" />
                {errors.cidade && <p className="text-xs text-red-500 mt-1">{errors.cidade}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--graphite)] mb-1">Estado *</label>
                <select value={form.estado} onChange={(e) => updateField('estado', e.target.value)} className={`w-full px-4 py-3 rounded-lg border ${errors.estado ? 'border-red-400' : 'border-[var(--medium-gray)]'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C47A21]/35 focus:border-[#C47A21]`}>
                  <option value="">UF</option>
                  {ESTADOS_BR.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                </select>
                {errors.estado && <p className="text-xs text-red-500 mt-1">{errors.estado}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--graphite)] mb-1">Melhor horário para contato <span className="text-[var(--text-muted)]">(opcional)</span></label>
              <select value={form.horarioContato} onChange={(e) => updateField('horarioContato', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-[var(--medium-gray)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C47A21]/35 focus:border-[#C47A21]">
                <option value="">Selecione</option>
                <option value="manha">Manhã (8h-12h)</option>
                <option value="tarde">Tarde (12h-18h)</option>
                <option value="noite">Noite (18h-21h)</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.aceiteContato} onChange={(e) => updateField('aceiteContato', e.target.checked)} className="mt-1 size-4 rounded border-gray-300 text-[#C47A21] focus:ring-[#C47A21]" />
                <span className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Ao continuar, você autoriza o contato para receber sua análise e orientações relacionadas ao consórcio imobiliário. Seus dados serão usados apenas para atendimento, diagnóstico e acompanhamento comercial.
                </span>
              </label>
              {errors.aceiteContato && <p className="text-xs text-red-500 mt-1">{errors.aceiteContato}</p>}
            </div>

            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg mt-4">
              <ShieldCheck className="size-4 text-[#C47A21]" />
              <span className="text-xs text-[var(--graphite)]">Diagnóstico orientativo, sem promessa de contemplação.</span>
            </div>

            <button type="submit" className="w-full mt-4 px-6 py-4 rounded-xl bg-[#C47A21] text-white font-semibold hover:bg-[#E0A84B] hover:text-slate-950 transition-colors active:scale-[0.98]">
              Ver meu resultado
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
