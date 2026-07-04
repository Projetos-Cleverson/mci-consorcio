import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuizStore } from '@/stores/quizStore';
import { useLeadsStore } from '@/stores/leadsStore';
import { useToast } from '@/hooks/use-toast';
import { LeadData, Lead, LeadConsentContext, LeadTrackingContext } from '@/types';
import { generateId } from '@/lib/utils';
import { APP_CONFIG, ESTADOS_BR } from '@/constants/config';
import {
  classifyTemperature,
  generateLeadTags,
  getDownPaymentRange,
  getIncomeRange,
  getObjective,
  getPropertyRange,
  getRecommendedProduct,
  getUrgency,
} from '@/lib/leadUtils';
import { AlertCircle, Building2, Loader2, ShieldCheck } from 'lucide-react';
import { getPartnerDisplayName, getPartnerWhatsapp, usePartnerCompany } from '@/hooks/usePartnerCompany';
import { useFunnelContext } from '@/hooks/useFunnelContext';
import { captureTrackingContext } from '@/lib/tracking';
import { saveResultContext } from '@/lib/resultContext';

export default function LeadCapture() {
  const navigate = useNavigate();
  const { partnerSlug, buildPath } = useFunnelContext();
  const partner = partnerSlug || 'direto';
  const {
    partnerCompany,
    loading: partnerLoading,
    error: partnerError,
  } = usePartnerCompany(partner);
  const partnerDisplayName = getPartnerDisplayName(partnerCompany);
  const partnerWhatsapp = getPartnerWhatsapp(partnerCompany);
  const effectiveWhatsapp = partnerWhatsapp || APP_CONFIG.temporaryOperationsWhatsapp;
  const usesEpsaTemporaryContact = !partnerWhatsapp;
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
  const [submissionId] = useState(() => generateId());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const partnerUnavailable = partner !== 'direto' && !partnerLoading && !partnerCompany;
  const consentPartnerName = partnerDisplayName || 'equipe EPSA/MCI';
  const consentText = partnerDisplayName
    ? `Autorizo a GVS Imóveis/EPSA Core a tratar meus dados para gerar o diagnóstico e compartilhá-los com ${partnerDisplayName}, empresa parceira do MCI, para atendimento relacionado ao meu interesse em consórcio imobiliário.`
    : 'Autorizo a GVS Imóveis/EPSA Core a tratar meus dados para gerar o diagnóstico e entrar em contato sobre meu interesse em consórcio imobiliário.';

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!form.whatsapp.trim()) newErrors.whatsapp = 'WhatsApp é obrigatório';
    else if (form.whatsapp.replace(/\D/g, '').length < 10) newErrors.whatsapp = 'WhatsApp inválido';
    if (!form.cidade.trim()) newErrors.cidade = 'Cidade é obrigatória';
    if (!form.estado) newErrors.estado = 'Estado é obrigatório';
    if (!form.email?.trim()) newErrors.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'E-mail inválido';
    if (!form.aceiteContato) newErrors.aceiteContato = 'É necessário autorizar o tratamento e o compartilhamento informados';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    if (partnerUnavailable) {
      setSubmitError('Este link de parceiro não está disponível. Não enviamos seus dados.');
      return;
    }

    if (!validate()) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Revise os campos destacados antes de continuar.',
      });
      return;
    }

    let perfilFinal = perfilPrincipal;
    if (!perfilFinal && answers.length > 0) {
      calculateResult();
      perfilFinal = useQuizStore.getState().perfilPrincipal;
    }

    if (!perfilFinal) {
      navigate(buildPath('/diagnostico'));
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();
      const tracking = captureTrackingContext(new URLSearchParams(window.location.search), partner);
      const temperatura = classifyTemperature(perfilFinal, answers);
      const tags = generateLeadTags(perfilFinal, temperatura, answers);

      const consent: LeadConsentContext = {
        version: APP_CONFIG.consentVersion,
        accepted_at: now,
        partner_slug: partner,
        partner_name: consentPartnerName,
        privacy_policy_path: APP_CONFIG.privacyPolicyPath,
        terms_path: APP_CONFIG.termsPath,
        text_snapshot: consentText,
      };

      const lead: Lead = {
        id: submissionId,
        dados: form,
        respostas: answers,
        scores,
        perfilPrincipal: perfilFinal,
        perfilSecundario: perfilSecundario || undefined,
        origem: tracking.params.utm_source
          ? `Tráfego pago: ${tracking.params.utm_source}`
          : partnerDisplayName
            ? `Empresa parceira: ${partnerDisplayName}`
            : 'MCI Consórcio',
        parceiro: partner !== 'direto' ? partner : undefined,
        parceiroNome: partnerDisplayName || undefined,
        parceiroWhatsapp: partnerWhatsapp || undefined,
        temperatura,
        status: 'Novo diagnóstico',
        tags,
        observacoes: '',
        historico: [{ data: now.slice(0, 10), acao: `Lead criado via MCI Consórcio (${temperatura})` }],
        dataEntrada: now.slice(0, 10),
        faixaImovel: getPropertyRange(answers),
        faixaRenda: getIncomeRange(answers),
        entradaDisponivel: getDownPaymentRange(answers),
        urgencia: getUrgency(answers),
        objetivo: getObjective(answers),
        produtoRecomendado: getRecommendedProduct(perfilFinal),
        tracking: tracking as LeadTrackingContext,
        consent,
      };

      await addLead(lead);

      saveResultContext({
        leadId: lead.id,
        partnerSlug: partner,
        partnerDisplayName,
        contactWhatsapp: effectiveWhatsapp,
        contactSource: usesEpsaTemporaryContact ? 'epsa_temporary' : 'partner',
        savedAt: now,
      });

      navigate(buildPath('/resultado'));
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Não foi possível salvar seus dados. Tente novamente.';
      setSubmitError(message);
      toast({
        variant: 'destructive',
        title: 'Não foi possível concluir',
        description: 'Seus dados não foram confirmados no sistema. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof LeadData, value: string | boolean) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setSubmitError(null);
    if (errors[field]) setErrors((previous) => ({ ...previous, [field]: '' }));
  };

  if (partnerLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--light-gray)] px-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm">
          <Loader2 className="size-5 animate-spin text-[#C47A21]" />
          <span className="text-sm font-medium text-[var(--deep-blue)]">Validando o link da empresa parceira...</span>
        </div>
      </div>
    );
  }

  if (partnerUnavailable) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--light-gray)] px-4">
        <div className="w-full max-w-lg rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto size-10 text-red-500" />
          <h1 className="mt-4 font-display text-2xl font-bold text-[var(--deep-blue)]">Link indisponível</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
            Não encontramos uma empresa ativa para este link. Nenhum dado foi enviado.
            {partnerError ? ' Tente novamente mais tarde.' : ''}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-xl bg-[#C47A21] px-5 py-3 text-sm font-semibold text-white"
          >
            Voltar ao MCI Consórcio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--light-gray)]">
      <header className="border-b border-[var(--medium-gray)] bg-white px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--deep-blue)]">
            <Building2 className="size-4 text-white" />
          </div>
          <div className="leading-tight">
            <span className="font-sans text-sm font-semibold text-[var(--deep-blue)]">MCI Consórcio</span>
            {partnerDisplayName && (
              <p className="text-[12px] font-semibold text-[var(--deep-blue)]">
                Atendimento por {partnerDisplayName}, empresa parceira do MCI
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-lg">
          <h1 className="text-balance font-display text-2xl font-bold text-[var(--deep-blue)]">
            Seu diagnóstico está pronto
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
            Confirme seus dados para registrar o diagnóstico e liberar o resultado.
          </p>

          {usesEpsaTemporaryContact && partnerDisplayName && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950">
              O canal comercial próprio de {partnerDisplayName} ainda está sendo configurado. Nesta etapa, o primeiro atendimento será recebido pelo canal temporário da EPSA.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <div>
              <label htmlFor="nome" className="mb-1 block text-sm font-medium text-[var(--graphite)]">Nome completo *</label>
              <input id="nome" type="text" autoComplete="name" value={form.nome} onChange={(event) => updateField('nome', event.target.value)} className={`w-full rounded-lg border bg-white px-4 py-3 text-sm focus:border-[#C47A21] focus:outline-none focus:ring-2 focus:ring-[#C47A21]/35 ${errors.nome ? 'border-red-400' : 'border-[var(--medium-gray)]'}`} placeholder="Seu nome" />
              {errors.nome && <p className="mt-1 text-xs text-red-500">{errors.nome}</p>}
            </div>

            <div>
              <label htmlFor="whatsapp" className="mb-1 block text-sm font-medium text-[var(--graphite)]">WhatsApp *</label>
              <input id="whatsapp" type="tel" autoComplete="tel" inputMode="tel" value={form.whatsapp} onChange={(event) => updateField('whatsapp', event.target.value)} className={`w-full rounded-lg border bg-white px-4 py-3 text-sm focus:border-[#C47A21] focus:outline-none focus:ring-2 focus:ring-[#C47A21]/35 ${errors.whatsapp ? 'border-red-400' : 'border-[var(--medium-gray)]'}`} placeholder="(00) 00000-0000" />
              {errors.whatsapp && <p className="mt-1 text-xs text-red-500">{errors.whatsapp}</p>}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-[var(--graphite)]">E-mail *</label>
              <input id="email" type="email" autoComplete="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} className={`w-full rounded-lg border bg-white px-4 py-3 text-sm focus:border-[#C47A21] focus:outline-none focus:ring-2 focus:ring-[#C47A21]/35 ${errors.email ? 'border-red-400' : 'border-[var(--medium-gray)]'}`} placeholder="seu@email.com" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cidade" className="mb-1 block text-sm font-medium text-[var(--graphite)]">Cidade *</label>
                <input id="cidade" type="text" autoComplete="address-level2" value={form.cidade} onChange={(event) => updateField('cidade', event.target.value)} className={`w-full rounded-lg border bg-white px-4 py-3 text-sm focus:border-[#C47A21] focus:outline-none focus:ring-2 focus:ring-[#C47A21]/35 ${errors.cidade ? 'border-red-400' : 'border-[var(--medium-gray)]'}`} placeholder="Sua cidade" />
                {errors.cidade && <p className="mt-1 text-xs text-red-500">{errors.cidade}</p>}
              </div>
              <div>
                <label htmlFor="estado" className="mb-1 block text-sm font-medium text-[var(--graphite)]">Estado *</label>
                <select id="estado" autoComplete="address-level1" value={form.estado} onChange={(event) => updateField('estado', event.target.value)} className={`w-full rounded-lg border bg-white px-4 py-3 text-sm focus:border-[#C47A21] focus:outline-none focus:ring-2 focus:ring-[#C47A21]/35 ${errors.estado ? 'border-red-400' : 'border-[var(--medium-gray)]'}`}>
                  <option value="">UF</option>
                  {ESTADOS_BR.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                </select>
                {errors.estado && <p className="mt-1 text-xs text-red-500">{errors.estado}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="horarioContato" className="mb-1 block text-sm font-medium text-[var(--graphite)]">Melhor horário para contato <span className="text-[var(--text-muted)]">(opcional)</span></label>
              <select id="horarioContato" value={form.horarioContato} onChange={(event) => updateField('horarioContato', event.target.value)} className="w-full rounded-lg border border-[var(--medium-gray)] bg-white px-4 py-3 text-sm focus:border-[#C47A21] focus:outline-none focus:ring-2 focus:ring-[#C47A21]/35">
                <option value="">Selecione</option>
                <option value="manha">Manhã (8h-12h)</option>
                <option value="tarde">Tarde (12h-18h)</option>
                <option value="noite">Noite (18h-21h)</option>
              </select>
            </div>

            <div className="pt-2">
              <div className="flex items-start gap-3">
                <input id="aceiteContato" type="checkbox" checked={form.aceiteContato} onChange={(event) => updateField('aceiteContato', event.target.checked)} className="mt-1 size-4 rounded border-gray-300 text-[#C47A21] focus:ring-[#C47A21]" />
                <div className="text-xs leading-relaxed text-[var(--text-muted)]">
                  <label htmlFor="aceiteContato" className="cursor-pointer">{consentText}</label>{' '}
                  Li a <Link to={APP_CONFIG.privacyPolicyPath} target="_blank" rel="noreferrer" className="font-semibold text-[var(--deep-blue)] underline">Política de Privacidade</Link> e os <Link to={APP_CONFIG.termsPath} target="_blank" rel="noreferrer" className="font-semibold text-[var(--deep-blue)] underline">Termos de Uso</Link>.
                </div>
              </div>
              {errors.aceiteContato && <p className="mt-1 text-xs text-red-500">{errors.aceiteContato}</p>}
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3">
              <ShieldCheck className="size-4 shrink-0 text-[#C47A21]" />
              <span className="text-xs text-[var(--graphite)]">Diagnóstico orientativo, sem promessa de contemplação.</span>
            </div>

            {submitError && (
              <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <AlertCircle className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-semibold">O resultado ainda não foi liberado.</p>
                  <p className="mt-1 text-xs leading-5">Não conseguimos confirmar o salvamento. Seus dados podem ser reenviados com segurança ao tentar novamente.</p>
                </div>
              </div>
            )}

            <button type="submit" disabled={isSubmitting || partnerUnavailable} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C47A21] px-6 py-4 font-semibold text-white transition-colors hover:bg-[#E0A84B] hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Confirmando seus dados...
                </>
              ) : (
                'Salvar e ver meu resultado'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
