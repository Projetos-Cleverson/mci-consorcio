import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLeadsStore } from '@/stores/leadsStore';
import { PROFILES } from '@/constants/profiles';
import { QUESTIONS } from '@/constants/questions';
import { formatPhone } from '@/lib/utils';
import {
  calculatePurchaseSimulation,
  formatCurrency,
  getCompatibilityClass,
  getCompatibilityLabel,
} from '@/lib/simulation';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Copy,
  Landmark,
  Mail,
  MessageCircle,
  Phone,
  PiggyBank,
  Printer,
} from 'lucide-react';

function formatDate(value?: string) {
  if (!value) return 'Não informado';

  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function LeadReport() {
  const [printMode, setPrintMode] = useState<'client' | 'full'>('full');
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, loadData, isLoading } = useLeadsStore();

  const lead = leads.find((item) => item.id === id);

  useEffect(() => {
    if (!lead && leads.length === 0) {
      void loadData();
    }
  }, [lead, leads.length, loadData]);

  if (isLoading && !lead) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">Carregando relatório...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-950">Lead não encontrado</h1>
          <p className="mt-2 text-sm text-slate-500">
            Não foi possível carregar os dados deste relatório.
          </p>

          <button
            onClick={() => navigate('/admin/leads')}
            className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Voltar para leads
          </button>
        </div>
      </div>
    );
  }

  const profile = PROFILES.find((item) => item.id === lead.perfilPrincipal);
  const secondaryProfile = lead.perfilSecundario
    ? PROFILES.find((item) => item.id === lead.perfilSecundario)
    : null;

  const simulation = calculatePurchaseSimulation(lead.respostas || [], lead.perfilPrincipal);

  const sortedAnswers = [...(lead.respostas || [])].sort(
    (a, b) => a.questionIndex - b.questionIndex
  );

  const summaryText = `Relatório Inicial de Compra Imobiliária

Cliente: ${lead.dados.nome}
WhatsApp: ${formatPhone(lead.dados.whatsapp)}
Cidade/UF: ${lead.dados.cidade}/${lead.dados.estado}
Perfil: ${profile?.nome || lead.perfilPrincipal}
${secondaryProfile ? `Tendência secundária: ${secondaryProfile.nome}` : ''}

Estimativa orientativa:
Valor do imóvel: ${formatCurrency(simulation.propertyValue)}
Entrada estimada: ${formatCurrency(simulation.downPayment)}
Valor a financiar: ${formatCurrency(simulation.financing.financedAmount)}
Parcela orientativa: ${formatCurrency(simulation.financing.estimatedPayment)}
Limite conservador pela renda: ${formatCurrency(simulation.affordablePayment)}
Parcela orientativa consórcio: ${formatCurrency(simulation.consortium.estimatedPaymentMin)} a ${formatCurrency(simulation.consortium.estimatedPaymentMax)}

Próximo passo:
${profile?.proximoPasso || 'Realizar análise consultiva do cenário do cliente.'}`;

  const whatsappText = `Olá, ${lead.dados.nome}! Gerei seu Relatório Inicial de Compra Imobiliária com base nas respostas do diagnóstico.

O relatório mostra seu perfil, pontos de atenção e uma estimativa orientativa considerando consórcio, prazo, carta e parcela.

Vou te enviar o PDF por aqui e depois podemos conversar sobre o melhor caminho para sua realidade.`;

  const whatsappUrl = `https://wa.me/55${lead.dados.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
    whatsappText
  )}`;

  const handleCopySummary = async () => {
    await navigator.clipboard.writeText(summaryText);
    alert('Resumo copiado para a área de transferência.');
  };

  const handlePrintClient = () => {
  setPrintMode('client');

  setTimeout(() => {
    window.print();
  }, 100);
};

const handlePrintFull = () => {
  setPrintMode('full');

  setTimeout(() => {
    window.print();
  }, 100);
};

  return (
    <div className={`min-h-screen bg-slate-100 font-sans text-slate-950 ${printMode === 'client' ? 'client-print' : 'full-print'}`}>
      <style>
  {`
    @media print {
      @page {
        size: A4;
        margin: 12mm;
      }

      body {
        background: white !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .no-print {
        display: none !important;
      }

      .print-page {
        box-shadow: none !important;
        border: none !important;
        margin: 0 !important;
        max-width: none !important;
        width: 100% !important;
      }

      .avoid-break {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .page-break-before {
        break-before: page;
        page-break-before: always;
      }

      .client-print .internal-section {
        display: none !important;
      }

      .client-print .client-final-section {
        display: block !important;
      }

      .full-print .client-final-section {
        display: none !important;
      }
    }
  `}
</style>

      <div className="no-print sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate(`/admin/leads/${lead.id}`)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="size-4" />
            Voltar ao lead
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handlePrintClient}
             className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
>
            <Printer className="size-4" />
             PDF para cliente
            </button>

            <button
              onClick={handlePrintFull}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
>
            <Printer className="size-4" />
              Relatório completo
            </button>

            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Copy className="size-4" />
              Copiar resumo
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <main className="px-4 py-8">
        <article className="print-page mx-auto max-w-5xl overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
          <header className="bg-slate-950 px-8 py-8 text-white">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10">
                    <Building2 className="size-6 text-white" />
                  </div>

                  <div>
                    <p className="text-lg font-bold">MCI</p>
                    <p className="text-xs text-white/60">
                      Diagnóstico de Compra Planejada
                    </p>
                  </div>
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  Relatório consultivo
                </p>

                <h1 className="mt-2 font-sans text-3xl font-bold">
                  Relatório Inicial de Compra Imobiliária
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                  Documento orientativo gerado a partir das respostas do diagnóstico.
                  Não representa proposta oficial, promessa de contemplação ou condição
                  oficial de administradora.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                <p className="text-white/50">Data do diagnóstico</p>
                <p className="mt-1 font-semibold text-white">
                  {formatDate(lead.dataEntrada)}
                </p>
              </div>
            </div>
          </header>

          <section className="grid gap-5 border-b border-slate-200 p-8 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Cliente
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-950">
                {lead.dados.nome}
              </h2>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <Phone className="size-4" />
                  {formatPhone(lead.dados.whatsapp)}
                </p>

                {lead.dados.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="size-4" />
                    {lead.dados.email}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Localização
              </p>

              <p className="mt-2 text-lg font-bold text-slate-950">
                {lead.dados.cidade}/{lead.dados.estado}
              </p>

              <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="size-4" />
                Entrada: {formatDate(lead.dataEntrada)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status operacional
              </p>

              <p className="mt-2 text-lg font-bold text-slate-950">
                {lead.status}
              </p>

              <p className="mt-4 text-sm text-slate-600">
                Temperatura: <strong>{lead.temperatura}</strong>
              </p>
            </div>
          </section>

          <section className="avoid-break border-b border-slate-200 p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Perfil identificado
            </p>

            <div className="mt-4 rounded-3xl bg-gradient-to-br from-slate-950 to-slate-800 p-6 text-white">
              <h2 className="font-sans text-3xl font-bold">
                {profile?.nome || lead.perfilPrincipal}
              </h2>

              {secondaryProfile && (
                <p className="mt-2 text-sm text-emerald-200">
                  Tendência secundária: <strong>{secondaryProfile.nome}</strong>
                </p>
              )}

              <p className="mt-4 text-sm leading-7 text-white/75">
                {profile?.fraseIdentificacao}
              </p>
            </div>

            {profile?.explicacao && (
              <p className="mt-5 text-sm leading-7 text-slate-600">
                {profile.explicacao}
              </p>
            )}
          </section>

          <section className="avoid-break border-b border-slate-200 p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Estimativa inicial de compra
            </p>

            <h2 className="mt-2 font-sans text-2xl font-bold text-slate-950">
              Estimativa orientativa de compra planejada
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-100">
                    <Landmark className="size-5 text-blue-700" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">
                      Compra planejada
                    </h3>
                    <p className="text-xs text-slate-500">
                      Estimativa por parcela aproximada
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Valor do imóvel</span>
                    <strong>{formatCurrency(simulation.propertyValue)}</strong>
                  </div>

                  <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Entrada estimada</span>
                    <strong>{formatCurrency(simulation.downPayment)}</strong>
                  </div>

                  <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Valor a financiar</span>
                    <strong>{formatCurrency(simulation.financing.financedAmount)}</strong>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Parcela orientativa
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-950">
                      {formatCurrency(simulation.financing.estimatedPayment)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Prazo usado: {simulation.financing.termMonths} meses
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Limite conservador pela renda
                    </p>
                    <p className="mt-1 text-xl font-bold text-slate-950">
                      {formatCurrency(simulation.affordablePayment)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Considerando até 30% da renda declarada.
                    </p>
                  </div>

                  <div
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold ${getCompatibilityClass(
                      simulation.financing.compatibility
                    )}`}
                  >
                    {getCompatibilityLabel(simulation.financing.compatibility)}
                  </div>

                  <p className="text-xs leading-6 text-slate-600">
                    {simulation.financing.reading}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-purple-100">
                    <PiggyBank className="size-5 text-purple-700" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">
                      Consórcio imobiliário
                    </h3>
                    <p className="text-xs text-slate-500">
                      Estimativa por carta de crédito
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Carta estimada</span>
                    <strong>{formatCurrency(simulation.consortium.creditAmount)}</strong>
                  </div>

                  <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Prazo usado</span>
                    <strong>{simulation.consortium.termMonths} meses</strong>
                  </div>

                  <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Taxa adm. referencial</span>
                    <strong>
                      {(simulation.consortium.adminFeeRate * 100).toFixed(0)}%
                    </strong>
                  </div>

                  <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Fundo referencial</span>
                    <strong>
                      {(simulation.consortium.reserveFundRate * 100).toFixed(0)}%
                    </strong>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Parcela orientativa
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-950">
                      {formatCurrency(simulation.consortium.estimatedPaymentMin)} a{' '}
                      {formatCurrency(simulation.consortium.estimatedPaymentMax)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Pode variar conforme administradora, grupo, prazo, seguro e regras do plano.
                    </p>
                  </div>

                  <p className="rounded-2xl bg-white p-4 text-xs leading-6 text-slate-600">
                    {simulation.consortium.reading}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {profile && (
            <section className="avoid-break grid gap-5 border-b border-slate-200 p-8 md:grid-cols-2">
              <div>
                <h3 className="flex items-center gap-2 font-bold text-slate-950">
                  <CheckCircle2 className="size-5 text-emerald-600" />
                  Pontos favoráveis
                </h3>

                <ul className="mt-4 space-y-2">
                  {profile.pontosFavoraveis.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="flex items-center gap-2 font-bold text-slate-950">
                  <AlertTriangle className="size-5 text-amber-500" />
                  Pontos de atenção
                </h3>

                <ul className="mt-4 space-y-2">
                  {profile.pontosAtencao.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {profile && (
            <section className="avoid-break border-b border-slate-200 p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Próximo passo recomendado
              </p>

              <h2 className="mt-2 font-sans text-2xl font-bold text-slate-950">
                {profile.cta}
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                {profile.proximoPasso}
                </p>
                </section>
                 )}

                 <section className="client-final-section border-t border-slate-200 bg-amber-50 p-8">
                 <div className="flex gap-3">
                 <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />

               <div>
               <h3 className="font-bold text-amber-900">
                Aviso importante
                </h3>

               <p className="mt-2 text-xs leading-6 text-amber-800">
               Este relatório é uma orientação inicial baseada nas informações fornecidas no diagnóstico. Ele não garante contemplação, proposta oficial, contratação de consórcio, aquisição do imóvel ou condição comercial específica. A simulação apresentada é estimativa e deve ser validada com um especialista.
               </p>
              </div>
              </div>
              </section>

                <section className="internal-section page-break-before border-b border-slate-200 p-8">
                 <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Respostas do diagnóstico
                  </p>

            {sortedAnswers.length > 0 ? (
              <div className="mt-5 space-y-3">
                {sortedAnswers.map((answer) => {
                  const question = QUESTIONS[answer.questionIndex];
                  const option = question?.opcoes[answer.answerIndex];

                  if (!question || !option) return null;

                  return (
                    <div
                      key={`${answer.questionIndex}-${answer.answerIndex}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-xs font-semibold text-slate-500">
                        {answer.questionIndex + 1}. {question.pergunta}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-950">
                        {option.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Este lead não possui respostas registradas.
              </p>
            )}
          </section>

          <footer className="internal-section bg-amber-50 p-8">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />

              <div>
                <h3 className="font-bold text-amber-900">Aviso legal</h3>
                <p className="mt-2 text-xs leading-6 text-amber-800">
                  Este relatório é uma orientação inicial baseada nas informações fornecidas
                  pelo cliente. Ele não garante aprovação de financiamento, contemplação em
                  consórcio, liberação de crédito, aquisição do imóvel ou condição comercial
                  específica. A melhor decisão depende de análise documental, regras da
                  instituição financeira, administradora, renda, entrada, prazo, imóvel,
                  crédito, perfil do cliente e capacidade real de pagamento.
                </p>
              </div>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}