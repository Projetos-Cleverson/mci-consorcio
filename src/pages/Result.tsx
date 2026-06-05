import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuizStore } from '@/stores/quizStore';
import { PROFILES } from '@/constants/profiles';
import { ProfileType } from '@/types';
import { APP_CONFIG } from '@/constants/config';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  RotateCcw,
  Building2,
  ShieldCheck,
  ArrowRight,
  ClipboardCheck,
} from 'lucide-react';

export default function Result() {
  const navigate = useNavigate();
  const { perfilPrincipal, perfilSecundario, reset } = useQuizStore();
  const partnerContext = (() => {
    try { return JSON.parse(localStorage.getItem('mci_partner_context') || '{}') as { display_name?: string; commercial_whatsapp?: string; slug?: string }; }
    catch { return {}; }
  })();
  const partnerDisplayName = partnerContext.display_name || '';
  const partnerWhatsapp = (partnerContext.commercial_whatsapp || APP_CONFIG.whatsappNumber).replace(/\D/g, '');

  useEffect(() => {
    if (!perfilPrincipal) {
      const saved = localStorage.getItem('quiz_principal');
      if (!saved) navigate('/diagnostico');
    }
  }, [perfilPrincipal, navigate]);

  const profileId = perfilPrincipal || (localStorage.getItem('quiz_principal') as ProfileType);
  const secondaryId = perfilSecundario || (localStorage.getItem('quiz_secundario') as ProfileType | null);
  const profile = PROFILES.find((p) => p.id === profileId);
  const secondary = secondaryId ? PROFILES.find((p) => p.id === secondaryId) : null;

  if (!profile) return null;

  const whatsappUrl = `https://wa.me/${partnerWhatsapp}?text=${encodeURIComponent(profile.ctaMensagem)}`;

  const handleRestart = () => {
    reset();
    navigate('/diagnostico');
  };

  const profileColors: Record<string, string> = {
    financiamento: 'from-emerald-600 to-emerald-800',
    consorcio: 'from-amber-600 to-amber-800',
    hibrida: 'from-indigo-600 to-indigo-800',
    reorganizacao: 'from-cyan-700 to-blue-800',
    investidor: 'from-orange-600 to-orange-800',
    emocional: 'from-[#9A5B13] via-[#7A4612] to-[#0F172A]',
  };

  return (
    <div className="min-h-screen bg-[var(--light-gray)]">
      <header className="border-b border-[var(--medium-gray)] bg-white px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--deep-blue)]">
              <Building2 className="size-4 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-sans text-sm font-semibold text-[var(--deep-blue)]">
                Resultado do Diagnóstico
              </span>
              {partnerDisplayName && (
                <p className="text-[12px] font-semibold text-[var(--deep-blue)]">
                  {partnerDisplayName} · Parceiro autorizado
                </p>
              )}
            </div>
          </div>

          <button onClick={handleRestart} className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--graphite)]">
            <RotateCcw className="size-3.5" />
            Refazer
          </button>
        </div>
      </header>

      <main className="px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl bg-gradient-to-br ${profileColors[profileId]} p-6 text-white sm:p-8`}>
            <p className="text-sm font-medium uppercase tracking-wide text-white/70">Seu perfil de aderência</p>
            <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{profile.nome}</h1>
            <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-base">{profile.fraseIdentificacao}</p>
            {secondary && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
                <span className="text-xs text-white/70">Tendência secundária:</span>
                <span className="text-xs font-semibold text-white">{secondary.nome}</span>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 rounded-xl border border-[var(--medium-gray)] bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-[var(--deep-blue)]">Entenda seu perfil</h2>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-[var(--graphite)]">{profile.explicacao}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-4 rounded-xl border border-[var(--medium-gray)] bg-white p-6">
            <h3 className="flex items-center gap-2 font-sans font-semibold text-[var(--deep-blue)]">
              <CheckCircle2 className="size-5 text-[var(--green-accent)]" />
              Pontos favoráveis
            </h3>
            <ul className="mt-3 space-y-2">
              {profile.pontosFavoraveis.map((ponto, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--graphite)]">
                  <span className="mt-2 size-1.5 flex-shrink-0 rounded-full bg-[var(--green-accent)]" />
                  {ponto}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4 rounded-xl border border-[var(--medium-gray)] bg-white p-6">
            <h3 className="flex items-center gap-2 font-sans font-semibold text-[var(--deep-blue)]">
              <AlertTriangle className="size-5 text-amber-500" />
              Pontos de atenção
            </h3>
            <ul className="mt-3 space-y-2">
              {profile.pontosAtencao.map((ponto, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--graphite)]">
                  <span className="mt-2 size-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                  {ponto}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="bg-slate-950 p-6 text-white">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20">
                  <ClipboardCheck className="size-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Próximo passo</p>
                  <h2 className="mt-1 font-display text-xl font-bold">Orientação recomendada</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">Este é um diagnóstico inicial. Antes de contratar qualquer cota, valide carta, prazo, parcela, regras do grupo e expectativa de contemplação.</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm leading-relaxed text-[var(--graphite)]">{profile.proximoPasso}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6 overflow-hidden rounded-2xl bg-[var(--deep-blue)] text-white shadow-xl shadow-slate-950/10">
            <div className="grid gap-0 sm:grid-cols-[1fr_auto]">
              <div className="p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                  Atendimento recomendado
                </p>

                <h2 className="mt-2 font-display text-2xl font-bold">
                  {partnerDisplayName ? `Falar com ${partnerDisplayName}` : 'Quer falar com um consultor?'}
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
                  {partnerDisplayName
                    ? `${partnerDisplayName}, parceiro autorizado, pode explicar o resultado, alinhar expectativas e avaliar se uma estratégia de consórcio faz sentido para seu momento.`
                    : 'Um consultor pode explicar o resultado, alinhar expectativas e avaliar se uma estratégia de consórcio faz sentido para seu momento.'}
                </p>
              </div>

              <div className="flex items-center justify-center border-t border-white/10 bg-white/5 p-6 sm:border-l sm:border-t-0 sm:p-7">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full min-w-[250px] items-center justify-center gap-2 rounded-2xl bg-[#C47A21] px-6 py-4 text-center text-sm font-bold text-white shadow-2xl shadow-amber-500/25 transition hover:-translate-y-0.5 hover:bg-[#E0A84B] hover:text-slate-950"
                >
                  <MessageCircle className="size-5" />
                  {profile.cta}
                </a>
              </div>
            </div>
          </motion.div>

          <div className="mt-6 rounded-xl border border-[var(--medium-gray)] bg-white p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[var(--green-accent)]" />
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                Este diagnóstico é uma análise inicial e orientativa. Ele não representa proposta oficial, promessa de contemplação, aprovação de crédito ou garantia de resultado. A contemplação pode ocorrer por sorteio ou lance, sem prazo garantido.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--deep-blue)] hover:text-[var(--green-accent)]">
              Voltar à página inicial
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
