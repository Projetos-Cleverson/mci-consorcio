import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getPartnerDisplayName, usePartnerCompany } from '@/hooks/usePartnerCompany';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Compass,
  BarChart3,
  Home as HomeIcon,
  Landmark,
  PiggyBank,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  HelpCircle,
} from 'lucide-react';

const heroImage = '/images/mci-hero.jpg';

const perfis = [
  {
    icon: PiggyBank,
    title: 'Consórcio Planejado',
    text: 'Para quem aceita planejamento, entende prazo e quer avaliar uma carta de crédito compatível com sua realidade.',
  },
  {
    icon: Landmark,
    title: 'Lance Estratégico',
    text: 'Para quem possui entrada, FGTS, reserva ou patrimônio e deseja avaliar uma estratégia de lance sem promessa de contemplação.',
  },
  {
    icon: TrendingUp,
    title: 'Estratégia Patrimonial',
    text: 'Para quem enxerga o imóvel como construção, proteção ou expansão de patrimônio no médio e longo prazo.',
  },
  {
    icon: RefreshCw,
    title: 'Troca ou Upgrade Imobiliário',
    text: 'Para quem deseja trocar de imóvel, melhorar de moradia ou planejar uma evolução patrimonial.',
  },
  {
    icon: ShieldCheck,
    title: 'Preparação para Consórcio',
    text: 'Para quem tem interesse, mas precisa organizar renda, parcela, reserva, expectativa ou entendimento das regras.',
  },
  {
    icon: AlertTriangle,
    title: 'Análise de Aderência',
    text: 'Para quem tem urgência, expectativa desalinhada ou precisa avaliar com cuidado se o consórcio serve para seu momento.',
  },
];

const beneficios = [
  {
    title: 'Clareza sobre aderência',
    text: 'Entenda se seu momento combina com uma compra planejada por consórcio imobiliário.',
  },
  {
    title: 'Melhor qualificação',
    text: 'O diagnóstico identifica prazo, capacidade mensal, expectativa, objetivo e potencial de lance.',
  },
  {
    title: 'Menos expectativa errada',
    text: 'Evite tratar consórcio como solução imediata ou promessa de contemplação rápida.',
  },
  {
    title: 'Atendimento mais consultivo',
    text: 'Chegue à conversa com um perfil claro e pontos de atenção para orientar a decisão.',
  },
];

const faqs = [
  {
    question: 'O diagnóstico é gratuito?',
    answer: 'Sim. O diagnóstico é gratuito e leva poucos minutos.',
  },
  {
    question: 'O diagnóstico garante contemplação?',
    answer:
      'Não. O diagnóstico é apenas uma orientação inicial. No consórcio, a contemplação pode ocorrer por sorteio ou lance, sem prazo garantido.',
  },
  {
    question: 'O diagnóstico é uma proposta de consórcio?',
    answer:
      'Não. Ele não substitui proposta oficial, contrato, análise comercial ou condições da administradora. Ele apenas ajuda a entender seu perfil de aderência.',
  },
  {
    question: 'Preciso já ter escolhido um imóvel?',
    answer:
      'Não. Você pode fazer o diagnóstico mesmo que ainda esteja pesquisando ou começando a entender suas possibilidades.',
  },
  {
    question: 'Preciso ter dinheiro para lance?',
    answer:
      'Não necessariamente. O diagnóstico identifica se existe potencial de lance, mas também mostra perfis de planejamento e preparação.',
  },
  {
    question: 'Vou receber contato depois?',
    answer:
      'Você só receberá contato se informar seus dados e autorizar. O objetivo é oferecer orientação, não pressão comercial.',
  },
];

export default function Landing() {
  const [searchParams] = useSearchParams();
const { partnerSlug } = useParams();

  const partnerFromQuery = searchParams.get('partner'); 
  const partner = partnerSlug || partnerFromQuery;
  const diagnosticoLink = partner ? `/diagnostico?partner=${encodeURIComponent(partner)}` : '/diagnostico';
  const { partnerCompany } = usePartnerCompany(partner);
  const partnerDisplayName = getPartnerDisplayName(partnerCompany);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-slate-950/82 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2.5">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <Building2 className="h-4.5 w-4.5 text-white" />
            </div>

            <div className="leading-tight">
  <div className="text-[13px] md:text-sm font-bold text-white tracking-tight">
    MCI — Diagnóstico de Compra Planejada
  </div>

  {partnerCompany && (
    <div className="mt-0.5 flex items-center gap-1.5">
      <span className="text-sm md:text-[15px] font-bold text-white leading-none">
        {partnerCompany.display_name || partnerCompany.name}
      </span>

      <span className="hidden sm:inline text-white/35">•</span>

      <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wide text-amber-300">
        Parceiro autorizado
      </span>
    </div>
  )}
</div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-amber-300 md:flex">
        <a
       href="#como-funciona"
       className="drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)] transition hover:text-white"
      >
       Como funciona
      </a>

       <a
      href="#perfis"
       className="drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)] transition hover:text-white"
      >
       Perfis
      </a>

      <a
      href="#faq"
       className="drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)] transition hover:text-white"
      >
       FAQ
      </a>
      </nav>

          <Link
            to={diagnosticoLink}
            className="hidden rounded-full bg-[#C47A21] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:bg-[#E0A84B] hover:text-slate-950 md:inline-flex"
          >
            Iniciar diagnóstico
          </Link>

          <Link
            to={diagnosticoLink}
            className="inline-flex rounded-full bg-[#C47A21] px-4 py-2 text-xs font-semibold text-white md:hidden"
          >
            Iniciar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-slate-950 pt-[72px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />

        <div className="absolute inset-0 bg-[#08111F]/64" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08111F] via-[#0F2B4C]/92 to-[#123B63]/58" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08111F]/84 via-transparent to-[#0F2B4C]/35" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl items-start px-5 pt-3 pb-4 lg:pt-4 lg:pb-5">
          <div className="grid w-full items-start gap-8 lg:grid-cols-[1.12fr_0.88fr]">
            {/* Left column */}
            <div className="max-w-3xl lg:pt-1">
              <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
                <ShieldCheck className="h-4 w-4 text-amber-300" />
                {partnerDisplayName ? partnerDisplayName : 'Diagnóstico gratuito e orientativo'}
              </div>

              <h1 className="max-w-3xl font-display text-[2.25rem] font-bold leading-[1.01] tracking-tight text-white drop-shadow-[0_4px_22px_rgba(0,0,0,0.7)] sm:text-5xl lg:text-[3.15rem] xl:text-[3.45rem]">
                Descubra se o consórcio imobiliário faz sentido para o seu{' '}
                <span className="text-[#E0A84B]">momento.</span>
              </h1>

              <p className="mt-3 max-w-2xl text-[0.9rem] font-medium leading-6 text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] sm:text-[0.95rem]">
                Faça gratuitamente o Diagnóstico de Compra Planejada e entenda se sua renda, prazo, objetivo, expectativa e possibilidade de lance combinam com uma estratégia de consórcio imobiliário.
              </p>

              <div className="mt-2.5 max-w-xl border-l-2 border-amber-400/80 pl-4">
              <p className="text-sm font-medium leading-6 text-white/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]">
                Orientação inicial para avaliar consórcio com mais clareza, sem promessa de contemplação e sem pressão comercial.
                </p>
                {partnerDisplayName && (
                  <p className="mt-2 text-sm font-bold text-emerald-200/95">
                    Parceiro autorizado
                  </p>
                )}
                </div>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={diagnosticoLink}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#C47A21] px-6 py-3.5 text-sm font-bold text-white shadow-2xl shadow-amber-500/25 transition hover:-translate-y-0.5 hover:bg-[#E0A84B] hover:text-slate-950 sm:text-base"
                >
                 Fazer diagnóstico gratuito
                <ArrowRight className="h-5 w-5" />
                </Link>

                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/25 bg-slate-950/25 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/12 sm:text-base"
                >
                  Entender como funciona
                </a>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-2 text-xs text-white/65 sm:text-sm">
                <span>Gratuito</span>
                <span>•</span>
                <span>Leva poucos minutos</span>
                <span>•</span>
                <span>Sem compromisso</span>
              </div>

              <div className="mt-3 hidden max-w-2xl grid-cols-1 gap-2.5 xl:grid xl:grid-cols-3">
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/35 px-3 py-2 backdrop-blur">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-300" />
                  <p className="text-[11px] font-semibold leading-4 text-white">
                    Diagnóstico consultivo
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/35 px-3 py-2 backdrop-blur">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-amber-300" />
                  <p className="text-[11px] font-semibold leading-4 text-white">
                    Sem promessa de contemplação
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/35 px-3 py-2 backdrop-blur">
                  <Compass className="h-4 w-4 shrink-0 text-amber-300" />
                  <p className="text-[11px] font-semibold leading-4 text-white">
                    Compra planejada
                  </p>
                </div>
              </div>
            </div>

            {/* Right card */}
            <div className="hidden lg:block">
              <div className="ml-auto mt-10 max-w-[350px] rounded-[1.35rem] border border-white/12 bg-slate-950/35 p-3.5 shadow-2xl backdrop-blur-xl xl:mt-8">
                <div className="mb-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-white/75">
                      Seu diagnóstico pode indicar
                    </p>
                    <h2 className="mt-0.5 text-base font-bold text-white drop-shadow-sm">
                      6 perfis de consórcio
                    </h2>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/20">
                    <BarChart3 className="h-5 w-5 text-amber-300" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  {perfis.slice(0, 4).map((perfil) => (
                    <div
                      key={perfil.title}
                      className="flex items-center gap-3 rounded-xl border border-white/15 bg-slate-950/35 px-3 py-2.5 shadow-sm backdrop-blur"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
                        <perfil.icon className="h-4 w-4 text-amber-300" />
                      </div>
                      <p className="text-xs font-semibold text-white drop-shadow-sm">
                        {perfil.title}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3.5 rounded-xl border border-amber-300/20 bg-[#0F2B4C]/65 px-3.5 py-2.5 text-[0.72rem] font-medium leading-5 text-emerald-50 backdrop-blur">
                  O resultado é uma orientação inicial, não uma promessa de contemplação.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Autoridade silenciosa */}
      <section className="bg-white px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl lg:pt-2">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C47A21]">
              Clareza antes da oferta
            </span>

            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Uma decisão de consórcio não deveria começar por uma proposta.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Muita gente começa perguntando apenas quanto fica a parcela ou quando será contemplado. Mas, antes disso, é preciso entender se o consórcio combina com o momento do cliente.
            </p>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              Antes de contratar uma cota, é preciso entender prazo, renda, objetivo, expectativa de contemplação e possibilidade de lance.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
              <Compass className="mb-5 h-8 w-8 text-[#C47A21]" />
              <h3 className="text-xl font-bold text-slate-950">
                Primeiro, entenda seu momento
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                O diagnóstico avalia sua realidade antes de sugerir qualquer estratégia de consórcio.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
              <BarChart3 className="mb-5 h-8 w-8 text-[#C47A21]" />
              <h3 className="text-xl font-bold text-slate-950">
                Depois, entenda a aderência
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                O diagnóstico diferencia perfil planejador, potencial de lance, visão patrimonial, preparação e baixa aderência momentânea.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
              <ShieldCheck className="mb-5 h-8 w-8 text-[#C47A21]" />
              <h3 className="text-xl font-bold text-slate-950">
                Então, avance com segurança
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                O resultado indica o próximo passo mais coerente para conversar com um consultor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problema */}
      <section className="bg-slate-950 px-5 py-24 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
              O erro comum
            </span>

            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              O problema não é vender consórcio para todo mundo.
            </h2>

            <p className="mt-6 text-xl leading-8 text-white/70">
              O problema é oferecer consórcio sem entender aderência, prazo e expectativa.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/8 p-8 backdrop-blur">
            <div className="space-y-5 text-lg leading-8 text-white/75">
              <p>
                Consórcio pode ser uma boa estratégia para quem aceita planejamento, entende prazo e busca uma compra organizada.
              </p>
              <p>
                Lance pode fazer sentido para quem possui reserva, FGTS ou patrimônio, mas nunca deve ser apresentado como garantia de contemplação.
              </p>
              <p>
                Em alguns casos, o melhor caminho é avançar para uma simulação. Em outros, é alinhar expectativa, organizar renda ou preparar melhor o cliente antes de contratar.
              </p>
            </div>

            <div className="mt-8 rounded-3xl bg-[#C47A21] p-6 text-white">
              <p className="text-2xl font-bold leading-tight">
                A contratação de uma cota não começa na promessa. Começa no diagnóstico.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="bg-slate-50 px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C47A21]">
              Como funciona
            </span>

            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Em poucos minutos, você entende seu perfil de aderência ao consórcio.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Você responde perguntas simples e recebe uma orientação inicial sobre qual perfil de compra planejada combina com seu momento.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-4">
            {[
              ['1', 'Responda ao diagnóstico', 'Informe objetivo, renda, prazo, expectativa, valor do imóvel, reserva para lance e principais preocupações.'],
              ['2', 'O sistema analisa seu perfil', 'O MCI cruza suas respostas e identifica sinais de aderência ao consórcio imobiliário.'],
              ['3', 'Receba seu resultado', 'Você descobre seu perfil principal e, quando houver, uma tendência secundária.'],
              ['4', 'Avance com orientação', 'Se fizer sentido, você pode falar com um especialista para entender melhor o próximo passo.'],
            ].map(([number, title, text]) => (
              <div key={number} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F2B4C] text-lg font-bold text-white">
                  {number}
                </div>
                <h3 className="text-lg font-bold text-slate-950">
                  {title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to={diagnosticoLink}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#C47A21] px-7 py-4 font-bold text-white shadow-lg shadow-amber-500/20 transition hover:bg-[#E0A84B] hover:text-slate-950"
            >
              Iniciar diagnóstico agora
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Perfis */}
      <section id="perfis" className="bg-white px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl lg:pt-2">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C47A21]">
              Perfis possíveis
            </span>

            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Cada cliente tem um perfil de consórcio diferente.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              O MCI Consórcio não parte da ideia de que consórcio serve para todo mundo. Ele analisa sinais do seu momento para indicar uma orientação inicial responsável.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {perfis.map((perfil) => (
              <div
                key={perfil.title}
                className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-[#0F2B4C] transition group-hover:bg-[#C47A21] group-hover:text-white">
                  <perfil.icon className="h-6 w-6" />
                </div>

                <h3 className="text-xl font-bold text-slate-950">
                  {perfil.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {perfil.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-3xl bg-slate-50 p-6 text-center text-slate-600">
            O resultado não é uma sentença. É uma orientação inicial para entender aderência, cuidado e próximo passo.
          </div>
        </div>
      </section>

      {/* Benefício emocional */}
      <section className="bg-slate-50 px-5 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C47A21]">
              Decisão com clareza
            </span>

            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Entrar em um consórcio exige mais do que vontade. Exige clareza.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Muitas pessoas descartam o consórcio por falta de explicação. Outras entram com expectativa errada sobre contemplação, prazo ou lance.
            </p>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              O objetivo do MCI Consórcio é ajudar você a enxergar a compra planejada com mais equilíbrio: sem promessa de contemplação, sem pressão e sem venda agressiva.
            </p>

            <div className="mt-8 rounded-3xl bg-white p-6 text-2xl font-bold text-slate-950 shadow-sm">
              Você não precisa contratar no escuro.
            </div>
          </div>

          <div className="grid gap-5">
            {beneficios.map((beneficio) => (
              <div key={beneficio.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <CheckCircle2 className="mb-4 h-6 w-6 text-[#C47A21]" />
                <h3 className="text-lg font-bold text-slate-950">
                  {beneficio.title}
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  {beneficio.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EPSA */}
      <section className="bg-white px-5 py-24">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-slate-950 p-8 text-white sm:p-12 lg:p-16">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10">
                <HomeIcon className="h-8 w-8 text-amber-300" />
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                Universidade EPSA
              </p>

              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Uma ferramenta para decisões de consórcio mais responsáveis.
              </h2>
            </div>

            <div className="text-lg leading-8 text-white/75">
              <p>
                O MCI Consórcio faz parte do ecossistema da Universidade EPSA, criado para organizar a captação, qualificação e atendimento consultivo de clientes interessados em consórcio imobiliário.
              </p>

              <p className="mt-5">
                Aqui, o diagnóstico vem antes da proposta. A clareza vem antes da venda. E a expectativa correta vem antes da contratação.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">
                  Diagnóstico de aderência
                </span>
                <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">
                  Orientação inicial
                </span>
                <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">
                  Sem compromisso
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-slate-50 px-5 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C47A21]">
              Perguntas frequentes
            </span>

            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Antes de começar, tire suas dúvidas.
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex gap-4">
                  <HelpCircle className="mt-1 h-5 w-5 shrink-0 text-[#C47A21]" />
                  <div>
                    <h3 className="font-bold text-slate-950">
                      {faq.question}
                    </h3>
                    <p className="mt-2 leading-7 text-slate-600">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-slate-950 px-5 py-24 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Antes de contratar uma cota, entenda seu perfil.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Planejar, avaliar lance, construir patrimônio, trocar de imóvel ou se preparar melhor são decisões que dependem do seu momento.
          </p>

          <Link
            to={diagnosticoLink}
            className="mt-9 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#C47A21] px-8 py-4 text-base font-bold text-white shadow-2xl shadow-amber-500/25 transition hover:bg-[#E0A84B] hover:text-slate-950"
          >
            Fazer diagnóstico gratuito
            <ArrowRight className="h-5 w-5" />
          </Link>

          <p className="mt-5 text-sm text-white/50">
            Gratuito • Leva poucos minutos • Sem compromisso
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 px-5 pb-10 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 border-t border-white/10 pt-10 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold">MCI</p>
                <p className="text-xs text-white/50">
                  Diagnóstico de Compra Planejada
                </p>
              </div>
            </div>

            <p className="text-sm leading-6 text-white/55">
              Uma ferramenta da Universidade EPSA para ajudar clientes a entenderem se o consórcio imobiliário faz sentido com mais clareza.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Aviso legal</h3>
            <p className="mt-3 text-sm leading-6 text-white/55">
              Este diagnóstico não garante contemplação, proposta oficial, aprovação, contratação de consórcio ou resultado.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Privacidade</h3>
            <p className="mt-3 text-sm leading-6 text-white/55">
              Seus dados são utilizados apenas para atendimento, diagnóstico e acompanhamento comercial, conforme autorização fornecida no formulário.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Links</h3>
            <div className="mt-3 flex flex-col gap-2 text-sm text-white/55">
              <Link to={diagnosticoLink} className="hover:text-white">
                Iniciar diagnóstico
              </Link>
              <a href="#como-funciona" className="hover:text-white">
                Como funciona
              </a>
              <a href="#faq" className="hover:text-white">
                Perguntas frequentes
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl text-sm text-white/35">
          © {new Date().getFullYear()} MCI Consórcio Imobiliário. Powered by Universidade EPSA.
        </div>
      </footer>
    </div>
  );
}
