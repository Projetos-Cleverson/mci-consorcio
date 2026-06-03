import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

type FormState = {
  company_name: string;
  cnpj: string;
  responsible_name: string;
  responsible_email: string;
  responsible_phone: string;
  commercial_whatsapp: string;
  city: string;
  state: string;
  desired_slug: string;
  consultants_count: string;
  password: string;
  confirm_password: string;
  message: string;
};

const initialForm: FormState = {
  company_name: '',
  cnpj: '',
  responsible_name: '',
  responsible_email: '',
  responsible_phone: '',
  commercial_whatsapp: '',
  city: '',
  state: '',
  desired_slug: '',
  consultants_count: '1',
  password: '',
  confirm_password: '',
  message: '',
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function makeSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function CompanyApplication() {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedSlug, setSubmittedSlug] = useState('');

  const previewUrl = useMemo(() => {
    if (!form.desired_slug) return '';
    return `${window.location.origin}/?partner=${form.desired_slug}`;
  }, [form.desired_slug]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => {
      const next = { ...previous, [key]: value };

      if (key === 'company_name' && !previous.desired_slug) {
        next.desired_slug = makeSlug(String(value));
      }

      if (key === 'desired_slug') {
        next.desired_slug = makeSlug(String(value));
      }

      if (key === 'responsible_phone' || key === 'commercial_whatsapp') {
        next[key] = formatPhone(String(value)) as FormState[K];
      }

      return next;
    });
  }

  function validate() {
    if (!form.company_name.trim()) return 'Informe o nome da empresa.';
    if (!form.responsible_name.trim()) return 'Informe o nome do responsável.';
    if (!form.responsible_email.trim()) return 'Informe o e-mail do responsável.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.responsible_email)) return 'Informe um e-mail válido.';
    if (onlyDigits(form.responsible_phone).length < 10) return 'Informe o WhatsApp do responsável com DDD.';
    if (onlyDigits(form.commercial_whatsapp).length < 10) return 'Informe o WhatsApp comercial com DDD.';
    if (!form.desired_slug.trim()) return 'Informe o nome desejado para o link.';
    if (form.desired_slug.length < 3) return 'O link desejado precisa ter pelo menos 3 caracteres.';
    if (Number(form.consultants_count || 0) < 1) return 'Informe a quantidade de consultores.';
    if (form.password.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.';
    if (form.password !== form.confirm_password) return 'A confirmação de senha não confere.';
    return '';
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errorMessage = validate();
    if (errorMessage) {
      toast({ variant: 'destructive', title: 'Revise o cadastro', description: errorMessage });
      return;
    }

    setIsSubmitting(true);

    try {
      const email = form.responsible_email.trim().toLowerCase();

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          data: {
            company_name: form.company_name.trim(),
            desired_slug: form.desired_slug.trim(),
            role: 'partner_company_pending',
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      const userId = signUpData.user?.id || null;

      const { error: insertError } = await supabase.from('partner_company_applications').insert({
        user_id: userId,
        company_name: form.company_name.trim(),
        cnpj: form.cnpj.trim() || null,
        responsible_name: form.responsible_name.trim(),
        responsible_email: email,
        responsible_phone: form.responsible_phone.trim(),
        commercial_whatsapp: form.commercial_whatsapp.trim(),
        city: form.city.trim() || null,
        state: form.state || null,
        desired_slug: form.desired_slug.trim(),
        consultants_count: Number(form.consultants_count || 1),
        message: form.message.trim() || null,
        status: 'pending',
      });

      if (insertError) throw insertError;

      await supabase.auth.signOut();
      setSubmittedSlug(form.desired_slug.trim());
      setSuccess(true);
      toast({ title: 'Solicitação enviada', description: 'Agora a equipe EPSA fará a análise comercial.' });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Não foi possível enviar',
        description: error instanceof Error ? error.message : 'Tente novamente em alguns instantes.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
        <section className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--deep-blue)] font-display mb-3">
            Solicitação recebida
          </h1>
          <p className="text-slate-600 leading-relaxed max-w-xl mx-auto">
            Sua empresa foi cadastrada como solicitação pendente. A equipe EPSA fará a validação comercial e liberará o acesso após a confirmação do pagamento ou aprovação manual.
          </p>
          <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-left">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Link reservado</p>
            <p className="text-sm font-semibold text-[var(--deep-blue)] break-all">
              {window.location.origin}/?partner={submittedSlug}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Este link será liberado quando a empresa for aprovada.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 mt-7 px-5 py-3 rounded-xl bg-[var(--deep-blue)] text-white font-semibold hover:bg-[var(--navy)] transition-colors"
          >
            Voltar ao início
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-[#0B1220] text-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">MCI - Diagnóstico de Compra Planejada</div>
              <div className="text-xs text-slate-300">Cadastro de Empresa Parceira</div>
            </div>
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-[0.9fr_1.25fr] gap-8 items-start">
        <aside className="lg:sticky lg:top-8 rounded-3xl bg-[#0F2B4C] text-white p-7 shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-300/20 text-emerald-200 text-xs font-semibold mb-5">
            <ShieldCheck className="w-4 h-4" />
            Parceiro autorizado
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-bold leading-tight mb-4">
            Solicite o acesso da sua empresa ao MCI Consórcio
          </h1>

          <p className="text-slate-300 leading-relaxed mb-6">
            Preencha os dados da empresa para análise. Após aprovação comercial, sua empresa receberá um link próprio do diagnóstico e acesso ao painel de leads.
          </p>

          <div className="space-y-3 text-sm">
            {[
              'Link exclusivo com o nome da empresa',
              'Leads separados por origem',
              'Painel administrativo com login próprio',
              'Aprovação manual pelo admin EPSA',
              'Possibilidade de suspensão em caso de inadimplência',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-[var(--deep-blue)]">
              Dados da empresa
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Esses dados serão usados para criar o link, o acesso e a identificação do parceiro.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome da empresa *</label>
              <input value={form.company_name} onChange={(e) => updateField('company_name', e.target.value)} placeholder="Ex: Consórcio Alpha" className="w-full h-11 rounded-xl border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">CNPJ</label>
              <input value={form.cnpj} onChange={(e) => updateField('cnpj', e.target.value)} placeholder="00.000.000/0001-00" className="w-full h-11 rounded-xl border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Slug/link desejado *</label>
              <input value={form.desired_slug} onChange={(e) => updateField('desired_slug', e.target.value)} placeholder="empresa-alpha" className="w-full h-11 rounded-xl border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600" />
            </div>

            {previewUrl && (
              <div className="sm:col-span-2 rounded-2xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Prévia do link</p>
                <p className="text-sm font-medium text-[var(--deep-blue)] break-all">{previewUrl}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Responsável *</label>
              <input value={form.responsible_name} onChange={(e) => updateField('responsible_name', e.target.value)} placeholder="Nome do responsável" className="w-full h-11 rounded-xl border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-mail de acesso *</label>
              <input type="email" value={form.responsible_email} onChange={(e) => updateField('responsible_email', e.target.value)} placeholder="responsavel@empresa.com.br" className="w-full h-11 rounded-xl border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">WhatsApp do responsável *</label>
              <input value={form.responsible_phone} onChange={(e) => updateField('responsible_phone', e.target.value)} placeholder="(21) 99999-9999" className="w-full h-11 rounded-xl border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">WhatsApp comercial *</label>
              <input value={form.commercial_whatsapp} onChange={(e) => updateField('commercial_whatsapp', e.target.value)} placeholder="(21) 99999-9999" className="w-full h-11 rounded-xl border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cidade</label>
              <input value={form.city} onChange={(e) => updateField('city', e.target.value)} placeholder="Rio de Janeiro" className="w-full h-11 rounded-xl border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Estado</label>
              <select value={form.state} onChange={(e) => updateField('state', e.target.value)} className="w-full h-11 rounded-xl border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white">
                <option value="">Selecione</option>
                {ESTADOS_BR.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantidade de consultores *</label>
              <input type="number" min="1" value={form.consultants_count} onChange={(e) => updateField('consultants_count', e.target.value)} className="w-full h-11 rounded-xl border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Senha de acesso *</label>
              <input type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full h-11 rounded-xl border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirmar senha *</label>
              <input type="password" value={form.confirm_password} onChange={(e) => updateField('confirm_password', e.target.value)} placeholder="Repita a senha" className="w-full h-11 rounded-xl border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mensagem ou observações</label>
              <textarea value={form.message} onChange={(e) => updateField('message', e.target.value)} rows={3} placeholder="Conte rapidamente sobre sua operação, região ou necessidade." className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600" />
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed">
              O envio deste formulário não libera acesso automaticamente. A liberação depende de validação comercial e aprovação manual da equipe EPSA.
            </p>
          </div>

          <button disabled={isSubmitting} className="mt-6 w-full h-12 rounded-xl bg-[var(--deep-blue)] text-white font-bold hover:bg-[var(--navy)] transition-colors disabled:opacity-60">
            {isSubmitting ? 'Enviando solicitação...' : 'Solicitar cadastro da empresa'}
          </button>
        </form>
      </section>
    </main>
  );
}
